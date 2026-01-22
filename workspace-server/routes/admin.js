const express = require('express');
const router = express.Router();
const { User, Role, ActivityLog } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// ==================== USER MANAGEMENT (Admin Only) ====================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Master Admin, Monitoring
router.get('/users', authenticate, authorize('superadmin', 'monitoring'), async (req, res) => {
    try {
        const { role, search, isActive } = req.query;
        const where = {};

        if (role) where.roleId = role;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where,
            include: [{ model: Role }],
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Master Admin, Monitoring
router.get('/users/:id', authenticate, authorize('superadmin', 'monitoring'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/users
// @desc    Create user (Admin creates)
// @access  Master Admin
router.post('/users', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            roleId: roleId || 3
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Master Admin
router.put('/users/:id', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, roleId, isActive } = req.body;
        await user.update({ name, email, roleId, isActive });

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Master Admin
router.delete('/users/:id', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== ACTIVITY LOGS (Monitoring) ====================

// @route   GET /api/admin/activities
// @desc    Get activity logs
// @access  Master Admin, Monitoring
router.get('/activities', authenticate, authorize('superadmin', 'monitoring'), async (req, res) => {
    try {
        const { userId, module, action, startDate, endDate, limit = 100 } = req.query;
        const where = {};

        if (userId) where.userId = userId;
        if (module) where.module = module;
        if (action) where.action = action;
        if (startDate && endDate) {
            where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const activities = await ActivityLog.findAll({
            where,
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== ROLES ====================

// @route   GET /api/admin/roles
// @desc    Get all roles
// @access  Master Admin
router.get('/roles', authenticate, authorize('superadmin'), async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [['id', 'ASC']]
        });
        res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== DASHBOARD STATS ====================

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Master Admin, Monitoring
router.get('/stats', authenticate, authorize('superadmin', 'monitoring'), async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const todayLogins = await ActivityLog.count({
            where: {
                action: 'login',
                createdAt: { [Op.gte]: new Date().setHours(0, 0, 0, 0) }
            }
        });

        const usersByRole = await User.findAll({
            attributes: ['roleId', [require('sequelize').fn('COUNT', 'id'), 'count']],
            group: ['roleId'],
            include: [{ model: Role, attributes: ['name', 'displayName'] }]
        });

        res.json({
            totalUsers,
            activeUsers,
            todayLogins,
            usersByRole
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
