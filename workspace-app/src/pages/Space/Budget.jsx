import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
} from 'react-icons/hi';
import { projectPlansAPI, spaceAPI } from '../../services/api';

const categoryConfig = {
    development: { label: 'Development', color: '#8b5cf6', icon: '💻' },
    hosting: { label: 'Hosting', color: '#06b6d4', icon: '☁️' },
    marketing: { label: 'Marketing', color: '#ec4899', icon: '📣' },
    tools: { label: 'Tools/Software', color: '#f59e0b', icon: '🛠️' },
    design: { label: 'Design', color: '#10b981', icon: '🎨' },
    domain: { label: 'Domain', color: '#6366f1', icon: '🌐' },
    other: { label: 'Other', color: '#6b7280', icon: '📦' },
};

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const SpaceBudget = () => {
    const { t } = useTranslation();
    const [budgets, setBudgets] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [filterProject, setFilterProject] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        spent: '',
        category: 'development',
        type: 'expense', // expense or income
        projectId: null,
        notes: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsData, budgetsData] = await Promise.all([
                projectPlansAPI.getAll(),
                spaceAPI.getBudgets(),
            ]);
            setProjects(projectsData || []);
            setBudgets(budgetsData || []);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load budgets'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Confirm delete state
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Filter budgets
    const filteredBudgets = budgets.filter(budget => {
        const matchProject = filterProject === 'all' || budget.projectId === parseInt(filterProject);
        const matchCategory = filterCategory === 'all' || budget.category === filterCategory;
        return matchProject && matchCategory;
    });

    // Calculate stats
    const stats = {
        totalBudget: budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
        totalSpent: budgets.reduce((sum, b) => sum + (parseFloat(b.spent) || 0), 0),
        remaining: budgets.reduce((sum, b) => sum + ((parseFloat(b.amount) || 0) - (parseFloat(b.spent) || 0)), 0),
        byCategory: Object.keys(categoryConfig).reduce((acc, cat) => {
            acc[cat] = budgets.filter(b => b.category === cat).reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
            return acc;
        }, {}),
    };

    const utilizationRate = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Please enter a budget name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingBudget) {
                const updated = await spaceAPI.updateBudget(editingBudget.id, formData);
                setBudgets(budgets.map(b => b.id === editingBudget.id ? updated : b));
            } else {
                const created = await spaceAPI.createBudget(formData);
                setBudgets([created, ...budgets]);
            }
            setShowModal(false);
            setEditingBudget(null);
            setFormData({ name: '', amount: '', spent: '', category: 'development', type: 'expense', projectId: null, notes: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setFormData({
            name: budget.name,
            amount: budget.amount,
            spent: budget.spent || 0,
            category: budget.category,
            type: budget.type || 'expense',
            projectId: budget.projectId,
            notes: budget.notes || '',
            date: budget.date || new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    // Handle delete
    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await spaceAPI.deleteBudget(confirmDelete);
            setBudgets(budgets.filter(b => b.id !== confirmDelete));
            setConfirmDelete(null);
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to delete budget');
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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading budgets...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.budget.title', 'Space Budget')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.budget.subtitle', 'Allocate and track budgets for your projects')}</p>
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
                        onClick={() => { setEditingBudget(null); setFormData({ name: '', amount: '', spent: '', category: 'development', type: 'expense', projectId: null, notes: '', date: new Date().toISOString().split('T')[0] }); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Budget
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
                    { label: 'Total Budget', value: formatRupiah(stats.totalBudget), color: '#8b5cf6', icon: HiOutlineCurrencyDollar },
                    { label: 'Total Spent', value: formatRupiah(stats.totalSpent), color: '#ef4444', icon: HiOutlineTrendingDown },
                    { label: 'Remaining', value: formatRupiah(stats.remaining), color: '#10b981', icon: HiOutlineTrendingUp },
                    { label: 'Utilization', value: `${Math.round(utilizationRate)}%`, color: '#f59e0b', icon: HiOutlineCurrencyDollar },
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
                                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>{stat.label}</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon style={{ width: '20px', height: '20px', color: stat.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Budget by Category */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 16px 0' }}>Budget by Category</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
                        <div key={key} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>{icon}</span>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>{formatRupiah(stats.byCategory[key] || 0)}</p>
                                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Categories</option>
                    {Object.entries(categoryConfig).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Budget List */}
            {filteredBudgets.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <HiOutlineCurrencyDollar style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No budgets yet</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Start allocating budgets for your projects!</p>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowModal(true)} className="btn-glow" style={{ fontSize: '14px' }}>
                        Add Budget
                    </motion.button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredBudgets.map((budget, index) => {
                        const category = categoryConfig[budget.category] || categoryConfig.other;
                        const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                        const isOverBudget = budget.spent > budget.amount;

                        return (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '24px' }}>{category.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>{budget.name}</h3>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => handleEdit(budget)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                                    <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                                </button>
                                                <button onClick={() => setConfirmDelete(budget.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                                    <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', backgroundColor: `${category.color}20`, color: category.color }}>
                                                {category.label}
                                            </span>
                                            {getProjectName(budget.projectId) && (
                                                <span style={{ fontSize: '11px', color: '#6b7280' }}>• {getProjectName(budget.projectId)}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '18px', fontWeight: '700', color: isOverBudget ? '#ef4444' : '#10b981' }}>
                                                {formatRupiah(budget.spent)}
                                            </span>
                                            <span style={{ fontSize: '14px', color: '#6b7280' }}>/ {formatRupiah(budget.amount)}</span>
                                        </div>
                                        <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                                transition={{ duration: 0.5 }}
                                                style={{ height: '100%', backgroundColor: isOverBudget ? '#ef4444' : category.color, borderRadius: '10px' }}
                                            />
                                        </div>
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
                            style={{ width: '100%', maxWidth: '500px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingBudget ? 'Edit Budget' : 'Add Budget'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Budget name... (e.g., Hosting VPS)"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Budget Amount (Rp)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="1000000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Spent Amount (Rp)</label>
                                        <input
                                            type="number"
                                            value={formData.spent}
                                            onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                                            placeholder="0"
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
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Notes (optional)..."
                                    rows={2}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingBudget ? 'Update' : 'Add Budget'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}
                        onClick={() => setConfirmDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{t('common.confirmDelete', 'Delete Budget?')}</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>{t('space.budget.deleteWarning', 'This action cannot be undone.')}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                                    {t('common.delete', 'Delete')}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 767px) {
                    div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default SpaceBudget;
