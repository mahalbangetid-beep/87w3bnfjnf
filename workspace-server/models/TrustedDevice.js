const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TrustedDevice = sequelize.define('TrustedDevice', {
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
    // Device identifier (hashed)
    deviceHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: 'SHA256 hash of device fingerprint'
    },
    // Token for trust verification
    trustToken: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    // Device info
    deviceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'User-friendly device name'
    },
    browser: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    os: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'City, Country from IP'
    },
    // Trust expiration
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Trust expires after 30 days by default'
    },
    // Last used
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Active status
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'TrustedDevices',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['trust_token'], unique: true },
        { fields: ['device_hash'] }
    ]
});

module.exports = TrustedDevice;
