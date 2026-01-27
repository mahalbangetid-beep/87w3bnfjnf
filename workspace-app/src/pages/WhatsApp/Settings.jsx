import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineKey,
    HiOutlineDeviceMobile,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineExternalLink,
    HiOutlineRefresh,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineSave,
    HiOutlineTranslate,
    HiOutlineQuestionMarkCircle,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
} from 'react-icons/hi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WhatsAppSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', 'error'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);

    const [formData, setFormData] = useState({
        apiKey: '',
        deviceId: '',
        defaultPhone: '',
        messageLanguage: 'id', // id, en
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        setLoading(true);
        try {
            const saved = localStorage.getItem('workspace_whatsapp_config');
            if (saved) {
                const config = JSON.parse(saved);
                setFormData({
                    apiKey: config.apiKey || '',
                    deviceId: config.deviceId || '',
                    defaultPhone: config.defaultPhone || '',
                    messageLanguage: config.messageLanguage || 'id',
                });
                if (config.apiKey && config.deviceId) {
                    setConnectionStatus('success');
                }
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.apiKey.trim()) {
            setError('API Key is required');
            return;
        }
        if (!formData.deviceId.trim()) {
            setError('Device ID is required');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            // Save to database (for scheduler automation)
            const response = await fetch(`${API_BASE_URL}/whatsapp/config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: formData.apiKey,
                    deviceId: formData.deviceId,
                    defaultPhone: formData.defaultPhone,
                    messageLanguage: formData.messageLanguage,
                    dailySummaryEnabled: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save config');
            }

            // Also save to localStorage for quick access
            localStorage.setItem('workspace_whatsapp_config', JSON.stringify({
                apiKey: formData.apiKey,
                deviceId: formData.deviceId,
                defaultPhone: formData.defaultPhone,
                messageLanguage: formData.messageLanguage,
                updatedAt: new Date().toISOString(),
            }));

            setSuccess('Settings saved successfully! Automation is now enabled.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!formData.apiKey.trim() || !formData.deviceId.trim()) {
            setError('Please enter API Key and Device ID first');
            return;
        }

        setTesting(true);
        setError('');
        setConnectionStatus(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/whatsapp/test-connection`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-WhatsApp-API-Key': formData.apiKey,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setConnectionStatus('success');
                setSuccess('Connection successful! Your API is working.');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                throw new Error(data.message || 'Connection failed');
            }
        } catch (err) {
            setConnectionStatus('error');
            setError(err.message || 'Failed to connect to KeWhats API');
        } finally {
            setTesting(false);
        }
    };

    const handleSendTestMessage = async () => {
        if (!formData.defaultPhone.trim()) {
            setError('Please enter a phone number to send test message');
            return;
        }

        setTesting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/whatsapp/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-WhatsApp-API-Key': formData.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceId: formData.deviceId,
                    to: formData.defaultPhone,
                    message: `🎉 Test message from Workspace!\n\nYour WhatsApp integration is working correctly.\n\nTimestamp: ${new Date().toLocaleString('id-ID')}`,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Test message sent successfully!');
                setTimeout(() => setSuccess(''), 3000);

                // Update stats
                const stats = JSON.parse(localStorage.getItem('workspace_whatsapp_stats') || '{"totalSent":0,"successRate":100,"pendingAlerts":0,"activeAlerts":0}');
                stats.totalSent += 1;
                localStorage.setItem('workspace_whatsapp_stats', JSON.stringify(stats));
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (err) {
            setError(err.message || 'Failed to send test message');
        } finally {
            setTesting(false);
        }
    };

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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading settings...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    <span style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WhatsApp Settings</span>
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>Configure your WhatsApp API connection</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <HiOutlineExclamationCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <HiOutlineCheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    <span style={{ color: '#34d399', fontSize: '14px' }}>{success}</span>
                </motion.div>
            )}

            {/* Get API Key Banner */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <HiOutlineKey style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>Need an API Key?</h3>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>Get your API key from kewhats.app to enable WhatsApp integration</p>
                </div>
                <a href="https://kewhats.app" target="_blank" rel="noopener noreferrer">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
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
                        <HiOutlineExternalLink style={{ width: '18px', height: '18px' }} />
                        Get API Key
                    </motion.button>
                </a>
            </div>

            {/* Tutorial Section */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => setShowTutorial(!showTutorial)}
                    style={{
                        width: '100%',
                        padding: '20px 24px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <HiOutlineQuestionMarkCircle style={{ width: '22px', height: '22px', color: 'white' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>
                                How to Get API Key & Device ID
                            </h3>
                            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                                Step-by-step guide to connect your WhatsApp
                            </p>
                        </div>
                    </div>
                    {showTutorial ? (
                        <HiOutlineChevronUp style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                    ) : (
                        <HiOutlineChevronDown style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                    )}
                </motion.button>

                <AnimatePresence>
                    {showTutorial && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {/* Tutorial 1: How to Get API Key */}
                                <div>
                                    <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#25D366',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'white',
                                        }}>1</span>
                                        How to Get Your API Key
                                    </h4>

                                    <div style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        marginBottom: '16px',
                                    }}>
                                        <img
                                            src="/images/tutorapi.png"
                                            alt="How to get API Key from kewhats.app"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block',
                                            }}
                                        />
                                    </div>

                                    <ol style={{
                                        margin: 0,
                                        paddingLeft: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            <strong style={{ color: 'white' }}>Register</strong> at{' '}
                                            <a href="https://kewhats.app" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
                                                kewhats.app
                                            </a>
                                        </li>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            <strong style={{ color: 'white' }}>Connect Device</strong> - Link your WhatsApp by scanning QR code
                                        </li>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            Click <strong style={{ color: 'white' }}>Settings</strong> on the Sidebar
                                        </li>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            Click <strong style={{ color: 'white' }}>API Key</strong> menu
                                        </li>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            <strong style={{ color: '#25D366' }}>Copy your API Key</strong> and paste it in the field above
                                        </li>
                                    </ol>
                                </div>

                                {/* Divider */}
                                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                                {/* Tutorial 2: How to Get Device ID */}
                                <div>
                                    <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#8b5cf6',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'white',
                                        }}>2</span>
                                        How to Get Your Device ID
                                    </h4>

                                    <div style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        marginBottom: '16px',
                                    }}>
                                        <img
                                            src="/images/tutordeviceid.png"
                                            alt="How to get Device ID from kewhats.app"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block',
                                            }}
                                        />
                                    </div>

                                    <ol style={{
                                        margin: 0,
                                        paddingLeft: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            Click <strong style={{ color: 'white' }}>"Setup N8N"</strong> on the Sidebar
                                        </li>
                                        <li style={{ color: '#d1d5db', fontSize: '14px' }}>
                                            <strong style={{ color: '#8b5cf6' }}>Copy the Device ID</strong> from the "Select Source Device" area (choose your connected device)
                                        </li>
                                    </ol>

                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(139,92,246,0.1)',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                    }}>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#c4b5fd' }}>
                                            💡 <strong>Tip:</strong> Make sure your WhatsApp device shows "Connected" status before copying the Device ID.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Language Selection - MUST be configured first */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '0' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HiOutlineTranslate style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                    Message Language
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                    Select the language for your WhatsApp notification messages. This will affect all automated alerts and reports.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    {[
                        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
                        { code: 'en', name: 'English', flag: '🇬🇧' },
                        { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
                        { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
                        { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
                        { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
                        { code: 'th', name: 'ภาษาไทย (Thai)', flag: '🇹🇭' },
                        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
                    ].map((lang) => (
                        <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, messageLanguage: lang.code })}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: formData.messageLanguage === lang.code
                                    ? '2px solid #25D366'
                                    : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: formData.messageLanguage === lang.code
                                    ? 'rgba(37,211,102,0.15)'
                                    : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{
                                    fontWeight: '500',
                                    color: formData.messageLanguage === lang.code ? '#25D366' : 'white',
                                    fontSize: '13px',
                                    margin: 0
                                }}>
                                    {lang.name}
                                </p>
                            </div>
                            {formData.messageLanguage === lang.code && (
                                <HiOutlineCheckCircle style={{
                                    width: '18px',
                                    height: '18px',
                                    color: '#25D366',
                                    marginLeft: 'auto'
                                }} />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* API Configuration */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HiOutlineKey style={{ width: '20px', height: '20px', color: '#25D366' }} />
                    API Configuration
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* API Key */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            API Key *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={formData.apiKey}
                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                placeholder="Enter your API key from kewhats.app"
                                style={{
                                    width: '100%',
                                    padding: '14px 50px 14px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '4px',
                                }}
                            >
                                {showApiKey ? <HiOutlineEyeOff style={{ width: '20px', height: '20px' }} /> : <HiOutlineEye style={{ width: '20px', height: '20px' }} />}
                            </button>
                        </div>
                    </div>

                    {/* Device ID */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            Device ID *
                        </label>
                        <input
                            type="text"
                            value={formData.deviceId}
                            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                            placeholder="e.g. device_abc123"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                            Find your Device ID in your kewhats.app dashboard
                        </p>
                    </div>

                    {/* Default Phone */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            Default Phone Number
                        </label>
                        <input
                            type="text"
                            value={formData.defaultPhone}
                            onChange={(e) => setFormData({ ...formData, defaultPhone: e.target.value })}
                            placeholder="+628123456789"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                            This will be the default recipient for reports and alerts
                        </p>
                    </div>

                    {/* Connection Status */}
                    {connectionStatus && (
                        <div style={{
                            padding: '16px',
                            borderRadius: '10px',
                            backgroundColor: connectionStatus === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${connectionStatus === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            {connectionStatus === 'success' ? (
                                <>
                                    <HiOutlineCheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
                                    <span style={{ color: '#34d399', fontSize: '14px', fontWeight: '500' }}>Connected to KeWhats API</span>
                                </>
                            ) : (
                                <>
                                    <HiOutlineExclamationCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                                    <span style={{ color: '#f87171', fontSize: '14px', fontWeight: '500' }}>Connection failed</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleTestConnection}
                            disabled={testing}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: '1px solid rgba(37,211,102,0.5)',
                                backgroundColor: 'transparent',
                                color: '#25D366',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: testing ? 'not-allowed' : 'pointer',
                                opacity: testing ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <HiOutlineRefresh style={{ width: '18px', height: '18px', animation: testing ? 'spin 1s linear infinite' : 'none' }} />
                            {testing ? 'Testing...' : 'Test Connection'}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSendTestMessage}
                            disabled={testing || !formData.defaultPhone}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: '1px solid rgba(139,92,246,0.5)',
                                backgroundColor: 'transparent',
                                color: '#8b5cf6',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: testing || !formData.defaultPhone ? 'not-allowed' : 'pointer',
                                opacity: testing || !formData.defaultPhone ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <HiOutlineDeviceMobile style={{ width: '18px', height: '18px' }} />
                            Send Test Message
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginLeft: 'auto',
                            }}
                        >
                            <HiOutlineSave style={{ width: '18px', height: '18px' }} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Info */}
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

export default WhatsAppSettings;
