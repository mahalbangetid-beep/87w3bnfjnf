const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogArticle = sequelize.define('BlogArticle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(280),
        allowNull: false,
        unique: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Short description for preview'
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'Full article content in HTML'
    },
    featuredImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'featured_image'
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'author_id'
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'category_id'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at'
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_at'
    },
    views: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    readingTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        field: 'reading_time',
        comment: 'Estimated reading time in minutes'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_featured'
    },
    allowComments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'allow_comments'
    },
    metaTitle: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'meta_title'
    },
    metaDescription: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'meta_description'
    },
    metaKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'meta_keywords'
    }
}, {
    tableName: 'blog_articles',
    underscored: true,
    hooks: {
        beforeSave: (article) => {
            // Calculate reading time based on word count
            if (article.content) {
                const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                article.readingTime = Math.max(1, Math.ceil(wordCount / 200));
            }
        }
    }
});

module.exports = BlogArticle;
