import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineTrash,
    HiOutlineClock,
    HiOutlineFolder,
    HiOutlineRefresh,
} from 'react-icons/hi';
import { tasksAPI, projectsAPI } from '../../services/api';

const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const Calendar = () => {
    const { t, i18n } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(null);
    const [error, setError] = useState('');

    // Helper to set error with auto-clear timeout
    const setErrorWithTimeout = (message, timeout = 5000) => {
        setError(message);
        setTimeout(() => setError(''), timeout);
    };

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        dueTime: '',
        projectId: null,
        color: '#8b5cf6',
        priority: 'medium',
    });

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksData, projectsData] = await Promise.all([
                tasksAPI.getAll(),
                projectsAPI.getAll().catch(() => []),
            ]);
            setTasks(tasksData || []);
            setProjects(projectsData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setErrorWithTimeout('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty slots for days before the first day of month
        const startDayOfWeek = firstDay.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: null, dayNumber: null });
        }

        // Add days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push({
                date: date.toISOString().split('T')[0],
                dayNumber: d,
                isToday: new Date().toDateString() === date.toDateString(),
            });
        }

        return days;
    }, [year, month]);

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        if (!date) return [];
        return tasks.filter((t) => t.date === date);
    };

    // Get projects that span a date
    const getProjectsForDate = (date) => {
        if (!date) return [];
        return projects.filter((p) => {
            return date >= p.startDate && date <= p.endDate;
        });
    };

    // Navigation
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Open modal for new task
    const handleNewTask = (date = null) => {
        setFormData({
            title: '',
            dueDate: date || new Date().toISOString().split('T')[0],
            dueTime: '',
            projectId: null,
            color: '#8b5cf6',
            priority: 'medium',
        });
        setShowModal(true);
    };

    // Save task
    const handleSaveTask = async () => {
        if (!formData.title.trim() || !formData.dueDate) {
            setErrorWithTimeout('Please enter a title and date');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const taskData = {
                title: formData.title,
                date: formData.dueDate,  // Backend expects 'date' not 'dueDate'
                time: formData.dueTime || null,  // Backend expects 'time' not 'dueTime'
                projectId: formData.projectId || null,
                priority: formData.priority,
            };

            const created = await tasksAPI.create(taskData);
            setTasks([created, ...tasks]);
            setShowModal(false);
        } catch (err) {
            console.error('Error creating task:', err);
            setErrorWithTimeout(err.message || 'Failed to create task');
        } finally {
            setSaving(false);
        }
    };

    // Toggle task completion
    const handleToggleComplete = async (taskId) => {
        try {
            const updated = await tasksAPI.toggleComplete(taskId);
            setTasks(tasks.map(t => t.id === taskId ? updated : t));
            if (showTaskDetail?.id === taskId) {
                setShowTaskDetail(updated);
            }
        } catch (err) {
            setErrorWithTimeout('Failed to toggle task');
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        try {
            await tasksAPI.delete(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
            setShowTaskDetail(null);
        } catch (err) {
            setErrorWithTimeout('Failed to delete task');
        }
    };

    // Month/Year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Today's tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.date === todayStr);
    const upcomingTasks = tasks.filter((t) => t.date > todayStr && !t.completed).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

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
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading calendar...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.calendar.title', 'Calendar')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.calendar.subtitle', 'Schedule tasks and track project timelines')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        aria-label="Refresh calendar"
                        title="Refresh calendar"
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
                        onClick={() => handleNewTask()}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('work.calendar.newTask', 'New Task')}
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

            <div className="calendar-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                {/* Calendar Grid */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <button onClick={prevMonth} style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                            <HiOutlineChevronLeft style={{ width: '20px', height: '20px' }} />
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                                {monthNames[month]} {year}
                            </h2>
                            <button onClick={goToToday} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
                                Go to Today
                            </button>
                        </div>
                        <button onClick={nextMonth} style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                            <HiOutlineChevronRight style={{ width: '20px', height: '20px' }} />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                        {dayNames.map((day) => (
                            <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', padding: '8px' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {daysInMonth.map((day, index) => {
                            const dayTasks = getTasksForDate(day.date);
                            const dayProjects = getProjectsForDate(day.date);
                            const isSelected = selectedDate === day.date;

                            return (
                                <motion.div
                                    key={index}
                                    whileHover={day.date ? { scale: 1.02 } : {}}
                                    onClick={() => day.date && setSelectedDate(day.date)}
                                    style={{
                                        minHeight: '140px',
                                        padding: '8px',
                                        borderRadius: '10px',
                                        backgroundColor: day.isToday
                                            ? 'rgba(139,92,246,0.2)'
                                            : isSelected
                                                ? 'rgba(255,255,255,0.1)'
                                                : day.date
                                                    ? 'rgba(255,255,255,0.02)'
                                                    : 'transparent',
                                        border: day.isToday ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                                        cursor: day.date ? 'pointer' : 'default',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {day.dayNumber && (
                                        <>
                                            <div style={{ fontSize: '14px', fontWeight: day.isToday ? '700' : '500', color: day.isToday ? '#a78bfa' : 'white', marginBottom: '4px' }}>
                                                {day.dayNumber}
                                            </div>

                                            {/* Project indicators */}
                                            {dayProjects.slice(0, 2).map((project) => (
                                                <div
                                                    key={project.id}
                                                    style={{
                                                        fontSize: '9px',
                                                        padding: '2px 4px',
                                                        marginBottom: '2px',
                                                        borderRadius: '4px',
                                                        backgroundColor: `${project.color || '#8b5cf6'}30`,
                                                        color: project.color || '#8b5cf6',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {project.name}
                                                </div>
                                            ))}

                                            {/* Task indicators - increased to 5 */}
                                            {dayTasks.slice(0, 5).map((task) => (
                                                <div
                                                    key={task.id}
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 4px',
                                                        marginBottom: '2px',
                                                        borderRadius: '4px',
                                                        backgroundColor: task.completed ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)',
                                                        color: task.completed ? '#34d399' : '#a78bfa',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        textDecoration: task.completed ? 'line-through' : 'none',
                                                    }}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}

                                            {dayTasks.length + dayProjects.length > 7 && (
                                                <div style={{ fontSize: '10px', color: '#6b7280' }}>+{dayTasks.length + dayProjects.length - 7} more</div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="calendar-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Today's Tasks */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineCalendar style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                            Today's Tasks
                        </h3>
                        {todayTasks.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>No tasks for today</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {todayTasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        whileHover={{ scale: 1.02 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setShowTaskDetail(task)}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleComplete(task.id);
                                            }}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                border: task.completed ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                                backgroundColor: task.completed ? '#10b981' : 'transparent',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: 0,
                                            }}
                                        >
                                            {task.completed && <HiOutlineCheck style={{ width: '14px', height: '14px' }} />}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', color: task.completed ? '#6b7280' : 'white', textDecoration: task.completed ? 'line-through' : 'none', margin: 0 }}>
                                                {task.title}
                                            </p>
                                            {task.time && <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{task.time}</p>}
                                        </div>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'low' ? '#10b981' : '#f59e0b' }} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => handleNewTask(todayStr)}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                backgroundColor: 'transparent',
                                color: '#9ca3af',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                            }}
                        >
                            <HiOutlinePlus style={{ width: '14px', height: '14px' }} />
                            Add Task
                        </button>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineClock style={{ width: '18px', height: '18px', color: '#06b6d4' }} />
                            Upcoming
                        </h3>
                        {upcomingTasks.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>No upcoming tasks</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {upcomingTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                        }}
                                    >
                                        <div style={{ width: '4px', height: '32px', borderRadius: '2px', backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'low' ? '#10b981' : '#f59e0b' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', color: 'white', margin: 0 }}>{task.title}</p>
                                            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{task.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Projects */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineFolder style={{ width: '18px', height: '18px', color: '#ec4899' }} />
                            Active Projects
                        </h3>
                        {projects.filter((p) => p.status === 'active').length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>No active projects</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {projects
                                    .filter((p) => p.status === 'active')
                                    .slice(0, 4)
                                    .map((project) => (
                                        <div
                                            key={project.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '10px',
                                                backgroundColor: `${project.color || '#8b5cf6'}10`,
                                                border: `1px solid ${project.color || '#8b5cf6'}30`,
                                            }}
                                        >
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: project.color || '#8b5cf6' }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '13px', color: 'white', margin: 0 }}>{project.name}</p>
                                                <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                                    {project.startDate} → {project.endDate}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Task Modal */}
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
                            style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>New Task</h2>
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
                                    placeholder="Task title..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                {/* Date & Time */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Date *</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Time (optional)</label>
                                        <input
                                            type="time"
                                            value={formData.dueTime}
                                            onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Priority</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['low', 'medium', 'high'].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: formData.priority === p ? `2px solid ${p === 'high' ? '#ef4444' : p === 'low' ? '#10b981' : '#f59e0b'}` : '1px solid rgba(255,255,255,0.1)',
                                                    backgroundColor: formData.priority === p ? `${p === 'high' ? '#ef4444' : p === 'low' ? '#10b981' : '#f59e0b'}20` : 'transparent',
                                                    color: formData.priority === p ? 'white' : '#9ca3af',
                                                    fontSize: '12px',
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Link to Project */}
                                {projects.length > 0 && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link to Project (optional)</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {projects.slice(0, 5).map((project) => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => setFormData({ ...formData, projectId: formData.projectId === project.id ? null : project.id })}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        border: formData.projectId === project.id ? `2px solid ${project.color || '#8b5cf6'}` : '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: formData.projectId === project.id ? `${project.color || '#8b5cf6'}30` : 'transparent',
                                                        color: formData.projectId === project.id ? 'white' : '#9ca3af',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {project.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveTask}
                                        disabled={saving}
                                        className="btn-glow"
                                        style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
                                    >
                                        {saving ? 'Creating...' : 'Create Task'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {showTaskDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                        onClick={() => setShowTaskDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: `${showTaskDetail.priority === 'high' ? '#ef4444' : showTaskDetail.priority === 'low' ? '#10b981' : '#f59e0b'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineCalendar style={{ width: '28px', height: '28px', color: showTaskDetail.priority === 'high' ? '#ef4444' : showTaskDetail.priority === 'low' ? '#10b981' : '#f59e0b' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px', textDecoration: showTaskDetail.completed ? 'line-through' : 'none' }}>{showTaskDetail.title}</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>{showTaskDetail.date} {showTaskDetail.time && `at ${showTaskDetail.time}`}</p>
                            <p style={{ fontSize: '13px', color: showTaskDetail.completed ? '#34d399' : '#9ca3af', marginBottom: '24px' }}>
                                {showTaskDetail.completed ? '✓ Completed' : 'Pending'}
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleToggleComplete(showTaskDetail.id)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: showTaskDetail.completed ? '#f59e0b' : '#10b981', color: 'white', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    {showTaskDetail.completed ? 'Mark Pending' : 'Mark Complete'}
                                </button>
                                <button onClick={() => handleDeleteTask(showTaskDetail.id)} style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', cursor: 'pointer' }}>
                                    <HiOutlineTrash style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    .calendar-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .calendar-sidebar {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 12px !important;
                    }
                }
                @media (max-width: 767px) {
                    .calendar-sidebar {
                        grid-template-columns: 1fr !important;
                    }
                    .calendar-day-cell {
                        min-height: 80px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Calendar;
