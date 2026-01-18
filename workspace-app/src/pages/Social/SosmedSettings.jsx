import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlineRefresh, HiOutlineCheck,
    HiOutlineExclamation, HiOutlineX, HiOutlineLink, HiOutlineExternalLink
} from 'react-icons/hi';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { socialAPI } from '../../services/api';

const PLATFORMS = {
    instagram: {
        name: 'Instagram',
        icon: FaInstagram,
        color: '#E4405F',
        description: 'Connect your Instagram Business or Creator account',
        requirements: [
            'Instagram Business or Creator Account',
            'Connected to a Facebook Page',
            'Meta App credentials configured in System Settings'
        ]
    },
    facebook: {
        name: 'Facebook',
        icon: FaFacebookF,
        color: '#1877F2',
        description: 'Connect your Facebook Page for posting',
        requirements: [
            'Facebook Page (not personal profile)',
            'Admin access to the Page',
            'Meta App credentials configured in System Settings'
        ]
    },
    twitter: {
        name: 'Twitter / X',
        icon: FaXTwitter,
        color: '#000000',
        description: 'Connect your Twitter/X account',
        requirements: [
            'Twitter Developer Account',
            'Twitter API credentials configured in System Settings'
        ]
    },
    linkedin: {
        name: 'LinkedIn',
        icon: FaLinkedinIn,
        color: '#0A66C2',
        description: 'Connect your LinkedIn profile or company page',
        requirements: [
            'LinkedIn account',
            'LinkedIn API credentials configured in System Settings'
        ]
    }
};

const SosmedSettings = () => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [connecting, setConnecting] = useState(false);

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await socialAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            setErrorWithTimeout(t('social.errors.fetchAccounts', 'Failed to fetch accounts'));
        } finally {
            setLoading(false);
        }
    };

    const disconnectAccount = async (id) => {
        if (!confirm(t('social.confirmDisconnectAccount', 'Are you sure you want to disconnect this account?'))) return;

        try {
            await socialAPI.disconnectAccount(id);
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.disconnectAccount', 'Failed to disconnect account'));
        }
    };

    const initiateOAuth = (platform) => {
        setSelectedPlatform(platform);
        setConnecting(true);

        // In production, this would redirect to OAuth flow
        // For now, show a placeholder message
        setTimeout(() => {
            alert(`OAuth flow for ${PLATFORMS[platform].name} would be initiated here.\n\nTo enable real OAuth:\n1. Configure API keys in System Settings\n2. Set up OAuth callback URLs\n3. Complete the platform's app review process`);
            setConnecting(false);
            setShowConnectModal(false);
        }, 1000);
    };

    const renderPlatformIcon = (platform, size = 24) => {
        const config = PLATFORMS[platform];
        if (!config) return null;
        const Icon = config.icon;
        return <Icon style={{ width: size, height: size }} />;
    };

    const getAccountsByPlatform = (platform) => {
        return accounts.filter(a => a.platform === platform);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('social.sosmedSettings.title', 'Social Media Settings')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('social.sosmedSettings.subtitle', 'Connect and manage your social media accounts')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchAccounts}
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
                        onClick={() => setShowConnectModal(true)}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Connect Account
                    </motion.button>
                </div>
            </div>

            {/* Error Display */}
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
            </AnimatePresence>

            {/* Platform Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {Object.entries(PLATFORMS).map(([key, platform], index) => {
                    const platformAccounts = getAccountsByPlatform(key);
                    const hasAccount = platformAccounts.length > 0;

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card"
                            style={{ padding: '24px' }}
                        >
                            {/* Platform Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    backgroundColor: `${platform.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: platform.color
                                }}>
                                    {renderPlatformIcon(key, 28)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                        {platform.name}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                                        {platformAccounts.length} account{platformAccounts.length !== 1 ? 's' : ''} connected
                                    </p>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    backgroundColor: hasAccount ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)',
                                    color: hasAccount ? '#10b981' : '#6b7280',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    {hasAccount ? 'Connected' : 'Not Connected'}
                                </span>
                            </div>

                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                                {platform.description}
                            </p>

                            {/* Connected Accounts */}
                            {platformAccounts.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    {platformAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            {account.profileImage ? (
                                                <img
                                                    src={account.profileImage}
                                                    alt={account.accountName}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: `${platform.color}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: platform.color
                                                }}>
                                                    {renderPlatformIcon(key, 18)}
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                                    {account.accountName}
                                                </p>
                                                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                                                    @{account.accountHandle || account.accountId}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {account.isActive ? (
                                                    <HiOutlineCheck style={{ width: '18px', height: '18px', color: '#10b981' }} />
                                                ) : (
                                                    <HiOutlineExclamation style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                                                )}
                                                <button
                                                    onClick={() => disconnectAccount(account.id)}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Connect Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedPlatform(key);
                                    setShowConnectModal(true);
                                }}
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
                                <HiOutlineLink style={{ width: '18px', height: '18px' }} />
                                {hasAccount ? 'Add Another Account' : 'Connect Account'}
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                    <HiOutlineExclamation style={{ display: 'inline', marginRight: '8px', color: '#f59e0b' }} />
                    Important Information
                </h3>
                <ul style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                    <li>Make sure you have configured API credentials in <strong style={{ color: 'white' }}>System Settings</strong> before connecting accounts.</li>
                    <li>For Meta platforms (Instagram & Facebook), you need a Meta Business App with proper permissions.</li>
                    <li>Twitter/X requires a Developer Account with API access enabled.</li>
                    <li>LinkedIn requires an approved LinkedIn Developer Application.</li>
                    <li>Some platforms may require app review and approval before production use.</li>
                </ul>
            </div>

            {/* Connect Modal */}
            <AnimatePresence>
                {showConnectModal && (
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
                        onClick={() => !connecting && setShowConnectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '480px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    Connect Account
                                </h3>
                                <button
                                    onClick={() => !connecting && setShowConnectModal(false)}
                                    disabled={connecting}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        cursor: connecting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            {selectedPlatform ? (
                                <div>
                                    {/* Selected Platform Info */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: `${PLATFORMS[selectedPlatform].color}10`,
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: `${PLATFORMS[selectedPlatform].color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: PLATFORMS[selectedPlatform].color
                                        }}>
                                            {renderPlatformIcon(selectedPlatform, 24)}
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'white', fontSize: '16px', margin: 0 }}>
                                                {PLATFORMS[selectedPlatform].name}
                                            </h4>
                                            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                                                {PLATFORMS[selectedPlatform].description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                                            Requirements:
                                        </h4>
                                        <ul style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
                                            {PLATFORMS[selectedPlatform].requirements.map((req, i) => (
                                                <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Connect Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => initiateOAuth(selectedPlatform)}
                                        disabled={connecting}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: PLATFORMS[selectedPlatform].color,
                                            color: 'white',
                                            cursor: connecting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            opacity: connecting ? 0.7 : 1
                                        }}
                                    >
                                        {connecting ? (
                                            <>
                                                <HiOutlineRefresh style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineExternalLink style={{ width: '18px', height: '18px' }} />
                                                Connect with {PLATFORMS[selectedPlatform].name}
                                            </>
                                        )}
                                    </motion.button>

                                    <button
                                        onClick={() => setSelectedPlatform(null)}
                                        style={{
                                            width: '100%',
                                            marginTop: '12px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'transparent',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Choose Different Platform
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
                                        Choose a platform to connect:
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '12px',
                                                    backgroundColor: `${platform.color}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: platform.color,
                                                    margin: '0 auto 8px'
                                                }}>
                                                    {renderPlatformIcon(key, 24)}
                                                </div>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                                    {platform.name}
                                                </p>
                                            </motion.button>
                                        ))}
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

export default SosmedSettings;
