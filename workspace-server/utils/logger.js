/**
 * Simple logger utility for production-ready logging
 * In production, these could be connected to a logging service like Winston, Pino, etc.
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
    /**
     * Log informational messages
     */
    info: (message, meta = {}) => {
        if (isDevelopment) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
        }
        // In production, send to logging service
    },

    /**
     * Log warning messages
     */
    warn: (message, meta = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
        // In production, send to logging service
    },

    /**
     * Log error messages
     */
    error: (message, error = null, meta = {}) => {
        const errorInfo = error ? {
            message: error.message,
            stack: isDevelopment ? error.stack : undefined,
            ...meta
        } : meta;

        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorInfo);
        // In production, send to error tracking service (Sentry, etc.)
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (message, meta = {}) => {
        if (isDevelopment) {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
        }
    }
};

module.exports = logger;
