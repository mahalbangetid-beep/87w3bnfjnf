/**
 * Notifications API Routes
 * Handles notification management, push subscriptions, and preferences
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const schedulerService = require('../services/schedulerService');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// Notification Endpoints
// ============================================

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 20, offset = 0, unreadOnly, type } = req.query;

        const result = await notificationService.getNotifications(req.user.id, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            unreadOnly: unreadOnly === 'true',
            type: type || null
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
    try {
        const { Notification } = require('../models');
        const count = await Notification.count({
            where: { userId: req.user.id, isRead: false }
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Failed to mark all as read' });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
    try {
        const { Notification } = require('../models');
        const deleted = await Notification.destroy({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

// ============================================
// Push Subscription Endpoints
// ============================================

/**
 * GET /api/notifications/vapid-key
 * Get VAPID public key for web push
 */
router.get('/vapid-key', (req, res) => {
    const publicKey = notificationService.getVapidPublicKey();

    if (!publicKey) {
        return res.status(503).json({
            message: 'Web push not configured',
            available: false
        });
    }

    res.json({
        publicKey,
        available: true
    });
});

/**
 * POST /api/notifications/subscribe
 * Subscribe to web push notifications
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, deviceName } = req.body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ message: 'Invalid subscription object' });
        }

        const result = await notificationService.subscribe(
            req.user.id,
            subscription,
            {
                userAgent: req.headers['user-agent'],
                deviceName: deviceName || 'Unknown Device'
            }
        );

        res.json({
            message: 'Subscribed to push notifications',
            subscriptionId: result.id
        });
    } catch (error) {
        console.error('Error subscribing to push:', error);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from web push notifications
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ message: 'Endpoint required' });
        }

        await notificationService.unsubscribe(endpoint);
        res.json({ message: 'Unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ message: 'Failed to unsubscribe' });
    }
});

/**
 * GET /api/notifications/subscriptions
 * Get user's push subscriptions
 */
router.get('/subscriptions', async (req, res) => {
    try {
        const { PushSubscription } = require('../models');
        const subscriptions = await PushSubscription.findAll({
            where: { userId: req.user.id },
            attributes: ['id', 'deviceName', 'isActive', 'lastUsedAt', 'createdAt']
        });

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
});

/**
 * DELETE /api/notifications/subscriptions/:id
 * Delete a push subscription
 */
router.delete('/subscriptions/:id', async (req, res) => {
    try {
        const { PushSubscription } = require('../models');
        const deleted = await PushSubscription.destroy({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        res.json({ message: 'Subscription deleted' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ message: 'Failed to delete subscription' });
    }
});

// ============================================
// Preference Endpoints
// ============================================

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
router.get('/preferences', async (req, res) => {
    try {
        const prefs = await notificationService.getPreferences(req.user.id);
        res.json(prefs);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Failed to fetch preferences' });
    }
});

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
router.put('/preferences', async (req, res) => {
    try {
        const allowedFields = [
            'enableNotifications',
            'enableWebPush',
            'enableEmail',
            'enableWhatsapp',
            'billReminders',
            'billReminderDays',
            'budgetAlerts',
            'budgetThreshold',
            'postPublished',
            'postFailed',
            'projectDeadlines',
            'deadlineReminderDays',
            'taskReminders',
            'goalProgress',
            'milestoneReminders',
            'systemUpdates',
            'securityAlerts',
            'quietHoursEnabled',
            'quietHoursStart',
            'quietHoursEnd',
            'timezone',
            'emailDigest',
            'emailDigestTime'
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const prefs = await notificationService.updatePreferences(req.user.id, updates);
        res.json(prefs);
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
});

// ============================================
// Test & Admin Endpoints
// ============================================

/**
 * POST /api/notifications/test
 * Send a test notification (for testing purposes)
 */
router.post('/test', async (req, res) => {
    try {
        const notification = await notificationService.send(
            req.user.id,
            'system',
            '🔔 Test Notification',
            'Ini adalah notifikasi test. Jika Anda melihat ini, berarti push notifications berfungsi dengan baik!',
            {
                priority: 'normal',
                actionUrl: '/notifications'
            }
        );

        res.json({
            message: 'Test notification sent',
            notification
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ message: 'Failed to send test notification' });
    }
});

/**
 * POST /api/notifications/trigger-job
 * Manually trigger a scheduled job (admin only)
 */
router.post('/trigger-job', async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.Role?.name !== 'superadmin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { jobName } = req.body;
        const result = await schedulerService.runJob(jobName);

        if (result) {
            res.json({ message: `Job ${jobName} triggered successfully` });
        } else {
            res.status(400).json({ message: 'Invalid job name' });
        }
    } catch (error) {
        console.error('Error triggering job:', error);
        res.status(500).json({ message: 'Failed to trigger job' });
    }
});

module.exports = router;
