/**
 * Notification Center Component
 * Dropdown component showing user notifications with real-time updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCog,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineShare,
    HiOutlineExclamationCircle,
    HiOutlineSparkles
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';

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

const priorityStyles = {
    low: { border: 'transparent' },
    normal: { border: 'transparent' },
    high: { border: '#f59e0b' },
    urgent: { border: '#ef4444', glow: true }
};

const NotificationCenter = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notificationsAPI.getAll({ limit: 20 });
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark notification as read
    const markAsRead = async (notification) => {
        if (notification.isRead) return;

        try {
            await notificationsAPI.markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationsAPI.delete(id);
            const deleted = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (!deleted?.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        markAsRead(notification);
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        }
    };

    // Format time ago
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

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: isOpen ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                    color: isOpen ? '#a78bfa' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                <HiOutlineBell style={{ width: '20px', height: '20px' }} />

                {/* Unread Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 6px',
                                boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                            }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            width: '380px',
                            maxHeight: '500px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(17,17,27,0.98)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            zIndex: 1000,
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '600' }}>
                                    Notifikasi
                                </h3>
                                <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '12px' }}>
                                    {unreadCount} belum dibaca
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {unreadCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={markAllAsRead}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'rgba(139,92,246,0.1)',
                                            color: '#a78bfa',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <HiOutlineCheckCircle style={{ width: '14px', height: '14px' }} />
                                        Baca Semua
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(139,92,246,0.3) transparent'
                        }}>
                            {loading && notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                    Memuat...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <HiOutlineBell style={{ width: '48px', height: '48px', color: '#374151', margin: '0 auto 12px' }} />
                                    <p style={{ color: '#6b7280', margin: 0 }}>Belum ada notifikasi</p>
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const Icon = typeIcons[notification.type] || HiOutlineBell;
                                    const color = typeColors[notification.type] || '#8b5cf6';
                                    const priority = priorityStyles[notification.priority];

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                                            onClick={() => handleNotificationClick(notification)}
                                            style={{
                                                padding: '14px 20px',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                cursor: notification.actionUrl ? 'pointer' : 'default',
                                                background: !notification.isRead ? 'rgba(139,92,246,0.05)' : 'transparent',
                                                borderLeft: priority.glow ? `3px solid ${priority.border}` : 'none',
                                                display: 'flex',
                                                gap: '12px',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Icon */}
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: `${color}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Icon style={{ width: '20px', height: '20px', color }} />
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: '8px'
                                                }}>
                                                    <h4 style={{
                                                        margin: 0,
                                                        fontSize: '13px',
                                                        fontWeight: notification.isRead ? '500' : '600',
                                                        color: notification.isRead ? '#9ca3af' : 'white',
                                                        lineHeight: 1.3
                                                    }}>
                                                        {notification.title}
                                                    </h4>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        onClick={(e) => deleteNotification(notification.id, e)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: '4px',
                                                            cursor: 'pointer',
                                                            color: '#6b7280',
                                                            opacity: 0.5,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <HiOutlineX style={{ width: '14px', height: '14px' }} />
                                                    </motion.button>
                                                </div>
                                                <p style={{
                                                    margin: '4px 0 0',
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    lineHeight: 1.4,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {notification.message}
                                                </p>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: '#4b5563',
                                                    marginTop: '6px',
                                                    display: 'block'
                                                }}>
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>

                                            {/* Unread dot */}
                                            {!notification.isRead && (
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: '#8b5cf6'
                                                }} />
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div style={{
                                padding: '12px 20px',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                textAlign: 'center'
                            }}>
                                <motion.button
                                    whileHover={{ color: '#a78bfa' }}
                                    onClick={() => {
                                        navigate('/notifications');
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6b7280',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Lihat Semua Notifikasi
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
