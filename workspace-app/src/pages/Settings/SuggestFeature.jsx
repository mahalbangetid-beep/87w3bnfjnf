/**
 * Suggest Feature - Allow users to submit feature suggestions
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineLightBulb,
    HiOutlinePlus,
    HiOutlineCheck,
    HiOutlineTrash,
    HiOutlineSparkles,
    HiOutlineRefresh
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';
import { suggestionsAPI } from '../../services/api';

const SuggestFeature = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [showNewSuggestion, setShowNewSuggestion] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [newSuggestion, setNewSuggestion] = useState({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium'
    });

    const statusColors = {
        pending: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c' },
        reviewed: { bg: 'rgba(6,182,212,0.2)', text: '#22d3ee' },
        planned: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa' },
        implemented: { bg: 'rgba(16,185,129,0.2)', text: '#34d399' },
        declined: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const data = await suggestionsAPI.getAll();
            setSuggestions(data);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSuggestion = async () => {
        if (!newSuggestion.title.trim()) return;
        setSubmitting(true);
        try {
            await suggestionsAPI.create(newSuggestion);
            setSuccess(t('settings.suggestions.successMessage', 'Thank you! Your suggestion has been submitted to the admin.'));
            setNewSuggestion({ title: '', description: '', category: 'feature', priority: 'medium' });
            setShowNewSuggestion(false);
            fetchSuggestions();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            console.error('Failed to submit suggestion:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSuggestion = async (id) => {
        try {
            await suggestionsAPI.delete(id);
            setSuggestions(suggestions.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete suggestion:', err);
        }
    };

    if (loading) {
        return (
            <SettingsLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#9ca3af' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <HiOutlineLightBulb style={{ width: '32px', height: '32px' }} />
                    </motion.div>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="glass-card" style={{ padding: '32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <HiOutlineLightBulb style={{ color: '#f59e0b' }} />
                            {t('settings.suggestions.title', 'Suggest a Feature')}
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                            {t('settings.suggestions.subtitle', 'Help us improve by sharing your ideas and feedback.')}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNewSuggestion(true)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('settings.suggestions.newSuggestion', 'New Suggestion')}
                    </motion.button>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                marginBottom: '20px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#34d399',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <HiOutlineCheck style={{ width: '20px', height: '20px' }} />
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Suggestion Form */}
                <AnimatePresence>
                    {showNewSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                marginBottom: '24px',
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.3)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: 'white' }}>
                                {t('settings.suggestions.formTitle', 'What would you like to see?')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    placeholder={t('settings.suggestions.titlePlaceholder', 'Feature title...')}
                                    value={newSuggestion.title}
                                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, title: e.target.value }))}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <textarea
                                    placeholder={t('settings.suggestions.descPlaceholder', 'Describe your idea in detail...')}
                                    value={newSuggestion.description}
                                    rows={4}
                                    onChange={(e) => setNewSuggestion(prev => ({ ...prev, description: e.target.value }))}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <select
                                        value={newSuggestion.category}
                                        onChange={(e) => setNewSuggestion(prev => ({ ...prev, category: e.target.value }))}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="feature">{t('settings.suggestions.categoryFeature', 'New Feature')}</option>
                                        <option value="improvement">{t('settings.suggestions.categoryImprovement', 'Improvement')}</option>
                                        <option value="bug">{t('settings.suggestions.categoryBug', 'Bug Report')}</option>
                                        <option value="other">{t('settings.suggestions.categoryOther', 'Other')}</option>
                                    </select>
                                    <select
                                        value={newSuggestion.priority}
                                        onChange={(e) => setNewSuggestion(prev => ({ ...prev, priority: e.target.value }))}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="low">{t('settings.suggestions.priorityLow', 'Low Priority')}</option>
                                        <option value="medium">{t('settings.suggestions.priorityMedium', 'Medium Priority')}</option>
                                        <option value="high">{t('settings.suggestions.priorityHigh', 'High Priority')}</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowNewSuggestion(false)}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'transparent',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmitSuggestion}
                                        disabled={submitting || !newSuggestion.title.trim()}
                                        style={{
                                            padding: '10px 24px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            opacity: !newSuggestion.title.trim() ? 0.5 : 1
                                        }}
                                    >
                                        {submitting ? t('common.submitting', 'Submitting...') : t('settings.suggestions.submit', 'Submit Suggestion')}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggestions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {suggestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                            <HiOutlineSparkles style={{ width: '48px', height: '48px', opacity: 0.5, marginBottom: '16px' }} />
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                                {t('settings.suggestions.noSuggestions', 'No suggestions yet')}
                            </p>
                            <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                                {t('settings.suggestions.beFirst', 'Be the first to suggest a feature!')}
                            </p>
                        </div>
                    ) : (
                        suggestions.map((suggestion, i) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    padding: '20px',
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'white' }}>
                                                {suggestion.title}
                                            </h4>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'capitalize',
                                                background: statusColors[suggestion.status]?.bg,
                                                color: statusColors[suggestion.status]?.text
                                            }}>
                                                {suggestion.status}
                                            </span>
                                        </div>
                                        {suggestion.description && (
                                            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
                                                {suggestion.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                                            <span>📅 {new Date(suggestion.createdAt).toLocaleDateString()}</span>
                                            <span>🏷️ {suggestion.category}</span>
                                            <span>⚡ {suggestion.priority}</span>
                                        </div>
                                    </div>
                                    {suggestion.status === 'pending' && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDeleteSuggestion(suggestion.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'rgba(239,68,68,0.1)',
                                                color: '#f87171',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                        </motion.button>
                                    )}
                                </div>
                                {suggestion.adminNotes && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(6,182,212,0.1)',
                                        border: '1px solid rgba(6,182,212,0.2)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#22d3ee' }}>
                                            💬 {t('settings.suggestions.adminResponse', 'Admin Response')}: {suggestion.adminNotes}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
};

export default SuggestFeature;
