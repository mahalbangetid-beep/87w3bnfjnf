const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetItem = sequelize.define('AssetItem', {
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
    type: {
        type: DataTypes.ENUM('text', 'image', 'link', 'file'),
        defaultValue: 'text'
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'General'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Text content or description'
    },
    link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL if type is link'
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'File path for uploaded files'
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '📄'
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
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'asset_items'
});

// Default categories
AssetItem.defaultCategories = [
    { name: 'General', icon: '📄', color: '#6b7280' },
    { name: 'Important', icon: '⭐', color: '#f59e0b' },
    { name: 'Credentials', icon: '🔑', color: '#ef4444' },
    { name: 'Documents', icon: '📑', color: '#3b82f6' },
    { name: 'Images', icon: '🖼️', color: '#ec4899' },
    { name: 'Links', icon: '🔗', color: '#06b6d4' },
    { name: 'Code', icon: '💻', color: '#10b981' },
    { name: 'Reference', icon: '📚', color: '#8b5cf6' }
];

module.exports = AssetItem;
