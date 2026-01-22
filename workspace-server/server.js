require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize, testConnection } = require('./config/database');

// ============================================
// SECURITY: Environment Variable Validation
// ============================================
const requiredEnvVars = ['JWT_SECRET'];
const criticalEnvVars = ['ENCRYPTION_KEY'];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ CRITICAL: Missing required env variable: ${varName}`);
        process.exit(1);
    }
});

criticalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.warn(`⚠️ WARNING: ${varName} not set. Using fallback key. SET THIS IN PRODUCTION!`);
    }
});

// ============================================
// SECURITY: Rate Limiting Configuration
// ============================================
// General API rate limiter - skip in development for easier testing
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Higher limit in dev
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development', // Skip rate limiting in development
});

// Strict limiter for authentication routes (brute force protection)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: {
        error: 'Too many login attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Limiter for password reset (prevent abuse)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        error: 'Too many password reset requests. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const noteRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');
const budgetRoutes = require('./routes/budgets');
const spaceRoutes = require('./routes/space');
const ideaProjectRoutes = require('./routes/ideaProjects');
const adminRoutes = require('./routes/admin');

// Social Stack Routes
const socialRoutes = require('./routes/social');
const blogRoutes = require('./routes/blog');
const aiRoutes = require('./routes/ai');
const systemSettingsRoutes = require('./routes/systemSettings');

// Finance Routes
const financeRoutes = require('./routes/finance');

// Assets Routes
const assetsRoutes = require('./routes/assets');

// Notification Routes
const notificationRoutes = require('./routes/notifications');
const schedulerService = require('./services/schedulerService');

// 2FA Routes
const twoFactorRoutes = require('./routes/twoFactor');

// AI Config Routes
const aiConfigRoutes = require('./routes/aiconfig');

// Collaboration Routes
const collaborationRoutes = require('./routes/collaboration');

// Google Sheets Routes
const googleSheetsRoutes = require('./routes/googleSheets');

// Feature Suggestions Routes
const suggestionsRoutes = require('./routes/suggestions');

// Blog System Routes (Public Blog)
const blogSystemRoutes = require('./routes/blogSystem');

// Pages Routes (Editable Static Pages)
const pagesRoutes = require('./routes/pages');

// Work Files Routes (File Manager)
const workFilesRoutes = require('./routes/workFiles');

// CRM Routes
const crmRoutes = require('./routes/crm');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY: Helmet - Security Headers
// ============================================
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
    crossOriginEmbedderPolicy: false,
}));

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// SECURITY: Apply Rate Limiters
// ============================================
// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Apply strict rate limiter to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/space', spaceRoutes);
app.use('/api/idea-projects', ideaProjectRoutes);
app.use('/api/admin', adminRoutes);

// Social Stack Routes
app.use('/api/social', socialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/system-settings', systemSettingsRoutes);

// Finance Routes
app.use('/api/finance', financeRoutes);

// Assets Routes
app.use('/api/assets', assetsRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// 2FA Routes
app.use('/api/2fa', twoFactorRoutes);

// AI Config Routes
app.use('/api/aiconfig', aiConfigRoutes);

// Collaboration Routes
app.use('/api/collaboration', collaborationRoutes);

// Google Sheets Routes
app.use('/api/google-sheets', googleSheetsRoutes);

// Feature Suggestions Routes
app.use('/api/suggestions', suggestionsRoutes);

// Blog System Routes (Public Blog)
app.use('/api/blog-system', blogSystemRoutes);

// Pages Routes (Editable Static Pages)
app.use('/api/pages', pagesRoutes);

// Work Files Routes (File Manager)
app.use('/api/work-files', workFilesRoutes);

// CRM Routes
app.use('/api/crm', crmRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (create tables if not exist)
        // Use { alter: false } for production, { force: true } to recreate all tables
        await sequelize.sync({ alter: false });
        console.log('✅ Database synced');

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Endpoints:`);
            console.log(`   POST   /api/auth/register`);
            console.log(`   POST   /api/auth/login`);
            console.log(`   GET    /api/auth/me`);
            console.log(`   GET    /api/projects`);
            console.log(`   GET    /api/notes`);
            console.log(`   GET    /api/tasks`);
            console.log(`   GET    /api/budgets`);
            console.log(`   GET    /api/admin/users (Admin only)`);
            console.log(`   --- Social Stack ---`);
            console.log(`   GET    /api/social/accounts`);
            console.log(`   GET    /api/social/posts`);
            console.log(`   GET    /api/blog/connections`);
            console.log(`   GET    /api/blog/posts`);
            console.log(`   POST   /api/ai/generate`);
            console.log(`   GET    /api/system-settings`);
            console.log(`   --- Notifications ---`);
            console.log(`   GET    /api/notifications`);
            console.log(`   GET    /api/notifications/preferences`);
            console.log(`\n`);

            // Initialize notification scheduler
            schedulerService.init();
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

