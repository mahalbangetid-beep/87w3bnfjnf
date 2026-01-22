const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetNote = sequelize.define('AssetNote', {
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
        type: DataTypes.ENUM('update', 'reminder', 'info', 'warning'),
        defaultValue: 'update',
        comment: 'Note type for different styling'
    },
    // Link to account if this note is about an account change
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to AssetAccount if related'
    },
    // Link to asset item if related
    assetItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to AssetItem if related'
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
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
    }
}, {
    tableName: 'asset_notes'
});

module.exports = AssetNote;
