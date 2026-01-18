require('dotenv').config();
const { sequelize, Role, User } = require('../models');

const roles = [
    {
        id: 1,
        name: 'master_admin',
        displayName: 'Master Admin',
        description: 'Full access to all features and settings',
        permissions: {
            projects: ['create', 'read', 'update', 'delete'],
            notes: ['create', 'read', 'update', 'delete'],
            tasks: ['create', 'read', 'update', 'delete'],
            budgets: ['create', 'read', 'update', 'delete'],
            assets: ['create', 'read', 'update', 'delete'],
            reports: ['create', 'read', 'export'],
            users: ['create', 'read', 'update', 'delete'],
            settings: ['read', 'update'],
            monitoring: ['read']
        }
    },
    {
        id: 2,
        name: 'monitoring',
        displayName: 'Monitoring',
        description: 'Can view all user activities and reports',
        permissions: {
            projects: ['read'],
            notes: ['read'],
            tasks: ['read'],
            budgets: ['read'],
            assets: ['read'],
            reports: ['read', 'export'],
            users: ['read'],
            settings: ['read'],
            monitoring: ['read']
        }
    },
    {
        id: 3,
        name: 'user',
        displayName: 'User',
        description: 'Standard user with personal workspace',
        permissions: {
            projects: ['create', 'read', 'update', 'delete'],
            notes: ['create', 'read', 'update', 'delete'],
            tasks: ['create', 'read', 'update', 'delete'],
            budgets: ['create', 'read', 'update', 'delete'],
            assets: ['create', 'read', 'update', 'delete'],
            reports: ['create', 'read', 'export'],
            users: [],
            settings: ['read', 'update'],
            monitoring: []
        }
    },
    {
        id: 4,
        name: 'marketing',
        displayName: 'Marketing',
        description: 'Marketing team with limited access',
        permissions: {
            projects: ['read'],
            notes: ['create', 'read', 'update', 'delete'],
            tasks: ['create', 'read', 'update', 'delete'],
            budgets: ['read'],
            assets: ['create', 'read', 'update', 'delete'],
            reports: ['read', 'export'],
            users: [],
            settings: ['read'],
            monitoring: []
        }
    },
    {
        id: 5,
        name: 'blog',
        displayName: 'Blog Writer',
        description: 'Can create and manage blog articles',
        permissions: {
            projects: [],
            notes: [],
            tasks: [],
            budgets: [],
            assets: [],
            reports: [],
            users: [],
            settings: ['read'],
            monitoring: [],
            blog: ['create', 'read', 'update', 'delete']
        }
    }
];

const defaultAdmin = {
    name: 'Admin',
    email: 'admin@workspace.com',
    password: 'admin123',
    roleId: 1,
    isActive: true
};

const seedDatabase = async () => {
    try {
        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: true }); // WARNING: This will drop all tables

        console.log('🌱 Seeding roles...');
        for (const role of roles) {
            await Role.create(role);
            console.log(`   ✅ Created role: ${role.displayName}`);
        }

        console.log('👤 Creating default admin user...');
        await User.create(defaultAdmin);
        console.log(`   ✅ Created admin: ${defaultAdmin.email} (password: ${defaultAdmin.password})`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log(`   Email: ${defaultAdmin.email}`);
        console.log(`   Password: ${defaultAdmin.password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
