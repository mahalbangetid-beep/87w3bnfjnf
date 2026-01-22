/**
 * Database Sync Script
 * Run: npm run db:sync
 */

require('dotenv').config();
const { sequelize } = require('../models');

const syncDatabase = async () => {
    try {
        console.log('🔄 Syncing database...');
        console.log(`📍 Database: ${process.env.DB_NAME}`);

        // Sync all models with database
        // Use { alter: true } to update existing tables
        // Use { force: true } to drop and recreate (DANGER: deletes all data!)
        await sequelize.sync({ alter: true });

        console.log('✅ Database synced successfully!');
        console.log('📋 All tables created/updated.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
