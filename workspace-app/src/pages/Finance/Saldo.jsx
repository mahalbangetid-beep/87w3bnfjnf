import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineCreditCard, HiOutlineCash, HiOutlineDeviceMobile
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

const getAccountTypes = (t) => ({
    bank: { name: t('finance.balance.bank'), icon: HiOutlineCreditCard, color: '#3b82f6' },
    cash: { name: t('finance.balance.cash'), icon: HiOutlineCash, color: '#10b981' },
    ewallet: { name: t('finance.balance.ewallet'), icon: HiOutlineDeviceMobile, color: '#8b5cf6' },
    other: { name: t('finance.balance.other'), icon: HiOutlineCreditCard, color: '#6b7280' }
});

const ACCOUNT_PRESETS = [
    { name: 'BCA', type: 'bank', icon: '🏦', color: '#004C97' },
    { name: 'Mandiri', type: 'bank', icon: '🏦', color: '#003d79' },
    { name: 'BNI', type: 'bank', icon: '🏦', color: '#F26522' },
    { name: 'BRI', type: 'bank', icon: '🏦', color: '#00529B' },
    { name: 'CIMB Niaga', type: 'bank', icon: '🏦', color: '#ED1C24' },
    { name: 'Jago', type: 'bank', icon: '🏦', color: '#FFD600' },
    { name: 'SeaBank', type: 'bank', icon: '🏦', color: '#00D4AA' },
    { name: 'GoPay', type: 'ewallet', icon: '💚', color: '#00AA13' },
    { name: 'OVO', type: 'ewallet', icon: '💜', color: '#4C3494' },
    { name: 'DANA', type: 'ewallet', icon: '💙', color: '#108CE5' },
    { name: 'ShopeePay', type: 'ewallet', icon: '🧡', color: '#EE4D2D' },
    { name: 'LinkAja', type: 'ewallet', icon: '❤️', color: '#E11D26' },
    { name: 'Dompet', type: 'cash', icon: '💵', color: '#10b981' },
];

const Saldo = () => {
    const { t, i18n } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank',
        initialBalance: '',
        icon: '🏦',
        color: '#8b5cf6',
        accountNumber: '',
        notes: '',
        isDefault: false
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
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await financeAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'bank',
            initialBalance: '',
            icon: '🏦',
            color: '#8b5cf6',
            accountNumber: '',
            notes: '',
            isDefault: false
        });
        setEditAccount(null);
    };

    const openAddModal = (preset = null) => {
        resetForm();
        if (preset) {
            setFormData(prev => ({
                ...prev,
                name: preset.name,
                type: preset.type,
                icon: preset.icon,
                color: preset.color
            }));
        }
        setShowModal(true);
    };

    const openEditModal = (account) => {
        setEditAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            initialBalance: account.balance,
            icon: account.icon || '🏦',
            color: account.color || '#8b5cf6',
            accountNumber: account.accountNumber || '',
            notes: account.notes || '',
            isDefault: account.isDefault
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert(t('finance.balance.nameRequired'));
            return;
        }

        setSaving(true);
        try {
            if (editAccount) {
                await financeAPI.updateAccount(editAccount.id, formData);
            } else {
                await financeAPI.createAccount(formData);
            }
            setShowModal(false);
            resetForm();
            fetchAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
            alert(error.message || t('finance.balance.saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('finance.balance.confirmDelete'))) return;

        try {
            await financeAPI.deleteAccount(id);
            fetchAccounts();
        } catch (error) {
            alert(error.message || t('finance.balance.deleteFailed'));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.balance.title', 'Balance')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.balance.subtitle', 'Manage all your accounts and balances')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchAccounts}
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
                        {t('finance.balance.addAccount')}
                    </motion.button>
                </div>
            </div>

            {/* Total Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    padding: '32px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
                    textAlign: 'center'
                }}
            >
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>{t('finance.balance.totalBalance')}</p>
                <p style={{ fontSize: '48px', fontWeight: '700', color: 'white', margin: '12px 0' }}>
                    {loading ? '...' : formatCurrency(totalBalance)}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {accounts.length} {t('finance.balance.accountsRegistered')}
                </p>
            </motion.div>

            {/* Quick Add Presets */}
            {accounts.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                        {t('finance.balance.quickAdd')}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {ACCOUNT_PRESETS.map((preset, i) => (
                            <motion.button
                                key={preset.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.03 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openAddModal(preset)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    border: `1px solid ${preset.color}40`,
                                    backgroundColor: `${preset.color}15`,
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px'
                                }}
                            >
                                <span>{preset.icon}</span>
                                {preset.name}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Accounts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {accounts.map((account, index) => {
                    const accountTypes = getAccountTypes(t);
                    const typeInfo = accountTypes[account.type] || accountTypes.other;
                    const TypeIcon = typeInfo.icon;

                    return (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card"
                            style={{
                                padding: '24px',
                                borderTop: `3px solid ${account.color || typeInfo.color}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: `${account.color || typeInfo.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        {account.icon || <TypeIcon style={{ color: account.color || typeInfo.color }} />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                                                {account.name}
                                            </h3>
                                            {account.isDefault && (
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'rgba(139,92,246,0.2)',
                                                    color: '#a78bfa',
                                                    fontSize: '10px'
                                                }}>
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                                            {typeInfo.name}
                                            {account.accountNumber && ` • ${account.accountNumber}`}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => openEditModal(account)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(139,92,246,0.3)',
                                            backgroundColor: 'rgba(139,92,246,0.1)',
                                            color: '#a78bfa',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            backgroundColor: 'rgba(239,68,68,0.1)',
                                            color: '#ef4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>
                            </div>

                            <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                                {formatCurrency(account.balance || 0)}
                            </p>

                            {account.notes && (
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                                    {account.notes}
                                </p>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {!loading && accounts.length === 0 && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <HiOutlineCreditCard style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>{t('finance.balance.noAccounts')}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        {t('finance.balance.addAccountDesc')}
                    </p>
                </div>
            )}

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
                        onClick={() => { setShowModal(false); resetForm(); }}
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
                                    {editAccount ? t('finance.balance.editAccount') : t('finance.balance.addAccount')}
                                </h3>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Account Type */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        {t('finance.balance.accountType')}
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {Object.entries(getAccountTypes(t)).map(([key, info]) => (
                                            <button
                                                key={key}
                                                onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: formData.type === key ? `2px solid ${info.color}` : '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: formData.type === key ? `${info.color}20` : 'transparent',
                                                    color: formData.type === key ? info.color : '#9ca3af',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <info.icon style={{ width: '20px', height: '20px' }} />
                                                {info.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Nama Akun *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="BCA Digital, GoPay, Dompet..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* Initial Balance */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        {editAccount ? 'Saldo Saat Ini' : 'Saldo Awal'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.initialBalance}
                                        onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: e.target.value }))}
                                        placeholder="0"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* Account Number */}
                                {formData.type === 'bank' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                            Nomor Rekening (opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            placeholder="1234567890"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                color: 'white',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Color */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Warna
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6b7280'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    backgroundColor: color,
                                                    border: formData.color === color ? '3px solid white' : 'none',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Default Toggle */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>Jadikan akun default</span>
                                </label>

                                {/* Notes */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Catatan (opsional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Catatan tambahan..."
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'transparent',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-glow"
                                    style={{
                                        flex: 1,
                                        opacity: saving ? 0.7 : 1,
                                        cursor: saving ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {saving ? t('finance.balance.saving') : t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Saldo;
