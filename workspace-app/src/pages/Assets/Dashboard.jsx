import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineKey, HiOutlineCollection, HiOutlineDocumentText, HiOutlineBookmark,
    HiOutlineRefresh, HiOutlinePlus, HiOutlineChevronRight, HiOutlineExternalLink
} from 'react-icons/hi';
import { assetsAPI } from '../../services/api';

const AssetsDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const data = await assetsAPI.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        { label: 'Total Akun', value: dashboardData?.stats?.accounts || 0, icon: HiOutlineKey, color: '#8b5cf6', path: '/assets/accounts' },
        { label: 'Total Aset', value: dashboardData?.stats?.items || 0, icon: HiOutlineCollection, color: '#10b981', path: '/assets/management' },
        { label: 'Catatan Update', value: dashboardData?.stats?.notes || 0, icon: HiOutlineDocumentText, color: '#f59e0b', path: '/assets/notes' },
        { label: 'Bookmark', value: dashboardData?.stats?.bookmarks || 0, icon: HiOutlineBookmark, color: '#06b6d4', path: '/assets/bookmark' },
    ];

    const quickActions = [
        { label: 'Tambah Akun', icon: HiOutlineKey, path: '/assets/accounts', color: '#8b5cf6' },
        { label: 'Tambah Aset', icon: HiOutlineCollection, path: '/assets/management', color: '#10b981' },
        { label: 'Buat Catatan', icon: HiOutlineDocumentText, path: '/assets/notes', color: '#f59e0b' },
        { label: 'Tambah Bookmark', icon: HiOutlineBookmark, path: '/assets/bookmark', color: '#06b6d4' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('assets.dashboard.title', 'Assets')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('assets.dashboard.subtitle', 'Kelola akun, aset, dan bookmark Anda')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchDashboard}
                    style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        color: '#9ca3af',
                        cursor: 'pointer'
                    }}
                >
                    <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '24px', cursor: 'pointer' }}
                        onClick={() => navigate(stat.path)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{stat.label}</p>
                                <p style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: '8px 0 0' }}>
                                    {loading ? '...' : stat.value}
                                </p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: `${stat.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
                style={{ padding: '24px' }}
            >
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                    Aksi Cepat
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {quickActions.map((action) => (
                        <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${action.color}30`,
                                backgroundColor: `${action.color}10`,
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '14px'
                            }}
                        >
                            <action.icon style={{ width: '20px', height: '20px', color: action.color }} />
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Recent Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* Recent Accounts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineKey style={{ color: '#8b5cf6' }} />
                            Akun Terbaru
                        </h3>
                        <button
                            onClick={() => navigate('/assets/accounts')}
                            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Lihat Semua <HiOutlineChevronRight />
                        </button>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
                    ) : !dashboardData?.recentAccounts?.length ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Belum ada akun</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dashboardData.recentAccounts.map((acc) => (
                                <div
                                    key={acc.id}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: `${acc.color || '#8b5cf6'}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>
                                        {acc.icon || '🔐'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{acc.name}</p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>{acc.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Bookmarks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineBookmark style={{ color: '#06b6d4' }} />
                            Bookmark Terbaru
                        </h3>
                        <button
                            onClick={() => navigate('/assets/bookmark')}
                            style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Lihat Semua <HiOutlineChevronRight />
                        </button>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
                    ) : !dashboardData?.recentBookmarks?.length ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Belum ada bookmark</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dashboardData.recentBookmarks.map((bm) => (
                                <a
                                    key={bm.id}
                                    href={bm.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: `${bm.color || '#06b6d4'}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>
                                        {bm.icon || '🔗'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{bm.title}</p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{bm.url}</p>
                                    </div>
                                    <HiOutlineExternalLink style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                                </a>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Notes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
                style={{ padding: '24px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineDocumentText style={{ color: '#f59e0b' }} />
                        Catatan Update Terbaru
                    </h3>
                    <button
                        onClick={() => navigate('/assets/notes')}
                        style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        Lihat Semua <HiOutlineChevronRight />
                    </button>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
                ) : !dashboardData?.recentNotes?.length ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Belum ada catatan</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                        {dashboardData.recentNotes.map((note) => (
                            <div
                                key={note.id}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderTop: `3px solid ${note.color || '#f59e0b'}`
                                }}
                            >
                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{note.title}</p>
                                {note.AssetAccount && (
                                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0' }}>
                                        {note.AssetAccount.icon} {note.AssetAccount.name}
                                    </p>
                                )}
                                {note.content && (
                                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {note.content}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AssetsDashboard;
