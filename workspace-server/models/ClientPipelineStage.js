const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClientPipelineStage = sequelize.define('ClientPipelineStage', {
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
        color: {
            type: DataTypes.STRING(20),
            defaultValue: '#6b7280'
        },
        icon: {
            type: DataTypes.STRING(10) // emoji
        },
        orderIndex: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'order_index'
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_default'
        },
        isFinal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_final'
        },
        stageType: {
            type: DataTypes.ENUM('active', 'won', 'lost', 'dormant'),
            defaultValue: 'active',
            field: 'stage_type'
        }
    }, {
        tableName: 'client_pipeline_stages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['user_id', 'order_index'] }
        ]
    });

    // Static method to create default stages for new user
    ClientPipelineStage.createDefaultStages = async function (userId) {
        const defaultStages = [
            { name: 'Lead', color: '#6b7280', icon: '📥', orderIndex: 0, isDefault: true, stageType: 'active' },
            { name: 'Contacted', color: '#3b82f6', icon: '📞', orderIndex: 1, stageType: 'active' },
            { name: 'Qualified', color: '#8b5cf6', icon: '✨', orderIndex: 2, stageType: 'active' },
            { name: 'Proposal', color: '#f59e0b', icon: '📝', orderIndex: 3, stageType: 'active' },
            { name: 'Negotiation', color: '#ec4899', icon: '💬', orderIndex: 4, stageType: 'active' },
            { name: 'Won', color: '#10b981', icon: '✅', orderIndex: 5, isFinal: true, stageType: 'won' },
            { name: 'Lost', color: '#ef4444', icon: '❌', orderIndex: 6, isFinal: true, stageType: 'lost' },
            { name: 'Dormant', color: '#9ca3af', icon: '😴', orderIndex: 7, stageType: 'dormant' }
        ];

        return await ClientPipelineStage.bulkCreate(
            defaultStages.map(stage => ({ ...stage, userId }))
        );
    };

    return ClientPipelineStage;
};
