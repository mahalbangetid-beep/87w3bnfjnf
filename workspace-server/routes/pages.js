const express = require('express');
const router = express.Router();
const { PageContent } = require('../models');
const { authenticate, requireBlogRole } = require('../middleware/auth');

// ==================== ADMIN ROUTES (must be before :slug route) ====================

// @route   GET /api/pages/admin/all
// @desc    Get all pages for admin management
// @access  Private (Blog Role)
router.get('/admin/all', authenticate, requireBlogRole, async (req, res) => {
    try {
        const pages = await PageContent.findAll({
            order: [['updatedAt', 'DESC']]
        });

        // Merge with default pages that haven't been customized
        const defaultSlugs = ['about', 'privacy', 'terms', 'security'];
        const existingSlugs = pages.map(p => p.slug);

        const allPages = [...pages];

        defaultSlugs.forEach(slug => {
            if (!existingSlugs.includes(slug)) {
                const defaults = getDefaultPageContent(slug);
                if (defaults) {
                    allPages.push({
                        id: null,
                        slug,
                        title: defaults.title,
                        subtitle: defaults.subtitle || '',
                        content: defaults.content || '',
                        sections: defaults.sections || [],
                        isPublished: true,
                        isDefault: true,
                        updatedAt: null
                    });
                }
            }
        });

        res.json(allPages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/pages/admin/:slug
// @desc    Get page for editing (includes unpublished)
// @access  Private (Blog Role)
router.get('/admin/:slug', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { slug } = req.params;

        let page = await PageContent.findOne({ where: { slug } });

        // If page doesn't exist, return default content template
        if (!page) {
            const defaults = getDefaultPageContent(slug);
            if (defaults) {
                const response = {
                    id: null,
                    slug,
                    ...defaults,
                    isDefault: true
                };
                console.log(`[Pages API] Returning default for ${slug}:`, {
                    title: response.title,
                    sectionsCount: response.sections?.length || 0,
                    hasContent: !!response.content
                });
                return res.json(response);
            }
            return res.status(404).json({ message: 'Page not found' });
        }

        console.log(`[Pages API] Returning DB page for ${slug}:`, {
            title: page.title,
            sectionsCount: Array.isArray(page.sections) ? page.sections.length : 'not array',
            hasContent: !!page.content
        });
        res.json(page);
    } catch (error) {
        console.error('Error fetching page for edit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/pages/admin/:slug
// @desc    Create or update page content
// @access  Private (Blog Role)
router.put('/admin/:slug', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            title,
            subtitle,
            content,
            sections,
            metaTitle,
            metaDescription,
            metaKeywords,
            isPublished = true
        } = req.body;

        let page = await PageContent.findOne({ where: { slug } });

        if (page) {
            // Update existing page
            await page.update({
                title,
                subtitle,
                content,
                sections: sections || [],
                metaTitle,
                metaDescription,
                metaKeywords,
                isPublished,
                lastUpdatedBy: req.user.id,
                publishedAt: isPublished ? new Date() : page.publishedAt
            });
        } else {
            // Create new page
            page = await PageContent.create({
                slug,
                title,
                subtitle,
                content,
                sections: sections || [],
                metaTitle,
                metaDescription,
                metaKeywords,
                isPublished,
                lastUpdatedBy: req.user.id,
                publishedAt: isPublished ? new Date() : null
            });
        }

        res.json({
            message: 'Page saved successfully',
            page
        });
    } catch (error) {
        console.error('Error saving page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/pages/admin/:slug/reset
// @desc    Reset page to default content
// @access  Private (Blog Role)
router.post('/admin/:slug/reset', authenticate, requireBlogRole, async (req, res) => {
    try {
        const { slug } = req.params;

        // Delete custom page content
        await PageContent.destroy({ where: { slug } });

        res.json({
            message: 'Page reset to default',
            page: getDefaultPageContent(slug)
        });
    } catch (error) {
        console.error('Error resetting page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/pages/:slug
// @desc    Get published page content by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        let page = await PageContent.findOne({
            where: { slug, isPublished: true }
        });

        // If page doesn't exist, return default content
        if (!page) {
            const defaults = getDefaultPageContent(slug);
            if (defaults) {
                return res.json(defaults);
            }
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== DEFAULT CONTENT ====================

function getDefaultPageContent(slug) {
    const defaults = {
        about: {
            title: 'About Us',
            subtitle: 'Empowering Productivity for Everyone',
            content: '',
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    title: 'About Us',
                    subtitle: 'We\'re on a mission to transform how people work, creating tools that unlock human potential and make productivity feel effortless.',
                    badge: 'Innovating Since 2020'
                },
                {
                    id: 'mission',
                    type: 'mission',
                    title: 'Our Mission',
                    heading: 'Empowering Productivity for Everyone',
                    description: 'We believe that everyone deserves access to powerful tools that help them achieve their goals.',
                    points: [
                        'Simplify complex workflows',
                        'Boost team collaboration',
                        'Enable data-driven decisions'
                    ]
                },
                {
                    id: 'values',
                    type: 'values',
                    title: 'Our Values',
                    heading: 'What Drives Us',
                    description: 'These core values guide everything we do.',
                    items: [
                        { icon: 'lightning', title: 'Innovation', description: 'Pushing boundaries.', color: '#f59e0b' },
                        { icon: 'heart', title: 'Passion', description: 'We love what we do.', color: '#ec4899' },
                        { icon: 'users', title: 'Collaboration', description: 'Working together.', color: '#06b6d4' },
                        { icon: 'globe', title: 'Impact', description: 'Making a difference.', color: '#8b5cf6' }
                    ]
                },
                {
                    id: 'stats',
                    type: 'stats',
                    items: [
                        { number: '100K+', label: 'Active Users' },
                        { number: '50+', label: 'Countries' },
                        { number: '99.9%', label: 'Uptime' },
                        { number: '4.9/5', label: 'Rating' }
                    ]
                }
            ],
            metaTitle: 'About Us - Workspace',
            metaDescription: 'Learn about our mission.',
            metaKeywords: 'about, workspace, team'
        },
        privacy: {
            title: 'Privacy Policy',
            subtitle: 'Your privacy is important to us',
            content: '<h2>1. Introduction</h2><p>This Privacy Policy explains how we collect and use your information.</p><h2>2. Information We Collect</h2><p>We collect information you provide directly to us.</p><h2>3. How We Use Your Information</h2><p>We use the information to provide and improve our services.</p><h2>4. Contact Us</h2><p>Contact us at privacy@workspace.app</p>',
            sections: [],
            metaTitle: 'Privacy Policy - Workspace',
            metaDescription: 'Our privacy policy.',
            metaKeywords: 'privacy, policy'
        },
        terms: {
            title: 'Terms of Service',
            subtitle: 'Please read these terms carefully',
            content: '<h2>1. Acceptance of Terms</h2><p>By using this service, you agree to these terms.</p><h2>2. Use of Service</h2><p>You agree to use the service lawfully.</p><h2>3. User Accounts</h2><p>You are responsible for your account.</p><h2>4. Contact Us</h2><p>Contact us at legal@workspace.app</p>',
            sections: [],
            metaTitle: 'Terms of Service - Workspace',
            metaDescription: 'Our terms of service.',
            metaKeywords: 'terms, service'
        },
        security: {
            title: 'Security',
            subtitle: 'Your security is our priority',
            content: '<h2>Our Commitment</h2><p>We take security seriously.</p><h2>Data Encryption</h2><p>All data is encrypted using TLS 1.3.</p><h2>Infrastructure</h2><p>SOC 2 Type II certified data centers.</p><h2>Contact</h2><p>Report issues to security@workspace.app</p>',
            sections: [],
            metaTitle: 'Security - Workspace',
            metaDescription: 'Our security measures.',
            metaKeywords: 'security, encryption'
        }
    };

    return defaults[slug] || null;
}

module.exports = router;
