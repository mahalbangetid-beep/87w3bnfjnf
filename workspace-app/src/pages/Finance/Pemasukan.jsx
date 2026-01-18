import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineSearch, HiOutlineTrendingUp, HiOutlineFilter
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const Pemasukan = () => {
    const { t, i18n } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [filters, setFilters] = useState({ accountId: '', categoryId: '', startDate: '', endDate: '' });
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [formData, setFormData] = useState({
        accountId: '',
        categoryId: '',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [saving, setSaving] = useState(false);

    // Dynamic currency formatting
    const formatCurrency = (amount) => {
        const isID = i18n.language === 'id';
        return new Intl.NumberFormat(isID ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: isID ? 'IDR' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(isID ? amount : amount / 15000);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [filters, pagination.page]);

    const fetchInitialData = async () => {
        try {
            const [accountsData, categoriesData] = await Promise.all([
                financeAPI.getAccounts(),
                financeAPI.getCategories('income')
            ]);
            setAccounts(accountsData);
            setCategories(categoriesData);
            if (accountsData.length > 0) {
                const defaultAcc = accountsData.find(a => a.isDefault) || accountsData[0];
                setFormData(prev => ({ ...prev, accountId: defaultAcc.id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                type: 'income',
                page: pagination.page,
                limit: 20,
                ...filters
            };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const data = await financeAPI.getTransactions(params);
            setTransactions(data.transactions || []);
            setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }));
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const resetForm = () => {
        setFormData({
            accountId: accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '',
            categoryId: '',
            amount: '',
            description: '',
            transactionDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setEditTransaction(null);
    };

    const openEditModal = (tx) => {
        setEditTransaction(tx);
        setFormData({
            accountId: tx.accountId,
            categoryId: tx.categoryId || '',
            amount: tx.amount,
            description: tx.description || '',
            transactionDate: tx.transactionDate,
            notes: tx.notes || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.accountId || !formData.amount) {
            alert(t('finance.income.accountAmountRequired'));
            return;
        }

        setSaving(true);
        try {
            const data = { ...formData, type: 'income' };
            if (editTransaction) {
                await financeAPI.updateTransaction(editTransaction.id, data);
            } else {
                await financeAPI.createTransaction(data);
            }
            setShowModal(false);
            resetForm();
            fetchTransactions();
            fetchInitialData(); // Refresh accounts for updated balance
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert(error.message || t('finance.income.saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('finance.income.confirmDelete'))) return;

        try {
            await financeAPI.deleteTransaction(id);
            fetchTransactions();
            fetchInitialData();
        } catch (error) {
            alert(error.message || t('finance.income.deleteFailed'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.income.title', 'Income')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.income.subtitle', 'Record and manage all your income')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchTransactions}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('finance.income.addIncome')}
                    </motion.button>
                </div>
            </div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineTrendingUp style={{ width: '28px', height: '28px', color: '#34d399' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>{t('finance.income.totalIncomeThisPage')}</p>
                        <p style={{ fontSize: '32px', fontWeight: '700', color: '#34d399', margin: 0 }}>{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <HiOutlineFilter style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
                    <select
                        value={filters.accountId}
                        onChange={(e) => setFilters(prev => ({ ...prev, accountId: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none' }}
                    >
                        <option value="">{t('finance.income.allAccounts')}</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                    <select
                        value={filters.categoryId}
                        onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none' }}
                    >
                        <option value="">{t('finance.income.allCategories')}</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                    </select>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        placeholder="Dari"
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none' }}
                    />
                    <span style={{ color: '#6b7280' }}>-</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        placeholder="Sampai"
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none' }}
                    />
                    {(filters.accountId || filters.categoryId || filters.startDate || filters.endDate) && (
                        <button
                            onClick={() => setFilters({ accountId: '', categoryId: '', startDate: '', endDate: '' })}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions List */}
            <div className="glass-card" style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('common.loading')}</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                        <HiOutlineTrendingUp style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>{t('finance.income.noIncome')}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>{t('finance.income.addFirstIncome')}</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontSize: '14px' }}
                        >
                            {t('finance.income.addIncome')}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {transactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderLeft: '4px solid #10b981'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        backgroundColor: `${tx.FinanceCategory?.color || '#10b981'}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        {tx.FinanceCategory?.icon || '💰'}
                                    </div>
                                    <div>
                                        <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
                                            {tx.description || tx.FinanceCategory?.name || 'Pemasukan'}
                                        </p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>
                                            {tx.FinanceAccount?.name} • {new Date(tx.transactionDate).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {tx.source !== 'manual' && <span style={{ marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: '10px' }}>{tx.sourceModule}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>
                                        +{formatCurrency(tx.amount)}
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => openEditModal(tx)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.3)', backgroundColor: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer' }}>
                                            <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                        </button>
                                        <button onClick={() => handleDelete(tx.id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>
                                            <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                            {t('common.previous')}
                        </button>
                        <span style={{ padding: '8px 16px', color: '#9ca3af', fontSize: '13px' }}>
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                        >
                            {t('common.next')}
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
                        onClick={() => { setShowModal(false); resetForm(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editTransaction ? t('finance.income.editIncome') : t('finance.income.addIncome')}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.toAccount')} *</label>
                                    <select
                                        value={formData.accountId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">{t('finance.income.selectAccount')}</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.category')}</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">{t('finance.income.selectCategory')}</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.amount')} *</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="1000000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.date')}</label>
                                        <input
                                            type="date"
                                            value={formData.transactionDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.description')}</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Gaji bulan Januari"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.income.notes')}</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={2}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>{t('common.cancel')}</button>
                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
                                    {saving ? t('finance.income.saving') : t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pemasukan;
