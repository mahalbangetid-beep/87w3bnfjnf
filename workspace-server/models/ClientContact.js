const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientContact = sequelize.define('ClientContact', {
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

        // Contact Info (encrypted)
        name: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(100)
        },
        email: {
            type: DataTypes.STRING(500)
        },
        phone: {
            type: DataTypes.STRING(100)
        },
        whatsapp: {
            type: DataTypes.STRING(100)
        },

        // Settings
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_primary'
        },
        preferredContact: {
            type: DataTypes.ENUM('email', 'phone', 'whatsapp', 'any'),
            defaultValue: 'any',
            field: 'preferred_contact'
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'client_contacts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['client_id'] },
            { fields: ['user_id'] }
        ]
    });

    return ClientContact;
};
