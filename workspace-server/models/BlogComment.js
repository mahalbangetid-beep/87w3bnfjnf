const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogComment = sequelize.define('BlogComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'article_id'
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_id',
        comment: 'For nested replies'
    },
    authorName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'author_name'
    },
    authorEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'author_email'
    },
    authorAvatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'author_avatar'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        comment: 'Null if guest comment'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'spam', 'deleted'),
        allowNull: false,
        defaultValue: 'pending'
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
    },
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'user_agent'
    }
}, {
    tableName: 'blog_comments',
    underscored: true
});

module.exports = BlogComment;
