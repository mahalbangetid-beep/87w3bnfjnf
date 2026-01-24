import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineCheck, HiOutlineClock, HiOutlineExclamationCircle,
    HiOutlineBell, HiOutlineCalendar
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

const DEFAULT_BILL_CATEGORIES = [
    { name: 'Internet', icon: '🌐', color: '#3b82f6' },
    { name: 'Shopee PayLater', icon: '🛒', color: '#ee4d2d' },
    { name: 'Shopee Pinjam', icon: '💳', color: '#ee4d2d' },
    { name: 'OVO PayLater', icon: '💜', color: '#4c3494' },
    { name: 'Tagihan Bank', icon: '🏦', color: '#1e40af' },
    { name: 'Listrik', icon: '⚡', color: '#f59e0b' },
    { name: 'Air PDAM', icon: '💧', color: '#06b6d4' },
    { name: 'Telepon', icon: '📱', color: '#10b981' },
    { name: 'Asuransi', icon: '🛡️', color: '#8b5cf6' },
    { name: 'Sewa/Kos', icon: '🏠', color: '#ec4899' },
    { name: 'Cicilan', icon: '📝', color: '#ef4444' },
    { name: 'Langganan', icon: '🔄', color: '#6366f1' },
    { name: 'Lainnya', icon: '📋', color: '#6b7280' }
];

const Tagihan = () => {
    const { t, i18n } = useTranslation();
    const [bills, setBills] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, paid, overdue
    const [showModal, setShowModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [editBill, setEditBill] = useState(null);
    const [payBill, setPayBill] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Lainnya',
        amount: '',
        dueDate: '',
        isRecurring: true,
        recurringType: 'monthly',
        reminderEnabled: true,
        reminderDays: 3,
        reminderWhatsapp: false,
        reminderPhone: '',
        icon: '📄',
        color: '#ef4444',
        notes: ''
    });
    const [payData, setPayData] = useState({ accountId: '', paidAmount: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [billsData, accountsData] = await Promise.all([
                financeAPI.getBills(),
                financeAPI.getAccounts()
            ]);
            setBills(billsData);
            setAccounts(accountsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'all') return true;
        return bill.status === filter;
    });

    const stats = {
        total: bills.length,
        pending: bills.filter(b => b.status === 'pending').length,
        overdue: bills.filter(b => b.status === 'overdue').length,
        paid: bills.filter(b => b.status === 'paid').length,
        totalAmount: bills.filter(b => ['pending', 'overdue'].includes(b.status)).reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Lainnya',
            amount: '',
            dueDate: '',
            isRecurring: true,
            recurringType: 'monthly',
            reminderEnabled: true,
            reminderDays: 3,
            reminderWhatsapp: false,
            reminderPhone: '',
            icon: '📄',
            color: '#ef4444',
            notes: ''
        });
        setEditBill(null);
    };

    const openAddModal = (category = null) => {
        resetForm();
        if (category) {
            setFormData(prev => ({
                ...prev,
                category: category.name,
                icon: category.icon,
                color: category.color
            }));
        }
        setShowModal(true);
    };

    const openEditModal = (bill) => {
        setEditBill(bill);
        setFormData({
            name: bill.name,
            category: bill.category,
            amount: bill.amount,
            dueDate: bill.dueDate,
            isRecurring: bill.isRecurring,
            recurringType: bill.recurringType,
            reminderEnabled: bill.reminderEnabled,
            reminderDays: bill.reminderDays,
            reminderWhatsapp: bill.reminderWhatsapp,
            reminderPhone: bill.reminderPhone || '',
            icon: bill.icon || '📄',
            color: bill.color || '#ef4444',
            notes: bill.notes || ''
        });
        setShowModal(true);
    };

    const openPayModal = (bill) => {
        setPayBill(bill);
        setPayData({
            accountId: accounts.find(a => a.isDefault)?.id || accounts[0]?.id || '',
            paidAmount: bill.amount
        });
        setShowPayModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.amount || !formData.dueDate) {
            alert('Nama, jumlah, dan tanggal jatuh tempo harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (editBill) {
                await financeAPI.updateBill(editBill.id, formData);
            } else {
                await financeAPI.createBill(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving bill:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handlePay = async () => {
        if (!payData.accountId) {
            alert('Pilih akun untuk pembayaran');
            return;
        }

        setSaving(true);
        try {
            await financeAPI.payBill(payBill.id, payData);
            setShowPayModal(false);
            setPayBill(null);
            fetchData();
        } catch (error) {
            console.error('Error paying bill:', error);
            alert(error.message || 'Gagal membayar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('finance.bills.confirmDelete'))) return;

        try {
            await financeAPI.deleteBill(id);
            fetchData();
        } catch (error) {
            alert(error.message || t('finance.bills.deleteFailed'));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', text: t('finance.bills.status.pending') },
            overdue: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444', text: t('finance.bills.status.overdue') },
            paid: { bg: 'rgba(16,185,129,0.2)', color: '#10b981', text: t('finance.bills.status.paid') },
            cancelled: { bg: 'rgba(107,114,128,0.2)', color: '#6b7280', text: t('finance.bills.status.cancelled') }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: s.bg, color: s.color, fontSize: '12px', fontWeight: '500' }}>
                {s.text}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.bills.title', 'Bills')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.bills.subtitle', 'Manage all bills and recurring payments')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchData}
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
                        onClick={() => openAddModal()}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('finance.bills.addBill')}
                    </motion.button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineExclamationCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{t('finance.bills.totalUnpaid')}</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>{formatCurrency(stats.totalAmount)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineClock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{t('finance.bills.waiting')}</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>{stats.pending}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineExclamationCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{t('finance.bills.overdue')}</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>{stats.overdue}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCheck style={{ width: '20px', height: '20px', color: '#10b981' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{t('finance.bills.paid')}</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', margin: 0 }}>{stats.paid}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: t('finance.bills.filter.all') },
                    { key: 'pending', label: t('finance.bills.filter.pending') },
                    { key: 'overdue', label: t('finance.bills.filter.overdue') },
                    { key: 'paid', label: t('finance.bills.filter.paid') }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: filter === tab.key ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: filter === tab.key ? 'rgba(139,92,246,0.2)' : 'transparent',
                            color: filter === tab.key ? '#a78bfa' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Quick Add Categories */}
            {bills.length === 0 && !loading && (
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                        {t('finance.bills.quickAdd')}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {DEFAULT_BILL_CATEGORIES.map((cat, i) => (
                            <motion.button
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.03 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openAddModal(cat)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    border: `1px solid ${cat.color}40`,
                                    backgroundColor: `${cat.color}15`,
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px'
                                }}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bills List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('common.loading')}</div>
                ) : filteredBills.length === 0 ? (
                    <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                        <HiOutlineCalendar style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>{t('finance.bills.noBills')}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('finance.bills.addYourBills')}</p>
                    </div>
                ) : (
                    filteredBills.map((bill, index) => {
                        const dueDate = new Date(bill.dueDate);
                        const isOverdue = bill.status !== 'paid' && dueDate < new Date();
                        const category = DEFAULT_BILL_CATEGORIES.find(c => c.name === bill.category) || { icon: bill.icon, color: bill.color };

                        return (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{
                                    padding: '20px',
                                    borderLeft: `4px solid ${isOverdue ? '#ef4444' : category.color || '#8b5cf6'}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: `${category.color || '#8b5cf6'}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            {category.icon || '📄'}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                                                    {bill.name}
                                                </h3>
                                                {getStatusBadge(isOverdue && bill.status === 'pending' ? 'overdue' : bill.status)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                                                <span>{bill.category}</span>
                                                <span>•</span>
                                                <span style={{ color: isOverdue ? '#ef4444' : '#9ca3af' }}>
                                                    {t('finance.bills.dueDateLabel')}: {dueDate.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                {bill.isRecurring && (
                                                    <>
                                                        <span>•</span>
                                                        <span>🔄 {bill.recurringType === 'monthly' ? t('finance.bills.monthly') : bill.recurringType === 'weekly' ? t('finance.bills.weekly') : t('finance.bills.yearly')}</span>
                                                    </>
                                                )}
                                                {bill.reminderEnabled && (
                                                    <>
                                                        <span>•</span>
                                                        <HiOutlineBell style={{ width: '14px', height: '14px' }} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                                            {formatCurrency(bill.amount)}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {bill.status !== 'paid' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => openPayModal(bill)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {t('finance.bills.pay')}
                                                </motion.button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(bill)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    backgroundColor: 'rgba(139,92,246,0.1)',
                                                    color: '#a78bfa',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill.id)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    backgroundColor: 'rgba(239,68,68,0.1)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
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
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editBill ? t('finance.bills.editBill') : t('finance.bills.addBill')}
                                </h3>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}
                                >
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Nama Tagihan *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Internet Indihome"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            const cat = DEFAULT_BILL_CATEGORIES.find(c => c.name === e.target.value);
                                            setFormData(prev => ({ ...prev, category: e.target.value, icon: cat?.icon || '📄', color: cat?.color || '#ef4444' }));
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        {DEFAULT_BILL_CATEGORIES.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Jumlah *</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="350000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Jatuh Tempo *</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isRecurring} onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>Tagihan Berulang</span>
                                </label>

                                {formData.isRecurring && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Frekuensi</label>
                                        <select
                                            value={formData.recurringType}
                                            onChange={(e) => setFormData(prev => ({ ...prev, recurringType: e.target.value }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="monthly">Bulanan</option>
                                            <option value="weekly">Mingguan</option>
                                            <option value="yearly">Tahunan</option>
                                        </select>
                                    </div>
                                )}

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.reminderEnabled} onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>Aktifkan Pengingat</span>
                                </label>

                                {formData.reminderEnabled && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Ingatkan Sebelum (hari)</label>
                                        <input
                                            type="number"
                                            value={formData.reminderDays}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>{t('common.cancel')}</button>
                                <button onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                    {saving ? t('finance.bills.saving') : t('finance.bills.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pay Modal */}
            <AnimatePresence>
                {showPayModal && payBill && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '400px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Bayar Tagihan</h3>
                            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '20px' }}>
                                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>{payBill.name}</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '8px 0 0' }}>{formatCurrency(payBill.amount)}</p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Bayar dari Akun</label>
                                <select
                                    value={payData.accountId}
                                    onChange={(e) => setPayData(prev => ({ ...prev, accountId: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                >
                                    <option value="">Pilih akun</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} - {formatCurrency(acc.balance)}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Jumlah Dibayar</label>
                                <input
                                    type="number"
                                    value={payData.paidAmount}
                                    onChange={(e) => setPayData(prev => ({ ...prev, paidAmount: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>Batal</button>
                                <button onClick={handlePay} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
                                    {saving ? 'Memproses...' : 'Konfirmasi Bayar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tagihan;
