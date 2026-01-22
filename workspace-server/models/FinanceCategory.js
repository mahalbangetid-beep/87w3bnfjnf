const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceCategory = sequelize.define('FinanceCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'NULL for system default categories'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '💰'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System default categories'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'finance_categories'
});

// Default categories to seed
FinanceCategory.defaultCategories = {
    income: [
        { name: 'Gaji', icon: '💼', color: '#10b981' },
        { name: 'Project Klien', icon: '💻', color: '#3b82f6' },
        { name: 'Jualan', icon: '🛒', color: '#f59e0b' },
        { name: 'Bonus', icon: '🎁', color: '#8b5cf6' },
        { name: 'Investasi', icon: '📈', color: '#06b6d4' },
        { name: 'Lainnya', icon: '💵', color: '#6b7280' }
    ],
    expense: [
        { name: 'Operasional Bisnis', icon: '🏢', color: '#ef4444' },
        { name: 'Pribadi', icon: '👤', color: '#f59e0b' },
        { name: 'Makan & Jajan', icon: '🍔', color: '#ec4899' },
        { name: 'Transportasi', icon: '🚗', color: '#3b82f6' },
        { name: 'Belanja', icon: '🛍️', color: '#8b5cf6' },
        { name: 'Tagihan', icon: '📄', color: '#ef4444' },
        { name: 'Hiburan', icon: '🎬', color: '#06b6d4' },
        { name: 'Kesehatan', icon: '🏥', color: '#10b981' },
        { name: 'Pendidikan', icon: '📚', color: '#6366f1' },
        { name: 'Lainnya', icon: '💸', color: '#6b7280' }
    ]
};

module.exports = FinanceCategory;
