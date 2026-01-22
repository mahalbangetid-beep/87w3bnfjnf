const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeatureSuggestion = sequelize.define('FeatureSuggestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('feature', 'improvement', 'bug', 'other'),
        defaultValue: 'feature'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'planned', 'implemented', 'declined'),
        defaultValue: 'pending'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'feature_suggestions',
    underscored: true
});

module.exports = FeatureSuggestion;
