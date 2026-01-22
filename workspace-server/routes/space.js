const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Milestone, Goal, Project, IdeaProject, SpaceTransaction, SpaceAsset, SpaceBudget } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');
const logger = require('../utils/logger');

// Validation rules for milestone
const milestoneValidation = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
    body('date').notEmpty().withMessage('Date is required').isISO8601().toDate().withMessage('Invalid date format'),
    body('status').optional().isIn(['upcoming', 'active', 'completed']).withMessage('Invalid status'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('projectId').optional({ nullable: true }).isInt().withMessage('Invalid project ID')
];

// Validation rules for goal
const goalValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
    body('current').optional().isFloat({ min: 0 }).withMessage('Current must be a non-negative number'),
    body('target').notEmpty().withMessage('Target is required').isFloat({ min: 0.01 }).withMessage('Target must be a positive number'),
    body('unit').optional().trim().isLength({ max: 50 }).withMessage('Unit too long'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('deadline').optional({ nullable: true }).isISO8601().toDate().withMessage('Invalid deadline format'),
    body('status').optional().isIn(['active', 'completed', 'paused']).withMessage('Invalid status'),
    body('category').optional().isIn(['revenue', 'users', 'features', 'performance', 'marketing', 'other']).withMessage('Invalid category')
];

// Helper to verify project ownership
const verifyProjectOwnership = async (projectId, userId) => {
    if (!projectId) return true;
    const project = await Project.findOne({ where: { id: projectId, userId } });
    return !!project;
};

// ==================== STATS ====================

// @route   GET /api/space/stats
// @desc    Get space statistics for dashboard
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
    try {
        const [milestones, goals, projects] = await Promise.all([
            Milestone.count({ where: { userId: req.user.id } }),
            Goal.count({ where: { userId: req.user.id } }),
            Project.count({ where: { userId: req.user.id } })
        ]);

        const activeMilestones = await Milestone.count({
            where: { userId: req.user.id, status: 'active' }
        });
        const completedMilestones = await Milestone.count({
            where: { userId: req.user.id, status: 'completed' }
        });
        const activeGoals = await Goal.count({
            where: { userId: req.user.id, status: 'active' }
        });
        const completedGoals = await Goal.count({
            where: { userId: req.user.id, status: 'completed' }
        });

        res.json({
            totalMilestones: milestones,
            activeMilestones,
            completedMilestones,
            totalGoals: goals,
            activeGoals,
            completedGoals,
            totalProjects: projects
        });
    } catch (error) {
        logger.error('Get space stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== MILESTONES ====================

// @route   GET /api/space/milestones
// @desc    Get all milestones for user
// @access  Private
router.get('/milestones', authenticate, async (req, res) => {
    try {
        const { status, projectId } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (projectId) where.projectId = projectId;

        const milestones = await Milestone.findAll({
            where,
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }],
            order: [['date', 'ASC']]
        });
        res.json(milestones);
    } catch (error) {
        logger.error('Get milestones error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/space/milestones
// @desc    Create milestone
// @access  Private
router.post('/milestones', authenticate, milestoneValidation, logActivity('create', 'milestone'), async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, date, status, color, projectId } = req.body;

        // SECURITY: Verify project ownership if projectId provided
        if (projectId) {
            const ownsProject = await verifyProjectOwnership(projectId, req.user.id);
            if (!ownsProject) {
                return res.status(403).json({ message: 'Project not found or access denied' });
            }
        }

        const milestone = await Milestone.create({
            title,
            description,
            date,
            status: status || 'upcoming',
            color: color || '#8b5cf6',
            projectId,
            userId: req.user.id
        });

        // Reload with Project relation
        const createdMilestone = await Milestone.findOne({
            where: { id: milestone.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.status(201).json(createdMilestone);
    } catch (error) {
        logger.error('Create milestone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/milestones/:id
// @desc    Update milestone
// @access  Private
router.put('/milestones/:id', authenticate, milestoneValidation.map(v => v.optional()), logActivity('update', 'milestone'), async (req, res) => {
    try {
        const milestone = await Milestone.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        const { title, description, date, status, color, projectId } = req.body;

        // Validate status if provided
        if (status && !['upcoming', 'active', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Validate color if provided
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate date format if provided
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // SECURITY: Verify project ownership if projectId changed
        if (projectId !== undefined && projectId !== milestone.projectId) {
            const ownsProject = await verifyProjectOwnership(projectId, req.user.id);
            if (!ownsProject) {
                return res.status(403).json({ message: 'Project not found or access denied' });
            }
        }

        await milestone.update({ title, description, date, status, color, projectId });

        // Reload with Project relation
        const updatedMilestone = await Milestone.findOne({
            where: { id: milestone.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedMilestone);
    } catch (error) {
        logger.error('Update milestone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/space/milestones/:id
// @desc    Delete milestone
// @access  Private
router.delete('/milestones/:id', authenticate, logActivity('delete', 'milestone'), async (req, res) => {
    try {
        const milestone = await Milestone.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        await milestone.destroy();
        res.json({ message: 'Milestone deleted' });
    } catch (error) {
        logger.error('Delete milestone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== GOALS ====================

// @route   GET /api/space/goals
// @desc    Get all goals for user
// @access  Private
router.get('/goals', authenticate, async (req, res) => {
    try {
        const { status, category } = req.query;
        const where = { userId: req.user.id };

        if (status) where.status = status;
        if (category) where.category = category;

        const goals = await Goal.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.json(goals);
    } catch (error) {
        logger.error('Get goals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/space/goals
// @desc    Create goal
// @access  Private
router.post('/goals', authenticate, goalValidation, logActivity('create', 'goal'), async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, current, target, unit, color, deadline, category } = req.body;

        const goal = await Goal.create({
            name,
            description,
            current: current || 0,
            target,
            unit: unit || 'units',
            color: color || '#8b5cf6',
            deadline,
            category: category || 'other',
            userId: req.user.id
        });

        res.status(201).json(goal);
    } catch (error) {
        logger.error('Create goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/goals/:id
// @desc    Update goal
// @access  Private
router.put('/goals/:id', authenticate, logActivity('update', 'goal'), async (req, res) => {
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const { name, description, current, target, unit, color, deadline, status, category } = req.body;

        // Validate current if provided
        if (current !== undefined && current < 0) {
            return res.status(400).json({ message: 'Current must be a non-negative number' });
        }

        // Validate target if provided
        if (target !== undefined && target <= 0) {
            return res.status(400).json({ message: 'Target must be a positive number' });
        }

        // Validate status if provided
        if (status && !['active', 'completed', 'paused'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Validate color if provided
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate category if provided
        const validCategories = ['revenue', 'users', 'features', 'performance', 'marketing', 'other'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        // Validate deadline format if provided
        if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
            return res.status(400).json({ message: 'Invalid deadline format. Use YYYY-MM-DD' });
        }

        await goal.update({ name, description, current, target, unit, color, deadline, status, category });

        res.json(goal);
    } catch (error) {
        logger.error('Update goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.put('/goals/:id/progress', authenticate, async (req, res) => {
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const { current } = req.body;

        // Validate current value
        if (current === undefined || current === null) {
            return res.status(400).json({ message: 'Current value is required' });
        }

        const numericCurrent = parseFloat(current);
        if (isNaN(numericCurrent) || numericCurrent < 0) {
            return res.status(400).json({ message: 'Current must be a non-negative number' });
        }

        const updates = { current: numericCurrent };

        // Auto-complete if goal reached
        if (numericCurrent >= goal.target && goal.status !== 'completed') {
            updates.status = 'completed';
        }

        await goal.update(updates);
        res.json(goal);
    } catch (error) {
        logger.error('Update goal progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/space/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/goals/:id', authenticate, logActivity('delete', 'goal'), async (req, res) => {
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        await goal.destroy();
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        logger.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== DASHBOARD STATS ====================

// @route   GET /api/space/stats
// @desc    Get space dashboard stats
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
    try {
        const [goals, milestones] = await Promise.all([
            Goal.findAll({ where: { userId: req.user.id } }),
            Milestone.findAll({ where: { userId: req.user.id } })
        ]);

        const goalsAchieved = goals.filter(g => g.status === 'completed').length;
        const activeGoals = goals.filter(g => g.status === 'active').length;
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        const activeMilestones = milestones.filter(m => m.status === 'active').length;
        const totalMilestones = milestones.length;

        const completionRate = totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0;

        res.json({
            activeStrategies: activeMilestones + activeGoals,
            goalsAchieved,
            inProgress: activeMilestones,
            completionRate,
            totalGoals: goals.length,
            totalMilestones
        });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== SPACE TRANSACTIONS (Finance) ====================

// Validation rules for transaction
const transactionValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('amount').notEmpty().isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('type').isIn(['income', 'expense']).withMessage('Invalid type'),
    body('category').optional().trim().isLength({ max: 50 }),
    body('date').optional().isISO8601().toDate(),
    body('notes').optional().trim().isLength({ max: 5000 }),
    body('projectId').optional({ nullable: true }).isInt()
];

// @route   GET /api/space/transactions
router.get('/transactions', authenticate, async (req, res) => {
    try {
        const { type, projectId, month } = req.query;
        const where = { userId: req.user.id };

        if (type) where.type = type;
        if (projectId) where.projectId = parseInt(projectId);

        const transactions = await SpaceTransaction.findAll({
            where,
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        // Filter by month if specified
        let filtered = transactions;
        if (month) {
            filtered = transactions.filter(t => t.date && t.date.startsWith(month));
        }

        res.json(filtered);
    } catch (error) {
        logger.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/space/transactions
router.post('/transactions', authenticate, transactionValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, amount, type, category, date, notes, projectId } = req.body;

        const transaction = await SpaceTransaction.create({
            name,
            amount: parseFloat(amount),
            type: type || 'income',
            category: category || 'other',
            date: date || new Date().toISOString().split('T')[0],
            notes,
            projectId: projectId || null,
            userId: req.user.id
        });

        const result = await SpaceTransaction.findByPk(transaction.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.status(201).json(result);
    } catch (error) {
        logger.error('Create transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/transactions/:id
router.put('/transactions/:id', authenticate, transactionValidation, async (req, res) => {
    try {
        const transaction = await SpaceTransaction.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const { name, amount, type, category, date, notes, projectId } = req.body;

        await transaction.update({
            name,
            amount: parseFloat(amount),
            type,
            category,
            date,
            notes,
            projectId: projectId || null
        });

        const result = await SpaceTransaction.findByPk(transaction.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.json(result);
    } catch (error) {
        logger.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/space/transactions/:id
router.delete('/transactions/:id', authenticate, async (req, res) => {
    try {
        const transaction = await SpaceTransaction.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.destroy();
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        logger.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== SPACE ASSETS ====================

// Validation rules for asset
const assetValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('type').optional().isIn(['image', 'document', 'link', 'code', 'other']),
    body('url').optional().trim().isLength({ max: 2048 }),
    body('description').optional().trim().isLength({ max: 5000 }),
    body('projectId').optional({ nullable: true }).isInt()
];

// @route   GET /api/space/assets
router.get('/assets', authenticate, async (req, res) => {
    try {
        const { type, projectId } = req.query;
        const where = { userId: req.user.id };

        if (type) where.type = type;
        if (projectId) where.projectId = parseInt(projectId);

        const assets = await SpaceAsset.findAll({
            where,
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(assets);
    } catch (error) {
        logger.error('Get assets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/space/assets
router.post('/assets', authenticate, assetValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, type, url, description, projectId } = req.body;

        const asset = await SpaceAsset.create({
            name,
            type: type || 'link',
            url,
            description,
            projectId: projectId || null,
            userId: req.user.id
        });

        const result = await SpaceAsset.findByPk(asset.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.status(201).json(result);
    } catch (error) {
        logger.error('Create asset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/assets/:id
router.put('/assets/:id', authenticate, assetValidation, async (req, res) => {
    try {
        const asset = await SpaceAsset.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        const { name, type, url, description, projectId } = req.body;

        await asset.update({
            name,
            type,
            url,
            description,
            projectId: projectId || null
        });

        const result = await SpaceAsset.findByPk(asset.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.json(result);
    } catch (error) {
        logger.error('Update asset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/space/assets/:id
router.delete('/assets/:id', authenticate, async (req, res) => {
    try {
        const asset = await SpaceAsset.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        await asset.destroy();
        res.json({ message: 'Asset deleted' });
    } catch (error) {
        logger.error('Delete asset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== SPACE BUDGETS ====================

// Validation rules for budget
const budgetValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('amount').notEmpty().isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('spent').optional().isFloat({ min: 0 }),
    body('category').optional().trim().isLength({ max: 50 }),
    body('date').optional().isISO8601().toDate(),
    body('notes').optional().trim().isLength({ max: 5000 }),
    body('projectId').optional({ nullable: true }).isInt()
];

// @route   GET /api/space/budgets
router.get('/budgets', authenticate, async (req, res) => {
    try {
        const { category, projectId } = req.query;
        const where = { userId: req.user.id };

        if (category) where.category = category;
        if (projectId) where.projectId = parseInt(projectId);

        const budgets = await SpaceBudget.findAll({
            where,
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(budgets);
    } catch (error) {
        logger.error('Get budgets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/space/budgets
router.post('/budgets', authenticate, budgetValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, amount, spent, category, date, notes, projectId } = req.body;

        const budget = await SpaceBudget.create({
            name,
            amount: parseFloat(amount),
            spent: parseFloat(spent) || 0,
            category: category || 'development',
            date,
            notes,
            projectId: projectId || null,
            userId: req.user.id
        });

        const result = await SpaceBudget.findByPk(budget.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.status(201).json(result);
    } catch (error) {
        logger.error('Create budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/space/budgets/:id
router.put('/budgets/:id', authenticate, budgetValidation, async (req, res) => {
    try {
        const budget = await SpaceBudget.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const { name, amount, spent, category, date, notes, projectId } = req.body;

        await budget.update({
            name,
            amount: parseFloat(amount),
            spent: parseFloat(spent) || 0,
            category,
            date,
            notes,
            projectId: projectId || null
        });

        const result = await SpaceBudget.findByPk(budget.id, {
            include: [{ model: IdeaProject, as: 'Project', attributes: ['id', 'name', 'color'] }]
        });

        res.json(result);
    } catch (error) {
        logger.error('Update budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/space/budgets/:id
router.delete('/budgets/:id', authenticate, async (req, res) => {
    try {
        const budget = await SpaceBudget.findOne({
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

module.exports = router;

