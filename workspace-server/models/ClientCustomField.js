const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientCustomField = sequelize.define('ClientCustomField', {
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
            type: DataTypes.STRING(100),
            allowNull: false
        },
        fieldKey: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'field_key'
        },
        type: {
            type: DataTypes.ENUM('text', 'textarea', 'number', 'date', 'select', 'multiselect', 'checkbox', 'url', 'email', 'phone'),
            allowNull: false
        },
        isRequired: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_required'
        },
        placeholder: {
            type: DataTypes.STRING(255)
        },
        options: {
            type: DataTypes.JSON // for select/multiselect options
        },
        defaultValue: {
            type: DataTypes.STRING(255),
            field: 'default_value'
        },
        orderIndex: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'order_index'
        }
    }, {
        tableName: 'client_custom_fields',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'field_key']
            }
        ]
    });

    return ClientCustomField;
};
