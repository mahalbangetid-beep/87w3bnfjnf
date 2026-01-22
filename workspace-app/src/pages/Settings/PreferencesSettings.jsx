/**
 * Preferences Settings - Language, Theme, and other preferences
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineColorSwatch,
    HiOutlineGlobe,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineDesktopComputer,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlineClock
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';

const PreferencesSettings = () => {
    const { t, i18n } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [preferences, setPreferences] = useState({
        language: i18n.language || 'en',
        theme: localStorage.getItem('theme') || 'dark',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        startOfWeek: 'monday',
    });

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    ];

    const themes = [
        { id: 'dark', name: 'Dark', icon: HiOutlineMoon },
        { id: 'light', name: 'Light', icon: HiOutlineSun },
        { id: 'system', name: 'System', icon: HiOutlineDesktopComputer },
    ];

    const dateFormats = [
        { id: 'DD/MM/YYYY', name: '31/12/2024' },
        { id: 'MM/DD/YYYY', name: '12/31/2024' },
        { id: 'YYYY-MM-DD', name: '2024-12-31' },
    ];

    const timeFormats = [
        { id: '24h', name: '24-hour (14:30)' },
        { id: '12h', name: '12-hour (2:30 PM)' },
    ];

    const weekStarts = [
        { id: 'monday', name: 'Monday' },
        { id: 'sunday', name: 'Sunday' },
    ];

    const handleLanguageChange = (langCode) => {
        setPreferences(prev => ({ ...prev, language: langCode }));
        i18n.changeLanguage(langCode);
        localStorage.setItem('language', langCode);
    };

    const handleThemeChange = (themeId) => {
        setPreferences(prev => ({ ...prev, theme: themeId }));
        localStorage.setItem('theme', themeId);

        // Apply theme
        if (themeId === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else if (themeId === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
            document.documentElement.classList.toggle('light', !prefersDark);
        }
    };

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Save preferences to localStorage
            localStorage.setItem('preferences', JSON.stringify(preferences));

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setMessage({ type: 'success', text: t('settings.preferences.saved', 'Preferences saved successfully!') });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setSaving(false);
        }
    };

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
                        <HiOutlineColorSwatch style={{ color: '#ec4899' }} />
                        {t('settings.preferences.title', 'Preferences')}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                        {t('settings.preferences.subtitle', 'Customize your experience and display settings.')}
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

                {/* Language */}
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
                        <HiOutlineGlobe style={{ color: '#06b6d4' }} />
                        {t('settings.preferences.language', 'Language')}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                        {languages.map((lang) => (
                            <motion.button
                                key={lang.code}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: preferences.language === lang.code
                                        ? '2px solid #8b5cf6'
                                        : '2px solid rgba(255,255,255,0.1)',
                                    background: preferences.language === lang.code
                                        ? 'rgba(139,92,246,0.15)'
                                        : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                                <span style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>{lang.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
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
                        <HiOutlineMoon style={{ color: '#8b5cf6' }} />
                        {t('settings.preferences.theme', 'Theme')}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {themes.map((theme) => (
                            <motion.button
                                key={theme.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleThemeChange(theme.id)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: preferences.theme === theme.id
                                        ? '2px solid #8b5cf6'
                                        : '2px solid rgba(255,255,255,0.1)',
                                    background: preferences.theme === theme.id
                                        ? 'rgba(139,92,246,0.15)'
                                        : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                }}
                            >
                                <theme.icon style={{
                                    width: '32px',
                                    height: '32px',
                                    color: preferences.theme === theme.id ? '#a78bfa' : '#9ca3af',
                                    marginBottom: '8px',
                                }} />
                                <p style={{ color: 'white', fontWeight: '500', fontSize: '14px', margin: 0 }}>{theme.name}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
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
                        <HiOutlineClock style={{ color: '#f59e0b' }} />
                        {t('settings.preferences.dateTime', 'Date & Time')}
                    </h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Timezone */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.preferences.timezone', 'Timezone')}
                            </label>
                            <input
                                type="text"
                                value={preferences.timezone}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    cursor: 'not-allowed',
                                }}
                            />
                            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                {t('settings.preferences.timezoneHint', 'Detected from your browser')}
                            </p>
                        </div>

                        {/* Date Format */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.preferences.dateFormat', 'Date Format')}
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {dateFormats.map((format) => (
                                    <motion.button
                                        key={format.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('dateFormat', format.id)}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: preferences.dateFormat === format.id
                                                ? '2px solid #8b5cf6'
                                                : '2px solid rgba(255,255,255,0.1)',
                                            background: preferences.dateFormat === format.id
                                                ? 'rgba(139,92,246,0.15)'
                                                : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {format.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Time Format */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.preferences.timeFormat', 'Time Format')}
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {timeFormats.map((format) => (
                                    <motion.button
                                        key={format.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('timeFormat', format.id)}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: preferences.timeFormat === format.id
                                                ? '2px solid #8b5cf6'
                                                : '2px solid rgba(255,255,255,0.1)',
                                            background: preferences.timeFormat === format.id
                                                ? 'rgba(139,92,246,0.15)'
                                                : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {format.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Week Starts On */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.preferences.weekStart', 'Week Starts On')}
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {weekStarts.map((day) => (
                                    <motion.button
                                        key={day.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleChange('startOfWeek', day.id)}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: preferences.startOfWeek === day.id
                                                ? '2px solid #8b5cf6'
                                                : '2px solid rgba(255,255,255,0.1)',
                                            background: preferences.startOfWeek === day.id
                                                ? 'rgba(139,92,246,0.15)'
                                                : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {day.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
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

export default PreferencesSettings;
