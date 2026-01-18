/**
 * Notification Service
 * Handles sending notifications via Web Push, Email, and managing notification logic
 */

const webpush = require('web-push');
const nodemailer = require('nodemailer');
const { Notification, PushSubscription, NotificationPreference, User } = require('../models');
const { Op } = require('sequelize');

// ============================================
// Web Push Configuration
// ============================================

// Generate VAPID keys: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@workspace.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ============================================
// Email Configuration
// ============================================

let emailTransporter = null;

const initEmailTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('📧 Email transporter initialized');
    } else {
        console.warn('⚠️ SMTP not configured - email notifications disabled');
    }
};

// Initialize on module load
initEmailTransporter();

// ============================================
// Notification Service Functions
// ============================================

const notificationService = {
    /**
     * Create and send a notification
     */
    async send(userId, type, title, message, options = {}) {
        try {
            // Get user preferences
            const prefs = await NotificationPreference.findOne({ where: { userId } });
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if notifications are enabled
            if (prefs && !prefs.enableNotifications) {
                console.log(`Notifications disabled for user ${userId}`);
                return null;
            }

            // Check quiet hours
            if (prefs?.quietHoursEnabled && this.isQuietHours(prefs)) {
                // Store notification but don't send push
                options.skipPush = true;
            }

            // Create notification record
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data: options.data || null,
                priority: options.priority || 'normal',
                actionUrl: options.actionUrl || null,
                expiresAt: options.expiresAt || null
            });

            // Send via Web Push
            if (!options.skipPush && (!prefs || prefs.enableWebPush)) {
                const pushSent = await this.sendWebPush(userId, notification);
                if (pushSent) {
                    notification.sentViaWebPush = true;
                }
            }

            // Send via Email
            if (!options.skipEmail && (!prefs || prefs.enableEmail)) {
                const emailSent = await this.sendEmail(user.email, notification);
                if (emailSent) {
                    notification.sentViaEmail = true;
                }
            }

            await notification.save();
            return notification;

        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    },

    /**
     * Send Web Push notification to all user's subscriptions
     */
    async sendWebPush(userId, notification) {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.warn('VAPID keys not configured - skipping web push');
            return false;
        }

        try {
            const subscriptions = await PushSubscription.findAll({
                where: { userId, isActive: true }
            });

            if (subscriptions.length === 0) {
                return false;
            }

            const payload = JSON.stringify({
                title: notification.title,
                body: notification.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                data: {
                    notificationId: notification.id,
                    type: notification.type,
                    actionUrl: notification.actionUrl,
                    ...notification.data
                },
                timestamp: Date.now()
            });

            const options = {
                TTL: 60 * 60 * 24, // 24 hours
                urgency: notification.priority === 'urgent' ? 'high' : 'normal'
            };

            let sentCount = 0;
            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }, payload, options);

                    // Update last used
                    sub.lastUsedAt = new Date();
                    sub.failureCount = 0;
                    await sub.save();
                    sentCount++;

                } catch (pushError) {
                    console.error('Push failed for subscription:', sub.id, pushError.statusCode);

                    // Handle expired/invalid subscriptions
                    if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                        await sub.destroy();
                        console.log('Removed invalid subscription:', sub.id);
                    } else {
                        sub.failureCount += 1;
                        sub.lastFailureAt = new Date();
                        if (sub.failureCount >= 5) {
                            sub.isActive = false;
                        }
                        await sub.save();
                    }
                }
            }

            return sentCount > 0;

        } catch (error) {
            console.error('Error sending web push:', error);
            return false;
        }
    },

    /**
     * Send Email notification
     */
    async sendEmail(email, notification) {
        if (!emailTransporter) {
            return false;
        }

        try {
            const html = this.getEmailTemplate(notification);

            await emailTransporter.sendMail({
                from: process.env.SMTP_FROM || '"Workspace" <noreply@workspace.app>',
                to: email,
                subject: notification.title,
                html
            });

            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    },

    /**
     * Generate email HTML template
     */
    getEmailTemplate(notification) {
        const priorityColor = {
            low: '#6b7280',
            normal: '#3b82f6',
            high: '#f59e0b',
            urgent: '#ef4444'
        };

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16161a 100%); border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #06b6d4); padding: 12px; border-radius: 12px;">
                            <span style="font-size: 24px;">✨</span>
                        </div>
                        <h1 style="color: white; margin: 15px 0 5px; font-size: 24px;">Workspace</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 25px; border-left: 4px solid ${priorityColor[notification.priority]};">
                        <h2 style="color: white; margin: 0 0 10px; font-size: 18px;">${notification.title}</h2>
                        <p style="color: #9ca3af; margin: 0; font-size: 15px; line-height: 1.6;">${notification.message}</p>
                    </div>
                    
                    ${notification.actionUrl ? `
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${notification.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 600;">
                            Lihat Detail
                        </a>
                    </div>
                    ` : ''}
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            Anda menerima email ini karena notifikasi diaktifkan di akun Workspace Anda.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    },

    /**
     * Check if current time is within quiet hours
     */
    isQuietHours(prefs) {
        if (!prefs.quietHoursEnabled) return false;

        const now = new Date();
        const timezone = prefs.timezone || 'Asia/Jakarta';

        // Get current time in user's timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });

        const currentTime = formatter.format(now);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMin;

        const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
        const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Handle overnight quiet hours (e.g., 22:00 - 07:00)
        if (startMinutes > endMinutes) {
            return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    },

    /**
     * Get user's notifications with pagination
     */
    async getNotifications(userId, options = {}) {
        const { limit = 20, offset = 0, unreadOnly = false, type = null } = options;

        const where = { userId };
        if (unreadOnly) where.isRead = false;
        if (type) where.type = type;

        const notifications = await Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            notifications: notifications.rows,
            total: notifications.count,
            unreadCount: await Notification.count({ where: { userId, isRead: false } })
        };
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: { id: notificationId, userId }
        });

        if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
        }

        return notification;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId, isRead: false } }
        );
    },

    /**
     * Delete old notifications (cleanup job)
     */
    async cleanupOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const deleted = await Notification.destroy({
            where: {
                createdAt: { [Op.lt]: cutoffDate },
                isRead: true
            }
        });

        console.log(`Cleaned up ${deleted} old notifications`);
        return deleted;
    },

    /**
     * Subscribe to Web Push
     */
    async subscribe(userId, subscription, deviceInfo = {}) {
        const crypto = require('crypto');
        const endpointHash = crypto.createHash('sha256').update(subscription.endpoint).digest('hex');

        // Check if subscription already exists
        const existing = await PushSubscription.findOne({
            where: { endpointHash }
        });

        if (existing) {
            // Update existing subscription
            existing.userId = userId;
            existing.endpoint = subscription.endpoint;
            existing.p256dh = subscription.keys.p256dh;
            existing.auth = subscription.keys.auth;
            existing.isActive = true;
            existing.userAgent = deviceInfo.userAgent;
            existing.deviceName = deviceInfo.deviceName;
            await existing.save();
            return existing;
        }

        // Create new subscription
        return await PushSubscription.create({
            userId,
            endpoint: subscription.endpoint,
            endpointHash,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userAgent: deviceInfo.userAgent,
            deviceName: deviceInfo.deviceName
        });
    },

    /**
     * Unsubscribe from Web Push
     */
    async unsubscribe(endpoint) {
        return await PushSubscription.destroy({
            where: { endpoint }
        });
    },

    /**
     * Get or create notification preferences
     */
    async getPreferences(userId) {
        let prefs = await NotificationPreference.findOne({ where: { userId } });

        if (!prefs) {
            prefs = await NotificationPreference.create({ userId });
        }

        return prefs;
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(userId, updates) {
        let prefs = await NotificationPreference.findOne({ where: { userId } });

        if (!prefs) {
            prefs = await NotificationPreference.create({ userId, ...updates });
        } else {
            await prefs.update(updates);
        }

        return prefs;
    },

    /**
     * Get VAPID public key for client
     */
    getVapidPublicKey() {
        return VAPID_PUBLIC_KEY;
    }
};

module.exports = notificationService;
