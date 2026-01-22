const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpaceAsset = sequelize.define('SpaceAsset', {
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
        type: DataTypes.ENUM('image', 'document', 'link', 'code', 'other'),
        allowNull: false,
        defaultValue: 'link'
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
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
    tableName: 'SpaceAssets',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['project_id'] }
    ]
});

module.exports = SpaceAsset;
