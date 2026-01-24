import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    HiOutlineChatAlt2,
    HiOutlineCog,
    HiOutlineBell,
    HiOutlineChartBar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlinePaperAirplane,
    HiOutlineRefresh,
    HiOutlineExternalLink,
} from 'react-icons/hi';

const WhatsAppDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState({
        totalSent: 0,
        successRate: 0,
        pendingAlerts: 0,
        activeAlerts: 0,
    });
    const [recentMessages, setRecentMessages] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load config from localStorage (will be synced with backend later)
            const savedConfig = localStorage.getItem('workspace_whatsapp_config');
            if (savedConfig) {
                setConfig(JSON.parse(savedConfig));
            }

            // Load stats from localStorage
            const savedStats = localStorage.getItem('workspace_whatsapp_stats');
            if (savedStats) {
                setStats(JSON.parse(savedStats));
            }

            // Load recent messages
            const savedMessages = localStorage.getItem('workspace_whatsapp_messages');
            if (savedMessages) {
                setRecentMessages(JSON.parse(savedMessages).slice(0, 5));
            }
        } catch (err) {
            console.error('Error loading WhatsApp data:', err);
        } finally {
            setLoading(false);
        }
    };

    const isConfigured = config?.apiKey && config?.deviceId;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid rgba(37,211,102,0.3)',
                    borderTopColor: '#25D366',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading WhatsApp...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WhatsApp Reporting</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>Automated reports & notifications via WhatsApp</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadDashboardData}
                    style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        color: '#9ca3af',
                        cursor: 'pointer',
                    }}
                >
                    <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                </motion.button>
            </div>

            {/* Setup Required Banner */}
            {!isConfigured && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(18,140,126,0.15))',
                        border: '1px solid rgba(37,211,102,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <HiOutlineChatAlt2 style={{ width: '32px', height: '32px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                            Setup WhatsApp Integration
                        </h3>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '8px 0 16px 0' }}>
                            Connect your WhatsApp to receive automated reports, bill reminders, and task notifications.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link to="/whatsapp/settings">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <HiOutlineCog style={{ width: '18px', height: '18px' }} />
                                    Setup Now
                                </motion.button>
                            </Link>
                            <a href="https://kewhats.app" target="_blank" rel="noopener noreferrer">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(37,211,102,0.5)',
                                        background: 'transparent',
                                        color: '#25D366',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <HiOutlineExternalLink style={{ width: '18px', height: '18px' }} />
                                    Get API Key
                                </motion.button>
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Messages Sent</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlinePaperAirplane style={{ width: '18px', height: '18px', color: '#25D366' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#25D366', margin: 0 }}>{stats.totalSent}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Success Rate</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCheckCircle style={{ width: '18px', height: '18px', color: '#10b981' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', margin: 0 }}>{stats.successRate}%</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Active Alerts</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineBell style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>{stats.activeAlerts}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Pending</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineClock style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>{stats.pendingAlerts}</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <Link to="/whatsapp/alerts" style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{ y: -3, scale: 1.01 }}
                            style={{
                                padding: '20px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.3)',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineBell style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>Custom Alerts</h3>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>Setup bill & task reminders</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/whatsapp/reports" style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{ y: -3, scale: 1.01 }}
                            style={{
                                padding: '20px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(6,182,212,0.1)',
                                border: '1px solid rgba(6,182,212,0.3)',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineChartBar style={{ width: '24px', height: '24px', color: '#06b6d4' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>Scheduled Reports</h3>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>Daily, weekly, monthly reports</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/whatsapp/settings" style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{ y: -3, scale: 1.01 }}
                            style={{
                                padding: '20px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(37,211,102,0.1)',
                                border: '1px solid rgba(37,211,102,0.3)',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineCog style={{ width: '24px', height: '24px', color: '#25D366' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>Settings</h3>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>API Key & device setup</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Recent Messages */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>Recent Messages</h2>
                    <Link to="/whatsapp/history" style={{ fontSize: '13px', color: '#25D366', textDecoration: 'none' }}>View All →</Link>
                </div>

                {recentMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <HiOutlineChatAlt2 style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No messages sent yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentMessages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: msg.status === 'sent' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {msg.status === 'sent' ? (
                                        <HiOutlineCheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                                    ) : (
                                        <HiOutlineExclamationCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: 0 }}>{msg.type}</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>To: {msg.to}</p>
                                </div>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{msg.sentAt}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Powered by KeWhats */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Powered by{' '}
                    <a href="https://kewhats.app" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
                        kewhats.app
                    </a>
                </p>
            </div>
        </div>
    );
};

export default WhatsAppDashboard;
