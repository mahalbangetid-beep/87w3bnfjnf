const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
    sequelize,
    FinanceAccount,
    FinanceCategory,
    FinanceTransaction,
    FinanceBill,
    FinanceNote,
    Project
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// ==================== VALIDATION RULES ====================

// Account validation
const accountValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('type').optional().isIn(['cash', 'bank', 'e-wallet', 'ewallet', 'credit', 'investment', 'other']).withMessage('Invalid account type'),
    body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon too long'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('initialBalance').optional().isFloat().withMessage('Initial balance must be a number'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
];

// Category validation
const categoryValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('type').notEmpty().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon too long'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer')
];

// Transaction validation
const transactionValidation = [
    body('accountId').notEmpty().isInt().withMessage('Account ID is required'),
    body('type').notEmpty().isIn(['income', 'expense', 'transfer']).withMessage('Invalid transaction type'),
    body('amount').notEmpty().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('categoryId').optional({ nullable: true }).isInt().withMessage('Invalid category ID'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
    body('toAccountId').optional({ nullable: true }).isInt().withMessage('Invalid destination account ID'),
    body('transactionDate').optional().isISO8601().withMessage('Invalid date format')
];

// Bill validation
const billValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name too long'),
    body('category').optional().trim().isLength({ max: 100 }).withMessage('Category too long'),
    body('amount').notEmpty().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('dueDate').notEmpty().isISO8601().withMessage('Due date is required and must be valid'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
    body('recurringType').optional().isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid recurring type'),
    body('recurringDay').optional().isInt({ min: 1, max: 31 }).withMessage('Invalid recurring day'),
    body('reminderEnabled').optional().isBoolean().withMessage('reminderEnabled must be boolean'),
    body('reminderDays').optional().isInt({ min: 1, max: 30 }).withMessage('Reminder days must be 1-30'),
    body('reminderWhatsapp').optional().isBoolean().withMessage('reminderWhatsapp must be boolean'),
    body('reminderPhone').optional().trim().isLength({ max: 20 }).withMessage('Phone number too long'),
    body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon too long'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long')
];

// Note validation
const noteValidation = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
    body('content').optional().trim().isLength({ max: 10000 }).withMessage('Content too long'),
    body('type').optional().isIn(['general', 'transaction', 'reminder', 'goal']).withMessage('Invalid note type'),
    body('transactionId').optional({ nullable: true }).isInt().withMessage('Invalid transaction ID'),
    body('isPinned').optional().isBoolean().withMessage('isPinned must be boolean'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('reminderDate').optional({ nullable: true }).isISO8601().withMessage('Invalid reminder date')
];

// ==================== ACCOUNTS ====================

// Get all accounts
router.get('/accounts', authenticateToken, async (req, res) => {
    try {
        const accounts = await FinanceAccount.findAll({
            where: { userId: req.user.id },
            order: [['isDefault', 'DESC'], ['name', 'ASC']]
        });
        res.json(accounts);
    } catch (error) {
        logger.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Get total balance across all accounts
router.get('/accounts/total', authenticateToken, async (req, res) => {
    try {
        const accounts = await FinanceAccount.findAll({
            where: { userId: req.user.id, isActive: true }
        });
        const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
        res.json({ totalBalance, accountCount: accounts.length });
    } catch (error) {
        logger.error('Error fetching total balance:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Create account
router.post('/accounts', authenticateToken, accountValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // SECURITY: Whitelist fields to prevent mass assignment
        const { name, type, icon, color, initialBalance, notes, isDefault, isActive } = req.body;
        const account = await FinanceAccount.create({
            userId: req.user.id,
            name, type, icon, color, notes, isActive,
            balance: initialBalance || 0
        });

        // If this is the first account or marked as default, set as default
        const existingAccounts = await FinanceAccount.count({ where: { userId: req.user.id } });
        if (existingAccounts === 1 || req.body.isDefault) {
            await FinanceAccount.update({ isDefault: false }, { where: { userId: req.user.id } });
            await account.update({ isDefault: true });
        }

        res.status(201).json(account);
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Update account
router.put('/accounts/:id', authenticateToken, accountValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const account = await FinanceAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        if (req.body.isDefault) {
            await FinanceAccount.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        // SECURITY: Whitelist allowed fields to prevent mass assignment
        const { name, type, icon, color, isDefault, isActive, notes } = req.body;
        await account.update({ name, type, icon, color, isDefault, isActive, notes });
        res.json(account);
    } catch (error) {
        logger.error('Error updating account:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Delete account
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const account = await FinanceAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Check if account has transactions
        const transactions = await FinanceTransaction.count({ where: { accountId: account.id } });
        if (transactions > 0) {
            return res.status(400).json({ error: 'Cannot delete account with transactions' });
        }

        await account.destroy();
        res.json({ message: 'Account deleted' });
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== CATEGORIES ====================

// Get categories
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const { type } = req.query;
        const where = {
            [Op.or]: [
                { userId: req.user.id },
                { isDefault: true }
            ]
        };
        if (type) where.type = type;

        const categories = await FinanceCategory.findAll({
            where,
            order: [['isDefault', 'DESC'], ['sortOrder', 'ASC'], ['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Create category
router.post('/categories', authenticateToken, categoryValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // SECURITY: Whitelist fields to prevent mass assignment
        const { name, type, icon, color, sortOrder } = req.body;
        const category = await FinanceCategory.create({
            userId: req.user.id,
            name, type, icon, color, sortOrder,
            isDefault: false
        });
        res.status(201).json(category);
    } catch (error) {
        logger.error('Error creating category:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Update category
router.put('/categories/:id', authenticateToken, categoryValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const category = await FinanceCategory.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });

        // SECURITY: Whitelist allowed fields to prevent mass assignment
        const { name, type, icon, color, sortOrder } = req.body;
        await category.update({ name, type, icon, color, sortOrder });
        res.json(category);
    } catch (error) {
        logger.error('Error updating category:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Delete category
router.delete('/categories/:id', authenticateToken, async (req, res) => {
    try {
        const category = await FinanceCategory.findOne({
            where: { id: req.params.id, userId: req.user.id, isDefault: false }
        });
        if (!category) return res.status(404).json({ error: 'Category not found or is default' });

        // SECURITY: Check if category is in use by any transactions
        const transactionCount = await FinanceTransaction.count({
            where: { categoryId: category.id }
        });

        if (transactionCount > 0) {
            return res.status(409).json({
                error: 'Cannot delete category that is in use',
                usageCount: transactionCount,
                message: `This category is used by ${transactionCount} transaction(s). Please reassign them to another category first.`,
                suggestion: 'Use PUT /categories/:id/reassign to move transactions to another category'
            });
        }

        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        logger.error('Error deleting category:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== TRANSACTIONS ====================

// Get transactions with filters
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const { type, accountId, categoryId, startDate, endDate, page = 1, limit = 50 } = req.query;

        const where = { userId: req.user.id };
        if (type) where.type = type;
        if (accountId) where.accountId = accountId;
        if (categoryId) where.categoryId = categoryId;
        if (startDate && endDate) {
            where.transactionDate = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            where.transactionDate = { [Op.gte]: startDate };
        } else if (endDate) {
            where.transactionDate = { [Op.lte]: endDate };
        }

        const offset = (page - 1) * limit;
        const { rows, count } = await FinanceTransaction.findAndCountAll({
            where,
            include: [
                { model: FinanceAccount, attributes: ['id', 'name', 'type', 'icon', 'color'] },
                { model: FinanceCategory, attributes: ['id', 'name', 'type', 'icon', 'color'] }
            ],
            order: [['transactionDate', 'DESC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            transactions: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        logger.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Create transaction (income/expense)
router.post('/transactions', authenticateToken, transactionValidation, async (req, res) => {
    // Use database transaction for atomicity
    const t = await sequelize.transaction();

    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await t.rollback();
            return res.status(400).json({ errors: errors.array() });
        }

        const { accountId, type, amount } = req.body;
        const amountValue = parseFloat(amount);

        // Validate and lock account for update (prevents race condition)
        const account = await FinanceAccount.findOne({
            where: { id: accountId, userId: req.user.id },
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!account) {
            await t.rollback();
            return res.status(404).json({ error: 'Account not found' });
        }

        // For expense/transfer, check sufficient balance
        if ((type === 'expense' || type === 'transfer') && parseFloat(account.balance) < amountValue) {
            await t.rollback();
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // For transfer, validate and lock destination account
        let toAccount = null;
        if (type === 'transfer' && req.body.toAccountId) {
            toAccount = await FinanceAccount.findOne({
                where: { id: req.body.toAccountId, userId: req.user.id },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!toAccount) {
                await t.rollback();
                return res.status(404).json({ error: 'Destination account not found' });
            }

            if (toAccount.id === account.id) {
                await t.rollback();
                return res.status(400).json({ error: 'Cannot transfer to the same account' });
            }
        }

        // Create transaction record - SECURITY: Whitelist fields
        const { categoryId, description, toAccountId, source, sourceId, sourceModule } = req.body;
        const transaction = await FinanceTransaction.create({
            userId: req.user.id,
            accountId, type, amount,
            categoryId, description, toAccountId, source, sourceId, sourceModule,
            transactionDate: req.body.transactionDate || new Date()
        }, { transaction: t });

        // Update account balances atomically using increment/decrement
        if (type === 'income') {
            await account.increment('balance', { by: amountValue, transaction: t });
        } else if (type === 'expense') {
            await account.decrement('balance', { by: amountValue, transaction: t });
        } else if (type === 'transfer' && toAccount) {
            await account.decrement('balance', { by: amountValue, transaction: t });
            await toAccount.increment('balance', { by: amountValue, transaction: t });
        }

        // Commit transaction
        await t.commit();

        res.status(201).json(transaction);
    } catch (error) {
        await t.rollback();
        logger.error('Error creating transaction:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Update transaction
router.put('/transactions/:id', authenticateToken, transactionValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const transaction = await FinanceTransaction.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        // Revert old balance effect
        const oldAccount = await FinanceAccount.findByPk(transaction.accountId);
        if (oldAccount) {
            const oldAmount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                await oldAccount.update({ balance: parseFloat(oldAccount.balance) - oldAmount });
            } else if (transaction.type === 'expense') {
                await oldAccount.update({ balance: parseFloat(oldAccount.balance) + oldAmount });
            }
        }

        // Update transaction
        await transaction.update(req.body);

        // Apply new balance effect
        const newAccount = await FinanceAccount.findByPk(req.body.accountId || transaction.accountId);
        if (newAccount) {
            const newAmount = parseFloat(req.body.amount || transaction.amount);
            const newType = req.body.type || transaction.type;
            if (newType === 'income') {
                await newAccount.update({ balance: parseFloat(newAccount.balance) + newAmount });
            } else if (newType === 'expense') {
                await newAccount.update({ balance: parseFloat(newAccount.balance) - newAmount });
            }
        }

        res.json(transaction);
    } catch (error) {
        logger.error('Error updating transaction:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Delete transaction
router.delete('/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const transaction = await FinanceTransaction.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        // Revert balance effect
        const account = await FinanceAccount.findByPk(transaction.accountId);
        if (account) {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                await account.update({ balance: parseFloat(account.balance) - amount });
            } else if (transaction.type === 'expense') {
                await account.update({ balance: parseFloat(account.balance) + amount });
            }
        }

        await transaction.destroy();
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        logger.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== BILLS ====================

// Get bills
router.get('/bills', authenticateToken, async (req, res) => {
    try {
        const { status, category } = req.query;
        const where = { userId: req.user.id };
        if (status) where.status = status;
        if (category) where.category = category;

        const bills = await FinanceBill.findAll({
            where,
            order: [['dueDate', 'ASC']]
        });
        res.json(bills);
    } catch (error) {
        logger.error('Error fetching bills:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Get upcoming bills
router.get('/bills/upcoming', authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const bills = await FinanceBill.findAll({
            where: {
                userId: req.user.id,
                status: { [Op.in]: ['pending', 'overdue'] },
                dueDate: { [Op.between]: [today, nextMonth] }
            },
            order: [['dueDate', 'ASC']]
        });
        res.json(bills);
    } catch (error) {
        logger.error('Error fetching upcoming bills:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Create bill
router.post('/bills', authenticateToken, billValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // SECURITY: Whitelist fields
        const { name, category, amount, dueDate, isRecurring, recurringType, recurringDay,
            reminderEnabled, reminderDays, reminderWhatsapp, reminderPhone, icon, color, notes } = req.body;
        const bill = await FinanceBill.create({
            userId: req.user.id,
            name, category, amount, dueDate, isRecurring, recurringType, recurringDay,
            reminderEnabled, reminderDays, reminderWhatsapp, reminderPhone, icon, color, notes
        });
        res.status(201).json(bill);
    } catch (error) {
        logger.error('Error creating bill:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Update bill
router.put('/bills/:id', authenticateToken, billValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const bill = await FinanceBill.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        // SECURITY: Whitelist allowed fields to prevent mass assignment
        const { name, category, amount, dueDate, isRecurring, recurringType, recurringDay,
            reminderEnabled, reminderDays, reminderWhatsapp, reminderPhone, icon, color, notes, status } = req.body;
        await bill.update({
            name, category, amount, dueDate, isRecurring, recurringType, recurringDay,
            reminderEnabled, reminderDays, reminderWhatsapp, reminderPhone, icon, color, notes, status
        });
        res.json(bill);
    } catch (error) {
        logger.error('Error updating bill:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Pay bill
router.post('/bills/:id/pay', authenticateToken, async (req, res) => {
    try {
        const { accountId, paidAmount } = req.body;
        const bill = await FinanceBill.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        const account = await FinanceAccount.findOne({
            where: { id: accountId, userId: req.user.id }
        });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Create expense transaction
        const amount = paidAmount || bill.amount;
        const transaction = await FinanceTransaction.create({
            userId: req.user.id,
            accountId,
            type: 'expense',
            amount,
            description: `Pembayaran: ${bill.name}`,
            transactionDate: new Date(),
            source: 'bill_payment',
            sourceId: bill.id,
            sourceModule: 'finance'
        });

        // Update account balance
        await account.update({ balance: parseFloat(account.balance) - parseFloat(amount) });

        // Update bill status
        await bill.update({
            status: 'paid',
            paidDate: new Date(),
            paidAmount: amount,
            paidAccountId: accountId
        });

        // If recurring, create next bill
        if (bill.isRecurring) {
            const nextDueDate = new Date(bill.dueDate);
            if (bill.recurringType === 'monthly') {
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            } else if (bill.recurringType === 'weekly') {
                nextDueDate.setDate(nextDueDate.getDate() + 7);
            } else if (bill.recurringType === 'yearly') {
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            }

            await FinanceBill.create({
                userId: req.user.id,
                name: bill.name,
                category: bill.category,
                amount: bill.amount,
                dueDate: nextDueDate,
                isRecurring: true,
                recurringType: bill.recurringType,
                recurringDay: bill.recurringDay,
                reminderEnabled: bill.reminderEnabled,
                reminderDays: bill.reminderDays,
                reminderWhatsapp: bill.reminderWhatsapp,
                reminderPhone: bill.reminderPhone,
                icon: bill.icon,
                color: bill.color,
                notes: bill.notes
            });
        }

        res.json({ bill, transaction });
    } catch (error) {
        logger.error('Error paying bill:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Delete bill
router.delete('/bills/:id', authenticateToken, async (req, res) => {
    try {
        const bill = await FinanceBill.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        await bill.destroy();
        res.json({ message: 'Bill deleted' });
    } catch (error) {
        logger.error('Error deleting bill:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Get bill categories (defaults)
router.get('/bills/categories', authenticateToken, async (req, res) => {
    try {
        res.json(FinanceBill.defaultCategories);
    } catch (error) {
        logger.error('Error fetching bill categories:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== NOTES ====================

// Get notes
router.get('/notes', authenticateToken, async (req, res) => {
    try {
        const { type, isPinned, isArchived } = req.query;
        const where = { userId: req.user.id };
        if (type) where.type = type;
        if (isPinned !== undefined) where.isPinned = isPinned === 'true';
        if (isArchived !== undefined) where.isArchived = isArchived === 'true';
        else where.isArchived = false; // Default: show non-archived

        const notes = await FinanceNote.findAll({
            where,
            include: [
                { model: FinanceTransaction, attributes: ['id', 'type', 'amount', 'description', 'transactionDate'] }
            ],
            order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(notes);
    } catch (error) {
        logger.error('Error fetching notes:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Create note
router.post('/notes', authenticateToken, noteValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // SECURITY: Whitelist fields
        const { title, content, type, transactionId, isPinned, color, reminderDate } = req.body;
        const note = await FinanceNote.create({
            userId: req.user.id,
            title, content, type, transactionId, isPinned, color, reminderDate
        });
        res.status(201).json(note);
    } catch (error) {
        logger.error('Error creating note:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Update note
router.put('/notes/:id', authenticateToken, noteValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = await FinanceNote.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!note) return res.status(404).json({ error: 'Note not found' });

        await note.update(req.body);
        res.json(note);
    } catch (error) {
        logger.error('Error updating note:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Delete note
router.delete('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await FinanceNote.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!note) return res.status(404).json({ error: 'Note not found' });

        await note.destroy();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        logger.error('Error deleting note:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== REPORTS ====================

// Dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get accounts
        const accounts = await FinanceAccount.findAll({
            where: { userId: req.user.id, isActive: true }
        });
        const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

        // Get monthly income
        const incomeResult = await FinanceTransaction.sum('amount', {
            where: {
                userId: req.user.id,
                type: 'income',
                transactionDate: { [Op.between]: [startOfMonth, endOfMonth] }
            }
        });

        // Get monthly expense
        const expenseResult = await FinanceTransaction.sum('amount', {
            where: {
                userId: req.user.id,
                type: 'expense',
                transactionDate: { [Op.between]: [startOfMonth, endOfMonth] }
            }
        });

        // Get upcoming bills
        const upcomingBills = await FinanceBill.findAll({
            where: {
                userId: req.user.id,
                status: { [Op.in]: ['pending', 'overdue'] },
                dueDate: { [Op.lte]: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
            },
            order: [['dueDate', 'ASC']],
            limit: 5
        });

        // Get recent transactions
        const recentTransactions = await FinanceTransaction.findAll({
            where: { userId: req.user.id },
            include: [
                { model: FinanceAccount, attributes: ['id', 'name', 'icon'] },
                { model: FinanceCategory, attributes: ['id', 'name', 'icon'] }
            ],
            order: [['transactionDate', 'DESC'], ['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            totalBalance,
            accountCount: accounts.length,
            accounts,
            monthlyIncome: incomeResult || 0,
            monthlyExpense: expenseResult || 0,
            monthlyNet: (incomeResult || 0) - (expenseResult || 0),
            upcomingBills,
            recentTransactions
        });
    } catch (error) {
        logger.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Monthly report
router.get('/reports/monthly', authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0);

        // Income by category
        const incomeByCategory = await FinanceTransaction.findAll({
            where: {
                userId: req.user.id,
                type: 'income',
                transactionDate: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: FinanceCategory, attributes: ['id', 'name', 'icon', 'color'] }],
            attributes: [
                'categoryId',
                [FinanceTransaction.sequelize.fn('SUM', FinanceTransaction.sequelize.col('amount')), 'total']
            ],
            group: ['categoryId']
        });

        // Expense by category
        const expenseByCategory = await FinanceTransaction.findAll({
            where: {
                userId: req.user.id,
                type: 'expense',
                transactionDate: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: FinanceCategory, attributes: ['id', 'name', 'icon', 'color'] }],
            attributes: [
                'categoryId',
                [FinanceTransaction.sequelize.fn('SUM', FinanceTransaction.sequelize.col('amount')), 'total']
            ],
            group: ['categoryId']
        });

        // Daily breakdown
        const dailyBreakdown = await FinanceTransaction.findAll({
            where: {
                userId: req.user.id,
                transactionDate: { [Op.between]: [startDate, endDate] }
            },
            attributes: [
                'transactionDate',
                'type',
                [FinanceTransaction.sequelize.fn('SUM', FinanceTransaction.sequelize.col('amount')), 'total']
            ],
            group: ['transactionDate', 'type'],
            order: [['transactionDate', 'ASC']]
        });

        res.json({
            year: y,
            month: m,
            incomeByCategory,
            expenseByCategory,
            dailyBreakdown
        });
    } catch (error) {
        logger.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Cash flow report
router.get('/reports/cashflow', authenticateToken, async (req, res) => {
    try {
        const { months = 6 } = req.query;
        const today = new Date();
        const result = [];

        for (let i = parseInt(months) - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const income = await FinanceTransaction.sum('amount', {
                where: {
                    userId: req.user.id,
                    type: 'income',
                    transactionDate: { [Op.between]: [startDate, endDate] }
                }
            }) || 0;

            const expense = await FinanceTransaction.sum('amount', {
                where: {
                    userId: req.user.id,
                    type: 'expense',
                    transactionDate: { [Op.between]: [startDate, endDate] }
                }
            }) || 0;

            result.push({
                month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, // ISO format for frontend to format
                year: date.getFullYear(),
                monthNum: date.getMonth() + 1,
                income,
                expense,
                net: income - expense
            });
        }

        res.json(result);
    } catch (error) {
        logger.error('Error fetching cash flow:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ==================== INTEGRATION WITH WORK/SPACE ====================

// Add income from Work project
router.post('/integration/work-income', authenticateToken, async (req, res) => {
    try {
        const { projectId, amount, description, accountId } = req.body;

        // Verify project
        const project = await Project.findOne({
            where: { id: projectId, userId: req.user.id }
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Get default account if not provided
        let account;
        if (accountId) {
            account = await FinanceAccount.findOne({ where: { id: accountId, userId: req.user.id } });
        } else {
            account = await FinanceAccount.findOne({ where: { userId: req.user.id, isDefault: true } });
        }
        if (!account) return res.status(404).json({ error: 'No account available' });

        // Find or create "Project Klien" category
        let category = await FinanceCategory.findOne({
            where: { name: 'Project Klien', type: 'income', [Op.or]: [{ userId: req.user.id }, { isDefault: true }] }
        });
        if (!category) {
            category = await FinanceCategory.create({
                userId: req.user.id,
                name: 'Project Klien',
                type: 'income',
                icon: '💻',
                color: '#3b82f6'
            });
        }

        // Create transaction
        const transaction = await FinanceTransaction.create({
            userId: req.user.id,
            accountId: account.id,
            categoryId: category.id,
            type: 'income',
            amount,
            description: description || `Pendapatan: ${project.name}`,
            transactionDate: new Date(),
            source: 'work_project',
            sourceId: projectId,
            sourceModule: 'work'
        });

        // Update account balance
        await account.update({ balance: parseFloat(account.balance) + parseFloat(amount) });

        res.status(201).json(transaction);
    } catch (error) {
        logger.error('Error adding work income:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

module.exports = router;
