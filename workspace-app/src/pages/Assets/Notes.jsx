import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineBookmark, HiOutlineArchive, HiOutlineKey
} from 'react-icons/hi';
import { assetsAPI } from '../../services/api';

const COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#06b6d4', '#ec4899', '#6b7280'];

// Helper to safely parse tags
const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string' && tags) {
        try { return JSON.parse(tags); } catch { return []; }
    }
    return [];
};

const NOTE_TYPES = [
    { key: 'update', label: 'Update', color: '#f59e0b', icon: '🔄' },
    { key: 'reminder', label: 'Pengingat', color: '#3b82f6', icon: '🔔' },
    { key: 'info', label: 'Info', color: '#10b981', icon: 'ℹ️' },
    { key: 'warning', label: 'Peringatan', color: '#ef4444', icon: '⚠️' }
];

const AssetNotes = () => {
    const { t } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [filter, setFilter] = useState('active');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'update',
        accountId: '',
        color: '#f59e0b',
        isPinned: false,
        tags: []
    });
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = filter === 'archived' ? { archived: 'true' } :
                filter === 'pinned' ? { pinned: 'true', archived: 'false' } :
                    { archived: 'false' };
            const [notesData, accountsData] = await Promise.all([
                assetsAPI.getNotes(params),
                assetsAPI.getAccounts()
            ]);
            // Parse tags if it's a string (JSON from backend)
            const parsedNotes = notesData.map(note => ({
                ...note,
                tags: Array.isArray(note.tags)
                    ? note.tags
                    : (typeof note.tags === 'string' && note.tags
                        ? JSON.parse(note.tags)
                        : [])
            }));
            setNotes(parsedNotes);
            setAccounts(accountsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: 'update',
            accountId: '',
            color: '#f59e0b',
            isPinned: false,
            tags: []
        });
        setNewTag('');
        setEditNote(null);
    };

    const openEditModal = (note) => {
        setEditNote(note);
        // Parse tags if it's a string
        const parsedTags = Array.isArray(note.tags)
            ? note.tags
            : (typeof note.tags === 'string' && note.tags ? JSON.parse(note.tags) : []);
        setFormData({
            title: note.title,
            content: note.content || '',
            type: note.type,
            accountId: note.accountId || '',
            color: note.color || '#f59e0b',
            isPinned: note.isPinned,
            tags: parsedTags
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('Judul harus diisi');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };
            if (!payload.accountId) delete payload.accountId;

            if (editNote) {
                await assetsAPI.updateNote(editNote.id, payload);
            } else {
                await assetsAPI.createNote(payload);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving note:', error);
            alert(error.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus catatan ini?')) return;

        try {
            await assetsAPI.deleteNote(id);
            fetchData();
        } catch (error) {
            alert(error.message || 'Gagal menghapus');
        }
    };

    const togglePin = async (note) => {
        try {
            await assetsAPI.updateNote(note.id, { isPinned: !note.isPinned });
            fetchData();
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const toggleArchive = async (note) => {
        try {
            await assetsAPI.updateNote(note.id, { isArchived: !note.isArchived });
            fetchData();
        } catch (error) {
            console.error('Error updating note:', error);
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

    const pinnedNotes = notes.filter(n => n.isPinned);
    const otherNotes = notes.filter(n => !n.isPinned);

    const getNoteTypeInfo = (type) => NOTE_TYPES.find(t => t.key === type) || NOTE_TYPES[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('assets.notes.title', 'Catatan Update')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('assets.notes.subtitle', 'Catat perubahan akun dan informasi penting')}
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
                        Buat Catatan
                    </motion.button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {[
                    { key: 'active', label: 'Aktif' },
                    { key: 'pinned', label: 'Disematkan' },
                    { key: 'archived', label: 'Arsip' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: filter === tab.key ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: filter === tab.key ? 'rgba(245,158,11,0.2)' : 'transparent',
                            color: filter === tab.key ? '#fbbf24' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notes */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
            ) : notes.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>Belum Ada Catatan</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        Buat catatan untuk mencatat perubahan akun
                    </p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-glow">
                        Buat Catatan
                    </button>
                </div>
            ) : (
                <>
                    {/* Pinned Notes */}
                    {pinnedNotes.length > 0 && filter !== 'archived' && (
                        <div>
                            <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <HiOutlineBookmark /> Disematkan
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {pinnedNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} onEdit={openEditModal} onDelete={handleDelete} onTogglePin={togglePin} onToggleArchive={toggleArchive} getNoteTypeInfo={getNoteTypeInfo} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Notes */}
                    {otherNotes.length > 0 && (
                        <div>
                            {pinnedNotes.length > 0 && filter !== 'archived' && (
                                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Lainnya</h3>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {otherNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} onEdit={openEditModal} onDelete={handleDelete} onTogglePin={togglePin} onToggleArchive={toggleArchive} getNoteTypeInfo={getNoteTypeInfo} />
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

                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px', borderTop: `4px solid ${formData.color}` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editNote ? 'Edit Catatan' : 'Buat Catatan'}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Tipe</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {NOTE_TYPES.map(t => (
                                            <button
                                                key={t.key}
                                                onClick={() => setFormData(prev => ({ ...prev, type: t.key, color: t.color }))}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    border: formData.type === t.key ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: formData.type === t.key ? `${t.color}20` : 'transparent',
                                                    color: formData.type === t.key ? t.color : '#9ca3af',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {t.icon} {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Judul *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Contoh: Ganti password LinkedIn"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Isi Catatan</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Password baru: newpass123"
                                        rows={3}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        <HiOutlineKey style={{ verticalAlign: 'middle' }} /> Terkait Akun (Opsional)
                                    </label>
                                    <select
                                        value={formData.accountId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">Tidak terkait akun</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
                                        ))}
                                    </select>
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
                                        <button onClick={addTag} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24', cursor: 'pointer', fontSize: '13px' }}>
                                            Tambah
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {formData.tags.map(tag => (
                                                <span key={tag} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0 }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isPinned} onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>Sematkan catatan ini</span>
                                </label>
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

const NoteCard = ({ note, index, onEdit, onDelete, onTogglePin, onToggleArchive, getNoteTypeInfo }) => {
    const typeInfo = getNoteTypeInfo(note.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{ padding: '20px', borderTop: `4px solid ${typeInfo.color}`, cursor: 'pointer' }}
            onClick={() => onEdit(note)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{typeInfo.icon}</span>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'white', margin: 0 }}>{note.title}</h3>
                        <span style={{ fontSize: '11px', color: typeInfo.color, padding: '2px 8px', borderRadius: '4px', backgroundColor: `${typeInfo.color}15` }}>
                            {typeInfo.label}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onTogglePin(note)} style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: note.isPinned ? 'rgba(245,158,11,0.2)' : 'transparent', color: note.isPinned ? '#f59e0b' : '#6b7280', cursor: 'pointer' }}>
                        <HiOutlineBookmark style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => onToggleArchive(note)} style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', color: '#6b7280', cursor: 'pointer' }}>
                        <HiOutlineArchive style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => onDelete(note.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                    </button>
                </div>
            </div>

            {note.AssetAccount && (
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineKey style={{ width: '12px', height: '12px' }} />
                    {note.AssetAccount.icon} {note.AssetAccount.name}
                </p>
            )}

            {note.content && (
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {note.content}
                </p>
            )}

            {parseTags(note.tags).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                    {parseTags(note.tags).map(tag => (
                        <span key={tag} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '10px' }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '10px' }}>
                {new Date(note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
        </motion.div>
    );
};

export default AssetNotes;
