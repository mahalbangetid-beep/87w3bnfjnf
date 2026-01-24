const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { User } = require('../models');
const schedulerService = require('../services/schedulerService');

const KEWHATS_API_URL = 'https://api.kewhats.app';

// Proxy to KeWhats API - Test Connection (no auth required for testing)
router.get('/test-connection', async (req, res) => {
    try {
        const apiKey = req.headers['x-whatsapp-api-key'];

        if (!apiKey) {
            return res.status(400).json({ success: false, message: 'API Key is required' });
        }

        const response = await fetch(`${KEWHATS_API_URL}/api/messages?limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            res.json({ success: true, message: 'Connection successful', data });
        } else {
            let errorMessage = 'Connection failed';
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) { }
            res.status(response.status).json({ success: false, message: errorMessage });
        }
    } catch (error) {
        console.error('WhatsApp test connection error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to connect to KeWhats API' });
    }
});

// Proxy to KeWhats API - Send Message
router.post('/send', async (req, res) => {
    try {
        const apiKey = req.headers['x-whatsapp-api-key'];
        const { deviceId, to, message } = req.body;

        if (!apiKey) {
            return res.status(400).json({ success: false, message: 'API Key is required' });
        }

        if (!deviceId || !to || !message) {
            return res.status(400).json({ success: false, message: 'deviceId, to, and message are required' });
        }

        const response = await fetch(`${KEWHATS_API_URL}/api/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId, to, message }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            res.json({ success: true, message: 'Message sent successfully', data: data.data });
        } else {
            res.status(response.status || 400).json({ success: false, message: data.message || 'Failed to send message' });
        }
    } catch (error) {
        console.error('WhatsApp send error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to send message' });
    }
});

// ============================================
// Config Endpoints (requires authentication)
// ============================================

// Get user's WhatsApp config
router.get('/config', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const config = user.settings?.whatsapp || {};
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Get WhatsApp config error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Save user's WhatsApp config
router.post('/config', authenticate, async (req, res) => {
    try {
        const { apiKey, deviceId, defaultPhone, messageLanguage, dailySummaryEnabled } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update settings
        const settings = user.settings || {};
        settings.whatsapp = {
            apiKey,
            deviceId,
            defaultPhone,
            messageLanguage: messageLanguage || 'id',
            dailySummaryEnabled: dailySummaryEnabled || false,
            updatedAt: new Date().toISOString(),
        };

        user.settings = settings;
        await user.save();

        res.json({ success: true, message: 'Config saved', data: settings.whatsapp });
    } catch (error) {
        console.error('Save WhatsApp config error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// Manual Trigger for Testing (requires auth)
// ============================================
router.post('/trigger/:jobName', authenticate, async (req, res) => {
    try {
        const { jobName } = req.params;

        const validJobs = ['whatsappBillReminders', 'whatsappTaskDeadlines', 'whatsappDailySummary'];
        if (!validJobs.includes(jobName)) {
            return res.status(400).json({
                success: false,
                message: `Invalid job name. Valid jobs: ${validJobs.join(', ')}`
            });
        }

        const result = await schedulerService.runJob(jobName);

        if (result) {
            res.json({ success: true, message: `Job ${jobName} triggered successfully` });
        } else {
            res.status(400).json({ success: false, message: `Job ${jobName} not found` });
        }
    } catch (error) {
        console.error('Trigger job error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

