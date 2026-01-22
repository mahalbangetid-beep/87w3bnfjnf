const express = require('express');
const router = express.Router();
const { SystemSetting } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Initialize default settings if they don't exist
router.post('/init', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const defaults = SystemSetting.getDefaults();
        let created = 0;

        for (const setting of defaults) {
            const [record, isNew] = await SystemSetting.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
            if (isNew) created++;
        }

        res.json({ message: `Initialized ${created} new settings`, total: defaults.length });
    } catch (error) {
        console.error('Error initializing settings:', error);
        res.status(500).json({ error: 'Failed to initialize settings' });
    }
});

// Get all settings by category
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { category } = req.query;

        const where = category ? { category } : {};

        const settings = await SystemSetting.findAll({
            where,
            order: [['category', 'ASC'], ['key', 'ASC']]
        });

        // Mask secret values
        const maskedSettings = settings.map(s => {
            const setting = s.toJSON();
            if (setting.isSecret && setting.value) {
                setting.value = '••••••••';
                setting.hasValue = true;
            }
            return setting;
        });

        res.json(maskedSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Get settings by category (grouped)
router.get('/grouped', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const settings = await SystemSetting.findAll({
            order: [['category', 'ASC'], ['key', 'ASC']]
        });

        // Group by category
        const grouped = {};
        for (const s of settings) {
            const setting = s.toJSON();
            if (setting.isSecret && setting.value) {
                setting.value = '••••••••';
                setting.hasValue = true;
            }

            if (!grouped[setting.category]) {
                grouped[setting.category] = [];
            }
            grouped[setting.category].push(setting);
        }

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Get single setting
router.get('/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const setting = await SystemSetting.findOne({
            where: { key: req.params.key }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        const result = setting.toJSON();
        if (result.isSecret && result.value) {
            result.value = '••••••••';
            result.hasValue = true;
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// Update single setting
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { value } = req.body;

        let setting = await SystemSetting.findOne({
            where: { key: req.params.key }
        });

        if (!setting) {
            // Create if doesn't exist
            setting = await SystemSetting.create({
                key: req.params.key,
                value,
                category: req.body.category || 'general',
                description: req.body.description,
                isSecret: req.body.isSecret || false
            });
        } else {
            await setting.update({ value });
        }

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// Bulk update settings
router.put('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || !Array.isArray(settings)) {
            return res.status(400).json({ error: 'Settings array is required' });
        }

        let updated = 0;
        for (const { key, value } of settings) {
            const [setting, created] = await SystemSetting.findOrCreate({
                where: { key },
                defaults: { key, value, category: 'general' }
            });

            if (!created && value !== undefined) {
                await setting.update({ value });
            }
            updated++;
        }

        res.json({ message: `Updated ${updated} settings` });
    } catch (error) {
        console.error('Error bulk updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Delete setting
router.delete('/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const setting = await SystemSetting.findOne({
            where: { key: req.params.key }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        await setting.destroy();
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

// Test API key validity
router.post('/test/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await SystemSetting.findOne({ where: { key } });

        if (!setting || !setting.value) {
            return res.status(400).json({ error: 'Setting not found or has no value' });
        }

        // Test based on key type
        let testResult = { success: false, message: 'Unknown key type' };

        if (key === 'GEMINI_API_KEY') {
            testResult = await testGeminiAPI(setting.value);
        } else if (key === 'OPENAI_API_KEY') {
            testResult = await testOpenAIAPI(setting.value);
        } else if (key === 'DEEPSEEK_API_KEY') {
            testResult = await testDeepSeekAPI(setting.value);
        } else if (key.includes('META_') || key.includes('TWITTER_') || key.includes('LINKEDIN_')) {
            testResult = { success: true, message: 'Social API key is configured (OAuth test required)' };
        } else {
            testResult = { success: true, message: 'Key is set' };
        }

        res.json(testResult);
    } catch (error) {
        console.error('API test error:', error);
        res.status(500).json({ error: 'Failed to test key' });
    }
});

/**
 * Test Gemini API key by making a simple request
 */
async function testGeminiAPI(apiKey) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: 'GET' }
        );

        if (response.ok) {
            const data = await response.json();
            const modelCount = data.models?.length || 0;
            return {
                success: true,
                message: `Gemini API key is valid. ${modelCount} models available.`,
                models: data.models?.slice(0, 5).map(m => m.name) || []
            };
        } else if (response.status === 400 || response.status === 403) {
            return { success: false, message: 'Invalid Gemini API key' };
        } else {
            return { success: false, message: `Gemini API returned status ${response.status}` };
        }
    } catch (error) {
        return { success: false, message: `Connection error: ${error.message}` };
    }
}

/**
 * Test OpenAI API key by fetching models
 */
async function testOpenAIAPI(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const modelCount = data.data?.length || 0;
            const gptModels = data.data?.filter(m => m.id.includes('gpt')).slice(0, 3).map(m => m.id) || [];
            return {
                success: true,
                message: `OpenAI API key is valid. ${modelCount} models accessible.`,
                models: gptModels
            };
        } else if (response.status === 401) {
            return { success: false, message: 'Invalid OpenAI API key' };
        } else if (response.status === 429) {
            return { success: true, message: 'OpenAI API key is valid (rate limited)', warning: 'Rate limit reached' };
        } else {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, message: errorData.error?.message || `OpenAI API returned status ${response.status}` };
        }
    } catch (error) {
        return { success: false, message: `Connection error: ${error.message}` };
    }
}

/**
 * Test DeepSeek API key
 */
async function testDeepSeekAPI(apiKey) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'DeepSeek API key is valid',
                models: data.data?.slice(0, 3).map(m => m.id) || ['deepseek-chat']
            };
        } else if (response.status === 401) {
            return { success: false, message: 'Invalid DeepSeek API key' };
        } else if (response.status === 429) {
            return { success: true, message: 'DeepSeek API key is valid (rate limited)', warning: 'Rate limit reached' };
        } else {
            return { success: false, message: `DeepSeek API returned status ${response.status}` };
        }
    } catch (error) {
        // DeepSeek might not have a public models endpoint, try a minimal chat request
        try {
            const chatResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 1
                })
            });

            if (chatResponse.ok || chatResponse.status === 429) {
                return { success: true, message: 'DeepSeek API key is valid' };
            } else if (chatResponse.status === 401) {
                return { success: false, message: 'Invalid DeepSeek API key' };
            }
        } catch (chatError) {
            // Ignore
        }
        return { success: false, message: `Connection error: ${error.message}` };
    }
}

// Get all categories
router.get('/meta/categories', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const categories = await SystemSetting.findAll({
            attributes: ['category'],
            group: ['category']
        });

        res.json(categories.map(c => c.category));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;
