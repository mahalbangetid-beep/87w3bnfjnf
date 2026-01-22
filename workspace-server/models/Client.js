const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Client = sequelize.define('Client', {
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

        // Basic Info (encrypted)
        name: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        companyName: {
            type: DataTypes.STRING(255),
            field: 'company_name'
        },
        logo: {
            type: DataTypes.STRING(255)
        },

        // Company Details
        industry: {
            type: DataTypes.STRING(100)
        },
        companySize: {
            type: DataTypes.ENUM('solo', 'small', 'medium', 'large', 'enterprise'),
            field: 'company_size'
        },
        website: {
            type: DataTypes.STRING(255)
        },
        budgetRange: {
            type: DataTypes.STRING(50),
            field: 'budget_range'
        },

        // Address
        addressStreet: {
            type: DataTypes.TEXT,
            field: 'address_street'
        },
        addressCity: {
            type: DataTypes.STRING(100),
            field: 'address_city'
        },
        addressState: {
            type: DataTypes.STRING(100),
            field: 'address_state'
        },
        addressPostal: {
            type: DataTypes.STRING(20),
            field: 'address_postal'
        },
        addressCountry: {
            type: DataTypes.STRING(100),
            defaultValue: 'Indonesia',
            field: 'address_country'
        },

        // Social Media
        socialLinkedin: {
            type: DataTypes.STRING(255),
            field: 'social_linkedin'
        },
        socialInstagram: {
            type: DataTypes.STRING(255),
            field: 'social_instagram'
        },
        socialTwitter: {
            type: DataTypes.STRING(255),
            field: 'social_twitter'
        },
        socialFacebook: {
            type: DataTypes.STRING(255),
            field: 'social_facebook'
        },
        socialTiktok: {
            type: DataTypes.STRING(255),
            field: 'social_tiktok'
        },
        socialOther: {
            type: DataTypes.JSON,
            field: 'social_other'
        },

        // Classification
        stageId: {
            type: DataTypes.INTEGER,
            field: 'stage_id'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'vip'),
            defaultValue: 'medium'
        },
        clientType: {
            type: DataTypes.ENUM('b2b', 'b2c', 'personal', 'agency'),
            field: 'client_type'
        },
        source: {
            type: DataTypes.STRING(100)
        },
        tags: {
            type: DataTypes.JSON
        },

        // Custom Fields
        customFields: {
            type: DataTypes.JSON,
            field: 'custom_fields'
        },

        // Notes (encrypted)
        notes: {
            type: DataTypes.TEXT
        },

        // Tracking
        lastContactedAt: {
            type: DataTypes.DATE,
            field: 'last_contacted_at'
        },
        nextFollowupAt: {
            type: DataTypes.DATE,
            field: 'next_followup_at'
        },

        // Soft Delete
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted'
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        }
    }, {
        tableName: 'clients',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['user_id'] },
            { fields: ['stage_id'] },
            { fields: ['is_deleted'] },
            { fields: ['priority'] }
        ]
    });

    return Client;
};
