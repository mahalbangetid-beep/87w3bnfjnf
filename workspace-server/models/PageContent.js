const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PageContent = sequelize.define('PageContent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Page identifier: about, privacy, terms, security'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    subtitle: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: 'HTML content'
    },
    sections: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
            const value = this.getDataValue('sections');
            if (!value) return [];
            try {
                return JSON.parse(value);
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('sections', JSON.stringify(value || []));
        },
        comment: 'JSON array of page sections'
    },
    metaTitle: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    metaKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastUpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'page_contents',
    timestamps: true,
    indexes: [
        { fields: ['slug'], unique: true }
    ]
});

module.exports = PageContent;
