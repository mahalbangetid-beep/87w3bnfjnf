const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
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
    // TOTP Secret (encrypted)
    secret: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Encrypted TOTP secret key'
    },
    // 2FA Status
    isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Method preference
    method: {
        type: DataTypes.ENUM('totp', 'email', 'both'),
        defaultValue: 'totp'
    },
    // Backup codes (encrypted JSON array)
    backupCodes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Encrypted backup codes array'
    },
    // Last verification timestamp
    lastVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Recovery email (optional, different from main email)
    recoveryEmail: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Pending setup (secret generated but not verified yet)
    pendingSecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Temporary secret during setup'
    }
}, {
    tableName: 'TwoFactorAuth',
    timestamps: true,
    underscored: true
});

module.exports = TwoFactorAuth;
