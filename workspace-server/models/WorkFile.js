const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkFile = sequelize.define('WorkFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('folder', 'file', 'link'),
        defaultValue: 'file'
    },
    fileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'document, image, video, audio, code, other'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'For link type or external file'
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes'
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Array of parent folder IDs as JSON string'
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Parent folder ID, null for root'
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Associated work project'
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#8b5cf6'
    },
    starred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'work_files'
});

module.exports = WorkFile;
