import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FiTrendingUp, FiUsers, FiTarget, FiActivity,
    FiCheckCircle, FiXCircle, FiBarChart2, FiPieChart, FiArrowLeft
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { crmAPI } from '../../services/api';

const AnalyticsPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [conversionData, setConversionData] = useState(null);
    const [trendsData, setTrendsData] = useState([]);
    const [activityStats, setActivityStats] = useState(null);
    const [trendPeriod, setTrendPeriod] = useState('week');

    useEffect(() => {
        fetchData();
    }, [trendPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        try {
            setLoading(true);
            const [conversion, trends, activity] = await Promise.all([
                crmAPI.getConversionRates().catch(() => null),
                crmAPI.getTrends(trendPeriod).catch(() => []),
                crmAPI.getActivityStats(30).catch(() => null)
            ]);
            setConversionData(conversion);
            setTrendsData(trends);
            setActivityStats(activity);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'rgba(17, 17, 27, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 16,
                padding: 24,
                border: '1px solid rgba(255,255,255,0.08)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon style={{ color, width: 22, height: 22 }} />
                </div>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{title}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{value}</div>
            {subtitle && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{subtitle}</div>}
        </motion.div>
    );

    const maxTrend = Math.max(...trendsData.map(d => d.count), 1);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
            }}>
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                    <div className="spinner" style={{
                        width: 40, height: 40, border: '3px solid #8b5cf6', borderTopColor: 'transparent',
                        borderRadius: '50%', margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p>{t('common.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}
            >
                <Link to="/crm" style={{ color: '#9ca3af' }}>
                    <FiArrowLeft size={20} />
                </Link>
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        <FiBarChart2 style={{ marginRight: 12, color: '#8b5cf6' }} />
                        {t('crm.analytics', 'Analytics')}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#9ca3af' }}>
                        {t('crm.analyticsSubtitle', 'Track your pipeline performance and client trends')}
                    </p>
                </div>
            </motion.div>

            {/* Overview Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                marginBottom: 32
            }}>
                <StatCard
                    icon={FiUsers}
                    title={t('crm.totalClients', 'Total Clients')}
                    value={conversionData?.overall?.total || 0}
                    color="#8b5cf6"
                />
                <StatCard
                    icon={FiCheckCircle}
                    title={t('crm.wonClients', 'Won')}
                    value={conversionData?.overall?.won || 0}
                    subtitle={`${conversionData?.overall?.winRate || 0}% win rate`}
                    color="#10b981"
                />
                <StatCard
                    icon={FiXCircle}
                    title={t('crm.lostClients', 'Lost')}
                    value={conversionData?.overall?.lost || 0}
                    color="#ef4444"
                />
                <StatCard
                    icon={FiActivity}
                    title={t('crm.activities30d', 'Activities (30d)')}
                    value={activityStats?.total || 0}
                    color="#f59e0b"
                />
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Client Trends Chart */}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                                <FiTrendingUp style={{ marginRight: 8, color: '#10b981' }} />
                                {t('crm.newClientsTrend', 'New Clients Trend')}
                            </h2>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['week', 'month', 'year'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setTrendPeriod(p)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            background: trendPeriod === p ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                                            border: 'none',
                                            borderRadius: 6,
                                            color: trendPeriod === p ? '#fff' : '#9ca3af',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                            {trendsData.map((d, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: 30,
                                            height: Math.max((d.count / maxTrend) * 160, 4),
                                            background: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
                                            borderRadius: 4,
                                            transition: 'height 0.3s'
                                        }}
                                    />
                                    <span style={{ fontSize: 10, color: '#6b7280', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                                        {trendPeriod === 'year' ? d.date : d.date.split('-').slice(1).join('/')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Conversion Funnel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: 'rgba(17, 17, 27, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            <FiTarget style={{ marginRight: 8, color: '#f59e0b' }} />
                            {t('crm.conversionFunnel', 'Conversion Funnel')}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {conversionData?.stages?.map((stage, i) => (
                                <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 120, fontSize: 13, color: '#9ca3af', textAlign: 'right' }}>
                                        {stage.name}
                                    </div>
                                    <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${stage.conversionRate}%`,
                                                background: stage.color,
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingLeft: 12,
                                                minWidth: 60
                                            }}
                                        >
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                                {stage.count} ({stage.conversionRate}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Activity Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: 'rgba(17, 17, 27, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            <FiPieChart style={{ marginRight: 8, color: '#8b5cf6' }} />
                            {t('crm.activityBreakdown', 'Activity Breakdown')}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activityStats?.byType?.map(item => {
                                const colors = {
                                    note: '#8b5cf6',
                                    call: '#10b981',
                                    email: '#3b82f6',
                                    meeting: '#f59e0b',
                                    task: '#ef4444'
                                };
                                const icons = {
                                    note: '📝',
                                    call: '📞',
                                    email: '✉️',
                                    meeting: '🤝',
                                    task: '✅'
                                };
                                const total = activityStats?.total || 1;
                                const percentage = Math.round((item.count / total) * 100);

                                return (
                                    <div key={item.type}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, color: '#d1d5db' }}>
                                                {icons[item.type] || '📌'} {item.type}
                                            </span>
                                            <span style={{ fontSize: 13, color: '#9ca3af' }}>
                                                {item.count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    background: colors[item.type] || '#6b7280',
                                                    borderRadius: 4
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {(!activityStats?.byType || activityStats.byType.length === 0) && (
                                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                                    {t('crm.noActivitiesYet', 'No activities recorded yet')}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Win Rate Gauge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: 'rgba(17, 17, 27, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid rgba(255,255,255,0.08)',
                            textAlign: 'center'
                        }}
                    >
                        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.winRate', 'Win Rate')}
                        </h2>

                        <div style={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: `conic-gradient(#10b981 ${(conversionData?.overall?.winRate || 0) * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: 'rgba(17, 17, 27, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>
                                    {conversionData?.overall?.winRate || 0}%
                                </span>
                            </div>
                        </div>

                        <p style={{ margin: '16px 0 0', fontSize: 13, color: '#6b7280' }}>
                            {conversionData?.overall?.won || 0} won of {conversionData?.overall?.total || 0} total
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
