import { useState, useEffect, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineFolder,
    HiOutlinePlus,
    HiOutlineDotsVertical,
    HiOutlineClock,
    HiOutlineUser,
    HiOutlineCurrencyDollar,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCalendar,
    HiOutlineDocumentReport,
    HiOutlineCheck,
    HiOutlineRefresh,
    HiOutlineUserAdd,
    HiOutlineFlag,
} from 'react-icons/hi';
import { projectsAPI, spaceAPI } from '../../services/api';
import { CollaborationPanel } from '../../components/Collaboration';
import { ProjectsEmptyState } from '../../components/UI';

const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
const reportingOptions = ['daily', 'weekly', 'monthly', 'daily,weekly', 'daily,monthly', 'weekly,monthly', 'daily,weekly,monthly'];
const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Review', value: 'review' },
    { label: 'Completed', value: 'completed' },
];


const Projects = () => {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingProgressId, setEditingProgressId] = useState(null);
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);
    const [projectMilestones, setProjectMilestones] = useState([]);

    // Dynamic currency formatting - always display as IDR (stored currency)
    // No conversion needed - just format for locale display
    const formatCurrency = (amount) => {
        const isID = i18n.language === 'id';
        return new Intl.NumberFormat(isID ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: 'IDR', // Always use stored currency
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        startDate: '',
        endDate: '',
        value: '',
        status: 'active',
        reportingFrequency: 'weekly',
        color: '#8b5cf6',
    });

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectsAPI.getAll();
            setProjects(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Click outside handler to close dropdown menu
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openMenuId]);

    // Helper to set error with auto-clear timeout
    const setErrorWithTimeout = (message, timeout = 5000) => {
        setError(message);
        setTimeout(() => setError(''), timeout);
    };

    // Fetch milestones when viewing a project
    useEffect(() => {
        const fetchMilestones = async () => {
            if (viewingProject?.id) {
                try {
                    const allMilestones = await spaceAPI.getMilestones();
                    const filtered = allMilestones.filter(m => m.projectId === viewingProject.id);
                    setProjectMilestones(filtered);
                } catch (err) {
                    console.error('Error fetching milestones:', err);
                    setProjectMilestones([]);
                }
            } else {
                setProjectMilestones([]);
            }
        };
        fetchMilestones();
    }, [viewingProject]);

    // Get project progress
    const getProgress = (project) => {
        if (project.progress !== undefined && project.progress !== null) {
            return project.progress;
        }
        // Fallback to date-based calculation
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const today = new Date();
        if (today < start) return 0;
        if (today > end) return 100;
        const total = end - start;
        const elapsed = today - start;
        return Math.round((elapsed / total) * 100);
    };

    // Update progress
    const handleProgressChange = async (projectId, newProgress) => {
        const value = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
        try {
            await projectsAPI.update(projectId, { progress: value });
            setProjects(projects.map(p =>
                p.id === projectId ? { ...p, progress: value } : p
            ));
        } catch (err) {
            setErrorWithTimeout('Error updating progress');
        }
    };

    // Handle clicking on progress bar
    const handleProgressBarClick = (e, projectId) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newProgress = Math.round((clickX / rect.width) * 100);
        handleProgressChange(projectId, newProgress);
    };

    // Calculate days remaining
    const getDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const today = new Date();
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Use deferred value for search to improve performance
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Filter projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name?.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            project.client?.toLowerCase().includes(deferredSearchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = {
        total: projects.length,
        active: projects.filter((p) => p.status === 'active').length,
        review: projects.filter((p) => p.status === 'review').length,
        completed: projects.filter((p) => p.status === 'completed').length,
    };

    // Open modal for new project
    const handleNewProject = () => {
        setEditingProject(null);
        setFormData({
            name: '',
            description: '',
            client: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            value: '',
            status: 'active',
            reportingFrequency: 'weekly',
            color: '#8b5cf6',
        });
        setShowModal(true);
    };

    // Open modal for editing
    const handleEditProject = (project) => {
        setEditingProject(project);
        setFormData({
            name: project.name || '',
            description: project.description || '',
            client: project.client || '',
            startDate: project.startDate || '',
            endDate: project.endDate || '',
            value: project.value?.toString() || '',
            status: project.status || 'active',
            reportingFrequency: project.reportingFrequency || 'weekly',
            color: project.color || '#8b5cf6',
        });
        setShowModal(true);
        setOpenMenuId(null);
    };

    // Save project (create or update)
    const handleSaveProject = async () => {
        if (!formData.name || !formData.client || !formData.startDate || !formData.endDate || !formData.value) {
            setErrorWithTimeout('Please fill all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const projectData = {
                ...formData,
                value: parseFloat(formData.value),
            };

            if (editingProject) {
                // Update existing
                const updated = await projectsAPI.update(editingProject.id, projectData);
                setProjects(projects.map(p => p.id === editingProject.id ? updated : p));
            } else {
                // Create new
                const created = await projectsAPI.create(projectData);
                setProjects([created, ...projects]);
            }

            setShowModal(false);
            setEditingProject(null);
        } catch (err) {
            console.error('Error saving project:', err);
            setErrorWithTimeout(err.message || 'Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    // Delete project
    const handleDeleteProject = async (id) => {
        try {
            await projectsAPI.delete(id);
            setProjects(projects.filter((p) => p.id !== id));
            setShowDeleteConfirm(null);
            setOpenMenuId(null);
        } catch (err) {
            console.error('Error deleting project:', err);
            setErrorWithTimeout(err.message || 'Failed to delete project');
        }
    };

    // Format reporting frequency for display
    const formatReporting = (freq) => {
        if (!freq) return 'Weekly';
        return freq.split(',').map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading projects...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.projects.title', 'Projects')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.projects.subtitle', 'Manage and track all your projects')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchProjects}
                        aria-label="Refresh projects"
                        title="Refresh projects"
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
                        {t('work.projects.newProject', 'New Project')}
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
                        placeholder="Search projects..."
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
                <div style={{ display: 'flex', gap: '8px' }}>
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filterStatus === filter.value ? 'rgba(139,92,246,0.2)' : 'transparent',
                                color: filterStatus === filter.value ? '#a78bfa' : '#9ca3af',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                    { label: 'Total Projects', value: stats.total, color: '#8b5cf6' },
                    { label: 'In Progress', value: stats.active, color: '#06b6d4' },
                    { label: 'In Review', value: stats.review, color: '#f59e0b' },
                    { label: 'Completed', value: stats.completed, color: '#10b981' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: `${stat.color}10`,
                            border: `1px solid ${stat.color}30`,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <AnimatePresence>
                    {filteredProjects.map((project, index) => {
                        const progress = getProgress(project);
                        const daysRemaining = getDaysRemaining(project.endDate);

                        return (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5, scale: 1.01 }}
                                onClick={() => setViewingProject(project)}
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
                                                setOpenMenuId(openMenuId === project.id ? null : project.id);
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
                                            {openMenuId === project.id && (
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
                                                        onClick={() => handleEditProject(project)}
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
                                                        onClick={() => { setSelectedProject(project); setOpenMenuId(null); }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: '#a78bfa',
                                                            fontSize: '13px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        <HiOutlineUserAdd style={{ width: '16px', height: '16px' }} />
                                                        Invite Team
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(project.id); setOpenMenuId(null); }}
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
                                <h3 style={{ fontWeight: '600', color: 'white', fontSize: '16px', marginBottom: '4px' }}>{project.name}</h3>
                                <p style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                    <HiOutlineUser style={{ width: '14px', height: '14px' }} /> {project.client || 'No client'}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {project.description || 'No description'}
                                </p>

                                {/* Dates */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: '#9ca3af' }}>
                                    <HiOutlineCalendar style={{ width: '14px', height: '14px' }} />
                                    <span>{project.startDate || '-'}</span>
                                    <span>→</span>
                                    <span>{project.endDate || '-'}</span>
                                </div>

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
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af' }}>
                                        <HiOutlineCurrencyDollar style={{ width: '14px', height: '14px' }} />
                                        {formatCurrency(project.value || 0)}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: daysRemaining < 0 ? '#f87171' : daysRemaining < 7 ? '#fb923c' : '#9ca3af' }}>
                                        <HiOutlineClock style={{ width: '14px', height: '14px' }} />
                                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                                    </span>
                                </div>

                                {/* Status & Reporting Badge */}
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '500', textTransform: 'capitalize', backgroundColor: project.status === 'active' ? 'rgba(16,185,129,0.2)' : project.status === 'review' ? 'rgba(249,115,22,0.2)' : 'rgba(6,182,212,0.2)', color: project.status === 'active' ? '#34d399' : project.status === 'review' ? '#fb923c' : '#06b6d4' }}>
                                        {project.status}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <HiOutlineDocumentReport style={{ width: '12px', height: '12px' }} />
                                        {formatReporting(project.reportingFrequency)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && !loading && (
                <ProjectsEmptyState
                    onAction={handleNewProject}
                    isFiltered={!!(searchTerm || filterStatus !== 'all')}
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
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '600px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editingProject ? 'Edit Project' : 'New Project'}
                                </h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Project Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Website Redesign"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                {/* Client */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Client / Company *</label>
                                    <input
                                        type="text"
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        placeholder="e.g. TechCorp Inc"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Project description..."
                                        rows={3}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Dates */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Start Date *</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>End Date *</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                {/* Value & Status */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Project Value (Rp) *</label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            placeholder="e.g. 15000000"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1a1a2e', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="review">In Review</option>
                                            <option value="completed">Completed</option>
                                            <option value="on-hold">On Hold</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Reporting Frequency */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Reporting Frequency</label>
                                    <select
                                        value={formData.reportingFrequency}
                                        onChange={(e) => setFormData({ ...formData, reportingFrequency: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1a1a2e', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        {reportingOptions.map((opt) => (
                                            <option key={opt} value={opt}>{formatReporting(opt)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Color */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Project Color</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    border: formData.color === color ? '2px solid white' : '2px solid transparent',
                                                    backgroundColor: color,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {formData.color === color && <HiOutlineCheck style={{ color: 'white' }} />}
                                            </button>
                                        ))}
                                    </div>
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
                                        onClick={handleSaveProject}
                                        disabled={saving}
                                        className="btn-glow"
                                        style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                        onClick={() => setShowDeleteConfirm(null)}
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Delete Project?</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>This action cannot be undone. Are you sure you want to delete this project?</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteProject(showDeleteConfirm)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collaboration Panel Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProject(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            zIndex: 1000,
                            padding: '20px',
                        }}
                    >
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '480px',
                                height: 'calc(100vh - 40px)',
                                overflowY: 'auto',
                            }}
                        >
                            <div style={{ marginBottom: 16 }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedProject(null)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <HiOutlineX /> Close
                                </motion.button>
                            </div>
                            <CollaborationPanel
                                projectId={selectedProject.id}
                                projectName={selectedProject.name}
                                isOwner={true}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Project Detail Modal */}
            <AnimatePresence>
                {viewingProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingProject(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, rotateX: -15 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, y: 50, rotateX: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                borderRadius: '28px',
                                background: 'linear-gradient(145deg, rgba(30,30,50,0.98), rgba(17,17,27,0.99))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Animated Background */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    top: -100,
                                    right: -100,
                                    width: 300,
                                    height: 300,
                                    background: `radial-gradient(circle, ${viewingProject.color || '#8b5cf6'}40 0%, transparent 70%)`,
                                    filter: 'blur(60px)',
                                    pointerEvents: 'none',
                                }}
                            />

                            {/* Header */}
                            <div style={{ padding: '28px 28px 0', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', delay: 0.2 }}
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 18,
                                                backgroundColor: `${viewingProject.color || '#8b5cf6'}30`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <HiOutlineFolder style={{ width: 32, height: 32, color: viewingProject.color || '#8b5cf6' }} />
                                        </motion.div>
                                        <div>
                                            <motion.h2
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'white' }}
                                            >
                                                {viewingProject.name}
                                            </motion.h2>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}
                                            >
                                                {viewingProject.client || 'Personal Project'}
                                            </motion.p>
                                        </div>
                                    </div>
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(239,68,68,0.2)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setViewingProject(null)}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <HiOutlineX style={{ width: 22, height: 22 }} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: 28, position: 'relative', zIndex: 1 }}>
                                {/* Status & Progress Row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}
                                >
                                    {/* Status */}
                                    <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Status</p>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: 20,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            background: viewingProject.status === 'active' ? 'rgba(16,185,129,0.2)' : viewingProject.status === 'completed' ? 'rgba(6,182,212,0.2)' : 'rgba(249,115,22,0.2)',
                                            color: viewingProject.status === 'active' ? '#34d399' : viewingProject.status === 'completed' ? '#22d3ee' : '#fb923c',
                                        }}>
                                            {viewingProject.status}
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Progress</p>
                                        <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto' }}>
                                            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                                                <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                                <motion.circle
                                                    cx="30" cy="30" r="25" fill="none"
                                                    stroke={viewingProject.color || '#8b5cf6'}
                                                    strokeWidth="6"
                                                    strokeLinecap="round"
                                                    initial={{ strokeDasharray: 157, strokeDashoffset: 157 }}
                                                    animate={{ strokeDashoffset: 157 - (157 * (viewingProject.progress || 0)) / 100 }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                />
                                            </svg>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14 }}>
                                                {viewingProject.progress || 0}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Budget */}
                                    <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Budget</p>
                                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                                            {formatCurrency(viewingProject.value || 0)}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Description */}
                                {viewingProject.description && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'white' }}>Description</h4>
                                        <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', lineHeight: 1.7, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                                            {viewingProject.description}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Timeline */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    style={{ display: 'flex', gap: 16, marginBottom: 24 }}
                                >
                                    <div style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <HiOutlineCalendar style={{ width: 20, height: 20, color: '#6b7280' }} />
                                        <div>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Start Date</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'white' }}>{viewingProject.startDate || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <HiOutlineCalendar style={{ width: 20, height: 20, color: '#6b7280' }} />
                                        <div>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>End Date</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'white' }}>{viewingProject.endDate || 'Not set'}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Milestones Section */}
                                {projectMilestones.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.65 }}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <HiOutlineFlag style={{ width: 18, height: 18, color: '#a78bfa' }} />
                                            Milestones ({projectMilestones.length})
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {projectMilestones.map((milestone, idx) => (
                                                <motion.div
                                                    key={milestone.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.7 + idx * 0.1 }}
                                                    style={{
                                                        padding: 14,
                                                        borderRadius: 12,
                                                        background: 'rgba(255,255,255,0.02)',
                                                        border: `1px solid ${milestone.color || '#8b5cf6'}30`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 14,
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 10,
                                                        background: `${milestone.color || '#8b5cf6'}20`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <HiOutlineFlag style={{ width: 18, height: 18, color: milestone.color || '#8b5cf6' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>
                                                            {milestone.title}
                                                        </p>
                                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                                                            {milestone.date} • <span style={{
                                                                color: milestone.status === 'completed' ? '#34d399' :
                                                                    milestone.status === 'active' ? '#fbbf24' : '#9ca3af'
                                                            }}>{milestone.status}</span>
                                                        </p>
                                                    </div>
                                                    {milestone.status === 'completed' && (
                                                        <div style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: 'rgba(16,185,129,0.2)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <HiOutlineCheck style={{ width: 14, height: 14, color: '#34d399' }} />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {projectMilestones.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.65 }}
                                        style={{
                                            marginBottom: 24,
                                            padding: 20,
                                            borderRadius: 12,
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px dashed rgba(255,255,255,0.1)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <HiOutlineFlag style={{ width: 24, height: 24, color: '#4b5563', marginBottom: 8 }} />
                                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                                            No milestones linked to this project
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#4b5563' }}>
                                            Create milestones in Space → Roadmap and link them to this project
                                        </p>
                                    </motion.div>
                                )}

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    style={{ display: 'flex', gap: 12 }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { handleEditProject(viewingProject); setViewingProject(null); }}
                                        style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}
                                    >
                                        <HiOutlinePencil style={{ width: 18, height: 18 }} /> Edit Project
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setSelectedProject(viewingProject); setViewingProject(null); }}
                                        style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}
                                    >
                                        <HiOutlineUser style={{ width: 18, height: 18 }} /> Invite Team
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
