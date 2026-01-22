import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCog, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineRefresh, HiOutlineX, HiOutlineTag
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#6b7280'];

const Settings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('income');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'income',
        icon: '💰',
        color: '#8b5cf6'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [activeTab]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await financeAPI.getCategories(activeTab);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: activeTab,
            icon: activeTab === 'income' ? '💰' : '💸',
            color: '#8b5cf6'
        });
        setEditCategory(null);
    };

    const openEditModal = (cat) => {
        if (cat.isDefault) {
            alert('Kategori default tidak dapat diedit');
            return;
        }
        setEditCategory(cat);
        setFormData({
            name: cat.name,
            type: cat.type,
            icon: cat.icon || '💰',
            color: cat.color || '#8b5cf6'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Nama kategori harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (editCategory) {
                await financeAPI.updateCategory(editCategory.id, formData);
            } else {
                await financeAPI.createCategory({ ...formData, type: activeTab });
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat) => {
        if (cat.isDefault) {
            alert('Kategori default tidak dapat dihapus');
            return;
        }
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;

        try {
            await financeAPI.deleteCategory(cat.id);
            fetchCategories();
        } catch (error) {
            alert(error.message || 'Gagal menghapus');
        }
    };

    const defaultCategories = categories.filter(c => c.isDefault);
    const userCategories = categories.filter(c => !c.isDefault);

    const ICON_OPTIONS = activeTab === 'income'
        ? ['💰', '💵', '💼', '💻', '🛒', '🎁', '📈', '💳', '🏆', '💎']
        : ['💸', '🏢', '👤', '🍔', '🚗', '🛍️', '📄', '🎬', '🏥', '📚', '💊', '✈️', '🎮', '☕'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.settings.title', 'Finance Settings')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.settings.subtitle', 'Manage income and expense categories')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchCategories}
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
                        Tambah Kategori
                    </motion.button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {[
                    { key: 'income', label: 'Kategori Pemasukan', color: '#10b981' },
                    { key: 'expense', label: 'Kategori Pengeluaran', color: '#ef4444' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: activeTab === tab.key ? `1px solid ${tab.color}50` : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: activeTab === tab.key ? `${tab.color}20` : 'transparent',
                            color: activeTab === tab.key ? tab.color : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Categories List */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HiOutlineTag style={{ color: activeTab === 'income' ? '#10b981' : '#ef4444' }} />
                    {activeTab === 'income' ? 'Kategori Pemasukan' : 'Kategori Pengeluaran'}
                </h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Default Categories */}
                        {defaultCategories.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Kategori Default</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {defaultCategories.map((cat, i) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${cat.color || '#8b5cf6'}30`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: `${cat.color || '#8b5cf6'}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}>
                                                {cat.icon || '💰'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{cat.name}</p>
                                                <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0 0' }}>Default</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* User Categories */}
                        <div>
                            <h4 style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Kategori Custom</h4>
                            {userCategories.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Belum ada kategori custom</p>
                                    <button
                                        onClick={() => { resetForm(); setShowModal(true); }}
                                        style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Tambah Kategori
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {userCategories.map((cat, i) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${cat.color || '#8b5cf6'}30`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: `${cat.color || '#8b5cf6'}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}>
                                                {cat.icon || '💰'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{cat.name}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer' }}
                                                >
                                                    <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                                                >
                                                    <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                            style={{ padding: '24px', width: '100%', maxWidth: '400px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Nama Kategori *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nama kategori"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Icon</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {ICON_OPTIONS.map(icon => (
                                            <button
                                                key={icon}
                                                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    border: formData.icon === icon ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: formData.icon === icon ? 'rgba(139,92,246,0.2)' : 'transparent',
                                                    fontSize: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Warna</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    backgroundColor: color,
                                                    border: formData.color === color ? '3px solid white' : 'none',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${formData.color}30` }}>
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Preview:</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            backgroundColor: `${formData.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px'
                                        }}>
                                            {formData.icon}
                                        </div>
                                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                                            {formData.name || 'Nama Kategori'}
                                        </span>
                                    </div>
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

export default Settings;
