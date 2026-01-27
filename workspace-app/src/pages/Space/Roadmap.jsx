import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineMap,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheck,
    HiOutlineClock,
    HiOutlineFlag,
    HiOutlinePencil,
    HiOutlineTrash,
} from 'react-icons/hi';
import { spaceAPI, projectPlansAPI } from '../../services/api';

const Roadmap = () => {
    const { t } = useTranslation();
    const [milestones, setMilestones] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };
    const [showModal, setShowModal] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [selectedProject, setSelectedProject] = useState('all');
    const [viewMode, setViewMode] = useState('timeline'); // timeline, kanban
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'upcoming',
        phase: 'planning',
        projectId: null,
    });

    // Get months for timeline
    const getTimelineMonths = () => {
        const months = [];
        const now = new Date();
        for (let i = -2; i <= 9; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push({
                key: `${date.getFullYear()}-${date.getMonth()}`,
                label: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
                year: date.getFullYear(),
                month: date.getMonth(),
            });
        }
        return months;
    };

    const timelineMonths = getTimelineMonths();

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [milestonesData, projectsData] = await Promise.all([
                spaceAPI.getMilestones(),
                projectPlansAPI.getAll(),
            ]);
            setMilestones(milestonesData || []);
            setProjects(projectsData || []);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load roadmap data'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter milestones by project
    const filteredMilestones = selectedProject === 'all'
        ? milestones
        : milestones.filter(m => m.projectId === parseInt(selectedProject));

    // Group milestones by month
    const getMilestonesByMonth = (monthKey) => {
        return filteredMilestones.filter(m => {
            const date = new Date(m.date);
            return `${date.getFullYear()}-${date.getMonth()}` === monthKey;
        });
    };

    // Group milestones by status for kanban
    const getMilestonesByStatus = (status) => {
        return filteredMilestones.filter(m => m.status === status);
    };

    // Handle save milestone
    const handleSave = async () => {
        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingMilestone) {
                const updated = await spaceAPI.updateMilestone(editingMilestone.id, formData);
                setMilestones(milestones.map(m => m.id === editingMilestone.id ? updated : m));
            } else {
                const created = await spaceAPI.createMilestone(formData);
                setMilestones([...milestones, created]);
            }
            setShowModal(false);
            setEditingMilestone(null);
            setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'upcoming', phase: 'planning', projectId: null });
        } catch (err) {
            setErrorWithTimeout(err.message || t('errors.generic', 'Failed to save milestone'));
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            title: milestone.title,
            description: milestone.description || '',
            date: milestone.date,
            status: milestone.status,
            phase: milestone.phase || 'planning',
            projectId: milestone.projectId,
        });
        setShowModal(true);
    };

    // Handle delete - show confirmation modal
    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteAction = async () => {
        if (confirmDelete) {
            try {
                await spaceAPI.deleteMilestone(confirmDelete);
                setMilestones(milestones.filter(m => m.id !== confirmDelete));
            } catch {
                setErrorWithTimeout(t('errors.generic', 'Failed to delete milestone'));
            } finally {
                setConfirmDelete(null);
            }
        }
    };

    // Update milestone status
    const handleStatusChange = async (id, status) => {
        try {
            await spaceAPI.updateMilestone(id, { status });
            setMilestones(milestones.map(m => m.id === id ? { ...m, status } : m));
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to update status'));
        }
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || 'No Project';
    };

    const getProjectColor = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.color || '#8b5cf6';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading roadmap...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.roadmap.title', 'Roadmap')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.roadmap.subtitle', 'Visual timeline for your project milestones')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEditingMilestone(null); setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'upcoming', phase: 'planning', projectId: null }); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Milestone
                    </motion.button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Filters & View Toggle */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
                    {['timeline', 'kanban'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: viewMode === mode ? 'rgba(139,92,246,0.2)' : 'transparent',
                                color: viewMode === mode ? '#a78bfa' : '#6b7280',
                                fontSize: '13px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
                    {/* Timeline Header */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '20px', minWidth: '800px' }}>
                        {timelineMonths.map((month) => {
                            const isCurrentMonth = month.month === new Date().getMonth() && month.year === new Date().getFullYear();
                            return (
                                <div
                                    key={month.key}
                                    style={{
                                        flex: 1,
                                        minWidth: '100px',
                                        textAlign: 'center',
                                        padding: '8px',
                                        backgroundColor: isCurrentMonth ? 'rgba(139,92,246,0.1)' : 'transparent',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: isCurrentMonth ? '600' : '400', color: isCurrentMonth ? '#a78bfa' : '#9ca3af' }}>
                                        {month.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Timeline Content */}
                    <div style={{ display: 'flex', minWidth: '800px', position: 'relative' }}>
                        {/* Timeline Line */}
                        <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                        {timelineMonths.map((month) => {
                            const monthMilestones = getMilestonesByMonth(month.key);
                            return (
                                <div key={month.key} style={{ flex: 1, minWidth: '100px', padding: '0 4px' }}>
                                    {monthMilestones.map((milestone, idx) => (
                                        <motion.div
                                            key={milestone.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{
                                                marginTop: idx === 0 ? '40px' : '8px',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${getProjectColor(milestone.projectId)}40`,
                                                borderLeft: `3px solid ${getProjectColor(milestone.projectId)}`,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleEdit(milestone)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                {milestone.status === 'completed' ? (
                                                    <HiOutlineCheck style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                                ) : milestone.status === 'active' ? (
                                                    <HiOutlineClock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                                                ) : (
                                                    <HiOutlineFlag style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                                )}
                                                <span style={{ fontSize: '12px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {milestone.title}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#6b7280' }}>{getProjectName(milestone.projectId)}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                        { status: 'upcoming', label: 'Upcoming', color: '#6b7280' },
                        { status: 'active', label: 'In Progress', color: '#f59e0b' },
                        { status: 'completed', label: 'Completed', color: '#10b981' },
                    ].map(({ status, label, color }) => (
                        <div key={status} className="glass-card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>{label}</h3>
                                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>
                                    {getMilestonesByStatus(status).length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {getMilestonesByStatus(status).map((milestone) => (
                                    <motion.div
                                        key={milestone.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${getProjectColor(milestone.projectId)}40`,
                                            borderLeft: `3px solid ${getProjectColor(milestone.projectId)}`,
                                        }}
                                    >
                                        <h4 style={{ fontSize: '13px', fontWeight: '500', color: 'white', margin: '0 0 8px 0' }}>{milestone.title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>{milestone.date}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => handleEdit(milestone)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                                    <HiOutlinePencil style={{ width: '12px', height: '12px' }} />
                                                </button>
                                                <button onClick={() => handleDelete(milestone.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                                    <HiOutlineTrash style={{ width: '12px', height: '12px' }} />
                                                </button>
                                            </div>
                                        </div>
                                        {status !== 'completed' && (
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                                {status === 'upcoming' && (
                                                    <button
                                                        onClick={() => handleStatusChange(milestone.id, 'active')}
                                                        style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '11px', cursor: 'pointer' }}
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(milestone.id, 'completed')}
                                                        style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '11px', cursor: 'pointer' }}
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {getMilestonesByStatus(status).length === 0 && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No milestones</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Milestone title..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description (optional)..."
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="active">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link to Project</label>
                                    <select
                                        value={formData.projectId || ''}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value ? parseInt(e.target.value) : null })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingMilestone ? 'Update' : 'Create'}
                                    </motion.button>
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{t('space.confirmDeleteMilestone', 'Delete Milestone?')}</h3>
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

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Roadmap;
