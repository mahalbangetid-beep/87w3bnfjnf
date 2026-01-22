const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SocialPost = sequelize.define('SocialPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Content
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    mediaUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of media file URLs'
    },
    hashtags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of hashtags'
    },
    // Platform targeting
    platforms: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of platforms to post to: instagram, facebook, twitter, linkedin'
    },
    // Posting status
    status: {
        type: DataTypes.ENUM('draft', 'queued', 'scheduled', 'publishing', 'published', 'partial', 'failed'),
        defaultValue: 'draft'
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Results per platform
    publishResults: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Object with platform as key, containing postId, status, error, etc'
    },
    // Engagement metrics (aggregated)
    metrics: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
            reach: 0
        }
    },
    // Queue position
    queuePosition: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Error tracking
    lastError: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'social_posts'
});

module.exports = SocialPost;
