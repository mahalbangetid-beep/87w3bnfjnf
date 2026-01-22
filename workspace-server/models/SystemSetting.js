const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general',
        comment: 'general, social, blog, ai, notification, etc'
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    isSecret: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'If true, value should be masked in API responses'
    },
    isRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dataType: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string'
    }
}, {
    tableName: 'system_settings'
});

// Define default settings
SystemSetting.getDefaults = () => [
    // Meta (Facebook & Instagram)
    { key: 'META_APP_ID', category: 'social', description: 'Meta App ID for Facebook & Instagram', isSecret: false, isRequired: true },
    { key: 'META_APP_SECRET', category: 'social', description: 'Meta App Secret', isSecret: true, isRequired: true },

    // Twitter/X
    { key: 'TWITTER_API_KEY', category: 'social', description: 'Twitter/X API Key', isSecret: false, isRequired: true },
    { key: 'TWITTER_API_SECRET', category: 'social', description: 'Twitter/X API Secret', isSecret: true, isRequired: true },
    { key: 'TWITTER_BEARER_TOKEN', category: 'social', description: 'Twitter/X Bearer Token', isSecret: true, isRequired: false },

    // LinkedIn
    { key: 'LINKEDIN_CLIENT_ID', category: 'social', description: 'LinkedIn Client ID', isSecret: false, isRequired: true },
    { key: 'LINKEDIN_CLIENT_SECRET', category: 'social', description: 'LinkedIn Client Secret', isSecret: true, isRequired: true },

    // Blog
    { key: 'GOOGLE_BLOGGER_API_KEY', category: 'blog', description: 'Google Blogger API Key', isSecret: true, isRequired: false },

    // AI Providers
    { key: 'GEMINI_API_KEY', category: 'ai', description: 'Google Gemini API Key', isSecret: true, isRequired: false },
    { key: 'OPENAI_API_KEY', category: 'ai', description: 'OpenAI API Key', isSecret: true, isRequired: false },
    { key: 'DEEPSEEK_API_KEY', category: 'ai', description: 'DeepSeek API Key', isSecret: true, isRequired: false },
    { key: 'DEFAULT_AI_PROVIDER', category: 'ai', description: 'Default AI provider (gemini, openai, deepseek)', isSecret: false, isRequired: false, value: 'gemini' },

    // Notifications
    { key: 'WHATSAPP_GATEWAY_URL', category: 'notification', description: 'WhatsApp Gateway API URL', isSecret: false, isRequired: false },
    { key: 'WHATSAPP_GATEWAY_TOKEN', category: 'notification', description: 'WhatsApp Gateway API Token', isSecret: true, isRequired: false },

    // App Settings
    { key: 'APP_URL', category: 'general', description: 'Application URL', isSecret: false, isRequired: true, value: 'http://localhost:5174' },
    { key: 'API_URL', category: 'general', description: 'API URL', isSecret: false, isRequired: true, value: 'http://localhost:3001' },
];

module.exports = SystemSetting;
