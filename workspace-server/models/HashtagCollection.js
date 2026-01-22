const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HashtagCollection = sequelize.define('HashtagCollection', {
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
        allowNull: false
    },
    hashtags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of hashtag strings without #'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#8b5cf6'
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'hashtag_collections'
});

module.exports = HashtagCollection;
