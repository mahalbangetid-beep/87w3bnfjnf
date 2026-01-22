/**
 * AI Settings Page - Centralized AI Configuration
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineSparkles,
    HiOutlineKey,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineChip,
    HiOutlineLightningBolt,
    HiOutlineDocumentText,
    HiOutlinePencilAlt,
    HiOutlineGlobe
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// AI Providers
const AI_PROVIDERS = {
    openai: { name: 'OpenAI', icon: '🤖', color: '#10a37f', description: 'GPT-4, ChatGPT' },
    gemini: { name: 'Google Gemini', icon: '✨', color: '#4285f4', description: 'Gemini Pro, Flash' },
    claude: { name: 'Anthropic Claude', icon: '🧠', color: '#d4a373', description: 'Claude 3, Sonnet' },
    grok: { name: 'xAI Grok', icon: '🚀', color: '#1da1f2', description: 'Grok Beta' },
    glm: { name: 'Zhipu GLM', icon: '🔮', color: '#ff6b35', description: 'GLM-4' },
    deepseek: { name: 'DeepSeek', icon: '🔍', color: '#6366f1', description: 'DeepSeek Chat, Coder' }
};

const MODELS = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    claude: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    grok: ['grok-beta', 'grok-2-1212'],
    glm: ['glm-4', 'glm-4v', 'glm-3-turbo'],
    deepseek: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner']
};

const DEFAULT_PROMPTS = {
    analysis: 'You are an expert data analyst. Analyze the provided data and give clear, actionable insights. Be concise and focus on key findings.',
    socialMedia: 'You are a social media marketing expert. Create engaging, viral-worthy content that resonates with the target audience. Use appropriate hashtags and emojis. Keep it concise and attention-grabbing.',
    blog: 'You are a professional content writer and SEO expert. Create well-structured, engaging blog content with proper headings, subheadings, and formatting. Focus on readability and value for readers.'
};

const AISettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [message, setMessage] = useState(null);

    const [config, setConfig] = useState({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o-mini',
        promptAnalysis: DEFAULT_PROMPTS.analysis,
        promptSocialMedia: DEFAULT_PROMPTS.socialMedia,
        promptBlog: DEFAULT_PROMPTS.blog
    });

    const [existingConfig, setExistingConfig] = useState(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('workspace_token')}`
    });

    // Fetch existing config
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/aiconfig`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setExistingConfig(data);
                if (data.exists) {
                    setConfig({
                        provider: data.provider || 'openai',
                        apiKey: '',
                        model: data.model || MODELS[data.provider]?.[0] || '',
                        promptAnalysis: data.promptAnalysis || DEFAULT_PROMPTS.analysis,
                        promptSocialMedia: data.promptSocialMedia || DEFAULT_PROMPTS.socialMedia,
                        promptBlog: data.promptBlog || DEFAULT_PROMPTS.blog
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch AI config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (provider) => {
        setConfig(prev => ({
            ...prev,
            provider,
            model: MODELS[provider]?.[0] || '',
            apiKey: '' // Clear API key when switching provider
        }));
        setTestResult(null);
    };

    const handleSave = async () => {
        if (!config.apiKey && !existingConfig?.apiKeySet) {
            setMessage({ type: 'error', text: 'Please enter your API key' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const payload = {
                provider: config.provider,
                model: config.model,
                promptAnalysis: config.promptAnalysis,
                promptSocialMedia: config.promptSocialMedia,
                promptBlog: config.promptBlog
            };

            // Only include API key if it's being updated
            if (config.apiKey) {
                payload.apiKey = config.apiKey;
            }

            const response = await fetch(`${API_BASE}/aiconfig`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'AI configuration saved successfully!' });
                setExistingConfig({ ...existingConfig, ...data.config, exists: true, apiKeySet: true });
                setConfig(prev => ({ ...prev, apiKey: '' })); // Clear the API key input
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save configuration' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(`${API_BASE}/aiconfig/test`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                setTestResult({ success: true, message: data.message, response: data.response });
            } else {
                setTestResult({ success: false, error: data.error });
            }
        } catch (error) {
            setTestResult({ success: false, error: 'Connection test failed' });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your AI configuration? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/aiconfig`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setExistingConfig({ exists: false });
                setConfig({
                    provider: 'openai',
                    apiKey: '',
                    model: 'gpt-4o-mini',
                    promptAnalysis: DEFAULT_PROMPTS.analysis,
                    promptSocialMedia: DEFAULT_PROMPTS.socialMedia,
                    promptBlog: DEFAULT_PROMPTS.blog
                });
                setMessage({ type: 'success', text: 'AI configuration deleted' });
                setTestResult(null);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete configuration' });
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#9ca3af' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <HiOutlineSparkles style={{ width: '32px', height: '32px' }} />
                </motion.div>
            </div>
        );
    }

    return (
        <SettingsLayout>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            🤖 AI Configuration
                        </span>
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                        Configure your AI provider settings. This configuration will be used across all AI features in Workspace.
                    </p>
                </motion.div>

                {/* Status Badge */}
                {existingConfig?.exists && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `4px solid ${existingConfig.apiKeySet ? '#10b981' : '#f59e0b'}` }}>
                        {existingConfig.apiKeySet ? (
                            <>
                                <HiOutlineCheck style={{ color: '#10b981', width: '24px', height: '24px' }} />
                                <div>
                                    <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>AI is configured</p>
                                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
                                        Provider: {AI_PROVIDERS[existingConfig.provider]?.name} • Model: {existingConfig.model} • Key: {existingConfig.apiKeyMasked}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <HiOutlineExclamation style={{ color: '#f59e0b', width: '24px', height: '24px' }} />
                                <div>
                                    <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>API Key not set</p>
                                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Enter your API key to enable AI features</p>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: message.type === 'success' ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {message.type === 'success' ? <HiOutlineCheck /> : <HiOutlineExclamation />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Provider Selection */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineChip style={{ color: '#8b5cf6' }} /> Select AI Provider
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                        {Object.entries(AI_PROVIDERS).map(([id, provider]) => (
                            <motion.button
                                key={id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleProviderChange(id)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: config.provider === id ? `2px solid ${provider.color}` : '2px solid rgba(255,255,255,0.1)',
                                    backgroundColor: config.provider === id ? `${provider.color}20` : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{provider.icon}</div>
                                <div style={{ color: config.provider === id ? 'white' : '#9ca3af', fontWeight: '500', fontSize: '13px' }}>{provider.name}</div>
                                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>{provider.description}</div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* API Key & Model */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineKey style={{ color: '#10b981' }} /> API Key & Model
                    </h3>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {/* API Key */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                API Key {existingConfig?.apiKeySet && <span style={{ color: '#10b981' }}>(Already set: {existingConfig.apiKeyMasked})</span>}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={config.apiKey}
                                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                    placeholder={existingConfig?.apiKeySet ? 'Enter new key to update...' : 'Enter your API key...'}
                                    style={{ width: '100%', padding: '12px 48px 12px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                                >
                                    {showApiKey ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Model</label>
                            <select
                                value={config.model}
                                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                            >
                                {MODELS[config.provider]?.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Test Connection Button */}
                    {existingConfig?.apiKeySet && (
                        <div style={{ marginTop: '16px' }}>
                            <button
                                onClick={handleTest}
                                disabled={testing}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.3)', backgroundColor: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: testing ? 'not-allowed' : 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {testing ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><HiOutlineRefresh /></motion.div> : <HiOutlineLightningBolt />}
                                {testing ? 'Testing...' : 'Test Connection'}
                            </button>

                            {/* Test Result */}
                            <AnimatePresence>
                                {testResult && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${testResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                        <p style={{ color: testResult.success ? '#34d399' : '#f87171', margin: 0, fontSize: '13px' }}>
                                            {testResult.success ? `✅ ${testResult.message}` : `❌ ${testResult.error}`}
                                        </p>
                                        {testResult.response && (
                                            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0', fontStyle: 'italic' }}>Response: "{testResult.response}"</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Custom Prompts */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineDocumentText style={{ color: '#f59e0b' }} /> Custom System Prompts
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
                        Customize how AI responds for different use cases. These prompts will be used as system instructions.
                    </p>

                    {/* Analysis Prompt */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            <span style={{ fontSize: '16px' }}>📊</span> Analysis Prompt
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>(Used for data analysis across all modules)</span>
                        </label>
                        <textarea
                            value={config.promptAnalysis}
                            onChange={(e) => setConfig(prev => ({ ...prev, promptAnalysis: e.target.value }))}
                            rows={3}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    {/* Social Media Prompt */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            <HiOutlinePencilAlt style={{ color: '#ec4899' }} /> Social Media Prompt
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>(Used for enhancing social media posts)</span>
                        </label>
                        <textarea
                            value={config.promptSocialMedia}
                            onChange={(e) => setConfig(prev => ({ ...prev, promptSocialMedia: e.target.value }))}
                            rows={3}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    {/* Blog Prompt */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            <HiOutlineGlobe style={{ color: '#06b6d4' }} /> Blog Prompt
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>(Used for enhancing blog/web posts)</span>
                        </label>
                        <textarea
                            value={config.promptBlog}
                            onChange={(e) => setConfig(prev => ({ ...prev, promptBlog: e.target.value }))}
                            rows={3}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                    {existingConfig?.exists && (
                        <button
                            onClick={handleDelete}
                            style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <HiOutlineTrash /> Delete Configuration
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-glow"
                        style={{ padding: '12px 32px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><HiOutlineRefresh /></motion.div> : <HiOutlineCheck />}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </motion.div>
            </div>
        </SettingsLayout>
    );
};

export default AISettings;
