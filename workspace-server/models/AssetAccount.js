const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetAccount = sequelize.define('AssetAccount', {
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
        allowNull: false,
        comment: 'Account name (e.g., LinkedIn, GitHub)'
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Other',
        comment: 'Category: Social Media, Email, Hosting, etc'
    },
    link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Login URL or website link'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Encrypted password'
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Phone number if used for login'
    },
    recoveryEmail: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '🔐'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastAccessed: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'asset_accounts'
});

// Default categories
AssetAccount.defaultCategories = [
    { name: 'Social Media', icon: '📱', color: '#3b82f6' },
    { name: 'Email', icon: '📧', color: '#10b981' },
    { name: 'Work', icon: '💼', color: '#f59e0b' },
    { name: 'Hosting', icon: '🌐', color: '#8b5cf6' },
    { name: 'Domain', icon: '🔗', color: '#06b6d4' },
    { name: 'Cloud Storage', icon: '☁️', color: '#6366f1' },
    { name: 'Payment', icon: '💳', color: '#ec4899' },
    { name: 'Banking', icon: '🏦', color: '#1e40af' },
    { name: 'Subscription', icon: '🔄', color: '#f97316' },
    { name: 'Development', icon: '💻', color: '#10b981' },
    { name: 'Gaming', icon: '🎮', color: '#ef4444' },
    { name: 'Entertainment', icon: '🎬', color: '#a855f7' },
    { name: 'Shopping', icon: '🛒', color: '#f59e0b' },
    { name: 'Other', icon: '📁', color: '#6b7280' }
];

module.exports = AssetAccount;
