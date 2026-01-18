const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    displayName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'display_name'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'roles',
    underscored: true
});

module.exports = Role;
