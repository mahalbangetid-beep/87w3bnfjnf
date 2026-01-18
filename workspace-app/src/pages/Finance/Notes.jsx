import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
    HiOutlineX, HiOutlineBookmark, HiOutlineArchive, HiOutlineTag
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#6b7280'];

const Notes = () => {
    const { t, i18n } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [filter, setFilter] = useState('active'); // active, pinned, archived
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        color: '#8b5cf6',
        isPinned: false,
        tags: []
    });
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [filter]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const params = filter === 'archived' ? { isArchived: 'true' } :
                filter === 'pinned' ? { isPinned: 'true', isArchived: 'false' } :
                    { isArchived: 'false' };
            const data = await financeAPI.getNotes(params);
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: 'general',
            color: '#8b5cf6',
            isPinned: false,
            tags: []
        });
        setNewTag('');
        setEditNote(null);
    };

    const openEditModal = (note) => {
        setEditNote(note);
        setFormData({
            title: note.title,
            content: note.content || '',
            type: note.type,
            color: note.color || '#8b5cf6',
            isPinned: note.isPinned,
            tags: note.tags || []
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert(t('finance.notes.titleRequired'));
            return;
        }

        setSaving(true);
        try {
            if (editNote) {
                await financeAPI.updateNote(editNote.id, formData);
            } else {
                await financeAPI.createNote(formData);
            }
            setShowModal(false);
            resetForm();
            fetchNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            alert(error.message || t('finance.notes.saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('finance.notes.confirmDelete'))) return;

        try {
            await financeAPI.deleteNote(id);
            fetchNotes();
        } catch (error) {
            alert(error.message || t('finance.notes.deleteFailed'));
        }
    };

    const togglePin = async (note) => {
        try {
            await financeAPI.updateNote(note.id, { isPinned: !note.isPinned });
            fetchNotes();
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const toggleArchive = async (note) => {
        try {
            await financeAPI.updateNote(note.id, { isArchived: !note.isArchived });
            fetchNotes();
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.notes.title', 'Finance Notes')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.notes.subtitle', 'Save notes and reminders related to finance')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchNotes}
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
                        {t('finance.notes.addNote')}
                    </motion.button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {[
                    { key: 'active', label: t('finance.notes.active') },
                    { key: 'pinned', label: t('finance.notes.pinned') },
                    { key: 'archived', label: t('finance.notes.archived') }
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

            {/* Notes Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('common.loading')}</div>
            ) : notes.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <HiOutlineBookmark style={{ width: '64px', height: '64px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>{t('finance.notes.noNotes')}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>{t('finance.notes.createFirst')}</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', cursor: 'pointer', fontSize: '14px' }}
                    >
                        {t('finance.notes.addNote')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Pinned Notes */}
                    {pinnedNotes.length > 0 && filter !== 'archived' && (
                        <div>
                            <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <HiOutlineBookmark /> {t('finance.notes.pinned')}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {pinnedNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} language={i18n.language} onEdit={openEditModal} onDelete={handleDelete} onTogglePin={togglePin} onToggleArchive={toggleArchive} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Notes */}
                    {otherNotes.length > 0 && (
                        <div>
                            {pinnedNotes.length > 0 && filter !== 'archived' && (
                                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>{t('finance.notes.others')}</h3>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {otherNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} language={i18n.language} onEdit={openEditModal} onDelete={handleDelete} onTogglePin={togglePin} onToggleArchive={toggleArchive} />
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
                            style={{ padding: '24px', width: '100%', maxWidth: '500px', borderTop: `4px solid ${formData.color}` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editNote ? t('finance.notes.editNote') : t('finance.notes.addNote')}
                                </h3>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.notes.titleLabel')} *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Judul catatan"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.notes.content')}</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Tulis catatan Anda..."
                                        rows={5}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.notes.type')}</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="general">{t('finance.notes.general')}</option>
                                            <option value="transaction">{t('finance.notes.transaction')}</option>
                                            <option value="reminder">{t('finance.notes.reminder')}</option>
                                            <option value="goal">{t('finance.notes.goal')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.notes.color')}</label>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        backgroundColor: color,
                                                        border: formData.color === color ? '2px solid white' : 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{t('finance.notes.tags')}</label>
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
                                            {t('finance.notes.add')}
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

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isPinned} onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>{t('finance.notes.pinNote')}</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>{t('common.cancel')}</button>
                                <button onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                    {saving ? t('finance.notes.saving') : t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NoteCard = ({ note, index, language, onEdit, onDelete, onTogglePin, onToggleArchive }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card"
        style={{ padding: '20px', borderTop: `4px solid ${note.color || '#8b5cf6'}`, cursor: 'pointer' }}
        onClick={() => onEdit(note)}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>{note.title}</h3>
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
        {note.content && (
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {note.content}
            </p>
        )}
        {note.tags && note.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                {note.tags.map(tag => (
                    <span key={tag} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '11px' }}>
                        {tag}
                    </span>
                ))}
            </div>
        )}
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '12px' }}>
            {new Date(note.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
    </motion.div>
);

export default Notes;
