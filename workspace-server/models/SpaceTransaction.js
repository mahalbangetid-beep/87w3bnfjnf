const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpaceTransaction = sequelize.define('SpaceTransaction', {
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
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
        defaultValue: 'income'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'other'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
    tableName: 'SpaceTransactions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['date'] },
        { fields: ['project_id'] }
    ]
});

module.exports = SpaceTransaction;
