const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogCategory = sequelize.define('BlogCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'HiOutlineFolder'
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'blog_categories',
    underscored: true
});

module.exports = BlogCategory;
