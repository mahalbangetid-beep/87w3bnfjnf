/**
 * Safe localStorage utility functions
 * Handles exceptions in private browsing mode and quota exceeded scenarios
 */

export const safeGetItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (e) {
        console.warn(`localStorage.getItem failed for "${key}":`, e.message);
        return defaultValue;
    }
};

export const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn(`localStorage.setItem failed for "${key}":`, e.message);
        return false;
    }
};

export const safeRemoveItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.warn(`localStorage.removeItem failed for "${key}":`, e.message);
        return false;
    }
};

export default { safeGetItem, safeSetItem, safeRemoveItem };
