const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectCollaborator = sequelize.define('ProjectCollaborator', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    invitedById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Status
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'removed'),
        defaultValue: 'pending'
    },
    // Role (for future use, currently all equal)
    role: {
        type: DataTypes.ENUM('owner', 'editor', 'viewer'),
        defaultValue: 'editor'
    },
    // Invite token for link-based invites
    inviteToken: {
        type: DataTypes.STRING(64),
        unique: true,
        allowNull: true
    },
    // When invite expires
    inviteExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Timestamps
    invitedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Last access
    lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'ProjectCollaborators',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['project_id'] },
        { fields: ['user_id'] },
        { fields: ['invite_token'], unique: true },
        { fields: ['project_id', 'user_id'], unique: true }
    ]
});

module.exports = ProjectCollaborator;
