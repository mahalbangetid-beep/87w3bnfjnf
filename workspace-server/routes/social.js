const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { SocialAccount, SocialPost, HashtagCollection, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Valid platforms
const VALID_PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];
const VALID_POST_STATUSES = ['draft', 'queued', 'scheduled', 'publishing', 'published', 'partial', 'failed'];

// Validation rules for post creation/update
const postValidation = [
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 65000 }).withMessage('Content too long'),
    body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
    body('platforms.*').isIn(VALID_PLATFORMS).withMessage('Invalid platform'),
    body('mediaUrls').optional().isArray().withMessage('mediaUrls must be an array'),
    body('mediaUrls.*').optional().isURL().withMessage('Invalid media URL'),
    body('hashtags').optional().isArray().withMessage('hashtags must be an array'),
    body('hashtags.*').optional().isString().isLength({ max: 100 }).withMessage('Hashtag too long'),
    body('status').optional().isIn(VALID_POST_STATUSES).withMessage('Invalid status'),
    body('scheduledAt').optional({ nullable: true }).isISO8601().toDate().withMessage('Invalid date format'),
    body('queuePosition').optional().isInt({ min: 0 }).withMessage('Invalid queue position')
];

// Validation rules for scheduling
const scheduleValidation = [
    body('scheduledAt').notEmpty().withMessage('scheduledAt is required').isISO8601().toDate().withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('scheduledAt must be a future date');
            }
            return true;
        })
];

// Validation rules for hashtag collection
const hashtagCollectionValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('hashtags').isArray({ min: 1, max: 30 }).withMessage('1-30 hashtags required'),
    body('hashtags.*').isString().isLength({ min: 1, max: 100 }).withMessage('Hashtag must be 1-100 characters'),
    body('category').optional().trim().isLength({ max: 50 }).withMessage('Category too long'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format')
];

// ============ SOCIAL ACCOUNTS ============

// Get all connected accounts
router.get('/accounts', authenticateToken, async (req, res) => {
    try {
        const accounts = await SocialAccount.findAll({
            where: { userId: req.user.id },
            attributes: { exclude: ['accessToken', 'refreshToken', 'pageAccessToken'] }
        });
        res.json(accounts);
    } catch (error) {
        logger.error('Error fetching accounts', { error: error.message, userId: req.user.id });
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Get single account
router.get('/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const account = await SocialAccount.findOne({
            where: { id: req.params.id, userId: req.user.id },
            attributes: { exclude: ['accessToken', 'refreshToken', 'pageAccessToken'] }
        });
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch account' });
    }
});

// Disconnect account
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const account = await SocialAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        await account.destroy();
        res.json({ message: 'Account disconnected successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect account' });
    }
});

// ============ SOCIAL POSTS ============

// Get all posts with filters
router.get('/posts', authenticateToken, async (req, res) => {
    try {
        const { status, platform, startDate, endDate, limit = 50, offset = 0 } = req.query;

        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (platform) {
            where.platforms = { [Op.like]: `%${platform}%` };
        }
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const posts = await SocialPost.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            posts: posts.rows,
            total: posts.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        logger.error('Error fetching posts', { error: error.message, userId: req.user.id });
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
router.get('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await SocialPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create new post
router.post('/posts', authenticateToken, postValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, mediaUrls, hashtags, platforms, status, scheduledAt, queuePosition } = req.body;

        const post = await SocialPost.create({
            userId: req.user.id,
            content,
            mediaUrls: mediaUrls || [],
            hashtags: hashtags || [],
            platforms,
            status: status || 'draft',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            queuePosition
        });

        logger.info('Post created', { postId: post.id, userId: req.user.id, platforms });
        res.status(201).json(post);
    } catch (error) {
        logger.error('Error creating post', { error: error.message, userId: req.user.id });
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Update post
router.put('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await SocialPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Don't allow editing published posts
        if (post.status === 'published') {
            return res.status(400).json({ error: 'Cannot edit published posts' });
        }

        const { content, mediaUrls, hashtags, platforms, status, scheduledAt, queuePosition } = req.body;

        // Validate platforms if provided
        if (platforms && (!Array.isArray(platforms) || platforms.some(p => !VALID_PLATFORMS.includes(p)))) {
            return res.status(400).json({ error: 'Invalid platform(s)' });
        }
        // Validate status if provided
        if (status && !VALID_POST_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await post.update({
            content: content ?? post.content,
            mediaUrls: mediaUrls ?? post.mediaUrls,
            hashtags: hashtags ?? post.hashtags,
            platforms: platforms ?? post.platforms,
            status: status ?? post.status,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : post.scheduledAt,
            queuePosition: queuePosition ?? post.queuePosition
        });

        logger.info('Post updated', { postId: post.id, userId: req.user.id });
        res.json(post);
    } catch (error) {
        logger.error('Error updating post', { error: error.message, userId: req.user.id, postId: req.params.id });
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await SocialPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await post.destroy();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Schedule post
router.post('/posts/:id/schedule', authenticateToken, scheduleValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { scheduledAt } = req.body;

        const post = await SocialPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await post.update({
            status: 'scheduled',
            scheduledAt: new Date(scheduledAt)
        });

        logger.info('Post scheduled', { postId: post.id, userId: req.user.id, scheduledAt });
        res.json(post);
    } catch (error) {
        logger.error('Error scheduling post', { error: error.message, userId: req.user.id, postId: req.params.id });
        res.status(500).json({ error: 'Failed to schedule post' });
    }
});

// Publish post immediately
router.post('/posts/:id/publish', authenticateToken, async (req, res) => {
    try {
        const post = await SocialPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if already published
        if (post.status === 'published') {
            return res.status(400).json({ error: 'Post is already published' });
        }

        // Get connected accounts for the platforms
        const connectedAccounts = await SocialAccount.findAll({
            where: {
                userId: req.user.id,
                platform: { [Op.in]: post.platforms },
                isActive: true
            }
        });

        // Check if we have accounts for all platforms
        const connectedPlatforms = connectedAccounts.map(acc => acc.platform);
        const missingPlatforms = post.platforms.filter(p => !connectedPlatforms.includes(p));

        if (missingPlatforms.length > 0) {
            return res.status(400).json({
                error: `Missing connected accounts for platforms: ${missingPlatforms.join(', ')}`,
                missingPlatforms
            });
        }

        // Update status to publishing
        await post.update({ status: 'publishing' });

        // Simulate publishing to each platform
        const publishResults = [];
        const publishErrors = [];

        for (const account of connectedAccounts) {
            try {
                const result = await publishToSocialPlatform(account, post);
                publishResults.push({
                    platform: account.platform,
                    accountName: account.displayName || account.username,
                    success: true,
                    postId: result.postId,
                    postUrl: result.postUrl
                });
            } catch (platformError) {
                publishErrors.push({
                    platform: account.platform,
                    accountName: account.displayName || account.username,
                    success: false,
                    error: platformError.message
                });
            }
        }

        // Update post status based on results
        if (publishErrors.length === 0) {
            // All successful
            await post.update({
                status: 'published',
                publishedAt: new Date(),
                publishResults: JSON.stringify(publishResults)
            });
        } else if (publishResults.length > 0) {
            // Partial success
            await post.update({
                status: 'partial',
                publishedAt: new Date(),
                publishResults: JSON.stringify([...publishResults, ...publishErrors])
            });
        } else {
            // All failed
            await post.update({
                status: 'failed',
                publishResults: JSON.stringify(publishErrors)
            });
        }

        res.json({
            message: publishErrors.length === 0 ? 'Published successfully' : 'Published with some errors',
            post: await post.reload(),
            results: publishResults,
            errors: publishErrors
        });
    } catch (error) {
        logger.error('Publish error', { error: error.message, userId: req.user.id, postId: req.params.id });
        res.status(500).json({ error: 'Failed to publish post' });
    }
});

/**
 * Simulate publishing to social media platform
 * In production, integrate with actual platform APIs
 */
async function publishToSocialPlatform(account, post) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const platform = account.platform;

    // Simulate platform-specific publishing
    switch (platform) {
        case 'facebook':
        case 'instagram':
            // Meta platforms - would use Graph API
            // https://developers.facebook.com/docs/graph-api/
            if (!account.accessToken) {
                throw new Error('Missing access token for Meta platform');
            }
            return {
                postId: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                postUrl: `https://facebook.com/posts/${Date.now()}`
            };

        case 'twitter':
            // Twitter/X - would use Twitter API v2
            // https://developer.twitter.com/en/docs/twitter-api
            if (!account.accessToken) {
                throw new Error('Missing access token for Twitter');
            }
            return {
                postId: `tw_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                postUrl: `https://twitter.com/i/status/${Date.now()}`
            };

        case 'linkedin':
            // LinkedIn - would use LinkedIn Marketing API
            // https://learn.microsoft.com/en-us/linkedin/marketing/
            if (!account.accessToken) {
                throw new Error('Missing access token for LinkedIn');
            }
            return {
                postId: `li_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                postUrl: `https://linkedin.com/posts/${Date.now()}`
            };

        case 'tiktok':
            // TikTok - would use TikTok API for Business
            // https://developers.tiktok.com/
            if (!account.accessToken) {
                throw new Error('Missing access token for TikTok');
            }
            return {
                postId: `tt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                postUrl: `https://tiktok.com/@user/video/${Date.now()}`
            };

        default:
            // Generic simulation
            return {
                postId: `${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                postUrl: `https://${platform}.com/posts/${Date.now()}`
            };
    }
}

// Get scheduled posts calendar
router.get('/posts/calendar/:year/:month', authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const posts = await SocialPost.findAll({
            where: {
                userId: req.user.id,
                scheduledAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['scheduledAt', 'ASC']]
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch calendar posts' });
    }
});

// ============ HASHTAG COLLECTIONS ============

// Get all hashtag collections
router.get('/hashtags', authenticateToken, async (req, res) => {
    try {
        const collections = await HashtagCollection.findAll({
            where: { userId: req.user.id },
            order: [['usageCount', 'DESC']]
        });
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hashtag collections' });
    }
});

// Create hashtag collection
router.post('/hashtags', authenticateToken, hashtagCollectionValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, hashtags, category, color } = req.body;

        const collection = await HashtagCollection.create({
            userId: req.user.id,
            name,
            hashtags,
            category,
            color
        });

        logger.info('Hashtag collection created', { collectionId: collection.id, userId: req.user.id });
        res.status(201).json(collection);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Collection name already exists' });
        }
        logger.error('Error creating hashtag collection', { error: error.message, userId: req.user.id });
        res.status(500).json({ error: 'Failed to create hashtag collection' });
    }
});

// Update hashtag collection
router.put('/hashtags/:id', authenticateToken, async (req, res) => {
    try {
        const collection = await HashtagCollection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const { name, hashtags, category, color } = req.body;

        // Validate name length if provided
        if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
            return res.status(400).json({ error: 'Name must be a string with max 255 characters' });
        }
        // Validate hashtags if provided
        if (hashtags !== undefined) {
            if (!Array.isArray(hashtags) || hashtags.length === 0 || hashtags.length > 30) {
                return res.status(400).json({ error: '1-30 hashtags required' });
            }
        }
        // Validate color format if provided
        if (color !== undefined && color !== null && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ error: 'Invalid color format' });
        }

        await collection.update({
            name: name ?? collection.name,
            hashtags: hashtags ?? collection.hashtags,
            category: category ?? collection.category,
            color: color ?? collection.color
        });

        res.json(collection);
    } catch (error) {
        logger.error('Error updating hashtag collection', { error: error.message, userId: req.user.id, collectionId: req.params.id });
        res.status(500).json({ error: 'Failed to update hashtag collection' });
    }
});

// Delete hashtag collection
router.delete('/hashtags/:id', authenticateToken, async (req, res) => {
    try {
        const collection = await HashtagCollection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        await collection.destroy();
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete hashtag collection' });
    }
});

// Increment usage count
router.post('/hashtags/:id/use', authenticateToken, async (req, res) => {
    try {
        const collection = await HashtagCollection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        await collection.increment('usageCount');
        res.json({ message: 'Usage count updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update usage count' });
    }
});

// ============ ANALYTICS ============

// Get dashboard stats
router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get counts
        const [totalPosts, scheduledPosts, publishedPosts, connectedAccounts, drafts] = await Promise.all([
            SocialPost.count({ where: { userId } }),
            SocialPost.count({ where: { userId, status: 'scheduled' } }),
            SocialPost.count({ where: { userId, status: 'published' } }),
            SocialAccount.count({ where: { userId, isActive: true } }),
            SocialPost.count({ where: { userId, status: 'draft' } })
        ]);

        // Get recent posts
        const recentPosts = await SocialPost.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Get upcoming scheduled
        const upcomingScheduled = await SocialPost.findAll({
            where: {
                userId,
                status: 'scheduled',
                scheduledAt: { [Op.gte]: new Date() }
            },
            order: [['scheduledAt', 'ASC']],
            limit: 5
        });

        res.json({
            stats: {
                totalPosts,
                scheduledPosts,
                publishedPosts,
                connectedAccounts,
                drafts
            },
            recentPosts,
            upcomingScheduled
        });
    } catch (error) {
        logger.error('Error fetching analytics', { error: error.message, userId: req.user.id });
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
