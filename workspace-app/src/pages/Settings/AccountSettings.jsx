/**
 * Account Settings - Password and Security settings
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineKey,
    HiOutlineShieldCheck,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlineDeviceMobile,
    HiOutlineLogout
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AccountSettings = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('workspace_token')}`
    });

    const handlePasswordChange = (e) => {
        setPasswordData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: t('settings.account.passwordMismatch', 'New passwords do not match') });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: t('settings.account.passwordTooShort', 'Password must be at least 8 characters') });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: t('settings.account.passwordChanged', 'Password changed successfully!') });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to change password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handle2FAToggle = async () => {
        // This would integrate with the existing 2FA routes
        setMessage({ type: 'info', text: t('settings.account.2faComingSoon', '2FA settings - Coming soon!') });
    };

    return (
        <SettingsLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Password Change Section */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: 'white',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineKey style={{ color: '#10b981' }} />
                            {t('settings.account.changePassword', 'Change Password')}
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                            {t('settings.account.changePasswordDesc', 'Update your password to keep your account secure.')}
                        </p>
                    </div>

                    {/* Message */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '24px',
                                    backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.2)' : message.type === 'info' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: message.type === 'success' ? '#34d399' : message.type === 'info' ? '#60a5fa' : '#f87171',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {message.type === 'success' ? <HiOutlineCheck /> : <HiOutlineExclamation />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                            {/* Current Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    {t('settings.account.currentPassword', 'Current Password')} *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 48px 12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showCurrentPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    {t('settings.account.newPassword', 'New Password')} *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={8}
                                        style={{
                                            width: '100%',
                                            padding: '12px 48px 12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showNewPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                    {t('settings.account.passwordHint', 'Minimum 8 characters')}
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    {t('settings.account.confirmPassword', 'Confirm New Password')} *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 48px 12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showConfirmPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-glow"
                                style={{
                                    padding: '12px 24px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                        <HiOutlineRefresh />
                                    </motion.div>
                                ) : (
                                    <HiOutlineCheck />
                                )}
                                {loading ? t('common.updating', 'Updating...') : t('settings.account.updatePassword', 'Update Password')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication Section */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <HiOutlineShieldCheck style={{ color: '#f59e0b' }} />
                                {t('settings.account.twoFactor', 'Two-Factor Authentication')}
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '500px' }}>
                                {t('settings.account.twoFactorDesc', 'Add an extra layer of security to your account by requiring a verification code when signing in.')}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handle2FAToggle}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: twoFactorEnabled ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                                backgroundColor: twoFactorEnabled ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                color: twoFactorEnabled ? '#ef4444' : '#10b981',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                            }}
                        >
                            {twoFactorEnabled
                                ? t('settings.account.disable2FA', 'Disable 2FA')
                                : t('settings.account.enable2FA', 'Enable 2FA')
                            }
                        </motion.button>
                    </div>

                    {twoFactorEnabled && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineDeviceMobile style={{ color: '#10b981', width: '24px', height: '24px' }} />
                            <div>
                                <p style={{ color: '#34d399', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                    {t('settings.account.2faActive', '2FA is active')}
                                </p>
                                <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                                    {t('settings.account.2faActiveDesc', 'Your account is protected with two-factor authentication.')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Sessions */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: 'white',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineLogout style={{ color: '#ef4444' }} />
                            {t('settings.account.sessions', 'Active Sessions')}
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                            {t('settings.account.sessionsDesc', 'Manage your active login sessions across devices.')}
                        </p>
                    </div>

                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'rgba(139,92,246,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <HiOutlineDeviceMobile style={{ color: '#a78bfa', width: '20px', height: '20px' }} />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                                    {t('settings.account.currentSession', 'Current Session')}
                                </p>
                                <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                                    {t('settings.account.thisDevice', 'This device')} • {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'rgba(16,185,129,0.2)',
                            color: '#34d399',
                            fontSize: '12px',
                        }}>
                            {t('common.active', 'Active')}
                        </span>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default AccountSettings;
