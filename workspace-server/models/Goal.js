const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('Goal', {
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
        type: DataTypes.TEXT
    },
    current: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    target: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'units' // e.g., 'units', 'currency', 'percentage'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#8b5cf6'
    },
    deadline: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'paused'),
        defaultValue: 'active'
    },
    category: {
        type: DataTypes.ENUM('revenue', 'users', 'features', 'performance', 'marketing', 'other'),
        defaultValue: 'other'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'goals',
    timestamps: true
});

module.exports = Goal;
