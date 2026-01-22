const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetBookmark = sequelize.define('AssetBookmark', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Other'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '🔗'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    favicon: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Favicon URL from the website'
    },
    thumbnail: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Screenshot or og:image'
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    clickCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastVisited: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'asset_bookmarks'
});

// Default categories
AssetBookmark.defaultCategories = [
    { name: 'Tools', icon: '🔧', color: '#3b82f6' },
    { name: 'Reference', icon: '📚', color: '#8b5cf6' },
    { name: 'Tutorial', icon: '📖', color: '#10b981' },
    { name: 'Design', icon: '🎨', color: '#ec4899' },
    { name: 'Development', icon: '💻', color: '#06b6d4' },
    { name: 'Resources', icon: '📦', color: '#f59e0b' },
    { name: 'Inspiration', icon: '💡', color: '#f97316' },
    { name: 'News', icon: '📰', color: '#6366f1' },
    { name: 'Social', icon: '👥', color: '#ef4444' },
    { name: 'Shopping', icon: '🛒', color: '#a855f7' },
    { name: 'Other', icon: '🔗', color: '#6b7280' }
];

module.exports = AssetBookmark;
