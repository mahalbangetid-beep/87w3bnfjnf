const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpaceBudget = sequelize.define('SpaceBudget', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    spent: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'development'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'project_plans',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'SpaceBudgets',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['category'] },
        { fields: ['project_id'] }
    ]
});

module.exports = SpaceBudget;
