import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCalendar,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineClock,
    HiOutlineFlag,
} from 'react-icons/hi';
import { spaceAPI, projectPlansAPI } from '../../services/api';

const SpaceCalendar = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [goals, setGoals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'event',
        projectId: null,
        description: '',
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [milestonesData, goalsData, projectsData] = await Promise.all([
                spaceAPI.getMilestones(),
                spaceAPI.getGoals(),
                projectPlansAPI.getAll(),
            ]);
            setMilestones(milestonesData || []);
            setGoals(goalsData || []);
            setProjects(projectsData || []);

            // Combine all events
            const allEvents = [];

            // Add milestones
            (milestonesData || []).forEach(m => {
                allEvents.push({
                    id: `milestone-${m.id}`,
                    title: m.title,
                    date: m.date,
                    type: 'milestone',
                    status: m.status,
                    projectId: m.projectId,
                    color: getProjectColor(m.projectId, projectsData),
                });
            });

            // Add goal deadlines
            (goalsData || []).forEach(g => {
                if (g.deadline) {
                    allEvents.push({
                        id: `goal-${g.id}`,
                        title: `🎯 ${g.name}`,
                        date: g.deadline,
                        type: 'goal',
                        projectId: g.projectId,
                        color: g.color,
                    });
                }
            });

            // Add project target dates
            (projectsData || []).forEach(p => {
                if (p.targetDate) {
                    allEvents.push({
                        id: `project-${p.id}`,
                        title: `📁 ${p.name}`,
                        date: p.targetDate,
                        type: 'project',
                        color: p.color,
                    });
                }
            });

            setEvents(allEvents);
        } catch (err) {
            // Error handled silently - events will be empty
        } finally {
            setLoading(false);
        }
    };

    const getProjectColor = (projectId, projectsData) => {
        const project = (projectsData || projects).find(p => p.id === projectId);
        return project?.color || '#8b5cf6';
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonth = new Date(year, month, 0);
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setFormData({
            ...formData,
            date: date.toISOString().split('T')[0],
        });
    };

    const handleAddEvent = () => {
        setShowModal(true);
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
                        <span className="gradient-text">{t('space.calendar.title', 'Space Calendar')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.calendar.subtitle', 'Schedule milestones and track deadlines')}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                >
                    <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                {/* Calendar */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <button onClick={() => navigateMonth(-1)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                            <HiOutlineChevronLeft style={{ width: '20px', height: '20px' }} />
                        </button>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => navigateMonth(1)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                            <HiOutlineChevronRight style={{ width: '20px', height: '20px' }} />
                        </button>
                    </div>

                    {/* Week Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                        {weekDays.map(day => (
                            <div key={day} style={{ textAlign: 'center', padding: '8px', color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {days.map((day, index) => {
                            const dayEvents = getEventsForDate(day.date);
                            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => handleDateClick(day.date)}
                                    style={{
                                        minHeight: '80px',
                                        padding: '8px',
                                        borderRadius: '10px',
                                        backgroundColor: isSelected ? 'rgba(139,92,246,0.2)' : isToday(day.date) ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                                        border: isSelected ? '1px solid rgba(139,92,246,0.5)' : isToday(day.date) ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                                        cursor: 'pointer',
                                        opacity: day.isCurrentMonth ? 1 : 0.4,
                                    }}
                                >
                                    <div style={{ fontSize: '12px', fontWeight: isToday(day.date) ? '600' : '400', color: isToday(day.date) ? '#a78bfa' : day.isCurrentMonth ? 'white' : '#6b7280', marginBottom: '4px' }}>
                                        {day.date.getDate()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    backgroundColor: `${event.color}30`,
                                                    borderLeft: `2px solid ${event.color}`,
                                                    fontSize: '9px',
                                                    color: event.color,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span style={{ fontSize: '9px', color: '#6b7280' }}>+{dayEvents.length - 3} more</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Selected Date Events */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 16px 0' }}>
                            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                        </h3>

                        {selectedDate && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {getEventsForDate(selectedDate).length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No events on this day</p>
                                ) : (
                                    getEventsForDate(selectedDate).map((event, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                borderLeft: `3px solid ${event.color}`,
                                            }}
                                        >
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'white', marginBottom: '4px' }}>{event.title}</div>
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: event.type === 'milestone' ? 'rgba(139,92,246,0.2)' : event.type === 'goal' ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)',
                                                color: event.type === 'milestone' ? '#a78bfa' : event.type === 'goal' ? '#10b981' : '#06b6d4',
                                                textTransform: 'capitalize',
                                            }}>
                                                {event.type}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HiOutlineClock style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                            Upcoming
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {events
                                .filter(e => new Date(e.date) >= new Date())
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .slice(0, 5)
                                .map((event, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderLeft: `3px solid ${event.color}`,
                                        }}
                                    >
                                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>{event.title}</div>
                                        <div style={{ fontSize: '10px', color: '#6b7280' }}>{event.date}</div>
                                    </div>
                                ))}
                            {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                                <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>No upcoming events</p>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af', margin: '0 0 12px 0' }}>Legend</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Milestone', icon: '🚀', color: '#8b5cf6' },
                                { label: 'Goal Deadline', icon: '🎯', color: '#10b981' },
                                { label: 'Project Target', icon: '📁', color: '#06b6d4' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceCalendar;
