const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    connectionId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Content
    title: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    featuredImage: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    // Taxonomy
    categories: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    // Status
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'publishing', 'published', 'failed'),
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
    // Platform post reference
    platformPostId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Post ID from the blog platform'
    },
    platformUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Published URL on the blog'
    },
    // SEO
    metaTitle: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING(255),
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
    tableName: 'blog_posts'
});

module.exports = BlogPost;
