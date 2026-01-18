import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineStar, HiOutlineSearch, HiOutlineExternalLink
} from 'react-icons/hi';
import { assetsAPI } from '../../services/api';

const Bookmark = () => {
    const { t } = useTranslation();
    const [bookmarks, setBookmarks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBookmark, setEditBookmark] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        description: '',
        category: 'Other',
        icon: '🔗',
        color: '#06b6d4',
        tags: []
    });
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookmarksData, categoriesData] = await Promise.all([
                assetsAPI.getBookmarks({ search, category: filterCategory }),
                assetsAPI.getBookmarkCategories()
            ]);
            setBookmarks(bookmarksData);
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
    }, [search, filterCategory]);

    const resetForm = () => {
        setFormData({
            title: '',
            url: '',
            description: '',
            category: 'Other',
            icon: '🔗',
            color: '#06b6d4',
            tags: []
        });
        setNewTag('');
        setEditBookmark(null);
    };

    const openEditModal = (bookmark) => {
        setEditBookmark(bookmark);
        setFormData({
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description || '',
            category: bookmark.category,
            icon: bookmark.icon || '🔗',
            color: bookmark.color || '#06b6d4',
            tags: bookmark.tags || []
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            alert('Judul dan URL harus diisi');
            return;
        }

        setSaving(true);
        try {
            if (editBookmark) {
                await assetsAPI.updateBookmark(editBookmark.id, formData);
            } else {
                await assetsAPI.createBookmark(formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving bookmark:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus bookmark ini?')) return;

        try {
            await assetsAPI.deleteBookmark(id);
            fetchData();
        } catch (error) {
            alert(error.message || 'Gagal menghapus');
        }
    };

    const toggleFavorite = async (id) => {
        try {
            await assetsAPI.toggleBookmarkFavorite(id);
            fetchData();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleClick = async (bookmark) => {
        try {
            await assetsAPI.trackBookmarkClick(bookmark.id);
            window.open(bookmark.url, '_blank');
        } catch (error) {
            window.open(bookmark.url, '_blank');
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

    const getCategoryInfo = (catName) => categories.find(c => c.name === catName) || { icon: '🔗', color: '#06b6d4' };

    const favoriteBookmarks = bookmarks.filter(b => b.isFavorite);
    const otherBookmarks = bookmarks.filter(b => !b.isFavorite);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('assets.bookmark.title', 'Bookmark')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('assets.bookmark.subtitle', 'Simpan link penting dan favorit Anda')}
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
                        Tambah Bookmark
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
                        placeholder="Cari bookmark..."
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

            {/* Bookmarks Grid - 5 Cards Layout */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
            ) : bookmarks.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>Belum Ada Bookmark</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        Simpan link favorit Anda untuk akses cepat
                    </p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-glow">
                        Tambah Bookmark
                    </button>
                </div>
            ) : (
                <>
                    {/* Favorites */}
                    {favoriteBookmarks.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <HiOutlineStar style={{ color: '#f59e0b' }} /> Favorit
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {favoriteBookmarks.map((bm, i) => (
                                    <BookmarkCard key={bm.id} bookmark={bm} index={i} onClick={handleClick} onEdit={openEditModal} onDelete={handleDelete} onToggleFavorite={toggleFavorite} getCategoryInfo={getCategoryInfo} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Others */}
                    {otherBookmarks.length > 0 && (
                        <div>
                            {favoriteBookmarks.length > 0 && (
                                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Semua</h3>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {otherBookmarks.map((bm, i) => (
                                    <BookmarkCard key={bm.id} bookmark={bm} index={i} onClick={handleClick} onEdit={openEditModal} onDelete={handleDelete} onToggleFavorite={toggleFavorite} getCategoryInfo={getCategoryInfo} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
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
                            style={{ padding: '24px', width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editBookmark ? 'Edit Bookmark' : 'Tambah Bookmark'}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Judul *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Nama website"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>URL *</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Deskripsi</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Deskripsi singkat..."
                                        rows={2}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => {
                                                const cat = getCategoryInfo(e.target.value);
                                                setFormData(prev => ({ ...prev, category: e.target.value, icon: cat.icon, color: cat.color }));
                                            }}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Icon</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {['🔗', '🌐', '📚', '🔧', '💻', '🎨', '📰', '🛒'].map(icon => (
                                                <button
                                                    key={icon}
                                                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        border: formData.icon === icon ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: formData.icon === icon ? 'rgba(6,182,212,0.2)' : 'transparent',
                                                        fontSize: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

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
                                        <button onClick={addTag} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(6,182,212,0.2)', color: '#22d3ee', cursor: 'pointer', fontSize: '13px' }}>
                                            Tambah
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {formData.tags.map(tag => (
                                                <span key={tag} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(6,182,212,0.2)', color: '#22d3ee', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', padding: 0 }}>×</button>
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

const BookmarkCard = ({ bookmark, index, onClick, onEdit, onDelete, onToggleFavorite, getCategoryInfo }) => {
    const catInfo = getCategoryInfo(bookmark.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="glass-card"
            style={{ padding: '16px', cursor: 'pointer', borderTop: `3px solid ${bookmark.color || catInfo.color}` }}
            onClick={() => onClick(bookmark)}
            whileHover={{ scale: 1.02 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: `${bookmark.color || catInfo.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                }}>
                    {bookmark.icon || catInfo.icon}
                </div>
                <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onToggleFavorite(bookmark.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', color: bookmark.isFavorite ? '#f59e0b' : '#6b7280', cursor: 'pointer' }}>
                        <HiOutlineStar style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => onEdit(bookmark)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' }}>
                        <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => onDelete(bookmark.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                    </button>
                </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {bookmark.title}
            </h3>

            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HiOutlineExternalLink style={{ width: '10px', height: '10px' }} />
                {new URL(bookmark.url).hostname}
            </p>

            {bookmark.clickCount > 0 && (
                <p style={{ fontSize: '10px', color: '#4b5563', marginTop: '6px' }}>
                    {bookmark.clickCount} klik
                </p>
            )}
        </motion.div>
    );
};

export default Bookmark;
