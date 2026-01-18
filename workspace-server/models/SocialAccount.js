const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SocialAccount = sequelize.define('SocialAccount', {
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
        type: DataTypes.ENUM('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'),
        allowNull: false
    },
    accountId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Platform account ID'
    },
    accountName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    accountHandle: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '@username'
    },
    profileImage: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pageId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'For Facebook pages'
    },
    pageAccessToken: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional platform-specific data'
    }
}, {
    tableName: 'social_accounts'
});

module.exports = SocialAccount;
