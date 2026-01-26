const jwt = require('jsonwebtoken');
const { User, Role, ActivityLog } = require('../models');

// Authenticate JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Check role permissions
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.Role) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const userRole = req.user.Role.name;

        // Super Admin has access to everything
        if (userRole === 'superadmin') {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action.' });
        }

        next();
    };
};

// Require admin middleware (superadmin or admin)
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.Role) {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const userRole = req.user.Role.name;

    if (userRole !== 'superadmin' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
    }

    next();
};

// Log activity middleware
const logActivity = (action, module) => {
    return async (req, res, next) => {
        // Store original send
        const originalSend = res.send;

        res.send = function (data) {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                ActivityLog.create({
                    action,
                    module,
                    description: `${req.user?.name || 'Unknown'} performed ${action} on ${module}`,
                    metadata: {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                        params: req.params
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    userId: req.user?.id
                }).catch(err => console.error('Activity log error:', err));
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

// Require blog role middleware (blog, admin, or superadmin)
const requireBlogRole = (req, res, next) => {
    if (!req.user || !req.user.Role) {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const userRole = req.user.Role.name;

    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'blog') {
        return res.status(403).json({ message: 'Blog writer access required.' });
    }

    next();
};

// Require verified phone for sensitive operations
const requireVerifiedPhone = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!req.user.phone) {
        return res.status(403).json({
            code: 'PHONE_REQUIRED',
            message: 'A phone number is required for this feature. Please add one in settings.',
            action: '/settings/profile'
        });
    }

    if (!req.user.phoneVerified) {
        return res.status(403).json({
            code: 'PHONE_NOT_VERIFIED',
            message: 'Please verify your phone number to access this feature.',
            action: '/settings/verify-phone'
        });
    }

    next();
};

module.exports = {
    authenticate,
    authenticateToken: authenticate, // Alias for compatibility
    authorize,
    requireAdmin,
    requireBlogRole,
    requireVerifiedPhone,
    logActivity
};

