const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectActivity = sequelize.define('ProjectActivity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Action type
    action: {
        type: DataTypes.ENUM(
            'project_created', 'project_updated', 'project_deleted',
            'task_created', 'task_updated', 'task_completed', 'task_deleted',
            'note_created', 'note_updated', 'note_deleted',
            'budget_updated', 'expense_added', 'expense_deleted',
            'asset_added', 'asset_removed',
            'collaborator_invited', 'collaborator_accepted', 'collaborator_removed',
            'comment_added'
        ),
        allowNull: false
    },
    // Target entity
    targetType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'task, note, budget, expense, asset, collaborator'
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    targetName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Human-readable name of target'
    },
    // Additional data as JSON
    metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('metadata');
            return val ? JSON.parse(val) : null;
        },
        set(val) {
            this.setDataValue('metadata', val ? JSON.stringify(val) : null);
        }
    },
    // IP and device info
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true
    }
}, {
    tableName: 'ProjectActivities',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['project_id'] },
        { fields: ['user_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = ProjectActivity;
