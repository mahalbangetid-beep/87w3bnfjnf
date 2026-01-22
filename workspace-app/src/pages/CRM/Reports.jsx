import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FiFileText, FiDownload, FiCalendar, FiFilter,
    FiPhone, FiMail, FiMessageSquare, FiCheckCircle, FiUsers,
    FiClock, FiArrowLeft
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { crmAPI } from '../../services/api';

const ReportsPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [filterType, setFilterType] = useState('all');
    const [activityData, setActivityData] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchReportData();
    }, [dateRange, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const stats = await crmAPI.getActivityStats(parseInt(dateRange));
            setActivityData(stats);

            // Fetch detailed activities for list
            const clients = await crmAPI.getClients();
            let allActivities = [];

            for (const client of clients.slice(0, 20)) { // Limit to 20 clients for performance
                try {
                    const clientData = await crmAPI.getClient(client.id);
                    if (clientData.activities) {
                        const mappedActivities = clientData.activities.map(a => ({
                            ...a,
                            clientName: client.name,
                            clientId: client.id
                        }));
                        allActivities = [...allActivities, ...mappedActivities];
                    }
                } catch { /* ignore */ }
            }

            // Sort by date, newest first
            allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Apply type filter
            if (filterType !== 'all') {
                allActivities = allActivities.filter(a => a.type === filterType);
            }

            // Apply date filter
            const cutoffDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000);
            allActivities = allActivities.filter(a => new Date(a.createdAt) >= cutoffDate);

            setActivities(allActivities);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Generate CSV
        const headers = ['Date', 'Client', 'Type', 'Title', 'Content'];
        const rows = activities.map(a => [
            new Date(a.createdAt).toLocaleDateString(),
            a.clientName,
            a.type,
            a.title || '',
            (a.content || '').replace(/"/g, '""')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const activityIcons = {
        note: FiMessageSquare,
        call: FiPhone,
        email: FiMail,
        meeting: FiUsers,
        task: FiCheckCircle
    };

    const activityColors = {
        note: '#8b5cf6',
        call: '#10b981',
        email: '#3b82f6',
        meeting: '#f59e0b',
        task: '#ef4444'
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return t('common.justNow', 'Just now');
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return d.toLocaleDateString();
    };

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/crm" style={{ color: '#9ca3af' }}>
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                            <FiFileText style={{ marginRight: 12, color: '#8b5cf6' }} />
                            {t('crm.activityReports', 'Activity Reports')}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#9ca3af' }}>
                            {t('crm.reportsSubtitle', 'Generate and export activity reports')}
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    disabled={activities.length === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: activities.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 12,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: activities.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: activities.length > 0 ? 1 : 0.5
                    }}
                >
                    <FiDownload />
                    {t('crm.exportReport', 'Export CSV')}
                </motion.button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 24,
                    padding: 20,
                    background: 'rgba(17, 17, 27, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)'
                }}
            >
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#9ca3af' }}>
                        <FiCalendar style={{ marginRight: 6 }} />
                        {t('crm.dateRange', 'Date Range')}
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            minWidth: 150
                        }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="14">Last 14 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="60">Last 60 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#9ca3af' }}>
                        <FiFilter style={{ marginRight: 6 }} />
                        {t('crm.activityType', 'Activity Type')}
                    </label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 13,
                            minWidth: 150
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="note">📝 Notes</option>
                        <option value="call">📞 Calls</option>
                        <option value="email">✉️ Emails</option>
                        <option value="meeting">🤝 Meetings</option>
                        <option value="task">✅ Tasks</option>
                    </select>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Total Activities</p>
                    <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>
                        {loading ? '-' : activities.length}
                    </p>
                </div>
            </motion.div>

            {/* Summary Cards */}
            {activityData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {activityData.byType?.map(item => {
                        const Icon = activityIcons[item.type] || FiMessageSquare;
                        const color = activityColors[item.type] || '#8b5cf6';
                        return (
                            <motion.div
                                key={item.type}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: 'rgba(17, 17, 27, 0.8)',
                                    borderRadius: 12,
                                    padding: 16,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 8px'
                                }}>
                                    <Icon style={{ color, width: 20, height: 20 }} />
                                </div>
                                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{item.count}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>
                                    {item.type}s
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Activity List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(17, 17, 27, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid rgba(255,255,255,0.08)'
                }}
            >
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                    <FiClock style={{ marginRight: 8 }} />
                    {t('crm.recentActivities', 'Recent Activities')}
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        <div style={{
                            width: 40, height: 40,
                            border: '3px solid #8b5cf6', borderTopColor: 'transparent',
                            borderRadius: '50%', margin: '0 auto 16px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p>{t('common.loading', 'Loading...')}</p>
                    </div>
                ) : activities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {activities.slice(0, 50).map((activity, i) => {
                            const Icon = activityIcons[activity.type] || FiMessageSquare;
                            const color = activityColors[activity.type] || '#8b5cf6';
                            return (
                                <div
                                    key={activity.id || i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 16,
                                        padding: 16,
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: 12,
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: `${color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon style={{ color, width: 18, height: 18 }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                                                    {activity.title || activity.type}
                                                </p>
                                                <Link
                                                    to={`/crm/clients/${activity.clientId}`}
                                                    style={{ fontSize: 12, color: '#8b5cf6', textDecoration: 'none' }}
                                                >
                                                    {activity.clientName}
                                                </Link>
                                            </div>
                                            <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                                {formatDate(activity.createdAt)}
                                            </span>
                                        </div>
                                        {activity.content && (
                                            <p style={{
                                                margin: '8px 0 0',
                                                fontSize: 13,
                                                color: '#9ca3af',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {activity.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                        <FiMessageSquare style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                        <p>{t('crm.noActivities', 'No activities found')}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ReportsPage;
