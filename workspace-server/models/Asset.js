const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
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
        type: DataTypes.ENUM('folder', 'document', 'image', 'video', 'audio', 'code', 'link'),
        defaultValue: 'document'
    },
    url: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    tableName: 'assets'
});

// Self-referencing for folder structure
Asset.hasMany(Asset, { as: 'children', foreignKey: 'parentId' });
Asset.belongsTo(Asset, { as: 'parent', foreignKey: 'parentId' });

module.exports = Asset;
