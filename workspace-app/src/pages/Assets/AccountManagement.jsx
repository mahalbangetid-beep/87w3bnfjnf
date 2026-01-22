import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineEye, HiOutlineEyeOff, HiOutlineStar, HiOutlineSearch,
    HiOutlineDuplicate, HiOutlineExternalLink
} from 'react-icons/hi';
import { assetsAPI } from '../../services/api';

const CATEGORY_ICONS = {
    'Social Media': '📱',
    'Email': '📧',
    'Work': '💼',
    'Hosting': '🌐',
    'Domain': '🔗',
    'Cloud Storage': '☁️',
    'Payment': '💳',
    'Banking': '🏦',
    'Subscription': '🔄',
    'Development': '💻',
    'Gaming': '🎮',
    'Entertainment': '🎬',
    'Shopping': '🛒',
    'Other': '📁'
};

const AccountManagement = () => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showPasswords, setShowPasswords] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        category: 'Other',
        link: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        recoveryEmail: '',
        twoFactorEnabled: false,
        notes: '',
        icon: '🔐',
        color: '#8b5cf6'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accountsData, categoriesData] = await Promise.all([
                assetsAPI.getAccounts({ search, category: filterCategory }),
                assetsAPI.getAccountCategories()
            ]);
            setAccounts(accountsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [search, filterCategory]);

    const filteredAccounts = accounts;

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Other',
            link: '',
            email: '',
            username: '',
            password: '',
            phone: '',
            recoveryEmail: '',
            twoFactorEnabled: false,
            notes: '',
            icon: '🔐',
            color: '#8b5cf6'
        });
        setEditAccount(null);
    };

    const openEditModal = (account) => {
        setEditAccount(account);
        setFormData({
            name: account.name,
            category: account.category,
            link: account.link || '',
            email: account.email || '',
            username: account.username || '',
            password: account.password || '',
            phone: account.phone || '',
            recoveryEmail: account.recoveryEmail || '',
            twoFactorEnabled: account.twoFactorEnabled || false,
            notes: account.notes || '',
            icon: account.icon || '🔐',
            color: account.color || '#8b5cf6'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Nama akun harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (editAccount) {
                await assetsAPI.updateAccount(editAccount.id, formData);
            } else {
                await assetsAPI.createAccount(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving account:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus akun ini?')) return;

        try {
            await assetsAPI.deleteAccount(id);
            fetchData();
        } catch (error) {
            alert(error.message || 'Gagal menghapus');
        }
    };

    const toggleFavorite = async (id) => {
        try {
            await assetsAPI.toggleAccountFavorite(id);
            fetchData();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const togglePassword = (id) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} disalin!`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('assets.accounts.title', 'Account Management')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('assets.accounts.subtitle', 'Simpan dan kelola semua akun Anda dengan aman')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchData}
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
                        Tambah Akun
                    </motion.button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <HiOutlineSearch style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari akun..."
                        style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Accounts Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
            ) : filteredAccounts.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>Belum Ada Akun</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        Simpan akun pertama Anda untuk mulai mengelola
                    </p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn-glow"
                    >
                        Tambah Akun
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                    {filteredAccounts.map((account, index) => (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card"
                            style={{ padding: '20px', borderTop: `4px solid ${account.color || '#8b5cf6'}` }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: `${account.color || '#8b5cf6'}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        {account.icon || CATEGORY_ICONS[account.category] || '🔐'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>{account.name}</h3>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{account.category}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => toggleFavorite(account.id)}
                                        style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: account.isFavorite ? 'rgba(245,158,11,0.2)' : 'transparent', color: account.isFavorite ? '#f59e0b' : '#6b7280', cursor: 'pointer' }}
                                    >
                                        <HiOutlineStar style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    {account.link && (
                                        <a
                                            href={account.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <HiOutlineExternalLink style={{ width: '16px', height: '16px' }} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => openEditModal(account)}
                                        style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer' }}
                                    >
                                        <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                {account.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#6b7280', width: '70px' }}>Email:</span>
                                        <span style={{ color: '#d1d5db', flex: 1 }}>{account.email}</span>
                                        <button onClick={() => copyToClipboard(account.email, 'Email')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
                                            <HiOutlineDuplicate style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                )}
                                {account.username && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#6b7280', width: '70px' }}>Username:</span>
                                        <span style={{ color: '#d1d5db', flex: 1 }}>{account.username}</span>
                                        <button onClick={() => copyToClipboard(account.username, 'Username')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
                                            <HiOutlineDuplicate style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                )}
                                {account.password && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#6b7280', width: '70px' }}>Password:</span>
                                        <span style={{ color: '#d1d5db', flex: 1, fontFamily: 'monospace' }}>
                                            {showPasswords[account.id] ? account.password : '••••••••'}
                                        </span>
                                        <button onClick={() => togglePassword(account.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
                                            {showPasswords[account.id] ? <HiOutlineEyeOff style={{ width: '14px', height: '14px' }} /> : <HiOutlineEye style={{ width: '14px', height: '14px' }} />}
                                        </button>
                                        <button onClick={() => copyToClipboard(account.password, 'Password')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
                                            <HiOutlineDuplicate style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                )}
                                {account.twoFactorEnabled && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', fontSize: '11px', width: 'fit-content' }}>
                                        🛡️ 2FA Aktif
                                    </span>
                                )}
                            </div>

                            {account.notes && (
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    {account.notes}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

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
                            style={{ padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editAccount ? 'Edit Akun' : 'Tambah Akun'}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Nama Akun *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="LinkedIn, GitHub..."
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, icon: CATEGORY_ICONS[e.target.value] || '🔐' }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>URL Login</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="email@example.com"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                            placeholder="username"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Password</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }}
                                    />
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.twoFactorEnabled}
                                        onChange={(e) => setFormData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>2FA / Two-Factor Authentication Aktif</span>
                                </label>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Catatan</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Catatan tambahan..."
                                        rows={2}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>Batal</button>
                                <button onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountManagement;
