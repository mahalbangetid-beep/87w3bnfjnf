const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
    BlogArticle,
    BlogCategory,
    BlogTag,
    BlogArticleTag,
    BlogComment,
    User,
    Role
} = require('../models');
const { authenticate } = require('../middleware/auth');

// Helper to generate slug
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ============ PUBLIC ROUTES ============

// Get all published articles (for public blog)
router.get('/public/articles', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            search,
            featured
        } = req.query;

        const offset = (page - 1) * limit;

        const where = {
            status: 'published',
            publishedAt: { [Op.lte]: new Date() }
        };

        if (category) {
            const cat = await BlogCategory.findOne({ where: { slug: category } });
            if (cat) where.categoryId = cat.id;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { excerpt: { [Op.like]: `%${search}%` } }
            ];
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        let include = [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'avatar']
            },
            {
                model: BlogCategory,
                as: 'category',
                attributes: ['id', 'name', 'slug', 'color']
            },
            {
                model: BlogTag,
                as: 'tags',
                attributes: ['id', 'name', 'slug', 'color'],
                through: { attributes: [] }
            }
        ];

        // Filter by tag
        if (tag) {
            include[2].where = { slug: tag };
            include[2].required = true;
        }

        const { count, rows: articles } = await BlogArticle.findAndCountAll({
            where,
            include,
            order: [['publishedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        res.json({
            articles,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get single article by slug (public)
router.get('/public/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const article = await BlogArticle.findOne({
            where: {
                slug,
                status: 'published',
                publishedAt: { [Op.lte]: new Date() }
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                },
                {
                    model: BlogTag,
                    as: 'tags',
                    attributes: ['id', 'name', 'slug', 'color'],
                    through: { attributes: [] }
                },
                {
                    model: BlogComment,
                    as: 'comments',
                    where: {
                        status: 'approved',
                        parentId: null
                    },
                    required: false,
                    include: [
                        {
                            model: BlogComment,
                            as: 'replies',
                            where: { status: 'approved' },
                            required: false,
                            include: [{
                                model: User,
                                as: 'user',
                                attributes: ['id', 'name', 'avatar']
                            }]
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'avatar']
                        }
                    ]
                }
            ]
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Increment view count
        await article.increment('views');

        // Get related articles
        const relatedArticles = await BlogArticle.findAll({
            where: {
                id: { [Op.ne]: article.id },
                status: 'published',
                publishedAt: { [Op.lte]: new Date() },
                [Op.or]: [
                    { categoryId: article.categoryId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ],
            limit: 3,
            order: [['publishedAt', 'DESC']]
        });

        res.json({ article, relatedArticles });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Get all categories (public)
router.get('/public/categories', async (req, res) => {
    try {
        const categories = await BlogCategory.findAll({
            where: { isActive: true },
            attributes: {
                include: [
                    [
                        require('sequelize').literal(
                            `(SELECT COUNT(*) FROM blog_articles WHERE blog_articles.category_id = BlogCategory.id AND blog_articles.status = 'published')`
                        ),
                        'articleCount'
                    ]
                ]
            },
            order: [['order', 'ASC'], ['name', 'ASC']]
        });

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get popular tags (public)
router.get('/public/tags', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const tags = await BlogTag.findAll({
            order: [['usageCount', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Post a comment (public - no auth required)
router.post('/public/articles/:slug/comments', async (req, res) => {
    try {
        const { slug } = req.params;
        const { authorName, authorEmail, content, parentId } = req.body;

        if (!authorName || !authorEmail || !content) {
            return res.status(400).json({ error: 'Name, email, and comment are required' });
        }

        const article = await BlogArticle.findOne({
            where: { slug, status: 'published', allowComments: true }
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found or comments are disabled' });
        }

        const comment = await BlogComment.create({
            articleId: article.id,
            parentId: parentId || null,
            authorName,
            authorEmail,
            content,
            status: 'pending', // Auto-approve can be configured
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            message: 'Comment submitted successfully. It will be visible after approval.',
            comment
        });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// ============ ADMIN/BLOGGER ROUTES (Protected) ============

// Middleware to check if user has blog role
const requireBlogRole = async (req, res, next) => {
    try {
        const userWithRole = await User.findByPk(req.user.id, {
            include: [{ model: Role }]
        });

        const allowedRoles = ['superadmin', 'admin', 'blog', 'blogger'];
        if (!userWithRole?.Role || !allowedRoles.includes(userWithRole.Role.name)) {
            return res.status(403).json({ error: 'Access denied. Blog role required.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// Get all articles for admin
router.get('/admin/articles', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};

        // Non-admin can only see their own articles
        const userRole = await User.findByPk(req.user.id, { include: [{ model: Role }] });
        if (!['superadmin', 'admin'].includes(userRole?.Role?.name)) {
            where.authorId = req.user.id;
        }

        if (status) where.status = status;

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: articles } = await BlogArticle.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: BlogCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            articles,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching admin articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Create new article
router.post('/admin/articles', authenticate, requireBlogRole, async (req, res) => {
    try {
        const {
            title,
            excerpt,
            content,
            featuredImage,
            categoryId,
            tags,
            status = 'draft',
            scheduledAt,
            isFeatured,
            allowComments = true,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate unique slug
        let slug = generateSlug(title);
        const existingSlug = await BlogArticle.findOne({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        const article = await BlogArticle.create({
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            authorId: req.user.id,
            categoryId,
            status,
            publishedAt: status === 'published' ? new Date() : null,
            scheduledAt: status === 'scheduled' ? scheduledAt : null,
            isFeatured: isFeatured || false,
            allowComments,
            metaTitle,
            metaDescription,
            metaKeywords
        });

        // Handle tags
        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tag = await BlogTag.findOne({ where: { name: tagName } });

                if (!tag) {
                    tag = await BlogTag.create({
                        name: tagName,
                        slug: generateSlug(tagName)
                    });
                }

                await BlogArticleTag.create({
                    articleId: article.id,
                    tagId: tag.id
                });

                await tag.increment('usageCount');
            }
        }

        // Fetch complete article with associations
        const completeArticle = await BlogArticle.findByPk(article.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
                { model: BlogCategory, as: 'category' },
                { model: BlogTag, as: 'tags', through: { attributes: [] } }
            ]
        });

        res.status(201).json(completeArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// Update article
router.put('/admin/articles/:id', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            excerpt,
            content,
            featuredImage,
            categoryId,
            tags,
            status,
            scheduledAt,
            isFeatured,
            allowComments,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        const article = await BlogArticle.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership (non-admin can only edit their own)
        const userRole = await User.findByPk(req.user.id, { include: [{ model: Role }] });
        if (!['superadmin', 'admin'].includes(userRole?.Role?.name) && article.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this article' });
        }

        // Update slug if title changed
        let slug = article.slug;
        if (title && title !== article.title) {
            slug = generateSlug(title);
            const existingSlug = await BlogArticle.findOne({
                where: { slug, id: { [Op.ne]: id } }
            });
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Handle publishing
        let publishedAt = article.publishedAt;
        if (status === 'published' && article.status !== 'published') {
            publishedAt = new Date();
        }

        await article.update({
            title: title || article.title,
            slug,
            excerpt,
            content,
            featuredImage,
            categoryId,
            status: status || article.status,
            publishedAt,
            scheduledAt: status === 'scheduled' ? scheduledAt : null,
            isFeatured: isFeatured !== undefined ? isFeatured : article.isFeatured,
            allowComments: allowComments !== undefined ? allowComments : article.allowComments,
            metaTitle,
            metaDescription,
            metaKeywords
        });

        // Update tags
        if (tags) {
            // Remove old tags
            await BlogArticleTag.destroy({ where: { articleId: id } });

            // Add new tags
            for (const tagName of tags) {
                let tag = await BlogTag.findOne({ where: { name: tagName } });

                if (!tag) {
                    tag = await BlogTag.create({
                        name: tagName,
                        slug: generateSlug(tagName)
                    });
                }

                await BlogArticleTag.create({
                    articleId: article.id,
                    tagId: tag.id
                });
            }
        }

        // Fetch updated article
        const updatedArticle = await BlogArticle.findByPk(id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
                { model: BlogCategory, as: 'category' },
                { model: BlogTag, as: 'tags', through: { attributes: [] } }
            ]
        });

        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// Delete article
router.delete('/admin/articles/:id', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;

        const article = await BlogArticle.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership
        const userRole = await User.findByPk(req.user.id, { include: [{ model: Role }] });
        if (!['superadmin', 'admin'].includes(userRole?.Role?.name) && article.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this article' });
        }

        // Delete related data
        await BlogArticleTag.destroy({ where: { articleId: id } });
        await BlogComment.destroy({ where: { articleId: id } });
        await article.destroy();

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// ============ CATEGORY MANAGEMENT ============

router.get('/admin/categories', authenticate, requireBlogRole, async (req, res) => {
    try {
        const categories = await BlogCategory.findAll({
            order: [['order', 'ASC'], ['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/admin/categories', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { name, description, color, icon, order } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const slug = generateSlug(name);

        const category = await BlogCategory.create({
            name,
            slug,
            description,
            color: color || '#8b5cf6',
            icon,
            order: order || 0
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.put('/admin/categories/:id', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon, order, isActive } = req.body;

        const category = await BlogCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        let slug = category.slug;
        if (name && name !== category.name) {
            slug = generateSlug(name);
        }

        await category.update({
            name: name || category.name,
            slug,
            description,
            color: color || category.color,
            icon: icon || category.icon,
            order: order !== undefined ? order : category.order,
            isActive: isActive !== undefined ? isActive : category.isActive
        });

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

router.delete('/admin/categories/:id', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;

        const category = await BlogCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Set articles to uncategorized
        await BlogArticle.update({ categoryId: null }, { where: { categoryId: id } });
        await category.destroy();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ============ COMMENT MODERATION ============

router.get('/admin/comments', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: comments } = await BlogComment.findAndCountAll({
            where: { status },
            include: [
                {
                    model: BlogArticle,
                    as: 'article',
                    attributes: ['id', 'title', 'slug']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            comments,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.put('/admin/comments/:id/status', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'spam', 'deleted'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const comment = await BlogComment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        await comment.update({ status });
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment status' });
    }
});

router.delete('/admin/comments/:id', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await BlogComment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Delete replies first
        await BlogComment.destroy({ where: { parentId: id } });
        await comment.destroy();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// ============ BLOG DASHBOARD STATS ============

router.get('/admin/stats', authenticate, requireBlogRole, async (req, res) => {
    try {
        const userRole = await User.findByPk(req.user.id, { include: [{ model: Role }] });
        const isAdmin = ['superadmin', 'admin'].includes(userRole?.Role?.name);

        const authorFilter = isAdmin ? {} : { authorId: req.user.id };

        const [
            totalArticles,
            publishedArticles,
            draftArticles,
            totalViews,
            pendingComments
        ] = await Promise.all([
            BlogArticle.count({ where: authorFilter }),
            BlogArticle.count({ where: { ...authorFilter, status: 'published' } }),
            BlogArticle.count({ where: { ...authorFilter, status: 'draft' } }),
            BlogArticle.sum('views', { where: authorFilter }) || 0,
            BlogComment.count({ where: { status: 'pending' } })
        ]);

        res.json({
            totalArticles,
            publishedArticles,
            draftArticles,
            totalViews,
            pendingComments
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
