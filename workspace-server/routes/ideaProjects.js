const express = require('express');
const router = express.Router();
const { IdeaProject } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');

// @route   GET /api/idea-projects
// @desc    Get all idea projects for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, priority } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const ideaProjects = await IdeaProject.findAll({
            where,
            order: [['updatedAt', 'DESC']]
        });
        res.json(ideaProjects);
    } catch (error) {
        console.error('Get idea projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/idea-projects/:id
// @desc    Get single idea project
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const ideaProject = await IdeaProject.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!ideaProject) {
            return res.status(404).json({ message: 'Idea project not found' });
        }

        res.json(ideaProject);
    } catch (error) {
        console.error('Get idea project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/idea-projects
// @desc    Create idea project
// @access  Private
router.post('/', authenticate, logActivity('create', 'idea_project'), async (req, res) => {
    try {
        const { name, description, status, priority, color, targetDate, launchDate, progress, tags, links, attachments } = req.body;

        const ideaProject = await IdeaProject.create({
            name,
            description,
            status: status || 'idea',
            priority: priority || 'medium',
            color: color || '#8b5cf6',
            targetDate,
            launchDate,
            progress: progress || 0,
            tags: tags || [],
            links: links || [],
            attachments: attachments || [],
            userId: req.user.id
        });

        res.status(201).json(ideaProject);
    } catch (error) {
        console.error('Create idea project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/idea-projects/:id
// @desc    Update idea project
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'idea_project'), async (req, res) => {
    try {
        const ideaProject = await IdeaProject.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!ideaProject) {
            return res.status(404).json({ message: 'Idea project not found' });
        }

        const { name, description, status, priority, color, targetDate, launchDate, progress, tags, links, attachments } = req.body;

        await ideaProject.update({
            name,
            description,
            status,
            priority,
            color,
            targetDate,
            launchDate,
            progress,
            tags,
            links,
            attachments
        });

        res.json(ideaProject);
    } catch (error) {
        console.error('Update idea project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/idea-projects/:id/progress
// @desc    Update idea project progress only
// @access  Private
router.put('/:id/progress', authenticate, async (req, res) => {
    try {
        const ideaProject = await IdeaProject.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!ideaProject) {
            return res.status(404).json({ message: 'Idea project not found' });
        }

        const { progress } = req.body;
        await ideaProject.update({ progress: Math.min(Math.max(progress, 0), 100) });

        res.json(ideaProject);
    } catch (error) {
        console.error('Update idea project progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/idea-projects/:id/status
// @desc    Update idea project status
// @access  Private
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const ideaProject = await IdeaProject.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!ideaProject) {
            return res.status(404).json({ message: 'Idea project not found' });
        }

        const { status } = req.body;
        const updates = { status };

        // Auto-set launch date when status becomes 'launched'
        if (status === 'launched' && !ideaProject.launchDate) {
            updates.launchDate = new Date().toISOString().split('T')[0];
            updates.progress = 100;
        }

        await ideaProject.update(updates);
        res.json(ideaProject);
    } catch (error) {
        console.error('Update idea project status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/idea-projects/:id
// @desc    Delete idea project
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'idea_project'), async (req, res) => {
    try {
        const ideaProject = await IdeaProject.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!ideaProject) {
            return res.status(404).json({ message: 'Idea project not found' });
        }

        await ideaProject.destroy();
        res.json({ message: 'Idea project deleted' });
    } catch (error) {
        console.error('Delete idea project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
