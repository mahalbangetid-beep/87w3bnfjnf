const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientActivity = sequelize.define('ClientActivity', {
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

        type: {
            type: DataTypes.ENUM('note', 'call', 'email', 'meeting', 'message', 'stage_change', 'updated', 'reminder', 'other'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255)
        },
        content: {
            type: DataTypes.TEXT // encrypted
        },
        metadata: {
            type: DataTypes.JSON // for extra data like old_stage, new_stage, etc
        }
    }, {
        tableName: 'client_activities',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['client_id'] },
            { fields: ['created_at'] },
            { fields: ['type'] }
        ]
    });

    return ClientActivity;
};
