/**
 * Notifications Page
 * Full page to view all notifications and manage preferences
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineTrash,
    HiOutlineCog,
    HiOutlineRefresh,
    HiOutlineFilter,
    HiOutlineDeviceMobile,
    HiOutlineMail,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineShare,
    HiOutlineExclamationCircle,
    HiOutlineSparkles
} from 'react-icons/hi';
import { notificationsAPI } from '../../services/api';
import usePushNotifications from '../../hooks/usePushNotifications';

const typeIcons = {
    bill_reminder: HiOutlineCurrencyDollar,
    post_published: HiOutlineShare,
    post_scheduled: HiOutlineCalendar,
    post_failed: HiOutlineExclamationCircle,
    project_deadline: HiOutlineCalendar,
    budget_alert: HiOutlineExclamationCircle,
    goal_progress: HiOutlineSparkles,
    system: HiOutlineCog,
    custom: HiOutlineBell
};

const typeColors = {
    bill_reminder: '#10b981',
    post_published: '#ec4899',
    post_scheduled: '#8b5cf6',
    post_failed: '#ef4444',
    project_deadline: '#f59e0b',
    budget_alert: '#ef4444',
    goal_progress: '#06b6d4',
    system: '#6366f1',
    custom: '#8b5cf6'
};

const NotificationsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);

    const {
        isSupported,
        isSubscribed,
        isLoading: pushLoading,
        permission,
        subscribe,
        unsubscribe
    } = usePushNotifications();

    // Fetch data
    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
        fetchSubscriptions();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsAPI.getAll({ limit: 50 });
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            const prefs = await notificationsAPI.getPreferences();
            setPreferences(prefs);
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const subs = await notificationsAPI.getSubscriptions();
            setSubscriptions(subs);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationsAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updatePreference = async (key, value) => {
        try {
            const newPrefs = { ...preferences, [key]: value };
            setPreferences(newPrefs);
            await notificationsAPI.updatePreferences({ [key]: value });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlePushToggle = async () => {
        try {
            if (isSubscribed) {
                await unsubscribe();
            } else {
                await subscribe('Web Browser');
            }
            fetchSubscriptions();
        } catch (error) {
            console.error('Error toggling push:', error);
        }
    };

    const sendTestNotification = async () => {
        try {
            await notificationsAPI.sendTest();
            fetchNotifications();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} hari lalu`;
        if (hours > 0) return `${hours} jam lalu`;
        if (minutes > 0) return `${minutes} menit lalu`;
        return 'Baru saja';
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !n.isRead;
        return n.type === activeTab;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const tabs = [
        { id: 'all', label: 'Semua' },
        { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
        { id: 'bill_reminder', label: 'Tagihan' },
        { id: 'project_deadline', label: 'Deadline' },
        { id: 'system', label: 'Sistem' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        🔔 Notifikasi
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px' }}>
                        Kelola notifikasi dan preferensi Anda
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={sendTestNotification}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(139,92,246,0.3)',
                            background: 'rgba(139,92,246,0.1)',
                            color: '#a78bfa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <HiOutlineBell style={{ width: '18px', height: '18px' }} />
                        Test Notifikasi
                    </motion.button>
                    {unreadCount > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={markAllAsRead}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <HiOutlineCheckCircle style={{ width: '18px', height: '18px' }} />
                            Baca Semua
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Push Notification Banner */}
            {isSupported && !isSubscribed && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                        border: '1px solid rgba(139,92,246,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HiOutlineDeviceMobile style={{ width: '24px', height: '24px', color: '#a78bfa' }} />
                        <div>
                            <p style={{ margin: 0, color: 'white', fontWeight: '500' }}>
                                Aktifkan Push Notifications
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>
                                Dapatkan notifikasi langsung di browser Anda
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePushToggle}
                        disabled={pushLoading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {pushLoading ? 'Mengaktifkan...' : 'Aktifkan'}
                    </motion.button>
                </motion.div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                                : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id ? 'white' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Notifications List */}
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                        Memuat notifikasi...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <HiOutlineBell style={{ width: '48px', height: '48px', color: '#374151', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6b7280', margin: 0 }}>Tidak ada notifikasi</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => {
                        const Icon = typeIcons[notification.type] || HiOutlineBell;
                        const color = typeColors[notification.type] || '#8b5cf6';

                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: index < filteredNotifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    background: !notification.isRead ? 'rgba(139,92,246,0.03)' : 'transparent',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start'
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: `${color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Icon style={{ width: '22px', height: '22px', color }} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: notification.isRead ? '#9ca3af' : 'white'
                                    }}>
                                        {notification.title}
                                    </h4>
                                    <p style={{
                                        margin: '6px 0 0',
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        lineHeight: 1.5
                                    }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px', display: 'block' }}>
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!notification.isRead && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => markAsRead(notification.id)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'rgba(16,185,129,0.1)',
                                                color: '#10b981',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <HiOutlineCheck style={{ width: '16px', height: '16px' }} />
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => deleteNotification(notification.id)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'rgba(239,68,68,0.1)',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Preferences Section */}
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px'
            }}>
                <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiOutlineCog style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                    Pengaturan Notifikasi
                </h3>

                {preferences && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Master Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ margin: 0, color: 'white' }}>Aktifkan Notifikasi</p>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Kontrol utama untuk semua notifikasi</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updatePreference('enableNotifications', !preferences.enableNotifications)}
                                style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: preferences.enableNotifications ? '#8b5cf6' : '#374151',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: 0
                                }}
                            >
                                <motion.div
                                    animate={{ x: preferences.enableNotifications ? 20 : 2 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '2px'
                                    }}
                                />
                            </motion.button>
                        </div>

                        {/* Bill Reminders */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ margin: 0, color: 'white' }}>Pengingat Tagihan</p>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Notifikasi sebelum tagihan jatuh tempo</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updatePreference('billReminders', !preferences.billReminders)}
                                style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: preferences.billReminders ? '#10b981' : '#374151',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: 0
                                }}
                            >
                                <motion.div
                                    animate={{ x: preferences.billReminders ? 20 : 2 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '2px'
                                    }}
                                />
                            </motion.button>
                        </div>

                        {/* Project Deadlines */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ margin: 0, color: 'white' }}>Deadline Proyek</p>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Pengingat deadline proyek mendekati</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updatePreference('projectDeadlines', !preferences.projectDeadlines)}
                                style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: preferences.projectDeadlines ? '#f59e0b' : '#374151',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: 0
                                }}
                            >
                                <motion.div
                                    animate={{ x: preferences.projectDeadlines ? 20 : 2 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '2px'
                                    }}
                                />
                            </motion.button>
                        </div>

                        {/* Email Notifications */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                            <div>
                                <p style={{ margin: 0, color: 'white' }}>Notifikasi Email</p>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>Kirim notifikasi juga ke email</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updatePreference('enableEmail', !preferences.enableEmail)}
                                style={{
                                    width: '48px',
                                    height: '28px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: preferences.enableEmail ? '#6366f1' : '#374151',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: 0
                                }}
                            >
                                <motion.div
                                    animate={{ x: preferences.enableEmail ? 20 : 2 }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: '2px'
                                    }}
                                />
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
