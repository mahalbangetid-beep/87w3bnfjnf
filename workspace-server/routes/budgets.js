const express = require('express');
const router = express.Router();
const { Budget, Expense, Project } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// ==================== BUDGETS ====================

// @route   GET /api/budgets
// @desc    Get all budgets for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const budgets = await Budget.findAll({
            where: { userId: req.user.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(budgets);
    } catch (error) {
        logger.error('Get budgets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/budgets
// @desc    Create budget for project
// @access  Private
router.post('/', authenticate, logActivity('create', 'budget'), async (req, res) => {
    try {
        const { projectId, amount, description } = req.body;

        // Validate required fields
        if (!projectId || amount === undefined) {
            return res.status(400).json({ message: 'Project ID and amount are required' });
        }

        // Validate amount is positive
        if (amount < 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        // SECURITY: Verify project belongs to user
        const project = await Project.findOne({
            where: { id: projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        // Check if budget already exists for project
        const existing = await Budget.findOne({
            where: { projectId, userId: req.user.id }
        });

        if (existing) {
            return res.status(400).json({ message: 'Budget already exists for this project' });
        }

        const budget = await Budget.create({
            projectId,
            amount,
            description,
            userId: req.user.id
        });

        res.status(201).json(budget);
    } catch (error) {
        logger.error('Create budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'budget'), async (req, res) => {
    try {
        const budget = await Budget.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const { amount, description } = req.body;

        // Validate amount if provided
        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        await budget.update({ amount, description });

        // Reload with Project relation for consistent response
        const updatedBudget = await Budget.findOne({
            where: { id: budget.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedBudget);
    } catch (error) {
        logger.error('Update budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'budget'), async (req, res) => {
    try {
        const budget = await Budget.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await budget.destroy();
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        logger.error('Delete budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== EXPENSES ====================

// @route   GET /api/budgets/expenses
// @desc    Get all expenses for user
// @access  Private
router.get('/expenses', authenticate, async (req, res) => {
    try {
        const { projectId, category, startDate, endDate } = req.query;
        const where = { userId: req.user.id };

        if (projectId) where.projectId = projectId;
        if (category) where.category = category;
        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        }

        const expenses = await Expense.findAll({
            where,
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(expenses);
    } catch (error) {
        logger.error('Get expenses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/budgets/expenses
// @desc    Create expense
// @access  Private
router.post('/expenses', authenticate, logActivity('create', 'expense'), async (req, res) => {
    try {
        const { projectId, amount, description, category, date } = req.body;

        // Validate required fields
        if (!projectId || amount === undefined || !description || !date) {
            return res.status(400).json({ message: 'Project ID, amount, description, and date are required' });
        }

        // Validate amount is positive
        if (amount < 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        // Validate category
        const validCategories = ['software', 'hardware', 'service', 'marketing', 'operations', 'other'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // SECURITY: Verify project belongs to user
        const project = await Project.findOne({
            where: { id: projectId, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found or access denied' });
        }

        const expense = await Expense.create({
            projectId,
            amount,
            description,
            category: category || 'other',
            date,
            userId: req.user.id
        });

        res.status(201).json(expense);
    } catch (error) {
        logger.error('Create expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/budgets/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/expenses/:id', authenticate, logActivity('update', 'expense'), async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const { projectId, amount, description, category, date } = req.body;

        // Validate amount if provided
        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        // Validate category if provided
        const validCategories = ['software', 'hardware', 'service', 'marketing', 'operations', 'other'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }

        // Validate date format if provided
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        await expense.update({ projectId, amount, description, category, date });

        // Reload with Project relation for consistent response
        const updatedExpense = await Expense.findOne({
            where: { id: expense.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedExpense);
    } catch (error) {
        logger.error('Update expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/budgets/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/expenses/:id', authenticate, logActivity('delete', 'expense'), async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await expense.destroy();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        logger.error('Delete expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
