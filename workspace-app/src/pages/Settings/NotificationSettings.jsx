/**
 * Notification Settings - Manage notification preferences
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineBell,
    HiOutlineMail,
    HiOutlineDeviceMobile,
    HiOutlineDesktopComputer,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineFolder,
    HiOutlineShare
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [preferences, setPreferences] = useState({
        // Channels
        emailNotifications: true,
        pushNotifications: true,
        browserNotifications: true,
        // Categories
        projectUpdates: true,
        taskReminders: true,
        calendarEvents: true,
        financeAlerts: true,
        socialNotifications: true,
        billReminders: true,
        weeklyDigest: false,
    });

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('workspace_token')}`
    });

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/notifications/preferences`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setPreferences(prev => ({ ...prev, ...data }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`${API_BASE}/notifications/preferences`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: t('settings.notifications.saved', 'Preferences saved successfully!') });
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.message || 'Failed to save preferences' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setSaving(false);
        }
    };

    const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
        }}>
            <div>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#9ca3af', fontSize: '12px' }}>{description}</p>
            </div>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    background: enabled ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.3s',
                }}
            >
                <motion.div
                    animate={{ x: enabled ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                />
            </motion.button>
        </div>
    );

    if (loading) {
        return (
            <SettingsLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#9ca3af' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <HiOutlineBell style={{ width: '32px', height: '32px' }} />
                    </motion.div>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <HiOutlineBell style={{ color: '#f59e0b' }} />
                        {t('settings.notifications.title', 'Notification Settings')}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                        {t('settings.notifications.subtitle', 'Choose how and when you want to be notified.')}
                    </p>

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
                                    marginTop: '16px',
                                    backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: message.type === 'success' ? '#34d399' : '#f87171',
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
                </div>

                {/* Notification Channels */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <HiOutlineDesktopComputer style={{ color: '#8b5cf6' }} />
                        {t('settings.notifications.channels', 'Notification Channels')}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <ToggleSwitch
                            enabled={preferences.emailNotifications}
                            onToggle={() => handleToggle('emailNotifications')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineMail style={{ color: '#8b5cf6' }} /> {t('settings.notifications.email', 'Email Notifications')}</span>}
                            description={t('settings.notifications.emailDesc', 'Receive notifications via email')}
                        />
                        <ToggleSwitch
                            enabled={preferences.pushNotifications}
                            onToggle={() => handleToggle('pushNotifications')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineDeviceMobile style={{ color: '#10b981' }} /> {t('settings.notifications.push', 'Push Notifications')}</span>}
                            description={t('settings.notifications.pushDesc', 'Receive push notifications on your device')}
                        />
                        <ToggleSwitch
                            enabled={preferences.browserNotifications}
                            onToggle={() => handleToggle('browserNotifications')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineDesktopComputer style={{ color: '#06b6d4' }} /> {t('settings.notifications.browser', 'Browser Notifications')}</span>}
                            description={t('settings.notifications.browserDesc', 'Show notifications in your browser')}
                        />
                    </div>
                </div>

                {/* Notification Categories */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <HiOutlineBell style={{ color: '#f59e0b' }} />
                        {t('settings.notifications.categories', 'Notification Categories')}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <ToggleSwitch
                            enabled={preferences.projectUpdates}
                            onToggle={() => handleToggle('projectUpdates')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineFolder style={{ color: '#8b5cf6' }} /> {t('settings.notifications.projects', 'Project Updates')}</span>}
                            description={t('settings.notifications.projectsDesc', 'New tasks, comments, and project changes')}
                        />
                        <ToggleSwitch
                            enabled={preferences.taskReminders}
                            onToggle={() => handleToggle('taskReminders')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineCheck style={{ color: '#10b981' }} /> {t('settings.notifications.tasks', 'Task Reminders')}</span>}
                            description={t('settings.notifications.tasksDesc', 'Reminders for upcoming and overdue tasks')}
                        />
                        <ToggleSwitch
                            enabled={preferences.calendarEvents}
                            onToggle={() => handleToggle('calendarEvents')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineCalendar style={{ color: '#06b6d4' }} /> {t('settings.notifications.calendar', 'Calendar Events')}</span>}
                            description={t('settings.notifications.calendarDesc', 'Upcoming meetings and events')}
                        />
                        <ToggleSwitch
                            enabled={preferences.financeAlerts}
                            onToggle={() => handleToggle('financeAlerts')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineCurrencyDollar style={{ color: '#f59e0b' }} /> {t('settings.notifications.finance', 'Finance Alerts')}</span>}
                            description={t('settings.notifications.financeDesc', 'Budget limits, bill reminders, transactions')}
                        />
                        <ToggleSwitch
                            enabled={preferences.socialNotifications}
                            onToggle={() => handleToggle('socialNotifications')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineShare style={{ color: '#ec4899' }} /> {t('settings.notifications.social', 'Social Media')}</span>}
                            description={t('settings.notifications.socialDesc', 'Post status, scheduled posts, engagement')}
                        />
                        <ToggleSwitch
                            enabled={preferences.weeklyDigest}
                            onToggle={() => handleToggle('weeklyDigest')}
                            label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineMail style={{ color: '#6366f1' }} /> {t('settings.notifications.digest', 'Weekly Digest')}</span>}
                            description={t('settings.notifications.digestDesc', 'Weekly summary of your activity')}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-glow"
                        style={{
                            padding: '12px 32px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {saving ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                <HiOutlineRefresh />
                            </motion.div>
                        ) : (
                            <HiOutlineCheck />
                        )}
                        {saving ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                    </button>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default NotificationSettings;
