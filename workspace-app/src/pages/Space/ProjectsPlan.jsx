import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePlus,
    HiOutlineX,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlinePhotograph,
    HiOutlineLink,
    HiOutlineChevronRight,
    HiOutlineCalendar,
    HiOutlineDotsVertical,
    HiOutlineLightBulb,
    HiOutlineEye,
    HiOutlineFolder,
    HiOutlineClock,
} from 'react-icons/hi';
import { projectPlansAPI } from '../../services/api';

const statusConfig = {
    idea: { label: 'Idea', color: '#6b7280', bg: 'rgba(107,114,128,0.2)' },
    planning: { label: 'Planning', color: '#f59e0b', bg: 'rgba(245,158,11,0.2)' },
    development: { label: 'Development', color: '#8b5cf6', bg: 'rgba(139,92,246,0.2)' },
    testing: { label: 'Testing', color: '#06b6d4', bg: 'rgba(6,182,212,0.2)' },
    launching: { label: 'Launching', color: '#ec4899', bg: 'rgba(236,72,153,0.2)' },
    launched: { label: 'Launched', color: '#10b981', bg: 'rgba(16,185,129,0.2)' },
};

const priorityConfig = {
    low: { label: 'Low', color: '#10b981' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#ef4444' },
};

const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1'];

const ProjectsPlan = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingProgressId, setEditingProgressId] = useState(null);
    const editorRef = useRef(null);
    const descriptionRef = useRef(''); // Store description separately to avoid re-renders
    const [editorKey, setEditorKey] = useState(0); // Key to force re-mount editor
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [insertImageUrl, setInsertImageUrl] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'idea',
        priority: 'medium',
        color: '#8b5cf6',
        targetDate: '',
        progress: 0,
        tags: [],
        links: [],
    });

    const [newTag, setNewTag] = useState('');
    const [newLink, setNewLink] = useState({ title: '', url: '' });
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [insertLinkData, setInsertLinkData] = useState({ url: '', text: '' });

    // Fetch projects
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectPlansAPI.getAll();
            // Parse tags if it's a string (JSON from backend)
            const parsedProjects = (data || []).map(project => ({
                ...project,
                tags: Array.isArray(project.tags)
                    ? project.tags
                    : (typeof project.tags === 'string' && project.tags
                        ? JSON.parse(project.tags)
                        : [])
            }));
            setProjects(parsedProjects);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load project plans'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Get days remaining
    const getDaysRemaining = (targetDate) => {
        if (!targetDate) return null;
        const target = new Date(targetDate);
        const today = new Date();
        const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchSearch = project.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Handle progress bar click
    const handleProgressBarClick = async (e, projectId) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newProgress = Math.round((clickX / rect.width) * 100);
        await handleProgressChange(projectId, newProgress);
    };

    // Update progress
    const handleProgressChange = async (projectId, newProgress) => {
        const value = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
        try {
            await projectPlansAPI.updateProgress(projectId, value);
            setProjects(projects.map(p =>
                p.id === projectId ? { ...p, progress: value } : p
            ));
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to update progress'));
        }
    };

    // Open modal for new/edit project
    const handleNewProject = () => {
        setEditingProject(null);
        descriptionRef.current = '';
        setFormData({
            name: '',
            description: '',
            status: 'idea',
            priority: 'medium',
            color: '#8b5cf6',
            targetDate: '',
            progress: 0,
            tags: [],
            links: [],
        });
        setEditorKey(k => k + 1); // Force editor re-mount
        setShowModal(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        descriptionRef.current = project.description || '';
        setFormData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            priority: project.priority,
            color: project.color,
            targetDate: project.targetDate || '',
            progress: project.progress || 0,
            tags: project.tags || [],
            links: project.links || [],
        });
        setEditorKey(k => k + 1); // Force editor re-mount
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleViewProject = (project) => {
        setViewingProject(project);
        setShowViewModal(true);
        setActiveMenu(null);
    };

    // Save project
    const handleSaveProject = async () => {
        if (!formData.name.trim()) {
            setError('Please enter a project name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const description = descriptionRef.current || (editorRef.current ? editorRef.current.innerHTML : formData.description);

            const data = {
                ...formData,
                description,
            };

            if (editingProject) {
                const updated = await projectPlansAPI.update(editingProject.id, data);
                setProjects(projects.map(p => p.id === editingProject.id ? updated : p));
            } else {
                const created = await projectPlansAPI.create(data);
                setProjects([created, ...projects]);
            }

            setShowModal(false);
        } catch (err) {
            setErrorWithTimeout(err.message || t('errors.generic', 'Failed to save project'));
        } finally {
            setSaving(false);
        }
    };

    // Delete project - show confirmation modal
    const handleDeleteProject = (id) => {
        setConfirmDelete(id);
        setActiveMenu(null);
    };

    const confirmDeleteAction = async () => {
        if (confirmDelete) {
            try {
                await projectPlansAPI.delete(confirmDelete);
                setProjects(projects.filter(p => p.id !== confirmDelete));
            } catch {
                setErrorWithTimeout(t('errors.generic', 'Failed to delete project'));
            } finally {
                setConfirmDelete(null);
            }
        }
    };

    // Editor functions
    const insertImage = () => {
        setShowImageModal(true);
        setInsertImageUrl('');
    };

    const confirmInsertImage = () => {
        if (insertImageUrl && editorRef.current) {
            const img = document.createElement('img');
            img.src = insertImageUrl;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.margin = '8px 0';
            editorRef.current.appendChild(img);
        }
        setShowImageModal(false);
    };

    const insertLink = () => {
        setShowLinkModal(true);
        setInsertLinkData({ url: '', text: '' });
    };

    const confirmInsertLink = () => {
        if (insertLinkData.url && editorRef.current) {
            const text = insertLinkData.text || insertLinkData.url;
            document.execCommand('insertHTML', false, `<a href="${insertLinkData.url}" target="_blank" style="color:#a78bfa;text-decoration:underline;">${text}</a>`);
        }
        setShowLinkModal(false);
    };

    // Tag management
    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    // Link management
    const handleAddLink = () => {
        if (newLink.title.trim() && newLink.url.trim()) {
            setFormData({ ...formData, links: [...formData.links, { ...newLink }] });
            setNewLink({ title: '', url: '' });
        }
    };

    const handleRemoveLink = (index) => {
        setFormData({ ...formData, links: formData.links.filter((_, i) => i !== index) });
    };

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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading project plans...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.projects.title', 'Projects Plan')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.projects.subtitle', 'Plan and launch your project ideas')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchProjects}
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
                        onClick={handleNewProject}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        New Project
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

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6b7280' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects..."
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
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', ...Object.keys(statusConfig)].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filterStatus === status ? 'rgba(139,92,246,0.2)' : 'transparent',
                                color: filterStatus === status ? '#a78bfa' : '#9ca3af',
                                fontSize: '12px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}
                        >
                            {status === 'all' ? 'All' : statusConfig[status]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Cards */}
            {filteredProjects.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <HiOutlineLightBulb style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No project plans yet</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Start planning your next big idea!</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={handleNewProject}
                        className="btn-glow"
                        style={{ fontSize: '14px' }}
                    >
                        Create Project Plan
                    </motion.button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    <AnimatePresence>
                        {filteredProjects.map((project, index) => {
                            const status = statusConfig[project.status] || statusConfig.idea;
                            const priority = priorityConfig[project.priority] || priorityConfig.medium;
                            const progress = project.progress || 0;
                            const daysRemaining = getDaysRemaining(project.targetDate);

                            return (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    className="glass-card"
                                    style={{ padding: '20px', cursor: 'pointer', position: 'relative' }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                backgroundColor: `${project.color || '#8b5cf6'}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <HiOutlineFolder style={{ width: '24px', height: '24px', color: project.color || '#8b5cf6' }} />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === project.id ? null : project.id);
                                                }}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: '#9ca3af',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <HiOutlineDotsVertical />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {activeMenu === project.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        style={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '100%',
                                                            backgroundColor: '#1a1a2e',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '10px',
                                                            padding: '8px',
                                                            zIndex: 50,
                                                            minWidth: '140px',
                                                        }}
                                                    >
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleViewProject(project); }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: '#d1d5db',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                textAlign: 'left',
                                                            }}
                                                        >
                                                            <HiOutlineEye style={{ width: '16px', height: '16px' }} />
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: '#d1d5db',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                textAlign: 'left',
                                                            }}
                                                        >
                                                            <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: '#f87171',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                textAlign: 'left',
                                                            }}
                                                        >
                                                            <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                                            Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Project Info */}
                                    <h3
                                        style={{ fontWeight: '600', color: 'white', fontSize: '16px', marginBottom: '8px', cursor: 'pointer' }}
                                        onClick={() => handleViewProject(project)}
                                    >
                                        {project.name}
                                    </h3>

                                    {/* Tags */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '10px',
                                            fontWeight: '500',
                                            backgroundColor: status.bg,
                                            color: status.color,
                                        }}>
                                            {status.label}
                                        </span>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '10px',
                                            fontWeight: '500',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            color: priority.color,
                                        }}>
                                            {priority.label}
                                        </span>
                                    </div>

                                    {/* Description preview */}
                                    {project.description && (
                                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {project.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                        </p>
                                    )}

                                    {/* Progress */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Progress
                                                <span style={{ fontSize: '10px', color: '#6b7280' }}>(click to edit)</span>
                                            </span>
                                            {editingProgressId === project.id ? (
                                                <input
                                                    type="number"
                                                    value={progress}
                                                    onChange={(e) => handleProgressChange(project.id, e.target.value)}
                                                    onBlur={() => setEditingProgressId(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingProgressId(null)}
                                                    autoFocus
                                                    min="0"
                                                    max="100"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        width: '50px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(139,92,246,0.5)',
                                                        backgroundColor: 'rgba(139,92,246,0.1)',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        textAlign: 'right',
                                                        outline: 'none',
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProgressId(project.id);
                                                    }}
                                                    style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                >
                                                    {progress}%
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            onClick={(e) => handleProgressBarClick(e, project.id)}
                                            style={{
                                                height: '8px',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                position: 'relative',
                                            }}
                                            title="Click to set progress"
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    height: '100%',
                                                    background: `linear-gradient(90deg, ${project.color || '#8b5cf6'}, ${project.color || '#8b5cf6'}99)`,
                                                    borderRadius: '10px',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {(project.tags || []).slice(0, 2).map((tag, i) => (
                                                <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        {daysRemaining !== null && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: daysRemaining < 0 ? '#f87171' : daysRemaining < 7 ? '#fb923c' : '#9ca3af' }}>
                                                <HiOutlineClock style={{ width: '14px', height: '14px' }} />
                                                {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', overflowY: 'auto' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingProject ? 'Edit Project' : 'New Project Plan'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Name */}
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Project name..."
                                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '16px', fontWeight: '500', outline: 'none' }}
                                />

                                {/* Rich Text Editor */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '12px', color: '#9ca3af' }}>Description (supports images & links)</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={insertImage} type="button" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <HiOutlinePhotograph style={{ width: '14px', height: '14px' }} /> Image
                                            </button>
                                            <button onClick={insertLink} type="button" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <HiOutlineLink style={{ width: '14px', height: '14px' }} /> Link
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        key={editorKey}
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descriptionRef.current) }}
                                        style={{
                                            minHeight: '200px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            outline: 'none',
                                        }}
                                        onInput={(e) => {
                                            // Update ref without causing re-render
                                            descriptionRef.current = e.currentTarget.innerHTML;
                                        }}
                                        onBlur={(e) => {
                                            // Sync to formData on blur for save
                                            descriptionRef.current = e.currentTarget.innerHTML;
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const html = e.clipboardData.getData('text/html');
                                            const text = e.clipboardData.getData('text/plain');
                                            document.execCommand('insertHTML', false, html || text);
                                        }}
                                    />
                                </div>

                                {/* Status, Priority, Target Date */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {Object.entries(statusConfig).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {Object.entries(priorityConfig).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Target Date</label>
                                        <input
                                            type="date"
                                            value={formData.targetDate}
                                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                {/* Progress & Color */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Progress: {formData.progress}%</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.progress}
                                            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                            style={{ width: '100%', accentColor: formData.color }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Color</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        border: formData.color === color ? '2px solid white' : '2px solid transparent',
                                                        backgroundColor: color,
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Tags</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {formData.tags.map((tag, i) => (
                                            <span key={i} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)} type="button" style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0 }}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Add tag..."
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', outline: 'none' }}
                                        />
                                        <button onClick={handleAddTag} type="button" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: '13px', cursor: 'pointer' }}>Add</button>
                                    </div>
                                </div>

                                {/* Links */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>External Links</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                        {formData.links.map((link, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                                <HiOutlineLink style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: '#a78bfa', fontSize: '13px', textDecoration: 'none' }}>{link.title}</a>
                                                <button onClick={() => handleRemoveLink(i)} type="button" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={newLink.title}
                                            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                            placeholder="Link title"
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', outline: 'none' }}
                                        />
                                        <input
                                            type="url"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            placeholder="https://..."
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', outline: 'none' }}
                                        />
                                        <button onClick={handleAddLink} type="button" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(6,182,212,0.2)', color: '#06b6d4', fontSize: '13px', cursor: 'pointer' }}>Add</button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProject} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {showViewModal && viewingProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', overflowY: 'auto' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}
                        >
                            {/* Header with color */}
                            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: `linear-gradient(135deg, ${viewingProject.color}20, transparent)` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>{viewingProject.name}</h2>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: statusConfig[viewingProject.status]?.bg,
                                                color: statusConfig[viewingProject.status]?.color,
                                            }}>
                                                {statusConfig[viewingProject.status]?.label}
                                            </span>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                color: priorityConfig[viewingProject.priority]?.color,
                                            }}>
                                                {priorityConfig[viewingProject.priority]?.label} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { handleEditProject(viewingProject); setShowViewModal(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                            <HiOutlinePencil style={{ width: '14px', height: '14px' }} /> Edit
                                        </button>
                                        <button onClick={() => setShowViewModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                            <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>Progress</span>
                                        <span style={{ fontSize: '13px', color: viewingProject.color }}>{viewingProject.progress || 0}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${viewingProject.progress || 0}%`, height: '100%', backgroundColor: viewingProject.color, borderRadius: '10px' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '24px' }}>
                                {/* Description */}
                                {viewingProject.description && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h3>
                                        <div
                                            style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.7' }}
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingProject.description) }}
                                        />
                                    </div>
                                )}

                                {/* Info Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    {viewingProject.targetDate && (
                                        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Target Date</p>
                                            <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>{viewingProject.targetDate}</p>
                                        </div>
                                    )}
                                    {viewingProject.launchDate && (
                                        <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.1)' }}>
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Launch Date</p>
                                            <p style={{ fontSize: '14px', color: '#34d399', margin: 0 }}>{viewingProject.launchDate}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                {viewingProject.tags && viewingProject.tags.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</h3>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {viewingProject.tags.map((tag, i) => (
                                                <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Links */}
                                {viewingProject.links && viewingProject.links.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Links</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {viewingProject.links.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', color: '#a78bfa', textDecoration: 'none', fontSize: '14px' }}
                                                >
                                                    <HiOutlineLink style={{ width: '16px', height: '16px' }} />
                                                    {link.title}
                                                    <HiOutlineChevronRight style={{ width: '14px', height: '14px', marginLeft: 'auto', color: '#6b7280' }} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insert Link Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px' }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 20px 0' }}>Insert Link</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link URL *</label>
                                    <input
                                        type="url"
                                        value={insertLinkData.url}
                                        onChange={(e) => setInsertLinkData({ ...insertLinkData, url: e.target.value })}
                                        placeholder="https://example.com"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link Text (optional)</label>
                                    <input
                                        type="text"
                                        value={insertLinkData.text}
                                        onChange={(e) => setInsertLinkData({ ...insertLinkData, text: e.target.value })}
                                        placeholder="Click here"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowLinkModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button onClick={confirmInsertLink} disabled={!insertLinkData.url} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: insertLinkData.url ? 1 : 0.5 }}>
                                        Insert
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}

                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{t('space.confirmDeleteProject', 'Delete Project Plan?')}</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={confirmDeleteAction} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insert Image Modal */}
            <AnimatePresence>
                {showImageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px' }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 20px 0' }}>Insert Image</h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Image URL *</label>
                                <input
                                    type="url"
                                    value={insertImageUrl}
                                    onChange={(e) => setInsertImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button onClick={() => setShowImageModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={confirmInsertImage} disabled={!insertImageUrl} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: insertImageUrl ? 1 : 0.5 }}>
                                    Insert
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
                    div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default ProjectsPlan;
