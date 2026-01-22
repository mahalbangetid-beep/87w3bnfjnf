const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientTag = sequelize.define('ClientTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },

        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(20),
            defaultValue: '#6b7280'
        }
    }, {
        tableName: 'client_tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'name']
            }
        ]
    });

    return ClientTag;
};
