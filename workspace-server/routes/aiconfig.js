const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { UserAIConfig } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Validation rules
const aiConfigValidation = [
    body('provider').isIn(['openai', 'gemini', 'claude', 'grok', 'glm', 'deepseek']).withMessage('Invalid AI provider'),
    body('apiKey').optional().trim().isLength({ min: 10 }).withMessage('API key too short'),
    body('model').optional().trim().isLength({ max: 100 }).withMessage('Model name too long'),
    body('promptAnalysis').optional().trim().isLength({ max: 10000 }).withMessage('Analysis prompt too long'),
    body('promptSocialMedia').optional().trim().isLength({ max: 10000 }).withMessage('Social media prompt too long'),
    body('promptBlog').optional().trim().isLength({ max: 10000 }).withMessage('Blog prompt too long')
];

// Get current user's AI config
router.get('/', authenticateToken, async (req, res) => {
    try {
        let config = await UserAIConfig.findOne({
            where: { userId: req.user.id }
        });

        if (!config) {
            // Return default config structure if none exists
            return res.json({
                exists: false,
                provider: 'openai',
                model: null,
                apiKeySet: false,
                promptAnalysis: UserAIConfig.rawAttributes.promptAnalysis.defaultValue,
                promptSocialMedia: UserAIConfig.rawAttributes.promptSocialMedia.defaultValue,
                promptBlog: UserAIConfig.rawAttributes.promptBlog.defaultValue,
                isActive: true,
                providers: UserAIConfig.PROVIDERS
            });
        }

        res.json({
            exists: true,
            id: config.id,
            provider: config.provider,
            model: config.model,
            apiKeyMasked: config.getMaskedApiKey(),
            apiKeySet: !!config.apiKeyEncrypted,
            promptAnalysis: config.promptAnalysis,
            promptSocialMedia: config.promptSocialMedia,
            promptBlog: config.promptBlog,
            isActive: config.isActive,
            providers: UserAIConfig.PROVIDERS,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt
        });
    } catch (error) {
        logger.error('Error fetching AI config:', error);
        res.status(500).json({ error: 'Failed to fetch AI configuration' });
    }
});

// Get available providers and models
router.get('/providers', authenticateToken, async (req, res) => {
    try {
        res.json(UserAIConfig.PROVIDERS);
    } catch (error) {
        logger.error('Error fetching AI providers:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
});

// Create or update AI config
router.post('/', authenticateToken, aiConfigValidation, async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { provider, apiKey, model, promptAnalysis, promptSocialMedia, promptBlog, isActive } = req.body;

        let config = await UserAIConfig.findOne({
            where: { userId: req.user.id }
        });

        if (config) {
            // Update existing config
            const updateData = {
                provider,
                model: model || UserAIConfig.getDefaultModel(provider),
                promptAnalysis,
                promptSocialMedia,
                promptBlog,
                isActive: isActive !== undefined ? isActive : true
            };

            // Only update API key if provided
            if (apiKey) {
                config.setApiKey(apiKey);
            }

            Object.assign(config, updateData);
            await config.save();
        } else {
            // Create new config
            config = await UserAIConfig.create({
                userId: req.user.id,
                provider,
                apiKeyEncrypted: apiKey, // Will be encrypted by hook
                model: model || UserAIConfig.getDefaultModel(provider),
                promptAnalysis,
                promptSocialMedia,
                promptBlog,
                isActive: isActive !== undefined ? isActive : true
            });
        }

        res.json({
            success: true,
            message: 'AI configuration saved successfully',
            config: {
                id: config.id,
                provider: config.provider,
                model: config.model,
                apiKeyMasked: config.getMaskedApiKey(),
                apiKeySet: !!config.apiKeyEncrypted,
                promptAnalysis: config.promptAnalysis,
                promptSocialMedia: config.promptSocialMedia,
                promptBlog: config.promptBlog,
                isActive: config.isActive
            }
        });
    } catch (error) {
        logger.error('Error saving AI config:', error);
        res.status(500).json({ error: 'Failed to save AI configuration' });
    }
});

// Test AI connection
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const config = await UserAIConfig.findOne({
            where: { userId: req.user.id }
        });

        if (!config || !config.apiKeyEncrypted) {
            return res.status(400).json({ error: 'No AI configuration found. Please save your API key first.' });
        }

        const apiKey = config.getApiKey();
        if (!apiKey) {
            return res.status(400).json({ error: 'Failed to decrypt API key. Please re-enter your key.' });
        }

        // Test connection based on provider
        let testResult;
        try {
            switch (config.provider) {
                case 'openai':
                    testResult = await testOpenAI(apiKey, config.model);
                    break;
                case 'gemini':
                    testResult = await testGemini(apiKey, config.model);
                    break;
                case 'claude':
                    testResult = await testClaude(apiKey, config.model);
                    break;
                case 'grok':
                    testResult = await testGrok(apiKey, config.model);
                    break;
                case 'glm':
                    testResult = await testGLM(apiKey, config.model);
                    break;
                case 'deepseek':
                    testResult = await testDeepSeek(apiKey, config.model);
                    break;
                default:
                    return res.status(400).json({ error: 'Unknown provider' });
            }
        } catch (testError) {
            logger.error(`AI test failed for ${config.provider}:`, testError);
            return res.status(400).json({
                success: false,
                error: testError.message || 'Connection test failed'
            });
        }

        res.json({
            success: true,
            message: `Successfully connected to ${UserAIConfig.PROVIDERS[config.provider].name}`,
            provider: config.provider,
            model: config.model,
            response: testResult
        });
    } catch (error) {
        logger.error('Error testing AI connection:', error);
        res.status(500).json({ error: 'Failed to test AI connection' });
    }
});

// Delete AI config
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const result = await UserAIConfig.destroy({
            where: { userId: req.user.id }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'No AI configuration found' });
        }

        res.json({ success: true, message: 'AI configuration deleted' });
    } catch (error) {
        logger.error('Error deleting AI config:', error);
        res.status(500).json({ error: 'Failed to delete AI configuration' });
    }
});

// ========== Provider Test Functions ==========

async function testOpenAI(apiKey, model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 2 words.' }],
            max_tokens: 10
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || 'Connected';
}

async function testGemini(apiKey, model) {
    const modelName = model || 'gemini-1.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "Connection successful!" in exactly 2 words.' }] }],
            generationConfig: { maxOutputTokens: 10 }
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected';
}

async function testClaude(apiKey, model) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: model || 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 2 words.' }]
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text || 'Connected';
}

async function testGrok(apiKey, model) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'grok-beta',
            messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 2 words.' }],
            max_tokens: 10
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.error);
    return data.choices?.[0]?.message?.content || 'Connected';
}

async function testGLM(apiKey, model) {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'glm-4',
            messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 2 words.' }],
            max_tokens: 10
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || 'Connected';
}

async function testDeepSeek(apiKey, model) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: [{ role: 'user', content: 'Say "Connection successful!" in exactly 2 words.' }],
            max_tokens: 10
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || 'Connected';
}

module.exports = router;
