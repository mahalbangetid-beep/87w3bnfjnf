const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceAccount = sequelize.define('FinanceAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Account name (e.g., BCA, Cash, OVO)'
    },
    type: {
        type: DataTypes.ENUM('bank', 'cash', 'ewallet', 'other'),
        defaultValue: 'bank'
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Current balance in IDR'
    },
    initialBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Initial balance when account was created'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Icon identifier or emoji'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Optional account number for reference'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Default account for transactions'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'finance_accounts'
});

module.exports = FinanceAccount;
