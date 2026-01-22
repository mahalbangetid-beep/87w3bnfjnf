import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineTrendingUp,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCurrencyDollar,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineCalendar,
} from 'react-icons/hi';
import { projectPlansAPI, spaceAPI } from '../../services/api';

const transactionTypes = {
    income: { label: 'Income', color: '#10b981', icon: HiOutlineArrowUp },
    expense: { label: 'Expense', color: '#ef4444', icon: HiOutlineArrowDown },
};

const categoryConfig = {
    sales: { label: 'Sales', color: '#10b981', icon: '💰' },
    subscription: { label: 'Subscription', color: '#8b5cf6', icon: '📦' },
    service: { label: 'Service', color: '#06b6d4', icon: '⚙️' },
    affiliate: { label: 'Affiliate', color: '#f59e0b', icon: '🔗' },
    hosting: { label: 'Hosting', color: '#ef4444', icon: '☁️' },
    marketing: { label: 'Marketing', color: '#ec4899', icon: '📣' },
    tools: { label: 'Tools', color: '#6366f1', icon: '🛠️' },
    other: { label: 'Other', color: '#6b7280', icon: '📋' },
};

const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const SpaceFinance = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterProject, setFilterProject] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        type: 'income',
        category: 'sales',
        projectId: null,
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Generate month options
    const getMonthOptions = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            });
        }
        return months;
    };

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsData, transactionsData] = await Promise.all([
                projectPlansAPI.getAll(),
                spaceAPI.getTransactions(),
            ]);
            // Filter only launched projects
            setProjects((projectsData || []).filter(p => p.status === 'launched'));
            setTransactions(transactionsData || []);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load transactions'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Confirm delete state
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const matchType = filterType === 'all' || t.type === filterType;
        const matchProject = filterProject === 'all' || t.projectId === parseInt(filterProject);
        const matchMonth = filterMonth === 'all' || (t.date && t.date.startsWith(filterMonth));
        return matchType && matchProject && matchMonth;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate stats
    const currentMonthTransactions = transactions.filter(t => {
        const now = new Date();
        return t.date && t.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    });

    const stats = {
        totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        monthlyIncome: currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        monthlyExpense: currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    };

    stats.netProfit = stats.totalIncome - stats.totalExpense;
    stats.monthlyProfit = stats.monthlyIncome - stats.monthlyExpense;

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Please enter a description');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingTransaction) {
                const updated = await spaceAPI.updateTransaction(editingTransaction.id, formData);
                setTransactions(transactions.map(t => t.id === editingTransaction.id ? updated : t));
            } else {
                const created = await spaceAPI.createTransaction(formData);
                setTransactions([created, ...transactions]);
            }
            setShowModal(false);
            setEditingTransaction(null);
            setFormData({ name: '', amount: '', type: 'income', category: 'sales', projectId: null, date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to save transaction');
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            name: transaction.name,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            projectId: transaction.projectId,
            date: transaction.date,
            notes: transaction.notes || '',
        });
        setShowModal(true);
    };

    // Handle delete
    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await spaceAPI.deleteTransaction(confirmDelete);
            setTransactions(transactions.filter(t => t.id !== confirmDelete));
            setConfirmDelete(null);
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to delete transaction');
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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading finance...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.finance.title', 'Space Finance')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.finance.subtitle', 'Track income and expenses from your launched projects')}</p>
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
                        onClick={() => { setEditingTransaction(null); setFormData({ name: '', amount: '', type: 'income', category: 'sales', projectId: null, date: new Date().toISOString().split('T')[0], notes: '' }); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Transaction
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Total Stats */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>All Time</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Income</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>{formatRupiah(stats.totalIncome)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Expense</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>{formatRupiah(stats.totalExpense)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Net Profit</span>
                            <span style={{ fontSize: '20px', fontWeight: '700', color: stats.netProfit >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(stats.netProfit)}</span>
                        </div>
                    </div>
                </div>

                {/* Monthly Stats */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Income</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>{formatRupiah(stats.monthlyIncome)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Expense</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>{formatRupiah(stats.monthlyExpense)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Profit</span>
                            <span style={{ fontSize: '20px', fontWeight: '700', color: stats.monthlyProfit >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(stats.monthlyProfit)}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overview</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Transactions</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{transactions.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Launched Projects</span>
                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#8b5cf6' }}>{projects.length}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Profit Margin</span>
                            <span style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                                {stats.totalIncome > 0 ? `${Math.round((stats.netProfit / stats.totalIncome) * 100)}%` : '0%'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
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
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Time</option>
                    {getMonthOptions().map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <HiOutlineTrendingUp style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No transactions yet</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Start tracking income from your launched projects!</p>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowModal(true)} className="btn-glow" style={{ fontSize: '14px' }}>
                        Add Transaction
                    </motion.button>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {filteredTransactions.map((transaction, index) => {
                        const typeInfo = transactionTypes[transaction.type];
                        const category = categoryConfig[transaction.category] || categoryConfig.other;
                        const IconComponent = typeInfo.icon;

                        return (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: index < filteredTransactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${typeInfo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconComponent style={{ width: '20px', height: '20px', color: typeInfo.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: '0 0 4px 0' }}>{transaction.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{transaction.date}</span>
                                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', backgroundColor: `${category.color}20`, color: category.color }}>
                                            {category.icon} {category.label}
                                        </span>
                                        {getProjectName(transaction.projectId) && (
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>• {getProjectName(transaction.projectId)}</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '16px', fontWeight: '600', color: typeInfo.color, margin: 0 }}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => handleEdit(transaction)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                        <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                    </button>
                                    <button onClick={() => setConfirmDelete(transaction.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                    </button>
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
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Type Toggle */}
                                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
                                    {Object.entries(transactionTypes).map(([key, { label, color }]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: key })}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: formData.type === key ? `${color}20` : 'transparent',
                                                color: formData.type === key ? color : '#6b7280',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Description..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Amount (Rp)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="1000000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
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
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Project</label>
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
                                        {saving ? 'Saving...' : editingTransaction ? 'Update' : 'Add Transaction'}
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{t('common.confirmDelete', 'Delete Transaction?')}</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>{t('space.finance.deleteWarning', 'This action cannot be undone.')}</p>
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
                    div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; }
                    div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 767px) {
                    div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default SpaceFinance;
