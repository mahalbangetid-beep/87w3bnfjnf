const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // ============================================
    // Master Controls
    // ============================================
    enableNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Master switch for all notifications'
    },
    enableWebPush: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    enableEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    enableWhatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // ============================================
    // Finance Notifications
    // ============================================
    billReminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Bill due date reminders'
    },
    billReminderDays: {
        type: DataTypes.JSON,
        defaultValue: [7, 3, 1],
        comment: 'Days before due date to remind'
    },
    budgetAlerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Alert when spending exceeds budget'
    },
    budgetThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 80,
        comment: 'Percentage threshold to trigger alert'
    },

    // ============================================
    // Social Notifications
    // ============================================
    postPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Notify when scheduled post is published'
    },
    postFailed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Notify when post fails to publish'
    },

    // ============================================
    // Work/Project Notifications
    // ============================================
    projectDeadlines: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Project deadline reminders'
    },
    deadlineReminderDays: {
        type: DataTypes.JSON,
        defaultValue: [7, 2],
        comment: 'Days before deadline to remind'
    },
    taskReminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // ============================================
    // Space/Goals Notifications
    // ============================================
    goalProgress: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Weekly goal progress updates'
    },
    milestoneReminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // ============================================
    // System Notifications
    // ============================================
    systemUpdates: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'System announcements and updates'
    },
    securityAlerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Login alerts, password changes, etc.'
    },

    // ============================================
    // Scheduling
    // ============================================
    quietHoursEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    quietHoursStart: {
        type: DataTypes.TIME,
        defaultValue: '22:00:00',
        comment: 'Start of quiet hours (no push notifications)'
    },
    quietHoursEnd: {
        type: DataTypes.TIME,
        defaultValue: '07:00:00',
        comment: 'End of quiet hours'
    },
    timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'Asia/Jakarta'
    },

    // ============================================
    // Email Digest
    // ============================================
    emailDigest: {
        type: DataTypes.ENUM('none', 'daily', 'weekly'),
        defaultValue: 'daily',
        comment: 'Email summary frequency'
    },
    emailDigestTime: {
        type: DataTypes.TIME,
        defaultValue: '08:00:00'
    }
}, {
    tableName: 'NotificationPreferences',
    timestamps: true,
    underscored: true
});

module.exports = NotificationPreference;

