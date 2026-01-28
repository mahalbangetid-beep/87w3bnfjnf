import { useState, useEffect, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus,
    HiOutlineBookmark,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineArchive,
    HiOutlineDotsVertical,
    HiOutlineCheck,
    HiOutlineTag,
    HiOutlineColorSwatch,
    HiOutlineRefresh,
} from 'react-icons/hi';
import { notesAPI, projectsAPI } from '../../services/api';
import { NotesEmptyState } from '../../components/UI';

// Helper to safely parse labels
const parseLabels = (labels) => {
    if (Array.isArray(labels)) return labels;
    if (typeof labels === 'string' && labels) {
        try { return JSON.parse(labels); } catch { return []; }
    }
    return [];
};
const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

const Notes = () => {
    const { t, i18n } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLabel, setFilterLabel] = useState('All');
    const [showArchived, setShowArchived] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [toggling, setToggling] = useState(null); // Track which note is being toggled
    const [error, setError] = useState('');

    // Helper to set error with auto-clear timeout
    const setErrorWithTimeout = (message, timeout = 5000) => {
        setError(message);
        setTimeout(() => setError(''), timeout);
    };

    // Click outside handler to close dropdown menu
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        color: '#8b5cf6',
        labels: [],
        pinned: false,
    });
    const [customLabelInput, setCustomLabelInput] = useState('');

    // Fetch notes from API
    const fetchNotes = async () => {
        try {
            setLoading(true);
            const [notesData, projectsData] = await Promise.all([
                notesAPI.getAll(showArchived),
                projectsAPI.getAll().catch(() => []),
            ]);
            // Parse labels if it's a string (JSON from backend)
            const parsedNotes = (notesData || []).map(note => ({
                ...note,
                labels: Array.isArray(note.labels)
                    ? note.labels
                    : (typeof note.labels === 'string' && note.labels
                        ? JSON.parse(note.labels)
                        : [])
            }));
            setNotes(parsedNotes);
            setProjects(projectsData || []);
        } catch (err) {
            console.error('Error fetching notes:', err);
            setErrorWithTimeout('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [showArchived]);

    // Use deferred value for search to improve performance
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Filter notes
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title?.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            note.content?.toLowerCase().includes(deferredSearchTerm.toLowerCase());
        const noteLabels = note.labels || [];
        const matchesLabel = filterLabel === 'All' || noteLabels.includes(filterLabel);
        return matchesSearch && matchesLabel;
    });

    // Separate pinned and unpinned
    const pinnedNotes = filteredNotes.filter((n) => n.pinned);
    const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

    // Get unique labels from all notes
    const usedLabels = [...new Set(notes.flatMap((n) => n.labels || []))];

    // Open modal for new note
    const handleNewNote = () => {
        setEditingNote(null);
        setFormData({
            title: '',
            content: '',
            color: '#8b5cf6',
            labels: [],
            pinned: false,
        });
        setShowModal(true);
    };

    // Open modal for editing
    const handleEditNote = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title || '',
            content: note.content || '',
            color: note.color || '#8b5cf6',
            labels: parseLabels(note.labels),
            pinned: note.pinned || false,
        });
        setShowModal(true);
        setOpenMenuId(null);
    };

    // Save note
    const handleSaveNote = async () => {
        if (!formData.title.trim()) {
            setErrorWithTimeout('Please enter a title');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingNote) {
                const updated = await notesAPI.update(editingNote.id, formData);
                setNotes(notes.map(n => n.id === editingNote.id ? updated : n));
            } else {
                const created = await notesAPI.create(formData);
                setNotes([created, ...notes]);
            }

            setShowModal(false);
            setEditingNote(null);
        } catch (err) {
            console.error('Error saving note:', err);
            setErrorWithTimeout(err.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    // Toggle pin
    const handleTogglePin = async (id) => {
        setToggling(id);
        setOpenMenuId(null);
        try {
            const updated = await notesAPI.togglePin(id);
            // Defensive check - ensure valid response
            if (updated && updated.id) {
                setNotes(notes.map(n => n.id === id ? updated : n));
            } else {
                // Fallback: just toggle the pinned state locally
                setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
            }
        } catch (err) {
            console.error('Error toggling pin:', err);
            setErrorWithTimeout('Failed to toggle pin');
        } finally {
            setToggling(null);
        }
    };

    // Toggle archive
    const handleToggleArchive = async (id) => {
        setToggling(id);
        try {
            await notesAPI.toggleArchive(id);
            // Remove from current view and refetch
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            // Error already handled by setErrorWithTimeout
            setErrorWithTimeout('Failed to toggle archive');
        } finally {
            setToggling(null);
        }
        setOpenMenuId(null);
    };

    // Delete note
    const handleDeleteNote = async (id) => {
        const noteId = Number(id); // Ensure consistent number type
        try {
            await notesAPI.delete(noteId);
            setNotes(notes.filter(n => n.id !== noteId));
            setShowDeleteConfirm(null);
            setOpenMenuId(null);
        } catch (err) {
            setErrorWithTimeout('Failed to delete note');
        }
    };

    // Toggle label in form
    const toggleLabel = (label) => {
        if (formData.labels.includes(label)) {
            setFormData({ ...formData, labels: formData.labels.filter((l) => l !== label) });
        } else {
            setFormData({ ...formData, labels: [...formData.labels, label] });
        }
    };

    // Format date with i18n support
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    };

    // Note Card Component
    const NoteCard = ({ note, index }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => handleEditNote(note)}
            style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: `${note.color || '#8b5cf6'}15`,
                border: `1px solid ${note.color || '#8b5cf6'}40`,
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0, flex: 1 }}>{note.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {note.pinned && (
                        <HiOutlineBookmark style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === note.id ? null : note.id);
                        }}
                        style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <HiOutlineDotsVertical style={{ width: '16px', height: '16px' }} />
                    </button>
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {openMenuId === note.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '40px',
                                backgroundColor: '#1a1a2e',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '8px',
                                zIndex: 50,
                                minWidth: '140px',
                            }}
                        >
                            <button onClick={() => handleEditNote(note)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#d1d5db', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                                <HiOutlinePencil style={{ width: '16px', height: '16px' }} /> Edit
                            </button>
                            <button onClick={() => handleTogglePin(note.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#d1d5db', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                                <HiOutlineBookmark style={{ width: '16px', height: '16px' }} /> {note.pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button onClick={() => handleToggleArchive(note.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#d1d5db', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                                <HiOutlineArchive style={{ width: '16px', height: '16px' }} /> {note.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => setShowDeleteConfirm(note.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                                <HiOutlineTrash style={{ width: '16px', height: '16px' }} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {note.content}
            </p>

            {/* Labels */}
            {parseLabels(note.labels).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {parseLabels(note.labels).map((label) => (
                        <span key={label} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#d1d5db' }}>
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {formatDate(note.updatedAt || note.createdAt)}
            </div>
        </motion.div>
    );

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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading notes...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.notes.title', 'Notes')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.notes.subtitle', 'Capture ideas and keep track of important information')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchNotes}
                        aria-label="Refresh notes"
                        title="Refresh notes"
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
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNewNote}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('work.notes.newNote', 'New Note')}
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

            {/* Search & Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '18px', height: '18px' }} />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                </div>
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: showArchived ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: showArchived ? '#a78bfa' : '#9ca3af',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    <HiOutlineArchive style={{ width: '16px', height: '16px' }} />
                    {showArchived ? 'Archived' : 'Active'}
                </button>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['All', ...usedLabels].map((label) => (
                        <button
                            key={label}
                            onClick={() => setFilterLabel(label)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: filterLabel === label ? 'rgba(139,92,246,0.2)' : 'transparent',
                                color: filterLabel === label ? '#a78bfa' : '#9ca3af',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineBookmark style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                        Pinned
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        <AnimatePresence>
                            {pinnedNotes.map((note, index) => (
                                <NoteCard key={note.id} note={note} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
                <div>
                    {pinnedNotes.length > 0 && (
                        <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', marginBottom: '16px' }}>Others</h2>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        <AnimatePresence>
                            {unpinnedNotes.map((note, index) => (
                                <NoteCard key={note.id} note={note} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredNotes.length === 0 && !loading && (
                <NotesEmptyState
                    onAction={handleNewNote}
                    isFiltered={!!(searchTerm || filterLabel !== 'All')}
                />
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
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
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                padding: '24px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                borderRadius: '20px',
                                backgroundColor: `${formData.color}15`,
                                border: `1px solid ${formData.color}40`,
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editingNote ? 'Edit Note' : 'New Note'}
                                </h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Title */}
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Note title..."
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        outline: 'none',
                                    }}
                                />

                                {/* Content */}
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your note here..."
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        lineHeight: '1.6',
                                    }}
                                />

                                {/* Color Picker */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        <HiOutlineColorSwatch style={{ width: '16px', height: '16px' }} />
                                        Color
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    border: formData.color === color ? '2px solid white' : '2px solid transparent',
                                                    backgroundColor: color,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {formData.color === color && <HiOutlineCheck style={{ color: 'white', width: '16px', height: '16px' }} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Labels */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        <HiOutlineTag style={{ width: '16px', height: '16px' }} />
                                        Labels
                                    </label>

                                    {/* Custom Label Input */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <input
                                            type="text"
                                            value={customLabelInput}
                                            onChange={(e) => setCustomLabelInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customLabelInput.trim()) {
                                                    e.preventDefault();
                                                    if (!formData.labels.includes(customLabelInput.trim())) {
                                                        setFormData({ ...formData, labels: [...formData.labels, customLabelInput.trim()] });
                                                    }
                                                    setCustomLabelInput('');
                                                }
                                            }}
                                            placeholder="Type custom label & press Enter"
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                color: 'white',
                                                fontSize: '13px',
                                                outline: 'none',
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (customLabelInput.trim() && !formData.labels.includes(customLabelInput.trim())) {
                                                    setFormData({ ...formData, labels: [...formData.labels, customLabelInput.trim()] });
                                                    setCustomLabelInput('');
                                                }
                                            }}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                backgroundColor: `${formData.color}30`,
                                                color: 'white',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Selected Labels */}
                                    {formData.labels.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            <span style={{ fontSize: '11px', color: '#6b7280', marginRight: '4px' }}>Selected:</span>
                                            {formData.labels.map((label) => (
                                                <span
                                                    key={label}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        backgroundColor: `${formData.color}40`,
                                                        color: 'white',
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    {label}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, labels: formData.labels.filter(l => l !== label) })}
                                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}
                                                    >
                                                        <HiOutlineX style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Link to Project */}
                                    {projects.length > 0 && (
                                        <>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', marginTop: '8px' }}>Link to Project:</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {projects.filter(p => !formData.labels.includes(`project:${p.name}`)).slice(0, 5).map((project) => (
                                                    <button
                                                        key={project.id}
                                                        onClick={() => {
                                                            const projectLabel = `project:${project.name}`;
                                                            if (!formData.labels.includes(projectLabel)) {
                                                                setFormData({ ...formData, labels: [...formData.labels, projectLabel] });
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            border: `1px solid ${project.color || '#8b5cf6'}50`,
                                                            backgroundColor: `${project.color || '#8b5cf6'}15`,
                                                            color: project.color || '#8b5cf6',
                                                            fontSize: '12px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.color || '#8b5cf6' }} />
                                                        {project.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Pin Toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => setFormData({ ...formData, pinned: !formData.pinned })}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            border: formData.pinned ? `1px solid ${formData.color}` : '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: formData.pinned ? `${formData.color}20` : 'transparent',
                                            color: formData.pinned ? '#fbbf24' : '#9ca3af',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <HiOutlineBookmark style={{ width: '16px', height: '16px' }} />
                                        {formData.pinned ? 'Pinned' : 'Pin this note'}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveNote}
                                        disabled={saving}
                                        className="btn-glow"
                                        style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {showDeleteConfirm && (
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
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#f87171' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Delete Note?</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteNote(showDeleteConfirm)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notes;
