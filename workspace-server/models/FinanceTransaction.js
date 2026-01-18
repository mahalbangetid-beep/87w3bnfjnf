const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceTransaction = sequelize.define('FinanceTransaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Reference to FinanceAccount'
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to FinanceCategory'
    },
    type: {
        type: DataTypes.ENUM('income', 'expense', 'transfer'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    transactionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Source tracking for integration
    source: {
        type: DataTypes.ENUM('manual', 'work_project', 'space_project', 'bill_payment', 'recurring'),
        defaultValue: 'manual'
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID from source module (project ID, bill ID, etc)'
    },
    sourceModule: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Module name: work, space, finance'
    },
    // Transfer fields
    toAccountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Destination account for transfers'
    },
    // Tags and notes
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Receipt/attachment
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of attachment URLs'
    },
    // Recurring transaction
    isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    recurringId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to parent recurring transaction'
    }
}, {
    tableName: 'finance_transactions'
});

module.exports = FinanceTransaction;
