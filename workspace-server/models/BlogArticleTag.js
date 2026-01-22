const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogArticleTag = sequelize.define('BlogArticleTag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'article_id',
        references: {
            model: 'blog_articles',
            key: 'id'
        }
    },
    tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tag_id',
        references: {
            model: 'blog_tags',
            key: 'id'
        }
    }
}, {
    tableName: 'blog_article_tags',
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['article_id', 'tag_id']
        }
    ]
});

module.exports = BlogArticleTag;
