import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineMap,
    HiOutlineFlag,
    HiOutlineSparkles,
    HiOutlineLightningBolt,
    HiOutlineChartBar,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCheck,
} from 'react-icons/hi';
import { spaceAPI, projectsAPI } from '../../services/api';

const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const RingChart = ({ percentage, size = 100, color }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: size * 0.22, fontWeight: '700', color: 'white' }}>{percentage}%</span>
            </div>
        </div>
    );
};

const SpaceDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [milestones, setMilestones] = useState([]);
    const [goals, setGoals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({
        activeStrategies: 0,
        goalsAchieved: 0,
        inProgress: 0,
        completionRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    // Modal states
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);

    // Form states
    const [milestoneForm, setMilestoneForm] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'upcoming',
        color: '#8b5cf6',
        projectId: null,
    });

    const [goalForm, setGoalForm] = useState({
        name: '',
        description: '',
        current: 0,
        target: 100,
        unit: 'units',
        color: '#8b5cf6',
        deadline: '',
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [milestonesData, goalsData, statsData, projectsData] = await Promise.all([
                spaceAPI.getMilestones(),
                spaceAPI.getGoals(),
                spaceAPI.getStats(),
                projectsAPI.getAll().catch(() => []),
            ]);
            setMilestones(milestonesData || []);
            setGoals(goalsData || []);
            // Deep merge stats with defaults to handle partial responses
            const defaultStats = { activeStrategies: 0, goalsAchieved: 0, inProgress: 0, completionRate: 0 };
            setStats({ ...defaultStats, ...(statsData || {}) });
            setProjects(projectsData || []);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load space data'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Milestone CRUD
    const handleSaveMilestone = async () => {
        if (!milestoneForm.title.trim() || !milestoneForm.date) {
            setError(t('space.validation.titleDateRequired', 'Please enter a title and date'));
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingMilestone) {
                const updated = await spaceAPI.updateMilestone(editingMilestone.id, milestoneForm);
                setMilestones(milestones.map(m => m.id === editingMilestone.id ? updated : m));
            } else {
                const created = await spaceAPI.createMilestone(milestoneForm);
                setMilestones([...milestones, created]);
            }
            setShowMilestoneModal(false);
            setEditingMilestone(null);
            setMilestoneForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'upcoming', color: '#8b5cf6', projectId: null });
            fetchData(); // Refresh stats
        } catch (err) {
            setErrorWithTimeout(err.message || t('errors.generic', 'Failed to save milestone'));
        } finally {
            setSaving(false);
        }
    };

    const handleEditMilestone = (milestone) => {
        setEditingMilestone(milestone);
        setMilestoneForm({
            title: milestone.title,
            description: milestone.description || '',
            date: milestone.date,
            status: milestone.status,
            color: milestone.color,
            projectId: milestone.projectId,
        });
        setShowMilestoneModal(true);
    };

    const handleDeleteMilestone = async (id) => {
        try {
            await spaceAPI.deleteMilestone(id);
            setMilestones(milestones.filter(m => m.id !== id));
            fetchData(); // Refresh stats
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to delete milestone'));
        }
    };

    // Goal CRUD
    const handleSaveGoal = async () => {
        if (!goalForm.name.trim() || !goalForm.target) {
            setError(t('space.validation.nameTargetRequired', 'Please enter a name and target'));
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = {
                ...goalForm,
                current: parseFloat(goalForm.current) || 0,
                target: parseFloat(goalForm.target),
            };

            if (editingGoal) {
                const updated = await spaceAPI.updateGoal(editingGoal.id, data);
                setGoals(goals.map(g => g.id === editingGoal.id ? updated : g));
            } else {
                const created = await spaceAPI.createGoal(data);
                setGoals([created, ...goals]);
            }
            setShowGoalModal(false);
            setEditingGoal(null);
            setGoalForm({ name: '', description: '', current: 0, target: 100, unit: 'units', color: '#8b5cf6', deadline: '' });
            fetchData(); // Refresh stats
        } catch (err) {
            setErrorWithTimeout(err.message || t('errors.generic', 'Failed to save goal'));
        } finally {
            setSaving(false);
        }
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setGoalForm({
            name: goal.name,
            description: goal.description || '',
            current: goal.current,
            target: goal.target,
            unit: goal.unit,
            color: goal.color,
            deadline: goal.deadline || '',
        });
        setShowGoalModal(true);
    };

    const handleDeleteGoal = async (id) => {
        try {
            await spaceAPI.deleteGoal(id);
            setGoals(goals.filter(g => g.id !== id));
            fetchData(); // Refresh stats
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to delete goal'));
        }
    };

    const quickActions = [
        { id: 1, name: t('space.newGoal', 'New Goal'), icon: HiOutlineFlag, color: '#8b5cf6', onClick: () => { setEditingGoal(null); setGoalForm({ name: '', description: '', current: 0, target: 100, unit: 'units', color: '#8b5cf6', deadline: '' }); setShowGoalModal(true); } },
        { id: 2, name: t('space.addMilestone', 'Add Milestone'), icon: HiOutlineSparkles, color: '#06b6d4', onClick: () => { setEditingMilestone(null); setMilestoneForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'upcoming', color: '#8b5cf6', projectId: null }); setShowMilestoneModal(true); } },
        { id: 3, name: t('space.quickTask', 'Quick Task'), icon: HiOutlineLightningBolt, color: '#ec4899', onClick: () => navigate('/work/calendar') },
        { id: 4, name: t('space.viewReports', 'View Reports'), icon: HiOutlineChartBar, color: '#10b981', onClick: () => navigate('/work/budget') },
    ];

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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('common.loading', 'Loading')}...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.dashboard.title', 'Space Dashboard')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.dashboard.subtitle', 'Strategic planning and goal tracking')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
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
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                        onClick={() => { setEditingMilestone(null); setMilestoneForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'upcoming', color: '#8b5cf6', projectId: null }); setShowMilestoneModal(true); }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('space.newMilestone', 'New Milestone')}
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

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {quickActions.map((action, index) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="glass-card"
                        style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                        onClick={action.onClick}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <action.icon style={{ width: '24px', height: '24px', color: action.color }} />
                        </div>
                        <span style={{ fontWeight: '600', color: 'white', fontSize: '15px' }}>{action.name}</span>
                    </motion.div>
                ))}
            </div>

            {/* Roadmap & Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Roadmap Timeline */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineMap style={{ color: '#a78bfa' }} />
                            {t('space.roadmapTimeline', 'Roadmap Timeline')}
                        </h2>
                    </div>

                    {milestones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('space.noMilestones', 'No milestones yet. Add a milestone to start your roadmap.')}</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: '24px' }}>
                            {/* Timeline line */}
                            <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom, #8b5cf6, #06b6d4)' }} />

                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={milestone.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    style={{ position: 'relative', paddingBottom: index === milestones.length - 1 ? 0 : '24px' }}
                                >
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-20px',
                                        top: '4px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: milestone.status === 'completed' ? '#10b981' : milestone.status === 'active' ? '#8b5cf6' : '#6b7280',
                                        border: '2px solid #0f0f23',
                                    }} />

                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>{milestone.title}</h3>
                                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{milestone.date}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                backgroundColor: milestone.status === 'completed' ? 'rgba(16,185,129,0.2)' : milestone.status === 'active' ? 'rgba(139,92,246,0.2)' : 'rgba(107,114,128,0.2)',
                                                color: milestone.status === 'completed' ? '#34d399' : milestone.status === 'active' ? '#a78bfa' : '#9ca3af',
                                            }}>
                                                {milestone.status}
                                            </span>
                                            <button onClick={() => handleEditMilestone(milestone)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                                <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                            </button>
                                            <button onClick={() => handleDeleteMilestone(milestone.id)} style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                                <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Goal Tracking */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineFlag style={{ color: '#06b6d4' }} />
                            {t('space.goalTracking', 'Goal Tracking')}
                        </h2>
                        <button
                            onClick={() => { setEditingGoal(null); setGoalForm({ name: '', description: '', current: 0, target: 100, unit: 'units', color: '#8b5cf6', deadline: '' }); setShowGoalModal(true); }}
                            style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '13px', cursor: 'pointer' }}
                            aria-label={t('space.addGoal', 'Add Goal')}
                        >
                            + {t('space.addGoal', 'Add Goal')}
                        </button>
                    </div>

                    {goals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('space.noGoals', 'No goals set. Add a goal to start tracking.')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {goals.slice(0, 5).map((goal, index) => {
                                const percentage = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                                    >
                                        <RingChart percentage={percentage} size={70} color={goal.color} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>{goal.name}</h3>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button onClick={() => handleEditGoal(goal)} style={{ padding: '2px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                                        <HiOutlinePencil style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                    <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '2px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                                        <HiOutlineTrash style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                                {goal.current} / {goal.target} {goal.unit}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                    { label: 'Active Strategies', value: stats.activeStrategies?.toString() || '0', color: '#8b5cf6' },
                    { label: 'Goals Achieved', value: stats.goalsAchieved?.toString() || '0', color: '#10b981' },
                    { label: 'In Progress', value: stats.inProgress?.toString() || '0', color: '#06b6d4' },
                    { label: 'Completion Rate', value: `${stats.completionRate || 0}%`, color: '#ec4899' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '20px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <p style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>{stat.value}</p>
                        </div>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{stat.label}</p>
                        <div style={{ marginTop: '12px', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: stat.label === 'Completion Rate' ? `${stats.completionRate || 0}%` : '70%' }}
                                transition={{ delay: 0.6 + index * 0.1, duration: 1 }}
                                style={{ height: '100%', backgroundColor: stat.color, borderRadius: '10px' }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Milestone Modal */}
            <AnimatePresence>
                {showMilestoneModal && (
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
                            style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingMilestone ? 'Edit Milestone' : 'New Milestone'}</h2>
                                <button onClick={() => setShowMilestoneModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={milestoneForm.title}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                                    placeholder="Milestone title..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <textarea
                                    value={milestoneForm.description}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                                    placeholder="Description (optional)..."
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Date *</label>
                                        <input
                                            type="date"
                                            value={milestoneForm.date}
                                            onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Status</label>
                                        <select
                                            value={milestoneForm.status}
                                            onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                {projects.length > 0 && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link to Project (optional)</label>
                                        <select
                                            value={milestoneForm.projectId || ''}
                                            onChange={(e) => setMilestoneForm({ ...milestoneForm, projectId: e.target.value ? parseInt(e.target.value) : null })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="">No project</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowMilestoneModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveMilestone} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingMilestone ? 'Update' : 'Create'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
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
                            style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
                                <button onClick={() => setShowGoalModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={goalForm.name}
                                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                                    placeholder="Goal name..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <textarea
                                    value={goalForm.description}
                                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                                    placeholder="Description (optional)..."
                                    rows={2}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Current</label>
                                        <input
                                            type="number"
                                            value={goalForm.current}
                                            onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Target *</label>
                                        <input
                                            type="number"
                                            value={goalForm.target}
                                            onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Unit</label>
                                        <input
                                            type="text"
                                            value={goalForm.unit}
                                            onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                                            placeholder="e.g. USD, clients"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Deadline (optional)</label>
                                        <input
                                            type="date"
                                            value={goalForm.deadline}
                                            onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Color</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setGoalForm({ ...goalForm, color })}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '6px',
                                                        border: goalForm.color === color ? '2px solid white' : '2px solid transparent',
                                                        backgroundColor: color,
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowGoalModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveGoal} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingGoal ? 'Update' : 'Create'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                    div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 767px) {
                    div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default SpaceDashboard;
