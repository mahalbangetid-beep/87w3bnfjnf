import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('workspace_token');
            if (token) {
                try {
                    const userData = await authAPI.getMe();
                    setUser(userData);
                } catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('workspace_token');
                    localStorage.removeItem('workspace_user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login with email/password
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ email, password });
            localStorage.setItem('workspace_token', response.token);
            localStorage.setItem('workspace_user', JSON.stringify(response.user));
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Login with Google
    const loginWithGoogle = async (googleToken) => {
        try {
            setError(null);
            const response = await authAPI.loginWithGoogle(googleToken);
            localStorage.setItem('workspace_token', response.token);
            localStorage.setItem('workspace_user', JSON.stringify(response.user));
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Register
    const register = async (name, email, phone, password) => {
        try {
            setError(null);
            const response = await authAPI.register({ name, email, phone, password });
            localStorage.setItem('workspace_token', response.token);
            localStorage.setItem('workspace_user', JSON.stringify(response.user));
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('workspace_token');
        localStorage.removeItem('workspace_user');
        setUser(null);
    };

    // Update profile
    const updateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data);
            setUser(response.user);
            localStorage.setItem('workspace_user', JSON.stringify(response.user));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Check permissions
    const hasPermission = (module, action) => {
        if (!user?.Role?.permissions) return false;
        const modulePermissions = user.Role.permissions[module];
        return modulePermissions?.includes(action) || false;
    };

    // Check if user is admin
    const isAdmin = () => user?.Role?.name === 'master_admin';
    const isMonitoring = () => ['master_admin', 'monitoring'].includes(user?.Role?.name);

    const value = {
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        hasPermission,
        isAdmin,
        isMonitoring,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
