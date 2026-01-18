const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Project, Budget, Expense, Task, Note } = require('../models');
const { sequelize } = require('../config/database');
const { authenticate, logActivity } = require('../middleware/auth');
const logger = require('../utils/logger');

// Validation rules for creating project (name is required)
const createProjectValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
    body('client').optional().trim().isLength({ max: 255 }).withMessage('Client name too long'),
    body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('status').optional().isIn(['active', 'review', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('reportingFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'daily,weekly', 'daily,monthly', 'weekly,monthly', 'daily,weekly,monthly']).withMessage('Invalid reporting frequency')
];

// Validation rules for updating project (all fields optional)
const updateProjectValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 255 }).withMessage('Name too long'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
    body('client').optional().trim().isLength({ max: 255 }).withMessage('Client name too long'),
    body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('status').optional().isIn(['active', 'review', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('reportingFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'daily,weekly', 'daily,monthly', 'weekly,monthly', 'daily,weekly,monthly']).withMessage('Invalid reporting frequency')
];

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Budget },
                { model: Expense },
                { model: Task }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(projects);
    } catch (error) {
        logger.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                { model: Budget },
                { model: Expense },
                { model: Task },
                { model: Note }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        logger.error('Get project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Private
router.post('/', authenticate, createProjectValidation, logActivity('create', 'project'), async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, client, startDate, endDate, value, status, color, reportingFrequency } = req.body;

        // Validate endDate is after startDate
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        const project = await Project.create({
            name,
            description,
            client,
            startDate,
            endDate,
            value: value || 0,
            status: status || 'active',
            color: color || '#8b5cf6',
            reportingFrequency,
            userId: req.user.id
        });

        res.status(201).json(project);
    } catch (error) {
        logger.error('Create project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', authenticate, updateProjectValidation, logActivity('update', 'project'), async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { name, description, client, startDate, endDate, value, status, progress, color, reportingFrequency } = req.body;

        // Validate endDate is after startDate
        const finalStartDate = startDate || project.startDate;
        const finalEndDate = endDate || project.endDate;
        if (finalStartDate && finalEndDate && new Date(finalEndDate) < new Date(finalStartDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        await project.update({
            name,
            description,
            client,
            startDate,
            endDate,
            value,
            status,
            progress,
            color,
            reportingFrequency
        });

        res.json(project);
    } catch (error) {
        logger.error('Update project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'project'), async (req, res) => {
    // Use transaction to ensure atomic delete operation
    const transaction = await sequelize.transaction();

    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id },
            transaction
        });

        if (!project) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete related data atomically
        await Budget.destroy({ where: { projectId: project.id }, transaction });
        await Expense.destroy({ where: { projectId: project.id }, transaction });
        await Task.destroy({ where: { projectId: project.id }, transaction });
        await Note.destroy({ where: { projectId: project.id }, transaction });

        await project.destroy({ transaction });

        // Commit transaction
        await transaction.commit();

        res.json({ message: 'Project deleted' });
    } catch (error) {
        // Rollback on error
        await transaction.rollback();
        logger.error('Delete project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
