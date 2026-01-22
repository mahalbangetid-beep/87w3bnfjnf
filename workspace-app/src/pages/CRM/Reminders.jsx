import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    FiBell, FiCheck, FiClock, FiCalendar, FiTrash2,
    FiAlertCircle, FiUser, FiSkipForward
} from 'react-icons/fi';
import { crmAPI } from '../../services/api';

const RemindersPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const [filter, setFilter] = useState('pending'); // pending, completed, all

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchReminders();
    }, [filter]);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const data = await crmAPI.getReminders(filter);
            setReminders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            setReminders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (reminderId) => {
        try {
            await crmAPI.completeReminder(reminderId);
            await fetchReminders();
        } catch (error) {
            console.error('Error completing reminder:', error);
        }
    };

    const handleSnooze = async (reminderId, hours = 1) => {
        try {
            const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
            await crmAPI.snoozeReminder(reminderId, snoozedUntil);
            await fetchReminders();
        } catch (error) {
            console.error('Error snoozing reminder:', error);
        }
    };

    const handleDelete = async (reminderId) => {
        if (!window.confirm(t('crm.confirmDeleteReminder', 'Delete this reminder?'))) return;

        try {
            await crmAPI.deleteReminder(reminderId);
            await fetchReminders();
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTimeFromNow = (date) => {
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
        const days = Math.floor(hours / 24);

        if (diff < 0) {
            return days > 0 ? `${days}d ago` : `${hours}h ago`;
        }
        return days > 0 ? `in ${days}d` : `in ${hours}h`;
    };

    const overdueReminders = reminders.filter(r => new Date(r.remindAt) < new Date() && !r.isCompleted);
    const upcomingReminders = reminders.filter(r => new Date(r.remindAt) >= new Date() && !r.isCompleted);
    const completedReminders = reminders.filter(r => r.isCompleted);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48, height: 48,
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        <FiBell style={{ marginRight: 12, color: '#8b5cf6' }} />
                        {t('crm.reminders', 'Reminders')}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                        {t('crm.manageReminders', 'Manage your follow-up reminders')}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
                    {['pending', 'completed', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                background: filter === f ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                                border: 'none',
                                borderRadius: 8,
                                color: filter === f ? '#a78bfa' : '#6b7280',
                                cursor: 'pointer',
                                fontSize: 13,
                                textTransform: 'capitalize'
                            }}
                        >
                            {t(`crm.${f}`, f)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                    borderRadius: 16, padding: 24,
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    <FiAlertCircle style={{ color: '#ef4444', marginBottom: 12 }} size={24} />
                    <h3 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#ef4444' }}>{overdueReminders.length}</h3>
                    <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 13 }}>{t('crm.overdue', 'Overdue')}</p>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                    borderRadius: 16, padding: 24,
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <FiClock style={{ color: '#8b5cf6', marginBottom: 12 }} size={24} />
                    <h3 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#8b5cf6' }}>{upcomingReminders.length}</h3>
                    <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 13 }}>{t('crm.upcoming', 'Upcoming')}</p>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    borderRadius: 16, padding: 24,
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <FiCheck style={{ color: '#10b981', marginBottom: 12 }} size={24} />
                    <h3 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#10b981' }}>{completedReminders.length}</h3>
                    <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 13 }}>{t('crm.completed', 'Completed')}</p>
                </div>
            </motion.div>

            {/* Overdue Section */}
            {overdueReminders.length > 0 && filter !== 'completed' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: 30 }}
                >
                    <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiAlertCircle /> {t('crm.overdueReminders', 'Overdue Reminders')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {overdueReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                isOverdue={true}
                                t={t}
                                formatDateTime={formatDateTime}
                                getTimeFromNow={getTimeFromNow}
                                onComplete={handleComplete}
                                onSnooze={handleSnooze}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Upcoming Section */}
            {upcomingReminders.length > 0 && filter !== 'completed' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: 30 }}
                >
                    <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiClock /> {t('crm.upcomingReminders', 'Upcoming Reminders')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {upcomingReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                isOverdue={false}
                                t={t}
                                formatDateTime={formatDateTime}
                                getTimeFromNow={getTimeFromNow}
                                onComplete={handleComplete}
                                onSnooze={handleSnooze}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Completed Section */}
            {completedReminders.length > 0 && (filter === 'completed' || filter === 'all') && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiCheck /> {t('crm.completedReminders', 'Completed Reminders')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {completedReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                isCompleted={true}
                                t={t}
                                formatDateTime={formatDateTime}
                                getTimeFromNow={getTimeFromNow}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {reminders.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center', padding: 60,
                        background: 'rgba(17, 17, 27, 0.6)',
                        borderRadius: 16
                    }}
                >
                    <FiBell style={{ width: 64, height: 64, color: '#6b7280', marginBottom: 20, opacity: 0.5 }} />
                    <h3 style={{ margin: 0, color: '#9ca3af', fontWeight: 500 }}>
                        {t('crm.noReminders', 'No reminders found')}
                    </h3>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14 }}>
                        {t('crm.createReminderHint', 'Create reminders from client detail pages')}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

// Reminder Card Component
const ReminderCard = ({ reminder, isOverdue, isCompleted, t, formatDateTime, getTimeFromNow, onComplete, onSnooze, onDelete }) => {
    const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                padding: 20, borderRadius: 12,
                background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)',
                border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: isCompleted ? '#6b7280' : '#fff', fontSize: 16, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {reminder.title}
                        </span>
                        {isOverdue && (
                            <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: 10 }}>
                                {getTimeFromNow(reminder.remindAt)}
                            </span>
                        )}
                    </div>
                    {reminder.description && (
                        <p style={{ margin: '0 0 8px', color: '#9ca3af', fontSize: 14 }}>{reminder.description}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isOverdue ? '#ef4444' : '#6b7280' }}>
                            <FiCalendar size={12} /> {formatDateTime(reminder.remindAt)}
                        </span>
                        {reminder.Client && (
                            <Link to={`/crm/clients/${reminder.Client.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8b5cf6', textDecoration: 'none' }}>
                                <FiUser size={12} /> {reminder.Client.name}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!isCompleted && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onComplete(reminder.id)}
                            style={{
                                padding: '8px 16px', borderRadius: 8,
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: 'none', color: '#10b981',
                                cursor: 'pointer', fontSize: 13,
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >
                            <FiCheck /> {t('common.done', 'Done')}
                        </motion.button>

                        <div style={{ position: 'relative' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                                style={{
                                    padding: '8px 12px', borderRadius: 8,
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: 'none', color: '#a78bfa',
                                    cursor: 'pointer', fontSize: 13
                                }}
                            >
                                <FiSkipForward />
                            </motion.button>

                            <AnimatePresence>
                                {showSnoozeMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{
                                            position: 'absolute', top: 40, right: 0,
                                            background: '#1a1a2e', borderRadius: 8,
                                            padding: 8, minWidth: 120, zIndex: 10,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {[1, 3, 24].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => { onSnooze(reminder.id, h); setShowSnoozeMenu(false); }}
                                                style={{
                                                    display: 'block', width: '100%',
                                                    padding: '8px 12px', background: 'transparent',
                                                    border: 'none', color: '#d1d5db',
                                                    textAlign: 'left', cursor: 'pointer',
                                                    borderRadius: 4, fontSize: 13
                                                }}
                                            >
                                                {h === 1 ? '1 hour' : h === 3 ? '3 hours' : '1 day'}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => onDelete(reminder.id)}
                            style={{
                                padding: '8px 12px', borderRadius: 8,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none', color: '#ef4444',
                                cursor: 'pointer', fontSize: 13
                            }}
                        >
                            <FiTrash2 />
                        </motion.button>
                    </div>
                )}

                {isCompleted && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onDelete(reminder.id)}
                        style={{
                            padding: '8px 12px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none', color: '#6b7280',
                            cursor: 'pointer', fontSize: 13
                        }}
                    >
                        <FiTrash2 />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default RemindersPage;
