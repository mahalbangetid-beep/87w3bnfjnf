const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Web Push subscription object from browser
    endpoint: {
        type: DataTypes.STRING(2048),
        allowNull: false
    },
    // Hash of endpoint for unique constraint (since TEXT can't be indexed)
    endpointHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    p256dh: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Public key for encryption'
    },
    auth: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Auth secret for encryption'
    },
    // Device info
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    deviceName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User-friendly device name'
    },
    // Status
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Failure tracking
    failureCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastFailureAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'PushSubscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['is_active'] }
    ]
});

module.exports = PushSubscription;


