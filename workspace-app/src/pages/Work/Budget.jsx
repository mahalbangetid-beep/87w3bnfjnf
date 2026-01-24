import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineExclamation,
    HiOutlineTrendingDown,
    HiOutlineChartBar,
    HiOutlineRefresh,
} from 'react-icons/hi';
import { budgetsAPI, projectsAPI } from '../../services/api';

const expenseCategories = [
    { id: 'software', name: 'Software & Tools', color: '#8b5cf6' },
    { id: 'hardware', name: 'Hardware', color: '#06b6d4' },
    { id: 'service', name: 'Services', color: '#ec4899' },
    { id: 'marketing', name: 'Marketing', color: '#f59e0b' },
    { id: 'operations', name: 'Operations', color: '#10b981' },
    { id: 'other', name: 'Other', color: '#6b7280' },
];

// Format currency to Rupiah
const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const Budget = () => {
    const { t, i18n } = useTranslation();
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filterProject, setFilterProject] = useState('all');
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: null, id: null });
    const [error, setError] = useState('');

    // Helper to set error with auto-clear timeout
    const setErrorWithTimeout = (message, timeout = 5000) => {
        setError(message);
        setTimeout(() => setError(''), timeout);
    };

    // Form states
    const [budgetForm, setBudgetForm] = useState({
        projectId: '',
        amount: '',
        description: '',
    });

    const [expenseForm, setExpenseForm] = useState({
        projectId: '',
        category: 'software',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [budgetsData, expensesData, projectsData] = await Promise.all([
                budgetsAPI.getAll(),
                budgetsAPI.getExpenses(),
                projectsAPI.getAll().catch(() => []),
            ]);
            setBudgets(budgetsData || []);
            setExpenses(expensesData || []);
            setProjects(projectsData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setErrorWithTimeout('Failed to load budget data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate totals
    const stats = useMemo(() => {
        const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const remaining = totalBudget - totalExpenses;
        const percentUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

        return { totalBudget, totalExpenses, remaining, percentUsed };
    }, [budgets, expenses]);

    // Per-project stats
    const projectStats = useMemo(() => {
        return projects.map((project) => {
            const budget = budgets.find((b) => b.projectId === project.id);
            const projectExpenses = expenses.filter((e) => e.projectId === project.id);
            const totalSpent = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const budgetAmount = budget?.amount || 0;
            const remaining = budgetAmount - totalSpent;
            const percentUsed = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
            const isOverBudget = remaining < 0;
            const isNearLimit = percentUsed >= 80 && !isOverBudget;

            return {
                ...project,
                budgetAmount,
                totalSpent,
                remaining,
                percentUsed,
                isOverBudget,
                isNearLimit,
                hasBudget: !!budget,
                budgetId: budget?.id,
            };
        });
    }, [projects, budgets, expenses]);

    // Filtered expenses
    const filteredExpenses = useMemo(() => {
        return filterProject === 'all'
            ? expenses
            : expenses.filter((e) => e.projectId === parseInt(filterProject));
    }, [expenses, filterProject]);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        return expenseCategories.map((cat) => {
            const catExpenses = expenses.filter((e) => e.category === cat.id);
            const total = catExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const percent = stats.totalExpenses > 0 ? (total / stats.totalExpenses) * 100 : 0;
            return { ...cat, total, percent };
        }).filter((c) => c.total > 0);
    }, [expenses, stats.totalExpenses]);

    // Budget CRUD
    const handleSaveBudget = async () => {
        if (!budgetForm.projectId || !budgetForm.amount) {
            setErrorWithTimeout('Please select a project and enter an amount');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = {
                projectId: parseInt(budgetForm.projectId),
                amount: parseFloat(budgetForm.amount),
                description: budgetForm.description,
            };

            if (editingBudget) {
                const updated = await budgetsAPI.update(editingBudget.id, data);
                setBudgets(budgets.map((b) => (b.id === editingBudget.id ? updated : b)));
            } else {
                // Check if project already has budget
                if (budgets.find((b) => b.projectId === parseInt(budgetForm.projectId))) {
                    setErrorWithTimeout('This project already has a budget. Edit the existing one instead.');
                    setSaving(false);
                    return;
                }
                const created = await budgetsAPI.create(data);
                setBudgets([...budgets, created]);
            }

            setShowBudgetModal(false);
            setEditingBudget(null);
            setBudgetForm({ projectId: '', amount: '', description: '' });
        } catch (err) {
            console.error('Error saving budget:', err);
            setErrorWithTimeout(err.message || 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setBudgetForm({
            projectId: budget.projectId.toString(),
            amount: budget.amount.toString(),
            description: budget.description || '',
        });
        setShowBudgetModal(true);
    };

    const handleDeleteBudget = async (budgetId) => {
        setConfirmDelete({ show: true, type: 'budget', id: budgetId });
    };

    const handleConfirmDelete = async () => {
        const { type, id } = confirmDelete;
        try {
            if (type === 'budget') {
                await budgetsAPI.delete(id);
                setBudgets(budgets.filter((b) => b.id !== id));
            } else if (type === 'expense') {
                await budgetsAPI.deleteExpense(id);
                setExpenses(expenses.filter((e) => e.id !== id));
            }
        } catch (err) {
            console.error('Error deleting:', err);
            setErrorWithTimeout('Failed to delete item');
        } finally {
            setConfirmDelete({ show: false, type: null, id: null });
        }
    };

    // Expense CRUD
    const handleSaveExpense = async () => {
        if (!expenseForm.projectId || !expenseForm.amount || !expenseForm.description) {
            setErrorWithTimeout('Please fill all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = {
                projectId: parseInt(expenseForm.projectId),
                category: expenseForm.category,
                amount: parseFloat(expenseForm.amount),
                description: expenseForm.description,
                date: expenseForm.date,
            };

            if (editingExpense) {
                const updated = await budgetsAPI.updateExpense(editingExpense.id, data);
                setExpenses(expenses.map((e) => (e.id === editingExpense.id ? updated : e)));
            } else {
                const created = await budgetsAPI.createExpense(data);
                setExpenses([created, ...expenses]);
            }

            setShowExpenseModal(false);
            setEditingExpense(null);
            setExpenseForm({ projectId: '', category: 'software', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            console.error('Error saving expense:', err);
            setErrorWithTimeout(err.message || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setExpenseForm({
            projectId: expense.projectId.toString(),
            category: expense.category,
            amount: expense.amount.toString(),
            description: expense.description,
            date: expense.date,
        });
        setShowExpenseModal(true);
    };

    const handleDeleteExpense = async (expenseId) => {
        setConfirmDelete({ show: true, type: 'expense', id: expenseId });
    };

    // Get project by ID
    const getProject = (projectId) => projects.find((p) => p.id === projectId);

    // Loading state
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid rgba(139,92,246,0.3)',
                    borderTopColor: '#8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading budget data...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.budget.title', 'Budget')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.budget.subtitle', 'Track and manage project budgets and expenses')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        aria-label="Refresh budget data"
                        title="Refresh budget data"
                        style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: '#9ca3af',
                            cursor: 'pointer',
                        }}
                    >
                        <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                            setEditingBudget(null);
                            setBudgetForm({ projectId: '', amount: '', description: '' });
                            setShowBudgetModal(true);
                        }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(16,185,129,0.3)',
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            color: '#34d399',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <HiOutlineChartBar style={{ width: '18px', height: '18px' }} />
                        Set Budget
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingExpense(null);
                            setExpenseForm({ projectId: '', category: 'software', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                            setShowExpenseModal(true);
                        }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Expense
                    </motion.button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                }}>
                    <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Total Budget */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Total Budget</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineChartBar style={{ width: '18px', height: '18px', color: '#34d399' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#34d399', margin: 0 }}>{formatRupiah(stats.totalBudget)}</p>
                </motion.div>

                {/* Total Spent */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Total Spent</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineTrendingDown style={{ width: '18px', height: '18px', color: '#f87171' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#f87171', margin: 0 }}>{formatRupiah(stats.totalExpenses)}</p>
                </motion.div>

                {/* Remaining */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Remaining</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: stats.remaining >= 0 ? 'rgba(6,182,212,0.2)' : 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCurrencyDollar style={{ width: '18px', height: '18px', color: stats.remaining >= 0 ? '#06b6d4' : '#f87171' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: stats.remaining >= 0 ? '#06b6d4' : '#f87171', margin: 0 }}>{formatRupiah(Math.abs(stats.remaining))}</p>
                    {stats.remaining < 0 && <p style={{ fontSize: '11px', color: '#f87171', margin: '4px 0 0 0' }}>Over budget!</p>}
                </motion.div>

                {/* Usage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Budget Used</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: stats.percentUsed > 100 ? '#f87171' : stats.percentUsed > 80 ? '#fb923c' : '#34d399' }}>
                            {stats.percentUsed.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
                            transition={{ duration: 1 }}
                            style={{
                                height: '100%',
                                background: stats.percentUsed > 100 ? '#ef4444' : stats.percentUsed > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                                borderRadius: '10px',
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Alert for over-budget projects */}
            {projectStats.some((p) => p.isOverBudget || p.isNearLimit) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <HiOutlineExclamation style={{ width: '24px', height: '24px', color: '#fb923c', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontWeight: '600', color: '#fb923c', fontSize: '14px', margin: 0 }}>Budget Alert</p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                            {projectStats.filter((p) => p.isOverBudget).length} project(s) over budget,{' '}
                            {projectStats.filter((p) => p.isNearLimit).length} project(s) near limit (80%+)
                        </p>
                    </div>
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Project Budgets - Planning vs Actual */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Planning vs Actual</h2>
                    {projectStats.filter((p) => p.hasBudget).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>No budgets set. Set a budget for a project to track spending.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {projectStats.filter((p) => p.hasBudget).map((project) => (
                                <div key={project.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: project.color || '#8b5cf6' }} />
                                            <span style={{ fontWeight: '500', color: 'white', fontSize: '14px' }}>{project.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {project.isOverBudget && (
                                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>Over</span>
                                            )}
                                            {project.isNearLimit && (
                                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>Near Limit</span>
                                            )}
                                            <button
                                                onClick={() => handleEditBudget(budgets.find((b) => b.projectId === project.id))}
                                                style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}
                                            >
                                                <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                                        <span>Spent: {formatRupiah(project.totalSpent)}</span>
                                        <span>Budget: {formatRupiah(project.budgetAmount)}</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(project.percentUsed, 100)}%` }}
                                            transition={{ duration: 0.8 }}
                                            style={{
                                                height: '100%',
                                                backgroundColor: project.isOverBudget ? '#ef4444' : project.isNearLimit ? '#f59e0b' : project.color || '#8b5cf6',
                                                borderRadius: '10px',
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '11px', color: project.remaining >= 0 ? '#9ca3af' : '#f87171', marginTop: '6px' }}>
                                        {project.remaining >= 0 ? `${formatRupiah(project.remaining)} remaining` : `${formatRupiah(Math.abs(project.remaining))} over budget`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Expense Breakdown</h2>
                    {categoryBreakdown.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>No expenses recorded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {categoryBreakdown.map((cat) => (
                                <div key={cat.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                        <span style={{ color: '#d1d5db' }}>{cat.name}</span>
                                        <span style={{ color: '#9ca3af' }}>{formatRupiah(cat.total)} ({cat.percent.toFixed(1)}%)</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.percent}%` }}
                                            transition={{ duration: 0.8 }}
                                            style={{ height: '100%', backgroundColor: cat.color, borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Expenses */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>Expense History</h2>
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {filteredExpenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No expenses recorded. Add an expense to start tracking.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredExpenses.slice(0, 10).map((expense) => {
                            const project = getProject(expense.projectId);
                            const category = expenseCategories.find((c) => c.id === expense.category);

                            return (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${category?.color || '#6b7280'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <HiOutlineCurrencyDollar style={{ width: '20px', height: '20px', color: category?.color || '#6b7280' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: 0 }}>{expense.description}</p>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                                {project?.name || 'Unknown Project'} • {category?.name} • {expense.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#f87171' }}>-{formatRupiah(expense.amount)}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => handleEditExpense(expense)}
                                                style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}
                                            >
                                                <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer' }}
                                            >
                                                <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Budget Modal */}
            <AnimatePresence>
                {showBudgetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingBudget ? 'Edit Budget' : 'Set Budget'}</h2>
                                <button onClick={() => setShowBudgetModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Project *</label>
                                    <select
                                        value={budgetForm.projectId}
                                        onChange={(e) => setBudgetForm({ ...budgetForm, projectId: e.target.value })}
                                        disabled={!!editingBudget}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: editingBudget ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">Select project</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Budget Amount (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={budgetForm.amount}
                                        onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                                        placeholder="10000000"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Description (optional)</label>
                                    <input
                                        type="text"
                                        value={budgetForm.description}
                                        onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                                        placeholder="Operational budget for Q1"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowBudgetModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveBudget}
                                        disabled={saving}
                                        className="btn-glow"
                                        style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'Saving...' : editingBudget ? 'Update' : 'Set Budget'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expense Modal */}
            <AnimatePresence>
                {showExpenseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
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
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                                <button onClick={() => setShowExpenseModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Project *</label>
                                        <select
                                            value={expenseForm.projectId}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, projectId: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="">Select project</option>
                                            {projects.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Category *</label>
                                        <select
                                            value={expenseForm.category}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {expenseCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Description *</label>
                                    <input
                                        type="text"
                                        value={expenseForm.description}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        placeholder="e.g. Adobe Creative Cloud subscription"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Amount (Rp) *</label>
                                        <input
                                            type="number"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            placeholder="250000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Date *</label>
                                        <input
                                            type="date"
                                            value={expenseForm.date}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveExpense}
                                        disabled={saving}
                                        className="btn-glow"
                                        style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'Saving...' : editingExpense ? 'Update' : 'Add Expense'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {confirmDelete.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#f87171' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                                Delete {confirmDelete.type === 'budget' ? 'Budget' : 'Expense'}?
                            </h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                                This action cannot be undone. Are you sure you want to delete this {confirmDelete.type}?
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setConfirmDelete({ show: false, type: null, id: null })}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleConfirmDelete}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Budget;
