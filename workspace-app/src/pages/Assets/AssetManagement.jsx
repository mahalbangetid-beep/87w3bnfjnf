import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineUpload, HiOutlineSearch, HiOutlineLink,
    HiOutlineDocumentText, HiOutlinePhotograph
} from 'react-icons/hi';
import { assetsAPI } from '../../services/api';

const AssetManagement = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'text',
        category: 'General',
        content: '',
        link: '',
        icon: '📄',
        color: '#8b5cf6',
        tags: []
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        fetchData();
    }, [filterType, filterCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsData, categoriesData] = await Promise.all([
                assetsAPI.getItems({ type: filterType, category: filterCategory, search }),
                assetsAPI.getItemCategories()
            ]);
            setItems(itemsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'text',
            category: 'General',
            content: '',
            link: '',
            icon: '📄',
            color: '#8b5cf6',
            tags: []
        });
        setUploadFile(null);
        setEditItem(null);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setFormData({
            name: item.name,
            type: item.type,
            category: item.category,
            content: item.content || '',
            link: item.link || '',
            icon: item.icon || '📄',
            color: item.color || '#8b5cf6',
            tags: item.tags || []
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Nama harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (uploadFile) {
                // Upload file
                const fd = new FormData();
                fd.append('file', uploadFile);
                fd.append('name', formData.name);
                fd.append('category', formData.category);
                fd.append('tags', JSON.stringify(formData.tags));
                await assetsAPI.uploadItem(fd);
            } else if (editItem) {
                await assetsAPI.updateItem(editItem.id, formData);
            } else {
                await assetsAPI.createItem(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving item:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;

        try {
            await assetsAPI.deleteItem(id);
            fetchData();
        } catch (error) {
            alert(error.message || 'Gagal menghapus');
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'image': return <HiOutlinePhotograph style={{ width: '18px', height: '18px' }} />;
            case 'link': return <HiOutlineLink style={{ width: '18px', height: '18px' }} />;
            default: return <HiOutlineDocumentText style={{ width: '18px', height: '18px' }} />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('assets.management.title', 'Asset Management')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('assets.management.subtitle', 'Simpan teks, gambar, dan link penting')}
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
                        Tambah Aset
                    </motion.button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <HiOutlineSearch style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari aset..."
                        style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="">Semua Tipe</option>
                    <option value="text">📄 Teks</option>
                    <option value="image">🖼️ Gambar</option>
                    <option value="link">🔗 Link</option>
                </select>
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

            {/* Items Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
            ) : items.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>Belum Ada Aset</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        Simpan teks, gambar, atau link penting Anda
                    </p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-glow">
                        Tambah Aset
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card"
                            style={{ padding: '20px', borderTop: `4px solid ${item.color || '#10b981'}` }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: `${item.color || '#10b981'}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        {item.icon || '📄'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'white', margin: 0 }}>{item.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {getTypeIcon(item.type)} {item.type}
                                            </span>
                                            <span style={{ color: '#4b5563' }}>•</span>
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => openEditModal(item)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer' }}>
                                        <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>
                                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>
                            </div>

                            {item.type === 'text' && item.content && (
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {item.content}
                                </p>
                            )}

                            {item.type === 'link' && item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '13px', color: '#06b6d4', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    🔗 {item.link}
                                </a>
                            )}

                            {item.type === 'image' && item.filePath && (
                                <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <img
                                        src={`http://localhost:5000/${item.filePath.replace(/\\/g, '/')}`}
                                        alt={item.name}
                                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            {item.tags && item.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                                    {item.tags.map(tag => (
                                        <span key={tag} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '10px' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
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
                                    {editItem ? 'Edit Aset' : 'Tambah Aset'}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Type Selector */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Tipe</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[
                                            { key: 'text', label: 'Teks', icon: '📄' },
                                            { key: 'link', label: 'Link', icon: '🔗' },
                                            { key: 'image', label: 'Gambar', icon: '🖼️' }
                                        ].map(t => (
                                            <button
                                                key={t.key}
                                                onClick={() => setFormData(prev => ({ ...prev, type: t.key, icon: t.icon }))}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: formData.type === t.key ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: formData.type === t.key ? 'rgba(139,92,246,0.2)' : 'transparent',
                                                    color: formData.type === t.key ? '#a78bfa' : '#9ca3af',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {t.icon} {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Nama *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Nama aset"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formData.type === 'text' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Konten</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Tulis konten..."
                                            rows={5}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                        />
                                    </div>
                                )}

                                {formData.type === 'link' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>URL</label>
                                        <input
                                            type="url"
                                            value={formData.link}
                                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                            placeholder="https://..."
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                {formData.type === 'image' && !editItem && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Upload Gambar</label>
                                        <div
                                            style={{
                                                padding: '24px',
                                                borderRadius: '10px',
                                                border: '2px dashed rgba(255,255,255,0.1)',
                                                textAlign: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => document.getElementById('file-upload').click()}
                                        >
                                            <HiOutlineUpload style={{ width: '32px', height: '32px', color: '#6b7280', margin: '0 auto 8px' }} />
                                            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                                                {uploadFile ? uploadFile.name : 'Klik untuk upload gambar'}
                                            </p>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*,.txt"
                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Tags</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Tambah tag"
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '13px', outline: 'none' }}
                                        />
                                        <button onClick={addTag} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer', fontSize: '13px' }}>
                                            Tambah
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {formData.tags.map(tag => (
                                                <span key={tag} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0 }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
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

export default AssetManagement;
