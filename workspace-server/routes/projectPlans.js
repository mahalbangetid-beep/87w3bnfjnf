const express = require('express');
const router = express.Router();
const { ProjectPlan } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');

// @route   GET /api/project-plans
// @desc    Get all project plans for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, priority } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const projectPlans = await ProjectPlan.findAll({
            where,
            order: [['updatedAt', 'DESC']]
        });
        res.json(projectPlans);
    } catch (error) {
        console.error('Get project plans error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/project-plans/:id
// @desc    Get single project plan
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const projectPlan = await ProjectPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!projectPlan) {
            return res.status(404).json({ message: 'Project plan not found' });
        }

        res.json(projectPlan);
    } catch (error) {
        console.error('Get project plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/project-plans
// @desc    Create project plan
// @access  Private
router.post('/', authenticate, logActivity('create', 'project_plan'), async (req, res) => {
    try {
        const { name, description, status, priority, color, targetDate, launchDate, progress, tags, links, attachments } = req.body;

        const projectPlan = await ProjectPlan.create({
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

        res.status(201).json(projectPlan);
    } catch (error) {
        console.error('Create project plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/project-plans/:id
// @desc    Update project plan
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'project_plan'), async (req, res) => {
    try {
        const projectPlan = await ProjectPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!projectPlan) {
            return res.status(404).json({ message: 'Project plan not found' });
        }

        const { name, description, status, priority, color, targetDate, launchDate, progress, tags, links, attachments } = req.body;

        await projectPlan.update({
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

        res.json(projectPlan);
    } catch (error) {
        console.error('Update project plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/project-plans/:id/progress
// @desc    Update project plan progress only
// @access  Private
router.put('/:id/progress', authenticate, async (req, res) => {
    try {
        const projectPlan = await ProjectPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!projectPlan) {
            return res.status(404).json({ message: 'Project plan not found' });
        }

        const { progress } = req.body;
        await projectPlan.update({ progress: Math.min(Math.max(progress, 0), 100) });

        res.json(projectPlan);
    } catch (error) {
        console.error('Update project plan progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/project-plans/:id/status
// @desc    Update project plan status
// @access  Private
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const projectPlan = await ProjectPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!projectPlan) {
            return res.status(404).json({ message: 'Project plan not found' });
        }

        const { status } = req.body;
        const updates = { status };

        // Auto-set launch date when status becomes 'launched'
        if (status === 'launched' && !projectPlan.launchDate) {
            updates.launchDate = new Date().toISOString().split('T')[0];
            updates.progress = 100;
        }

        await projectPlan.update(updates);
        res.json(projectPlan);
    } catch (error) {
        console.error('Update project plan status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/project-plans/:id
// @desc    Delete project plan
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'project_plan'), async (req, res) => {
    try {
        const projectPlan = await ProjectPlan.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!projectPlan) {
            return res.status(404).json({ message: 'Project plan not found' });
        }

        await projectPlan.destroy();
        res.json({ message: 'Project plan deleted' });
    } catch (error) {
        console.error('Delete project plan error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
