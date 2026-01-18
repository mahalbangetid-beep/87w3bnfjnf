const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogTag = sequelize.define('BlogTag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#06b6d4'
    },
    usageCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'usage_count'
    }
}, {
    tableName: 'blog_tags',
    underscored: true
});

module.exports = BlogTag;
