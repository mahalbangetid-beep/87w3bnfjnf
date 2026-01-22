const express = require('express');
const router = express.Router();
const { Task, Project } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { date, startDate, endDate, completed } = req.query;
        const where = { userId: req.user.id };

        if (date) {
            where.date = date;
        }

        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        }

        if (completed !== undefined) {
            where.completed = completed === 'true';
        }

        const tasks = await Task.findAll({
            where,
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });
        res.json(tasks);
    } catch (error) {
        logger.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Project }]
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        logger.error('Get task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private
router.post('/', authenticate, logActivity('create', 'task'), async (req, res) => {
    try {
        const { title, description, date, time, color, projectId, priority } = req.body;

        // Validate required fields
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and date are required' });
        }

        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Validate time format if provided (HH:MM)
        if (time && !/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
        }

        // Validate color format
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate priority
        const validPriorities = ['low', 'medium', 'high'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority. Must be low, medium, or high' });
        }

        const task = await Task.create({
            title,
            description,
            date,
            time,
            color: color || '#8b5cf6',
            priority: priority || 'medium',
            projectId,
            userId: req.user.id
        });

        res.status(201).json(task);
    } catch (error) {
        logger.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'task'), async (req, res) => {
    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { title, description, date, time, completed, color, projectId, priority } = req.body;

        // Validate date format if provided
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Validate time format if provided
        if (time && !/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
        }

        // Validate color format if provided
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate priority if provided
        const validPriorities = ['low', 'medium', 'high'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority. Must be low, medium, or high' });
        }

        await task.update({
            title,
            description,
            date,
            time,
            completed,
            color,
            projectId,
            priority
        });

        // Reload with Project relation for consistent response
        const updatedTask = await Task.findOne({
            where: { id: task.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedTask);
    } catch (error) {
        logger.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'task'), async (req, res) => {
    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        logger.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tasks/:id/complete
// @desc    Toggle task completion
// @access  Private
router.put('/:id/complete', authenticate, async (req, res) => {
    try {
        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.update({ completed: !task.completed });

        // Reload with relations to maintain consistency
        const updatedTask = await Task.findOne({
            where: { id: task.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedTask);
    } catch (error) {
        logger.error('Toggle complete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
