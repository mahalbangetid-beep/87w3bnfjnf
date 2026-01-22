const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'workspace-ai-config-key-32ch'; // 32 chars for AES-256
const IV_LENGTH = 16;

// Encrypt function
function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Decrypt function
function decrypt(text) {
    if (!text) return null;
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = parts.join(':');
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

const UserAIConfig = sequelize.define('UserAIConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One config per user
        references: {
            model: 'users',
            key: 'id'
        }
    },
    provider: {
        type: DataTypes.ENUM('openai', 'gemini', 'claude', 'grok', 'glm', 'deepseek'),
        defaultValue: 'openai'
    },
    apiKeyEncrypted: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Model name preference, e.g., gpt-4o, gemini-1.5-pro'
    },
    promptAnalysis: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'You are an expert data analyst. Analyze the provided data and give clear, actionable insights. Be concise and focus on key findings.'
    },
    promptSocialMedia: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'You are a social media marketing expert. Create engaging, viral-worthy content that resonates with the target audience. Use appropriate hashtags and emojis. Keep it concise and attention-grabbing.'
    },
    promptBlog: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'You are a professional content writer and SEO expert. Create well-structured, engaging blog content with proper headings, subheadings, and formatting. Focus on readability and value for readers.'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'UserAIConfigs',
    timestamps: true,
    hooks: {
        beforeCreate: (config) => {
            if (config.apiKeyEncrypted && !config.apiKeyEncrypted.includes(':')) {
                config.apiKeyEncrypted = encrypt(config.apiKeyEncrypted);
            }
        },
        beforeUpdate: (config) => {
            if (config.changed('apiKeyEncrypted') && config.apiKeyEncrypted && !config.apiKeyEncrypted.includes(':')) {
                config.apiKeyEncrypted = encrypt(config.apiKeyEncrypted);
            }
        }
    }
});

// Instance method to get decrypted API key
UserAIConfig.prototype.getApiKey = function () {
    return decrypt(this.apiKeyEncrypted);
};

// Instance method to set API key (will be encrypted on save)
UserAIConfig.prototype.setApiKey = function (plainKey) {
    this.apiKeyEncrypted = encrypt(plainKey);
};

// Instance method to get masked API key for display
UserAIConfig.prototype.getMaskedApiKey = function () {
    const key = this.getApiKey();
    if (!key) return null;
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
};

// Static: Available providers with their models
UserAIConfig.PROVIDERS = {
    openai: {
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        baseUrl: 'https://api.openai.com/v1'
    },
    gemini: {
        name: 'Google Gemini',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
    },
    claude: {
        name: 'Anthropic Claude',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        baseUrl: 'https://api.anthropic.com/v1'
    },
    grok: {
        name: 'xAI Grok',
        models: ['grok-beta', 'grok-2-1212'],
        baseUrl: 'https://api.x.ai/v1'
    },
    glm: {
        name: 'Zhipu GLM',
        models: ['glm-4', 'glm-4v', 'glm-3-turbo'],
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
    },
    deepseek: {
        name: 'DeepSeek',
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
        baseUrl: 'https://api.deepseek.com/v1'
    }
};

// Helper to get default model for provider
UserAIConfig.getDefaultModel = function (provider) {
    const providerConfig = this.PROVIDERS[provider];
    return providerConfig ? providerConfig.models[0] : null;
};

module.exports = UserAIConfig;
