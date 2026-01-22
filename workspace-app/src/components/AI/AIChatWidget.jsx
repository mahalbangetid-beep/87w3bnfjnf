/**
 * AI Chat Floating Widget
 * Floating chat button with AI assistant interface
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineSparkles,
    HiOutlineX,
    HiOutlinePaperAirplane,
    HiOutlineCog,
    HiOutlineChartBar,
    HiOutlineLightBulb,
    HiOutlineRefresh,
    HiOutlineTrash
} from 'react-icons/hi';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

// Helper to detect current module from URL path
const getCurrentModule = () => {
    const path = window.location.pathname.toLowerCase();
    // Check Space FIRST (important: space paths may include 'projects-plan')
    if (path.includes('/space') || path.includes('/project-plan') || path.includes('/projects-plan') || path.includes('/roadmap') || path.includes('/targeting')) return 'space';
    // Then check other modules
    if (path.includes('/work') || path.includes('/work/projects') || path.includes('/tasks')) return 'work';
    if (path.includes('/finance') || path.includes('/budget') || path.includes('/bills') || path.includes('/income') || path.includes('/expense')) return 'finance';
    if (path.includes('/social') || path.includes('/blog') || path.includes('/posting')) return 'social';
    if (path.includes('/dashboard')) return 'dashboard';
    return 'dashboard'; // default
};

const AIChatWidget = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState('gemini');
    const [showSettings, setShowSettings] = useState(false);
    const [providers, setProviders] = useState({});
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 300);
        }
    }, [isOpen]);

    // Fetch available providers
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const token = localStorage.getItem('workspace_token');
                const response = await fetch(`${API_BASE}/ai/providers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProviders(data.providers || {});
                    if (data.defaultProvider) {
                        setProvider(data.defaultProvider);
                    }
                }
            } catch (error) {
                console.error('Error fetching providers:', error);
            }
        };
        fetchProviders();
    }, []);

    // Send message
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('workspace_token');
            const currentModule = getCurrentModule();
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: newMessages,
                    provider,
                    module: currentModule,
                    locale: i18n.language
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: data.content,
                    provider: data.provider
                }]);
            } else {
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: `❌ Error: ${data.error || 'Gagal mendapatkan respons'}`,
                    isError: true
                }]);
            }
        } catch (error) {
            setMessages([...newMessages, {
                role: 'assistant',
                content: t('ai.connectionError', '❌ Cannot connect to server.'),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic quick actions based on current module
    const getQuickActions = () => {
        const currentModule = getCurrentModule();

        const moduleActions = {
            work: [
                { icon: HiOutlineChartBar, label: t('ai.actions.analyzeProjects', 'Analyze Projects'), action: t('ai.prompts.analyzeProjects', 'Analyze my projects progress and give recommendations') },
                { icon: HiOutlineLightBulb, label: t('ai.actions.budgetReview', 'Budget Review'), action: t('ai.prompts.budgetReview', 'Review my budget utilization and spending patterns') },
            ],
            finance: [
                { icon: HiOutlineChartBar, label: t('ai.actions.financeAnalysis', 'Finance Analysis'), action: t('ai.prompts.financeAnalysis', 'Analyze my finances this month') },
                { icon: HiOutlineLightBulb, label: t('ai.actions.savingsTips', 'Savings Tips'), action: t('ai.prompts.savingsTips', 'Give me tips to save money based on my spending') },
            ],
            space: [
                { icon: HiOutlineLightBulb, label: t('ai.actions.ideaPriority', 'Prioritize Ideas'), action: t('ai.prompts.ideaPriority', 'Which project ideas should I prioritize?') },
                { icon: HiOutlineChartBar, label: t('ai.actions.goalProgress', 'Goal Progress'), action: t('ai.prompts.goalProgress', 'Analyze my goals progress and suggest next steps') },
            ],
            social: [
                { icon: HiOutlineLightBulb, label: t('ai.actions.postingTime', 'Best Posting Time'), action: t('ai.prompts.postingTime', 'When is the best time to post on Instagram?') },
                { icon: HiOutlineChartBar, label: t('ai.actions.contentIdeas', 'Content Ideas'), action: t('ai.prompts.contentIdeas', 'Give me content ideas for social media') },
            ],
            dashboard: [
                { icon: HiOutlineChartBar, label: t('ai.actions.overview', 'Overview'), action: t('ai.prompts.overview', 'Give me an overview of my productivity today') },
                { icon: HiOutlineLightBulb, label: t('ai.actions.priorities', 'Today\'s Priorities'), action: t('ai.prompts.priorities', 'What should I prioritize today?') },
            ]
        };

        return moduleActions[currentModule] || moduleActions.dashboard;
    };

    const quickActions = getQuickActions();

    const handleQuickAction = (action) => {
        setInput(action);
        // Use callback to ensure latest input value is used
        setTimeout(() => {
            const userMessage = { role: 'user', content: action };
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);
            setInput('');
            setIsLoading(true);

            const token = localStorage.getItem('workspace_token');
            const currentModule = getCurrentModule();
            fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messages: newMessages, provider, module: currentModule, locale: i18n.language })
            })
                .then(res => res.json())
                .then(data => {
                    setMessages([...newMessages, {
                        role: 'assistant',
                        content: data.content || data.error || t('ai.noResponse', 'No response'),
                        provider: data.provider,
                        isError: !data.content
                    }]);
                })
                .catch(() => {
                    setMessages([...newMessages, {
                        role: 'assistant',
                        content: t('ai.connectionError', '❌ Cannot connect to server.'),
                        isError: true
                    }]);
                })
                .finally(() => setIsLoading(false));
        }, 0);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                }}
                className="hide-mobile"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isOpen ? (
                        <HiOutlineX style={{ width: '24px', height: '24px', color: 'white' }} />
                    ) : (
                        <HiOutlineSparkles style={{ width: '24px', height: '24px', color: 'white' }} />
                    )}
                </motion.div>

                {/* Pulse animation */}
                {!isOpen && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        }}
                    />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '160px',
                            right: '24px',
                            width: '380px',
                            height: '500px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(17,17,27,0.98)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 998,
                        }}
                        className="hide-mobile"
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HiOutlineSparkles style={{ width: '20px', height: '20px', color: 'white' }} />
                                </motion.div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'white' }}>
                                        Workspace AI
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                        {providers[provider]?.name || provider} • Online
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={clearChat}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowSettings(!showSettings)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: showSettings ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                                        color: showSettings ? '#a78bfa' : '#9ca3af',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HiOutlineCog style={{ width: '16px', height: '16px' }} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div style={{ padding: '12px 16px' }}>
                                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
                                            AI Provider:
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {Object.entries(providers).map(([key, value]) => (
                                                <motion.button
                                                    key={key}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setProvider(key)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: provider === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                        background: provider === key ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'transparent',
                                                        color: provider === key ? 'white' : '#9ca3af',
                                                        cursor: value.configured ? 'pointer' : 'not-allowed',
                                                        opacity: value.configured ? 1 : 0.5,
                                                        fontSize: '12px',
                                                    }}
                                                    disabled={!value.configured}
                                                >
                                                    {value.name}
                                                    {!value.configured && ' ⚠️'}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 16px',
                                        }}
                                    >
                                        <HiOutlineSparkles style={{ width: '32px', height: '32px', color: '#a78bfa' }} />
                                    </motion.div>
                                    <h4 style={{ margin: '0 0 8px', color: 'white' }}>{t('ai.greeting', 'Hello! 👋')}</h4>
                                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>
                                        {t('ai.greetingSubtitle', "I'm Workspace AI, your productivity assistant.")}
                                    </p>

                                    {/* Quick Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {quickActions.map((action, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.02, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleQuickAction(action.action)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: '#9ca3af',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <action.icon style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                                                <span style={{ fontSize: '13px' }}>{action.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '10px 14px',
                                            borderRadius: msg.role === 'user'
                                                ? '14px 14px 4px 14px'
                                                : '14px 14px 14px 4px',
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                                : msg.isError
                                                    ? 'rgba(239,68,68,0.1)'
                                                    : 'rgba(255,255,255,0.05)',
                                            border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '13px',
                                                lineHeight: 1.5,
                                                color: msg.role === 'user' ? 'white' : msg.isError ? '#ef4444' : '#e5e7eb',
                                                whiteSpace: 'pre-wrap',
                                            }}>
                                                {msg.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        gap: '4px',
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '14px',
                                        width: 'fit-content',
                                    }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                                delay: i * 0.15,
                                            }}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#a78bfa',
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={t('ai.placeholder', 'Ask something...')}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!input.trim() || isLoading}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: input.trim() && !isLoading
                                            ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                                            : 'rgba(255,255,255,0.05)',
                                        cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HiOutlinePaperAirplane
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            color: input.trim() && !isLoading ? 'white' : '#6b7280',
                                            transform: 'rotate(90deg)',
                                        }}
                                    />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatWidget;
