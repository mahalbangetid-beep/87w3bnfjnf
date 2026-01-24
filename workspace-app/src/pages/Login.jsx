import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login, loginWithGoogle, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleClientId, setGoogleClientId] = useState('');
    const [googleEnabled, setGoogleEnabled] = useState(false);

    // Fetch Google OAuth Client ID from system settings
    useEffect(() => {
        const fetchGoogleAuth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/system-settings/public/google-auth`);
                if (response.ok) {
                    const data = await response.json();
                    setGoogleClientId(data.clientId || '');
                    setGoogleEnabled(data.enabled || false);
                }
            } catch (err) {
                console.error('Failed to fetch Google auth settings:', err);
            }
        };
        fetchGoogleAuth();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || t('auth.login.loginError', 'Login failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        if (!googleEnabled || !googleClientId) {
            setError('Google Sign-In is not configured. Please contact admin.');
            return;
        }

        // Initialize Google Sign-In
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response) => {
                    try {
                        setLoading(true);
                        await loginWithGoogle(response.credential);
                        navigate('/');
                    } catch (err) {
                        setError(err.message || 'Google login failed');
                    } finally {
                        setLoading(false);
                    }
                },
            });
            window.google.accounts.id.prompt();
        } else {
            setError('Google Sign-In not available. Please refresh the page.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
            position: 'relative',
        }}>
            {/* Language Switcher - Top Right */}
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <LanguageSwitcher variant="dropdown" showLabel={true} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '32px',
                        }}
                    >
                        ⚡
                    </motion.div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                        {t('auth.login.title', 'Welcome Back')}
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>
                        {t('auth.login.subtitle', 'Sign in to continue to Workspace')}
                    </p>
                </div>

                {/* Login Card */}
                <div
                    className="glass-card"
                    style={{ padding: '32px' }}
                >
                    {/* Error Message */}
                    {(error || authError) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                marginBottom: '20px',
                            }}
                        >
                            <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error || authError}</p>
                        </motion.div>
                    )}

                    {/* Google Login */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '24px',
                        }}
                    >
                        <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>or continue with email</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('auth.login.email', 'Email Address')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineMail style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7280',
                                    width: '18px',
                                    height: '18px',
                                }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 44px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#9ca3af' }}>
                                    {t('auth.login.password', 'Password')}
                                </label>
                                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none' }}>
                                    {t('auth.login.forgotPassword', 'Forgot password?')}
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineLockClosed style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7280',
                                    width: '18px',
                                    height: '18px',
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 44px 14px 44px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    {showPassword ? <HiOutlineEyeOff style={{ width: '18px', height: '18px' }} /> : <HiOutlineEye style={{ width: '18px', height: '18px' }} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-glow"
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '15px',
                                fontWeight: '600',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? t('common.loading', 'Signing in...') : t('auth.login.loginButton', 'Sign In')}
                        </motion.button>
                    </form>

                    {/* Register Link */}
                    <p style={{ textAlign: 'center', marginTop: '24px', color: '#9ca3af', fontSize: '14px' }}>
                        {t('auth.login.noAccount', "Don't have an account?")}{' '}
                        <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>
                            {t('auth.login.registerLink', 'Create one')}
                        </Link>
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default Login;

