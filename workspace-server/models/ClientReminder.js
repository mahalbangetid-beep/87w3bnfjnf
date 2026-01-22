const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientReminder = sequelize.define('ClientReminder', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'client_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        remindAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'remind_at'
        },
        repeatType: {
            type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'),
            defaultValue: 'none',
            field: 'repeat_type'
        },
        notifyVia: {
            type: DataTypes.JSON, // ['app', 'email', 'whatsapp']
            defaultValue: ['app'],
            field: 'notify_via'
        },

        // Status
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_completed'
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        },
        isSnoozed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_snoozed'
        },
        snoozedUntil: {
            type: DataTypes.DATE,
            field: 'snoozed_until'
        }
    }, {
        tableName: 'client_reminders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['remind_at'] },
            { fields: ['user_id', 'is_completed'] },
            { fields: ['client_id'] }
        ]
    });

    return ClientReminder;
};
