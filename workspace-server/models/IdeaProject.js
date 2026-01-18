const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IdeaProject = sequelize.define('IdeaProject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT('long'), // Support long HTML content with images
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('idea', 'planning', 'development', 'testing', 'launching', 'launched'),
        defaultValue: 'idea'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#8b5cf6'
    },
    targetDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    launchDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    tags: {
        type: DataTypes.JSON, // Array of tags
        defaultValue: []
    },
    links: {
        type: DataTypes.JSON, // Array of {title, url}
        defaultValue: []
    },
    attachments: {
        type: DataTypes.JSON, // Array of {name, url, type}
        defaultValue: []
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'project_plans', // Keep old table name to preserve existing data
    timestamps: true
});

module.exports = IdeaProject;
