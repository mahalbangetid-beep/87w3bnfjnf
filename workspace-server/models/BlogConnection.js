const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogConnection = sequelize.define('BlogConnection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    platform: {
        type: DataTypes.ENUM('wordpress', 'blogspot', 'custom'),
        allowNull: false
    },
    siteName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    siteUrl: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    // WordPress specific
    apiUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'REST API URL for WordPress or custom CMS'
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    appPassword: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'WordPress Application Password'
    },
    // Blogspot specific
    blogId: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Custom CMS
    apiKey: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // OAuth tokens (for Blogger)
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Status
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastSync: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Additional settings
    settings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            defaultCategory: null,
            defaultAuthor: null
        }
    }
}, {
    tableName: 'blog_connections'
});

module.exports = BlogConnection;
