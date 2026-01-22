const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceBill = sequelize.define('FinanceBill', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Bill category: internet, electricity, etc'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // Recurring settings
    isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    recurringType: {
        type: DataTypes.ENUM('monthly', 'weekly', 'yearly', 'custom'),
        defaultValue: 'monthly'
    },
    recurringDay: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Day of month/week for recurring bills'
    },
    // Status
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'pending'
    },
    paidDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paidAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    paidAccountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Account used to pay this bill'
    },
    // Reminder settings
    reminderEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    reminderDays: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        comment: 'Days before due date to send reminder'
    },
    reminderWhatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Send reminder via WhatsApp'
    },
    reminderPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Phone number for WhatsApp reminder'
    },
    lastReminderSent: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Additional info
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '📄'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#ef4444'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'finance_bills'
});

// Default bill categories
FinanceBill.defaultCategories = [
    { name: 'Internet', icon: '🌐', color: '#3b82f6' },
    { name: 'Shopee PayLater', icon: '🛒', color: '#ee4d2d' },
    { name: 'Shopee Pinjam', icon: '💳', color: '#ee4d2d' },
    { name: 'OVO PayLater', icon: '💜', color: '#4c3494' },
    { name: 'Tagihan Bank', icon: '🏦', color: '#1e40af' },
    { name: 'Listrik', icon: '⚡', color: '#f59e0b' },
    { name: 'Air PDAM', icon: '💧', color: '#06b6d4' },
    { name: 'Telepon', icon: '📱', color: '#10b981' },
    { name: 'Asuransi', icon: '🛡️', color: '#8b5cf6' },
    { name: 'Sewa/Kos', icon: '🏠', color: '#ec4899' },
    { name: 'Cicilan', icon: '📝', color: '#ef4444' },
    { name: 'Langganan', icon: '🔄', color: '#6366f1' },
    { name: 'Lainnya', icon: '📋', color: '#6b7280' }
];

module.exports = FinanceBill;
