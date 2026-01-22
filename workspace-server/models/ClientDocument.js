const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientDocument = sequelize.define('ClientDocument', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fileName: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        originalName: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        fileType: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        filePath: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'client_documents',
        timestamps: true,
    });

    return ClientDocument;
};
