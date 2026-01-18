const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('software', 'hardware', 'service', 'marketing', 'operations', 'other'),
        defaultValue: 'other'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'expenses'
});

module.exports = Expense;
