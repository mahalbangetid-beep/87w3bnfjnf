import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlineRefresh, HiOutlineCheck,
    HiOutlineExclamation, HiOutlineX, HiOutlinePencil, HiOutlineExternalLink,
    HiOutlineGlobeAlt
} from 'react-icons/hi';
import { blogAPI } from '../../services/api';
import EmptyState from '../../components/UI/EmptyState';

const PLATFORMS = {
    wordpress: {
        name: 'WordPress',
        color: '#21759b',
        logo: '📝',
        fields: ['siteUrl', 'username', 'appPassword'],
        fieldLabels: {
            siteUrl: 'WordPress Site URL',
            username: 'Username',
            appPassword: 'Application Password'
        },
        description: 'Connect to WordPress with REST API',
        helpText: 'You need to create an Application Password in WordPress: Users → Your Profile → Application Passwords'
    },
    blogspot: {
        name: 'Blogger / Blogspot',
        color: '#ff5722',
        logo: '🅱️',
        fields: ['siteUrl', 'blogId', 'apiKey'],
        fieldLabels: {
            siteUrl: 'Blog URL',
            blogId: 'Blog ID',
            apiKey: 'OAuth Access Token'
        },
        description: 'Connect to Google Blogger',
        helpText: 'Get your access token from Google Cloud Console → OAuth 2.0. Blog ID is found in Blogger Settings URL.'
    },
    custom: {
        name: 'Custom CMS',
        color: '#8b5cf6',
        logo: '⚙️',
        fields: ['siteUrl', 'apiUrl', 'apiKey'],
        fieldLabels: {
            siteUrl: 'Website URL',
            apiUrl: 'API Endpoint URL',
            apiKey: 'API Key'
        },
        description: 'Connect to any CMS with REST API',
        helpText: 'Your CMS must support REST API for creating posts'
    }
};

const BlogSettings = () => {
    const { t } = useTranslation();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [editConnection, setEditConnection] = useState(null);
    const [formData, setFormData] = useState({
        siteName: '',
        siteUrl: '',
        apiUrl: '',
        username: '',
        appPassword: '',
        blogId: '',
        apiKey: ''
    });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Auto-clear messages after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };
    const setSuccessWithTimeout = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 5000);
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const data = await blogAPI.getConnections();
            setConnections(data);
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.fetchConnections', 'Failed to fetch connections'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            siteName: '',
            siteUrl: '',
            apiUrl: '',
            username: '',
            appPassword: '',
            blogId: '',
            apiKey: ''
        });
        setSelectedPlatform(null);
        setEditConnection(null);
    };

    const openAddModal = (platform = null) => {
        resetForm();
        if (platform) {
            setSelectedPlatform(platform);
        }
        setShowAddModal(true);
    };

    const openEditModal = (connection) => {
        setEditConnection(connection);
        setSelectedPlatform(connection.platform);
        setFormData({
            siteName: connection.siteName || '',
            siteUrl: connection.siteUrl || '',
            apiUrl: connection.apiUrl || '',
            username: connection.username || '',
            appPassword: '', // Don't show stored password
            blogId: connection.blogId || '',
            apiKey: '' // Don't show stored key
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.siteName || !formData.siteUrl) {
            setErrorWithTimeout(t('blog.errors.fillSiteNameUrl', 'Please fill in site name and URL'));
            return;
        }

        setSaving(true);
        try {
            const data = {
                platform: selectedPlatform,
                siteName: formData.siteName,
                siteUrl: formData.siteUrl,
                apiUrl: formData.apiUrl || null,
                username: formData.username || null,
                appPassword: formData.appPassword || null,
                blogId: formData.blogId || null,
                apiKey: formData.apiKey || null
            };

            if (editConnection) {
                await blogAPI.updateConnection(editConnection.id, data);
            } else {
                await blogAPI.createConnection(data);
            }

            setShowAddModal(false);
            resetForm();
            fetchConnections();
            setSuccessWithTimeout(t('blog.success.connectionSaved', 'Connection saved successfully'));
        } catch (error) {
            setErrorWithTimeout(error.message || t('blog.errors.saveConnection', 'Failed to save connection'));
        } finally {
            setSaving(false);
        }
    };

    const deleteConnection = async (id) => {
        if (!confirm(t('blog.confirmDeleteConnection', 'Are you sure you want to delete this connection?'))) return;

        try {
            await blogAPI.deleteConnection(id);
            setConnections(prev => prev.filter(c => c.id !== id));
            setSuccessWithTimeout(t('blog.success.connectionDeleted', 'Connection deleted successfully'));
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.deleteConnection', 'Failed to delete connection'));
        }
    };

    const testConnection = async (id) => {
        setTesting(id);
        try {
            const result = await blogAPI.verifyConnection(id);
            if (result.success) {
                setSuccessWithTimeout(t('blog.success.connectionVerified', 'Connection verified successfully!'));
            } else {
                setErrorWithTimeout(t('blog.errors.connectionFailed', 'Connection test failed') + ': ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.connectionFailed', 'Connection test failed') + ': ' + (error.message || 'Unknown error'));
        } finally {
            setTesting(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('social.blogSettings.title', 'Blog Settings')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('social.blogSettings.subtitle', 'Connect and manage your blog platforms')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchConnections}
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
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openAddModal()}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Connection
                    </motion.button>
                </div>
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            fontSize: '14px'
                        }}
                    >
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16,185,129,0.15)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#10b981',
                            fontSize: '14px'
                        }}
                    >
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Platform Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {Object.entries(PLATFORMS).map(([key, platform], index) => {
                    const platformConnections = connections.filter(c => c.platform === key);

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card"
                            style={{ padding: '24px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    backgroundColor: `${platform.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px'
                                }}>
                                    {platform.logo}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                        {platform.name}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                                        {platformConnections.length} connection{platformConnections.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                                {platform.description}
                            </p>

                            {/* Connected Sites */}
                            {platformConnections.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    {platformConnections.map((conn) => (
                                        <div
                                            key={conn.id}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                                        {conn.siteName}
                                                    </p>
                                                    <a
                                                        href={conn.siteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        {conn.siteUrl}
                                                        <HiOutlineExternalLink style={{ width: '12px', height: '12px' }} />
                                                    </a>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {conn.isActive ? (
                                                        <HiOutlineCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />
                                                    ) : (
                                                        <HiOutlineExclamation style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                                                    )}
                                                    <button
                                                        onClick={() => testConnection(conn.id)}
                                                        disabled={testing === conn.id}
                                                        style={{
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(6,182,212,0.3)',
                                                            backgroundColor: 'rgba(6,182,212,0.1)',
                                                            color: '#06b6d4',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <HiOutlineRefresh style={{
                                                            width: '12px',
                                                            height: '12px',
                                                            animation: testing === conn.id ? 'spin 1s linear infinite' : 'none'
                                                        }} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(conn)}
                                                        style={{
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(139,92,246,0.3)',
                                                            backgroundColor: 'rgba(139,92,246,0.1)',
                                                            color: '#a78bfa',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <HiOutlinePencil style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteConnection(conn.id)}
                                                        style={{
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(239,68,68,0.3)',
                                                            backgroundColor: 'rgba(239,68,68,0.1)',
                                                            color: '#ef4444',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <HiOutlineTrash style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openAddModal(key)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: `1px solid ${platform.color}40`,
                                    backgroundColor: `${platform.color}10`,
                                    color: platform.color,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                                Add {platform.name}
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {!loading && connections.length === 0 && (
                <EmptyState
                    icon="🌐"
                    title="No Blog Connections Yet"
                    description="Connect your first blog platform to start publishing content directly from Workspace"
                    actionLabel="Add Your First Connection"
                    onAction={() => openAddModal()}
                    color="#8b5cf6"
                    variant="card"
                />
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => { setShowAddModal(false); resetForm(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editConnection ? 'Edit Connection' : 'Add Connection'}
                                </h3>
                                <button
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            {/* Platform Selection */}
                            {!selectedPlatform ? (
                                <div>
                                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
                                        Choose a platform:
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {Object.entries(PLATFORMS).map(([key, platform]) => (
                                            <motion.button
                                                key={key}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedPlatform(key)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${platform.color}30`,
                                                    backgroundColor: `${platform.color}10`,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span style={{ fontSize: '32px' }}>{platform.logo}</span>
                                                <div>
                                                    <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: 0 }}>
                                                        {platform.name}
                                                    </p>
                                                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
                                                        {platform.description}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Platform Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: `${PLATFORMS[selectedPlatform].color}10`,
                                        marginBottom: '20px'
                                    }}>
                                        <span style={{ fontSize: '28px' }}>{PLATFORMS[selectedPlatform].logo}</span>
                                        <div>
                                            <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
                                                {PLATFORMS[selectedPlatform].name}
                                            </p>
                                            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                                                {PLATFORMS[selectedPlatform].helpText}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Site Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.siteName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                                                placeholder="My Blog"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        {PLATFORMS[selectedPlatform].fields.map(field => (
                                            <div key={field}>
                                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                    {PLATFORMS[selectedPlatform].fieldLabels[field]} *
                                                </label>
                                                <input
                                                    type={field.includes('Password') || field.includes('Key') ? 'password' : 'text'}
                                                    value={formData[field]}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                                    placeholder={
                                                        field === 'siteUrl' ? 'https://yourblog.com' :
                                                            field === 'apiUrl' ? 'https://yourblog.com/api' :
                                                                field === 'username' ? 'admin' :
                                                                    field === 'blogId' ? '1234567890' :
                                                                        `Enter ${PLATFORMS[selectedPlatform].fieldLabels[field]}`
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button
                                            onClick={() => {
                                                if (editConnection) {
                                                    setShowAddModal(false);
                                                    resetForm();
                                                } else {
                                                    setSelectedPlatform(null);
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backgroundColor: 'transparent',
                                                color: '#9ca3af',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {editConnection ? 'Cancel' : 'Back'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="btn-glow"
                                            style={{
                                                flex: 1,
                                                opacity: saving ? 0.7 : 1,
                                                cursor: saving ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {saving ? 'Saving...' : (editConnection ? 'Update' : 'Save')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default BlogSettings;
