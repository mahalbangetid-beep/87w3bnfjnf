import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FiUsers, FiTrendingUp, FiTarget, FiCheckCircle,
    FiAlertCircle, FiCalendar, FiPlus, FiArrowRight, FiX,
    FiBarChart2, FiFileText, FiCopy
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { crmAPI } from '../../services/api';

const CRMDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [reminders, setReminders] = useState([]);

    // Quick Add Modal
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [stages, setStages] = useState([]);
    const [quickAddData, setQuickAddData] = useState({
        name: '',
        companyName: '',
        stageId: '',
        priority: 'medium',
        email: '',
        phone: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [analyticsData, funnelData, remindersData, stagesData] = await Promise.all([
                crmAPI.getAnalyticsOverview().catch(() => null),
                crmAPI.getAnalyticsFunnel().catch(() => []),
                crmAPI.getReminders('pending').catch(() => []),
                crmAPI.getPipelineStages().catch(() => [])
            ]);
            setAnalytics(analyticsData);
            setFunnel(Array.isArray(funnelData) ? funnelData : []);
            setReminders(Array.isArray(remindersData) ? remindersData.slice(0, 5) : []);
            setStages(Array.isArray(stagesData) ? stagesData : []);
            // Set default stage if available
            if (stagesData && stagesData.length > 0 && !quickAddData.stageId) {
                setQuickAddData(prev => ({ ...prev, stageId: stagesData[0].id }));
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async () => {
        if (!quickAddData.name.trim()) return;

        setSaving(true);
        try {
            // Create client with optional contact
            const clientData = {
                name: quickAddData.name,
                companyName: quickAddData.companyName,
                stageId: quickAddData.stageId,
                priority: quickAddData.priority,
                contacts: []
            };

            // Add contact if email or phone provided
            if (quickAddData.email || quickAddData.phone) {
                clientData.contacts.push({
                    name: quickAddData.name,
                    email: quickAddData.email,
                    phone: quickAddData.phone,
                    isPrimary: true
                });
            }

            const newClient = await crmAPI.createClient(clientData);

            // Reset form and close modal
            setQuickAddData({
                name: '',
                companyName: '',
                stageId: stages[0]?.id || '',
                priority: 'medium',
                email: '',
                phone: ''
            });
            setShowQuickAdd(false);

            // Navigate to client detail
            navigate(`/crm/clients/${newClient.id}`);
        } catch (error) {
            console.error('Error creating client:', error);
        } finally {
            setSaving(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                background: 'rgba(17, 17, 27, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: 24,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `${color}15`,
                filter: 'blur(30px)'
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{title}</p>
                    <h3 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#fff' }}>{value}</h3>
                    {subtitle && (
                        <p style={{ margin: '8px 0 0', fontSize: 13, color }}>{subtitle}</p>
                    )}
                </div>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon style={{ width: 24, height: 24, color }} />
                </div>
            </div>
        </motion.div>
    );

    const FunnelStage = ({ stage, index, maxCount }) => {
        const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 0'
                }}
            >
                <div style={{ width: 100, fontSize: 13, color: '#9ca3af' }}>
                    {stage.name}
                </div>
                <div style={{ flex: 1, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        style={{
                            height: '100%',
                            background: stage.color || '#6b7280',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: 12,
                            minWidth: stage.count > 0 ? 50 : 0
                        }}
                    >
                        {stage.count > 0 && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{stage.count}</span>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48,
                        height: 48,
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    const maxFunnelCount = Math.max(...funnel.map(s => s.count), 1);

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 32
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        {t('crm.dashboard', 'CRM Dashboard')}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#9ca3af' }}>
                        {t('crm.dashboardSubtitle', 'Manage your clients and track your pipeline')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQuickAdd(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        border: 'none',
                        borderRadius: 12,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <FiPlus /> {t('crm.quickAdd', 'Quick Add')}
                </motion.button>
            </motion.div>

            {/* Quick Add Modal */}
            <AnimatePresence>
                {showQuickAdd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 20
                        }}
                        onClick={() => setShowQuickAdd(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
                                borderRadius: 20,
                                padding: 32,
                                width: '100%',
                                maxWidth: 500,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#fff' }}>
                                    <FiPlus style={{ marginRight: 10, color: '#8b5cf6' }} />
                                    {t('crm.quickAddClient', 'Quick Add Client')}
                                </h2>
                                <button
                                    onClick={() => setShowQuickAdd(false)}
                                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8 }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Name (Required) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                        {t('crm.clientName', 'Client Name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={quickAddData.name}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                                        placeholder="Enter client name..."
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 10,
                                            color: '#fff',
                                            fontSize: 14
                                        }}
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                        {t('crm.company', 'Company')}
                                    </label>
                                    <input
                                        type="text"
                                        value={quickAddData.companyName}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, companyName: e.target.value })}
                                        placeholder="Company name..."
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 10,
                                            color: '#fff',
                                            fontSize: 14
                                        }}
                                    />
                                </div>

                                {/* Stage & Priority Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                            {t('crm.stage', 'Stage')}
                                        </label>
                                        <select
                                            value={quickAddData.stageId}
                                            onChange={(e) => setQuickAddData({ ...quickAddData, stageId: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14
                                            }}
                                        >
                                            {stages.map(s => (
                                                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                            {t('crm.priority', 'Priority')}
                                        </label>
                                        <select
                                            value={quickAddData.priority}
                                            onChange={(e) => setQuickAddData({ ...quickAddData, priority: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14
                                            }}
                                        >
                                            <option value="vip">⭐ VIP</option>
                                            <option value="high">🔥 High</option>
                                            <option value="medium">📌 Medium</option>
                                            <option value="low">📋 Low</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Contact Info Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                            {t('crm.email', 'Email')}
                                        </label>
                                        <input
                                            type="email"
                                            value={quickAddData.email}
                                            onChange={(e) => setQuickAddData({ ...quickAddData, email: e.target.value })}
                                            placeholder="email@example.com"
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
                                            {t('crm.phone', 'Phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={quickAddData.phone}
                                            onChange={(e) => setQuickAddData({ ...quickAddData, phone: e.target.value })}
                                            placeholder="+62..."
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                                <Link to="/crm/clients/new" style={{ textDecoration: 'none' }}>
                                    <button
                                        style={{
                                            padding: '12px 20px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 10,
                                            color: '#9ca3af',
                                            fontSize: 14,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('crm.fullForm', 'Full Form')}
                                    </button>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleQuickAdd}
                                    disabled={saving || !quickAddData.name.trim()}
                                    style={{
                                        padding: '12px 24px',
                                        background: quickAddData.name.trim() ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: 10,
                                        color: '#fff',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: quickAddData.name.trim() ? 'pointer' : 'not-allowed',
                                        opacity: quickAddData.name.trim() ? 1 : 0.5
                                    }}
                                >
                                    {saving ? t('common.saving', 'Saving...') : t('crm.createClient', 'Create Client')}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 20,
                marginBottom: 32
            }}>
                <StatCard
                    icon={FiUsers}
                    title={t('crm.totalClients', 'Total Clients')}
                    value={analytics?.totalClients || 0}
                    color="#8b5cf6"
                    delay={0}
                />
                <StatCard
                    icon={FiTrendingUp}
                    title={t('crm.newThisMonth', 'New This Month')}
                    value={analytics?.newThisMonth || 0}
                    subtitle={analytics?.newThisMonth > 0 ? '+' + analytics.newThisMonth : ''}
                    color="#10b981"
                    delay={0.1}
                />
                <StatCard
                    icon={FiTarget}
                    title={t('crm.wonThisMonth', 'Won This Month')}
                    value={analytics?.wonThisMonth || 0}
                    color="#f59e0b"
                    delay={0.2}
                />
                <StatCard
                    icon={FiCalendar}
                    title={t('crm.pendingReminders', 'Pending Follow-ups')}
                    value={(analytics?.reminders?.upcoming || 0) + (analytics?.reminders?.overdue || 0)}
                    subtitle={analytics?.reminders?.overdue > 0 ? `${analytics.reminders.overdue} overdue` : ''}
                    color={analytics?.reminders?.overdue > 0 ? '#ef4444' : '#06b6d4'}
                    delay={0.3}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
                {/* Pipeline Funnel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        background: 'rgba(17, 17, 27, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 20,
                        padding: 24,
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.pipelineFunnel', 'Pipeline Funnel')}
                        </h3>
                        <Link to="/crm/clients" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#8b5cf6',
                            textDecoration: 'none',
                            fontSize: 13
                        }}>
                            {t('common.viewAll', 'View All')} <FiArrowRight />
                        </Link>
                    </div>

                    {funnel.length > 0 ? (
                        <div>
                            {funnel.map((stage, index) => (
                                <FunnelStage
                                    key={stage.name}
                                    stage={stage}
                                    index={index}
                                    maxCount={maxFunnelCount}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 40,
                            color: '#6b7280'
                        }}>
                            <FiUsers style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
                            <p>{t('crm.noClients', 'No clients yet. Add your first client to get started!')}</p>
                        </div>
                    )}

                    {/* Stage Stats */}
                    {analytics?.stageStats && analytics.stageStats.length > 0 && (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginTop: 24,
                            paddingTop: 24,
                            borderTop: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            {analytics.stageStats.map(stage => (
                                <div
                                    key={stage.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: 20,
                                        fontSize: 13
                                    }}
                                >
                                    <span>{stage.icon}</span>
                                    <span style={{ color: '#9ca3af' }}>{stage.name}:</span>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>{stage.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Upcoming Reminders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            background: 'rgba(17, 17, 27, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 20,
                            padding: 24,
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                                {t('crm.upcomingFollowups', 'Upcoming Follow-ups')}
                            </h3>
                            <Link to="/crm/reminders" style={{
                                color: '#8b5cf6',
                                textDecoration: 'none',
                                fontSize: 13
                            }}>
                                {t('common.viewAll', 'View All')}
                            </Link>
                        </div>

                        {reminders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {reminders.map((reminder, index) => {
                                    const isOverdue = new Date(reminder.remindAt) < new Date();
                                    return (
                                        <motion.div
                                            key={reminder.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            style={{
                                                padding: 16,
                                                background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                                                borderRadius: 12,
                                                border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                {isOverdue ? (
                                                    <FiAlertCircle style={{ color: '#ef4444', marginTop: 2 }} />
                                                ) : (
                                                    <FiCheckCircle style={{ color: '#10b981', marginTop: 2 }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                                                        {reminder.title}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                                                        {reminder.Client?.name || 'Unknown Client'}
                                                    </p>
                                                    <p style={{
                                                        margin: '4px 0 0',
                                                        fontSize: 11,
                                                        color: isOverdue ? '#ef4444' : '#9ca3af'
                                                    }}>
                                                        {new Date(reminder.remindAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: 30,
                                color: '#6b7280'
                            }}>
                                <FiCalendar style={{ width: 32, height: 32, marginBottom: 12, opacity: 0.5 }} />
                                <p style={{ margin: 0, fontSize: 13 }}>{t('crm.noReminders', 'No upcoming reminders')}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            background: 'rgba(17, 17, 27, 0.8)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 20,
                            padding: 24,
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.quickActions', 'Quick Actions')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Link to="/crm/clients" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: 'pointer',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}
                                >
                                    <FiUsers style={{ color: '#8b5cf6' }} />
                                    <span style={{ color: '#fff', fontSize: 14 }}>
                                        {t('crm.viewClients', 'View All Clients')}
                                    </span>
                                </motion.div>
                            </Link>
                            <Link to="/crm/settings" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: 'pointer',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    <FiTarget style={{ color: '#10b981' }} />
                                    <span style={{ color: '#fff', fontSize: 14 }}>
                                        {t('crm.managePipeline', 'Manage Pipeline')}
                                    </span>
                                </motion.div>
                            </Link>
                            <Link to="/crm/analytics" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: 'pointer',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}
                                >
                                    <FiBarChart2 style={{ color: '#f59e0b' }} />
                                    <span style={{ color: '#fff', fontSize: 14 }}>
                                        {t('crm.analytics', 'Analytics')}
                                    </span>
                                </motion.div>
                            </Link>
                            <Link to="/crm/reports" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: 'pointer',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}
                                >
                                    <FiFileText style={{ color: '#3b82f6' }} />
                                    <span style={{ color: '#fff', fontSize: 14 }}>
                                        {t('crm.reports', 'Activity Reports')}
                                    </span>
                                </motion.div>
                            </Link>
                            <Link to="/crm/duplicates" style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        cursor: 'pointer',
                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}
                                >
                                    <FiCopy style={{ color: '#ef4444' }} />
                                    <span style={{ color: '#fff', fontSize: 14 }}>
                                        {t('crm.duplicates', 'Find Duplicates')}
                                    </span>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;
