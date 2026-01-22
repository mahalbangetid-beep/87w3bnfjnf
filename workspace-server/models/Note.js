const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#8b5cf6'
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    labels: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'notes'
});

module.exports = Note;
