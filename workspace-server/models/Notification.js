const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'bill_reminder',      // Pengingat tagihan
            'post_published',     // Post berhasil dipublish
            'post_scheduled',     // Post dijadwalkan
            'project_deadline',   // Deadline proyek mendekat
            'budget_alert',       // Melebihi budget
            'goal_progress',      // Update progress goal
            'system',             // Notifikasi sistem
            'custom'              // Custom notification
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data like billId, projectId, etc.'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Delivery status
    sentViaWebPush: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentViaEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentViaWhatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Action URL (nullable)
    actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    // Expiry (optional)
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Notifications',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id', 'is_read'] },
        { fields: ['user_id', 'type'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Notification;

