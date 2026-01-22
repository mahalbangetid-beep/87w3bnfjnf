const express = require('express');
const router = express.Router();
const { FeatureSuggestion, User, Notification } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   POST /api/suggestions
// @desc    Submit a new feature suggestion
// @access  Private
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const suggestion = await FeatureSuggestion.create({
            userId: req.user.id,
            title,
            description,
            category: category || 'feature',
            priority: priority || 'medium'
        });

        // Create notification for all admins
        const admins = await User.findAll({
            include: [{ model: require('../models').Role, where: { name: ['admin', 'superadmin'] } }]
        });
        for (const admin of admins) {
            await Notification.create({
                userId: admin.id,
                type: 'feature_suggestion',
                title: 'New Feature Suggestion',
                message: `${req.user.name} submitted a new suggestion: ${title}`,
                data: JSON.stringify({ suggestionId: suggestion.id }),
                read: false
            });
        }

        res.status(201).json(suggestion);
    } catch (error) {
        console.error('Create suggestion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/suggestions
// @desc    Get all suggestions (admin) or user's suggestions
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, category } = req.query;
        const where = {};

        // Regular users only see their own suggestions
        const userRole = req.user.Role?.name || '';
        const isAdmin = userRole === 'admin' || userRole === 'superadmin';
        if (!isAdmin) {
            where.userId = req.user.id;
        }

        if (status) where.status = status;
        if (category) where.category = category;

        const suggestions = await FeatureSuggestion.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(suggestions);
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/suggestions/:id
// @desc    Get single suggestion
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const suggestion = await FeatureSuggestion.findOne({
            where: { id: req.params.id },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }]
        });

        if (!suggestion) {
            return res.status(404).json({ message: 'Suggestion not found' });
        }

        // Non-admins can only view their own suggestions
        const userRole = req.user.Role?.name || '';
        const isAdmin = userRole === 'admin' || userRole === 'superadmin';
        if (!isAdmin && suggestion.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(suggestion);
    } catch (error) {
        console.error('Get suggestion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/suggestions/:id/status
// @desc    Update suggestion status (admin only)
// @access  Admin
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const suggestion = await FeatureSuggestion.findByPk(req.params.id);
        if (!suggestion) {
            return res.status(404).json({ message: 'Suggestion not found' });
        }

        await suggestion.update({ status, adminNotes });

        // Notify the user about status change
        await Notification.create({
            userId: suggestion.userId,
            type: 'suggestion_update',
            title: 'Suggestion Status Updated',
            message: `Your suggestion "${suggestion.title}" has been ${status}`,
            data: JSON.stringify({ suggestionId: suggestion.id, status }),
            read: false
        });

        res.json(suggestion);
    } catch (error) {
        console.error('Update suggestion status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/suggestions/:id/vote
// @desc    Vote for a suggestion
// @access  Private
router.post('/:id/vote', authenticate, async (req, res) => {
    try {
        const suggestion = await FeatureSuggestion.findByPk(req.params.id);
        if (!suggestion) {
            return res.status(404).json({ message: 'Suggestion not found' });
        }

        await suggestion.increment('votes');
        await suggestion.reload();

        res.json({ votes: suggestion.votes });
    } catch (error) {
        console.error('Vote suggestion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/suggestions/:id
// @desc    Delete suggestion
// @access  Private (owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const suggestion = await FeatureSuggestion.findByPk(req.params.id);
        if (!suggestion) {
            return res.status(404).json({ message: 'Suggestion not found' });
        }

        const userRole = req.user.Role?.name || '';
        const isAdmin = userRole === 'admin' || userRole === 'superadmin';
        if (!isAdmin && suggestion.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await suggestion.destroy();
        res.json({ message: 'Suggestion deleted' });
    } catch (error) {
        console.error('Delete suggestion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
