import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineFlag,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineChartBar,
    HiOutlineTrendingUp,
    HiOutlineCheck,
    HiOutlineClock,
} from 'react-icons/hi';
import { spaceAPI, projectPlansAPI } from '../../services/api';

const categoryConfig = {
    revenue: { label: 'Revenue', color: '#10b981', icon: '💰' },
    users: { label: 'Users', color: '#8b5cf6', icon: '👥' },
    features: { label: 'Features', color: '#06b6d4', icon: '⚡' },
    performance: { label: 'Performance', color: '#f59e0b', icon: '📈' },
    marketing: { label: 'Marketing', color: '#ec4899', icon: '📣' },
    other: { label: 'Other', color: '#6b7280', icon: '🎯' },
};

const Targeting = () => {
    const { t } = useTranslation();
    const [goals, setGoals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        current: 0,
        target: 100,
        unit: 'units',
        category: 'other',
        color: '#8b5cf6',
        deadline: '',
        projectId: null,
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [goalsData, projectsData] = await Promise.all([
                spaceAPI.getGoals(),
                projectPlansAPI.getAll(),
            ]);
            setGoals(goalsData || []);
            setProjects(projectsData || []);
        } catch (err) {
            setErrorWithTimeout(t('errors.generic', 'Failed to load goals'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter goals
    const filteredGoals = selectedCategory === 'all'
        ? goals
        : goals.filter(g => g.category === selectedCategory);

    // Calculate stats
    const stats = {
        total: goals.length,
        completed: goals.filter(g => g.current >= g.target).length,
        inProgress: goals.filter(g => g.current > 0 && g.current < g.target).length,
        avgProgress: goals.length > 0
            ? Math.round(goals.reduce((sum, g) => sum + (g.target > 0 ? (g.current / g.target) * 100 : 0), 0) / goals.length)
            : 0,
    };

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Please enter a goal name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = {
                ...formData,
                current: parseFloat(formData.current) || 0,
                target: parseFloat(formData.target) || 100,
            };

            if (editingGoal) {
                const updated = await spaceAPI.updateGoal(editingGoal.id, data);
                setGoals(goals.map(g => g.id === editingGoal.id ? updated : g));
            } else {
                const created = await spaceAPI.createGoal(data);
                setGoals([created, ...goals]);
            }
            setShowModal(false);
            setEditingGoal(null);
        } catch (err) {
            setErrorWithTimeout(err.message || t('errors.generic', 'Failed to save goal'));
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            description: goal.description || '',
            current: goal.current,
            target: goal.target,
            unit: goal.unit,
            category: goal.category || 'other',
            color: goal.color,
            deadline: goal.deadline || '',
            projectId: goal.projectId,
        });
        setShowModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (confirm(t('space.confirmDeleteGoal', 'Delete this goal?'))) {
            try {
                await spaceAPI.deleteGoal(id);
                setGoals(goals.filter(g => g.id !== id));
            } catch (err) {
                setErrorWithTimeout(t('errors.generic', 'Failed to delete goal'));
            }
        }
    };

    // Update progress
    const handleProgressUpdate = async (id, newCurrent) => {
        try {
            await spaceAPI.updateGoalProgress(id, newCurrent);
            setGoals(goals.map(g => g.id === id ? { ...g, current: newCurrent } : g));
        } catch (err) {
            setErrorWithTimeout(t('errors.generic', 'Failed to update progress'));
        }
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || null;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading goals...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.targeting.title', 'Targeting')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.targeting.subtitle', 'Set and track goals for your projects')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEditingGoal(null); setFormData({ name: '', description: '', current: 0, target: 100, unit: 'units', category: 'other', color: '#8b5cf6', deadline: '', projectId: null }); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        New Goal
                    </motion.button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Total Goals', value: stats.total, color: '#8b5cf6', icon: HiOutlineFlag },
                    { label: 'Completed', value: stats.completed, color: '#10b981', icon: HiOutlineCheck },
                    { label: 'In Progress', value: stats.inProgress, color: '#f59e0b', icon: HiOutlineClock },
                    { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#06b6d4', icon: HiOutlineTrendingUp },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                        style={{ padding: '20px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>{stat.label}</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon style={{ width: '20px', height: '20px', color: stat.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setSelectedCategory('all')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: selectedCategory === 'all' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: selectedCategory === 'all' ? '#a78bfa' : '#9ca3af',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }}
                >
                    All
                </button>
                {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: selectedCategory === key ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                            color: selectedCategory === key ? '#a78bfa' : '#9ca3af',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* Goals Grid */}
            {filteredGoals.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <HiOutlineFlag style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No goals yet</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Set your first goal to start tracking progress!</p>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingGoal(null); setShowModal(true); }} className="btn-glow" style={{ fontSize: '14px' }}>
                        Create Goal
                    </motion.button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {filteredGoals.map((goal, index) => {
                        const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
                        const isCompleted = goal.current >= goal.target;
                        const category = categoryConfig[goal.category] || categoryConfig.other;

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
                            >
                                {/* Completed badge */}
                                {isCompleted && (
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <HiOutlineCheck style={{ width: '12px', height: '12px' }} /> Achieved
                                    </div>
                                )}

                                {/* Category & Project */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '20px' }}>{category.icon}</span>
                                    <span style={{ fontSize: '11px', color: category.color, backgroundColor: `${category.color}20`, padding: '3px 8px', borderRadius: '4px' }}>
                                        {category.label}
                                    </span>
                                    {getProjectName(goal.projectId) && (
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>• {getProjectName(goal.projectId)}</span>
                                    )}
                                </div>

                                {/* Goal Name */}
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{goal.name}</h3>
                                {goal.description && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>{goal.description}</p>
                                )}

                                {/* Progress */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '24px', fontWeight: '700', color: goal.color }}>{goal.current}</span>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>/ {goal.target} {goal.unit}</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8 }}
                                            style={{ height: '100%', backgroundColor: goal.color, borderRadius: '10px' }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{Math.round(progress)}%</span>
                                    </div>
                                </div>

                                {/* Quick Update */}
                                {!isCompleted && (
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        {[1, 5, 10].map(increment => (
                                            <button
                                                key={increment}
                                                onClick={() => handleProgressUpdate(goal.id, Math.min(goal.current + increment, goal.target))}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                                    color: '#9ca3af',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                +{increment}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {goal.deadline && (
                                        <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <HiOutlineClock style={{ width: '12px', height: '12px' }} />
                                            {goal.deadline}
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                        <button onClick={() => handleEdit(goal)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                            <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                        </button>
                                        <button onClick={() => handleDelete(goal.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                            <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Goal name... (e.g., Reach 1000 users)"
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description (optional)..."
                                    rows={2}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Current</label>
                                        <input
                                            type="number"
                                            value={formData.current}
                                            onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Target</label>
                                        <input
                                            type="number"
                                            value={formData.target}
                                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Unit</label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="users, $, %"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {Object.entries(categoryConfig).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Deadline</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link to Project</label>
                                    <select
                                        value={formData.projectId || ''}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value ? parseInt(e.target.value) : null })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Color</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: formData.color === color ? '2px solid white' : '2px solid transparent',
                                                    backgroundColor: color,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingGoal ? 'Update' : 'Create'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Targeting;
