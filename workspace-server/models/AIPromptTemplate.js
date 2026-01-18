const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIPromptTemplate = sequelize.define('AIPromptTemplate', {
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
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('caption', 'blog', 'hashtag', 'seo', 'improve', 'other'),
        defaultValue: 'caption'
    },
    provider: {
        type: DataTypes.ENUM('gemini', 'openai', 'deepseek', 'any'),
        defaultValue: 'any'
    },
    variables: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of variable names like {topic}, {tone}, etc'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'If true, available to all users'
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'ai_prompt_templates'
});

module.exports = AIPromptTemplate;
