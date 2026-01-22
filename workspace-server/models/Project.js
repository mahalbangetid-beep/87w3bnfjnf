const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    client: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'review', 'completed', 'on-hold', 'cancelled'),
        defaultValue: 'active'
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    reportingFrequency: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'weekly'
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#8b5cf6'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'projects'
});

module.exports = Project;
