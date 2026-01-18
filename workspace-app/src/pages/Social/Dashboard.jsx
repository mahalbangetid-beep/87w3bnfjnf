import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePencilAlt, HiOutlineCalendar, HiOutlineClock,
    HiOutlineChartBar, HiOutlineCollection, HiOutlineGlobeAlt,
    HiOutlinePhotograph, HiOutlineDocumentText, HiOutlineCog,
    HiOutlineRefresh, HiOutlinePlus, HiOutlineExternalLink
} from 'react-icons/hi';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { socialAPI, blogAPI } from '../../services/api';

const PLATFORMS = {
    instagram: { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
    facebook: { name: 'Facebook', icon: FaFacebookF, color: '#1877F2' },
    twitter: { name: 'Twitter/X', icon: FaXTwitter, color: '#000000' },
    linkedin: { name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2' },
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [socialStats, setSocialStats] = useState(null);
    const [blogStats, setBlogStats] = useState(null);
    const [connectedAccounts, setConnectedAccounts] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [socialData, blogData, accounts] = await Promise.all([
                socialAPI.getDashboard().catch(() => null),
                blogAPI.getDashboard().catch(() => null),
                socialAPI.getAccounts().catch(() => [])
            ]);
            setSocialStats(socialData);
            setBlogStats(blogData);
            setConnectedAccounts(accounts);
        } catch (error) {
            // Silent fail - data fetched with fallbacks
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: t('social.connectedAccounts', 'Connected Accounts'),
            value: connectedAccounts.length,
            icon: HiOutlineGlobeAlt,
            color: '#8b5cf6',
            link: '/social/sosmed-settings'
        },
        {
            label: t('social.dashboard.scheduled', 'Scheduled Posts'),
            value: (socialStats?.stats?.scheduledPosts || 0) + (blogStats?.stats?.scheduledPosts || 0),
            icon: HiOutlineClock,
            color: '#06b6d4',
            link: '/social/schedule-post'
        },
        {
            label: t('social.dashboard.published', 'Published Posts'),
            value: (socialStats?.stats?.publishedPosts || 0) + (blogStats?.stats?.publishedPosts || 0),
            icon: HiOutlineChartBar,
            color: '#10b981',
            link: null
        },
        {
            label: t('social.dashboard.drafts', 'Drafts'),
            value: (socialStats?.stats?.drafts || 0) + (blogStats?.stats?.drafts || 0),
            icon: HiOutlineDocumentText,
            color: '#f59e0b',
            link: '/social/sosmed-posting'
        }
    ];

    const quickActions = [
        { label: t('social.newSocialPost', 'New Social Post'), icon: HiOutlinePencilAlt, path: '/social/sosmed-posting', color: '#8b5cf6' },
        { label: t('social.newBlogPost', 'New Blog Post'), icon: HiOutlineDocumentText, path: '/social/blog-posting', color: '#06b6d4' },
        { label: t('social.schedulePost', 'Schedule Post'), icon: HiOutlineCalendar, path: '/social/schedule-post', color: '#10b981' },
        { label: t('social.manageAccounts', 'Manage Accounts'), icon: HiOutlineCog, path: '/social/sosmed-settings', color: '#f59e0b' }
    ];

    const renderPlatformIcon = (platform, size = 18) => {
        const config = PLATFORMS[platform];
        if (!config) return null;
        const Icon = config.icon;
        return <Icon style={{ width: size, height: size, color: config.color }} />;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('social.dashboard.title', 'Social Stack')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('social.dashboard.subtitle', 'Manage your social media and blog presence')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchData}
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
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '20px', cursor: stat.link ? 'pointer' : 'default' }}
                        onClick={() => stat.link && navigate(stat.link)}
                        whileHover={stat.link ? { y: -2 } : {}}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                                    {loading ? '...' : stat.value}
                                </p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: `${stat.color}15`,
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
            <div className="glass-card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                    {t('social.quickActions', 'Quick Actions')}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.path}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${action.color}30`,
                                backgroundColor: `${action.color}10`,
                                color: action.color,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <action.icon style={{ width: '20px', height: '20px' }} />
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* Connected Accounts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                            Connected Accounts
                        </h2>
                        <button
                            onClick={() => navigate('/social/sosmed-settings')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(139,92,246,0.3)',
                                backgroundColor: 'rgba(139,92,246,0.1)',
                                color: '#a78bfa',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <HiOutlinePlus style={{ width: '14px', height: '14px' }} />
                            Add
                        </button>
                    </div>

                    {connectedAccounts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <HiOutlineGlobeAlt style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No accounts connected yet</p>
                            <button
                                onClick={() => navigate('/social/sosmed-settings')}
                                style={{
                                    marginTop: '12px',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Connect Account
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {connectedAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    {renderPlatformIcon(account.platform, 24)}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                            {account.accountName}
                                        </p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                                            @{account.accountHandle}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: account.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: account.isActive ? '#10b981' : '#ef4444',
                                        fontSize: '11px'
                                    }}>
                                        {account.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Scheduled */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card"
                    style={{ padding: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                            Upcoming Scheduled
                        </h2>
                        <button
                            onClick={() => navigate('/social/schedule-post')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(6,182,212,0.3)',
                                backgroundColor: 'rgba(6,182,212,0.1)',
                                color: '#06b6d4',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            View All
                            <HiOutlineExternalLink style={{ width: '14px', height: '14px' }} />
                        </button>
                    </div>

                    {(!socialStats?.upcomingScheduled || socialStats.upcomingScheduled.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <HiOutlineCalendar style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No scheduled posts</p>
                            <button
                                onClick={() => navigate('/social/sosmed-posting')}
                                style={{
                                    marginTop: '12px',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#06b6d4',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Schedule Post
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {socialStats.upcomingScheduled.slice(0, 5).map((post) => (
                                <div
                                    key={post.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <p style={{ color: 'white', fontSize: '13px', marginBottom: '8px' }}>
                                        {post.content?.substring(0, 60)}...
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {post.platforms?.map(p => (
                                            <span key={p}>{renderPlatformIcon(p, 14)}</span>
                                        ))}
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#6b7280' }}>
                                            <HiOutlineClock style={{ display: 'inline', marginRight: '4px' }} />
                                            {new Date(post.scheduledAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card"
                    style={{ padding: '20px' }}
                >
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                        Recent Activity
                    </h2>

                    {(!socialStats?.recentPosts || socialStats.recentPosts.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <HiOutlineCollection style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {socialStats.recentPosts.slice(0, 5).map((post) => (
                                <div
                                    key={post.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        {post.platforms?.map(p => (
                                            <span key={p}>{renderPlatformIcon(p, 14)}</span>
                                        ))}
                                        <span style={{
                                            marginLeft: 'auto',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            backgroundColor: post.status === 'published' ? 'rgba(16,185,129,0.2)' :
                                                post.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                                            color: post.status === 'published' ? '#10b981' :
                                                post.status === 'failed' ? '#ef4444' : '#9ca3af'
                                        }}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                                        {post.content?.substring(0, 50)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Blog Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card"
                    style={{ padding: '20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                            Blog Overview
                        </h2>
                        <button
                            onClick={() => navigate('/social/blog-settings')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(236,72,153,0.3)',
                                backgroundColor: 'rgba(236,72,153,0.1)',
                                color: '#ec4899',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Manage Blogs
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div style={{
                            padding: '16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(236,72,153,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899', margin: 0 }}>
                                {blogStats?.stats?.connectedBlogs || 0}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Connected Blogs</p>
                        </div>
                        <div style={{
                            padding: '16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(139,92,246,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
                                {blogStats?.stats?.totalPosts || 0}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Posts</p>
                        </div>
                        <div style={{
                            padding: '16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(6,182,212,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4', margin: 0 }}>
                                {blogStats?.stats?.scheduledPosts || 0}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Scheduled</p>
                        </div>
                        <div style={{
                            padding: '16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(245,158,11,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
                                {blogStats?.stats?.drafts || 0}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Drafts</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
