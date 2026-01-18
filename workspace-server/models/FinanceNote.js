const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceNote = sequelize.define('FinanceNote', {
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
        type: DataTypes.STRING(200),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('transaction', 'general', 'reminder', 'goal'),
        defaultValue: 'general'
    },
    // Link to transaction if type is 'transaction'
    transactionId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Visual customization
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Tags for organization
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'finance_notes'
});

module.exports = FinanceNote;
