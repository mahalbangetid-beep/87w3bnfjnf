const express = require('express');
const router = express.Router();
const { BlogConnection, BlogPost, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// ============ BLOG CONNECTIONS ============

// Get all blog connections
router.get('/connections', authenticateToken, async (req, res) => {
    try {
        const connections = await BlogConnection.findAll({
            where: { userId: req.user.id },
            attributes: { exclude: ['appPassword', 'apiKey', 'accessToken', 'refreshToken'] }
        });
        res.json(connections);
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ error: 'Failed to fetch blog connections' });
    }
});

// Get single connection
router.get('/connections/:id', authenticateToken, async (req, res) => {
    try {
        const connection = await BlogConnection.findOne({
            where: { id: req.params.id, userId: req.user.id },
            attributes: { exclude: ['appPassword', 'apiKey', 'accessToken', 'refreshToken'] }
        });
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        res.json(connection);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch connection' });
    }
});

// Create blog connection
router.post('/connections', authenticateToken, async (req, res) => {
    try {
        const { platform, siteName, siteUrl, apiUrl, username, appPassword, blogId, apiKey } = req.body;

        if (!platform || !siteName || !siteUrl) {
            return res.status(400).json({ error: 'Platform, siteName, and siteUrl are required' });
        }

        // Validate based on platform
        if (platform === 'wordpress' && (!username || !appPassword)) {
            return res.status(400).json({ error: 'Username and app password are required for WordPress' });
        }
        if (platform === 'blogspot' && !blogId) {
            return res.status(400).json({ error: 'Blog ID is required for Blogspot' });
        }
        if (platform === 'custom' && !apiUrl) {
            return res.status(400).json({ error: 'API URL is required for custom CMS' });
        }

        const connection = await BlogConnection.create({
            userId: req.user.id,
            platform,
            siteName,
            siteUrl,
            apiUrl,
            username,
            appPassword,
            blogId,
            apiKey
        });

        // Return without sensitive data
        const safeConnection = connection.toJSON();
        delete safeConnection.appPassword;
        delete safeConnection.apiKey;
        delete safeConnection.accessToken;
        delete safeConnection.refreshToken;

        res.status(201).json(safeConnection);
    } catch (error) {
        console.error('Error creating connection:', error);
        res.status(500).json({ error: 'Failed to create blog connection' });
    }
});

// Update blog connection
router.put('/connections/:id', authenticateToken, async (req, res) => {
    try {
        const connection = await BlogConnection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        const { siteName, siteUrl, apiUrl, username, appPassword, blogId, apiKey, isActive, settings } = req.body;

        await connection.update({
            siteName: siteName ?? connection.siteName,
            siteUrl: siteUrl ?? connection.siteUrl,
            apiUrl: apiUrl ?? connection.apiUrl,
            username: username ?? connection.username,
            appPassword: appPassword ?? connection.appPassword,
            blogId: blogId ?? connection.blogId,
            apiKey: apiKey ?? connection.apiKey,
            isActive: isActive ?? connection.isActive,
            settings: settings ?? connection.settings
        });

        // Return without sensitive data
        const safeConnection = connection.toJSON();
        delete safeConnection.appPassword;
        delete safeConnection.apiKey;
        delete safeConnection.accessToken;
        delete safeConnection.refreshToken;

        res.json(safeConnection);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog connection' });
    }
});

// Delete blog connection
router.delete('/connections/:id', authenticateToken, async (req, res) => {
    try {
        const connection = await BlogConnection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        await connection.destroy();
        res.json({ message: 'Connection deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete connection' });
    }
});

// Verify connection
router.post('/connections/:id/verify', authenticateToken, async (req, res) => {
    try {
        const connection = await BlogConnection.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        // Verify based on platform
        let verifyResult = { success: false, message: 'Unknown platform' };

        try {
            switch (connection.platform) {
                case 'wordpress':
                    verifyResult = await verifyWordPressConnection(connection);
                    break;
                case 'blogspot':
                    verifyResult = await verifyBlogspotConnection(connection);
                    break;
                case 'custom':
                    verifyResult = await verifyCustomCMSConnection(connection);
                    break;
                default:
                    verifyResult = { success: true, message: 'Connection saved (verification not available for this platform)' };
            }

            // Update connection status
            await connection.update({
                isActive: verifyResult.success,
                lastVerified: new Date()
            });

        } catch (verifyError) {
            verifyResult = {
                success: false,
                message: `Verification failed: ${verifyError.message}`
            };
            await connection.update({ isActive: false });
        }

        res.json(verifyResult);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify connection' });
    }
});

/**
 * Verify WordPress connection using REST API
 */
async function verifyWordPressConnection(connection) {
    const apiUrl = connection.apiUrl || `${connection.siteUrl}/wp-json/wp/v2`;

    try {
        // Test authentication by fetching user info
        const authHeader = Buffer.from(`${connection.username}:${connection.appPassword}`).toString('base64');

        const response = await fetch(`${apiUrl}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            return {
                success: true,
                message: `Connected as ${user.name || user.slug}`,
                siteInfo: {
                    userId: user.id,
                    username: user.slug,
                    displayName: user.name
                }
            };
        } else if (response.status === 401) {
            return { success: false, message: 'Invalid credentials. Check username and app password.' };
        } else {
            return { success: false, message: `WordPress API returned status ${response.status}` };
        }
    } catch (error) {
        // If fetch fails, try basic endpoint check
        try {
            const response = await fetch(`${apiUrl}/posts?per_page=1`);
            if (response.ok) {
                return {
                    success: true,
                    message: 'WordPress REST API accessible (authentication not verified)',
                    warning: 'Could not verify credentials, but API is reachable'
                };
            }
        } catch (e) {
            // Ignore
        }
        return { success: false, message: `Connection failed: ${error.message}` };
    }
}

/**
 * Verify Blogspot/Blogger connection
 */
async function verifyBlogspotConnection(connection) {
    if (!connection.blogId) {
        return { success: false, message: 'Blog ID is required for Blogspot' };
    }

    try {
        // Test if blog exists (public access)
        const response = await fetch(
            `https://www.googleapis.com/blogger/v3/blogs/${connection.blogId}?key=${process.env.GOOGLE_API_KEY || 'test'}`,
            { method: 'GET' }
        );

        if (response.ok) {
            const blog = await response.json();
            return {
                success: true,
                message: `Connected to "${blog.name}"`,
                siteInfo: {
                    blogId: blog.id,
                    name: blog.name,
                    url: blog.url
                }
            };
        } else if (response.status === 403) {
            // API key issue but blog might still be valid
            return {
                success: true,
                message: 'Blog ID saved (API key validation pending)',
                warning: 'Configure GOOGLE_API_KEY for full integration'
            };
        } else {
            return { success: false, message: 'Invalid Blog ID or blog not found' };
        }
    } catch (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
    }
}

/**
 * Verify Custom CMS API connection
 */
async function verifyCustomCMSConnection(connection) {
    if (!connection.apiUrl) {
        return { success: false, message: 'API URL is required for custom CMS' };
    }

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (connection.apiKey) {
            headers['Authorization'] = `Bearer ${connection.apiKey}`;
            headers['X-API-Key'] = connection.apiKey;
        }

        const response = await fetch(connection.apiUrl, {
            method: 'GET',
            headers
        });

        if (response.ok) {
            return {
                success: true,
                message: 'API endpoint accessible',
                statusCode: response.status
            };
        } else if (response.status === 401 || response.status === 403) {
            return { success: false, message: 'Authentication failed. Check API key.' };
        } else {
            return { success: false, message: `API returned status ${response.status}` };
        }
    } catch (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
    }
}

// ============ BLOG POSTS ============

// Get all blog posts with filters
router.get('/posts', authenticateToken, async (req, res) => {
    try {
        const { status, connectionId, limit = 50, offset = 0 } = req.query;

        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (connectionId) where.connectionId = connectionId;

        const posts = await BlogPost.findAndCountAll({
            where,
            include: [{
                model: BlogConnection,
                attributes: ['id', 'siteName', 'siteUrl', 'platform']
            }],
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
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// Get single blog post
router.get('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{
                model: BlogConnection,
                attributes: ['id', 'siteName', 'siteUrl', 'platform']
            }]
        });
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// Create blog post
router.post('/posts', authenticateToken, async (req, res) => {
    try {
        const {
            connectionId, title, content, excerpt, featuredImage,
            categories, tags, status, scheduledAt,
            metaTitle, metaDescription, slug
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const post = await BlogPost.create({
            userId: req.user.id,
            connectionId,
            title,
            content,
            excerpt,
            featuredImage,
            categories: categories || [],
            tags: tags || [],
            status: status || 'draft',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            metaTitle,
            metaDescription,
            slug
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

// Update blog post
router.put('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const {
            connectionId, title, content, excerpt, featuredImage,
            categories, tags, status, scheduledAt,
            metaTitle, metaDescription, slug
        } = req.body;

        await post.update({
            connectionId: connectionId ?? post.connectionId,
            title: title ?? post.title,
            content: content ?? post.content,
            excerpt: excerpt ?? post.excerpt,
            featuredImage: featuredImage ?? post.featuredImage,
            categories: categories ?? post.categories,
            tags: tags ?? post.tags,
            status: status ?? post.status,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : post.scheduledAt,
            metaTitle: metaTitle ?? post.metaTitle,
            metaDescription: metaDescription ?? post.metaDescription,
            slug: slug ?? post.slug
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

// Delete blog post
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        await post.destroy();
        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// Schedule blog post
router.post('/posts/:id/schedule', authenticateToken, async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        if (!scheduledAt) {
            return res.status(400).json({ error: 'scheduledAt is required' });
        }

        const post = await BlogPost.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        await post.update({
            status: 'scheduled',
            scheduledAt: new Date(scheduledAt)
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to schedule blog post' });
    }
});

// Publish blog post immediately
router.post('/posts/:id/publish', authenticateToken, async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [BlogConnection]
        });
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Check if already published
        if (post.status === 'published') {
            return res.status(400).json({ error: 'Blog post is already published' });
        }

        // Check if connection exists
        if (!post.BlogConnection) {
            return res.status(400).json({
                error: 'No blog connection selected. Please select a blog to publish to.'
            });
        }

        // Check if connection is active
        if (!post.BlogConnection.isActive) {
            return res.status(400).json({
                error: 'Blog connection is not active. Please verify the connection first.'
            });
        }

        // Update status to publishing
        await post.update({ status: 'publishing' });

        let publishResult;
        try {
            // Publish based on platform
            switch (post.BlogConnection.platform) {
                case 'wordpress':
                    publishResult = await publishToWordPress(post.BlogConnection, post);
                    break;
                case 'blogspot':
                    publishResult = await publishToBlogspot(post.BlogConnection, post);
                    break;
                case 'custom':
                    publishResult = await publishToCustomCMS(post.BlogConnection, post);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${post.BlogConnection.platform}`);
            }

            // Update post with success
            await post.update({
                status: 'published',
                publishedAt: new Date(),
                externalId: publishResult.postId,
                externalUrl: publishResult.postUrl
            });

            res.json({
                message: 'Blog post published successfully',
                post: await post.reload(),
                publishResult
            });

        } catch (publishError) {
            // Update post with failure
            await post.update({
                status: 'failed',
                publishError: publishError.message
            });

            res.status(500).json({
                error: 'Failed to publish blog post',
                details: publishError.message
            });
        }
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ error: 'Failed to publish blog post' });
    }
});

/**
 * Publish to WordPress using REST API
 */
async function publishToWordPress(connection, post) {
    const apiUrl = connection.apiUrl || `${connection.siteUrl}/wp-json/wp/v2`;
    const authHeader = Buffer.from(`${connection.username}:${connection.appPassword}`).toString('base64');

    const postData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: 'publish',
        slug: post.slug || undefined,
        categories: post.categories || [],
        tags: post.tags || []
    };

    // Add featured image if exists
    if (post.featuredImage) {
        postData.featured_media = post.featuredImage;
    }

    // Add meta fields if exists
    if (post.metaTitle || post.metaDescription) {
        postData.meta = {
            _yoast_wpseo_title: post.metaTitle || '',
            _yoast_wpseo_metadesc: post.metaDescription || ''
        };
    }

    const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `WordPress API returned status ${response.status}`);
    }

    const wpPost = await response.json();
    return {
        postId: wpPost.id.toString(),
        postUrl: wpPost.link,
        platform: 'wordpress'
    };
}

/**
 * Publish to Blogspot/Blogger
 */
async function publishToBlogspot(connection, post) {
    // Blogger API v3 requires OAuth2 access token
    if (!connection.accessToken) {
        throw new Error('Blogger requires OAuth2 authentication. Please reconnect your account.');
    }

    const postData = {
        kind: 'blogger#post',
        blog: { id: connection.blogId },
        title: post.title,
        content: post.content,
        labels: post.tags || []
    };

    const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${connection.blogId}/posts`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Blogger API returned status ${response.status}`);
    }

    const bloggerPost = await response.json();
    return {
        postId: bloggerPost.id,
        postUrl: bloggerPost.url,
        platform: 'blogspot'
    };
}

/**
 * Publish to Custom CMS API
 */
async function publishToCustomCMS(connection, post) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (connection.apiKey) {
        headers['Authorization'] = `Bearer ${connection.apiKey}`;
        headers['X-API-Key'] = connection.apiKey;
    }

    const postData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        categories: post.categories,
        tags: post.tags,
        featured_image: post.featuredImage,
        meta_title: post.metaTitle,
        meta_description: post.metaDescription,
        status: 'published'
    };

    const response = await fetch(
        connection.apiUrl.replace(/\/?$/, '/posts'),
        {
            method: 'POST',
            headers,
            body: JSON.stringify(postData)
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `API returned status ${response.status}`);
    }

    const cmsPost = await response.json();
    return {
        postId: cmsPost.id?.toString() || cmsPost.post_id?.toString(),
        postUrl: cmsPost.url || cmsPost.link || `${connection.siteUrl}/posts/${cmsPost.slug}`,
        platform: 'custom'
    };
}

// Get scheduled blog posts calendar
router.get('/posts/calendar/:year/:month', authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const posts = await BlogPost.findAll({
            where: {
                userId: req.user.id,
                scheduledAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: BlogConnection,
                attributes: ['id', 'siteName', 'platform']
            }],
            order: [['scheduledAt', 'ASC']]
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch calendar posts' });
    }
});

// ============ ANALYTICS ============

// Get blog dashboard stats
router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [totalPosts, scheduledPosts, publishedPosts, connectedBlogs, drafts] = await Promise.all([
            BlogPost.count({ where: { userId } }),
            BlogPost.count({ where: { userId, status: 'scheduled' } }),
            BlogPost.count({ where: { userId, status: 'published' } }),
            BlogConnection.count({ where: { userId, isActive: true } }),
            BlogPost.count({ where: { userId, status: 'draft' } })
        ]);

        const recentPosts = await BlogPost.findAll({
            where: { userId },
            include: [{
                model: BlogConnection,
                attributes: ['id', 'siteName', 'platform']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const upcomingScheduled = await BlogPost.findAll({
            where: {
                userId,
                status: 'scheduled',
                scheduledAt: { [Op.gte]: new Date() }
            },
            include: [{
                model: BlogConnection,
                attributes: ['id', 'siteName', 'platform']
            }],
            order: [['scheduledAt', 'ASC']],
            limit: 5
        });

        res.json({
            stats: {
                totalPosts,
                scheduledPosts,
                publishedPosts,
                connectedBlogs,
                drafts
            },
            recentPosts,
            upcomingScheduled
        });
    } catch (error) {
        console.error('Error fetching blog analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
