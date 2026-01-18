import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineFolder, HiOutlineCurrencyDollar, HiOutlineTrendingUp,
    HiOutlineCalendar, HiOutlineDocumentText, HiOutlineChartBar,
    HiOutlineClock, HiOutlineCheckCircle, HiOutlinePlus,
    HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineFire,
    HiOutlineChevronRight, HiOutlinePlay
} from 'react-icons/hi';
import { projectsAPI, notesAPI, tasksAPI, budgetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count.toLocaleString()}</span>;
};

// Floating Orb Background
const FloatingOrbs = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -80, 60, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    width: 200 + i * 50,
                    height: 200 + i * 50,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${['rgba(139,92,246,0.15)', 'rgba(6,182,212,0.12)', 'rgba(236,72,153,0.1)', 'rgba(16,185,129,0.08)', 'rgba(249,115,22,0.1)'][i]} 0%, transparent 70%)`,
                    left: `${10 + i * 20}%`,
                    top: `${5 + i * 15}%`,
                    filter: 'blur(40px)',
                }}
            />
        ))}
    </div>
);

// 3D Tilt Card
const TiltCard = ({ children, className = '', style = {}, ...props }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: y * 10, y: x * -10 });
    };
    return (
        <motion.div
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={className}
            style={{ ...style, transformStyle: 'preserve-3d', perspective: 1000 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Glowing Metric Card
const GlowMetricCard = ({ title, value, icon: Icon, color, trend, loading, delay = 0 }) => {
    const colors = {
        violet: { gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', glow: 'rgba(139,92,246,0.4)', text: '#a78bfa' },
        emerald: { gradient: 'linear-gradient(135deg, #10b981, #34d399)', glow: 'rgba(16,185,129,0.4)', text: '#34d399' },
        pink: { gradient: 'linear-gradient(135deg, #ec4899, #f472b6)', glow: 'rgba(236,72,153,0.4)', text: '#f472b6' },
        cyan: { gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)', glow: 'rgba(6,182,212,0.4)', text: '#22d3ee' },
        orange: { gradient: 'linear-gradient(135deg, #f97316, #fb923c)', glow: 'rgba(249,115,22,0.4)', text: '#fb923c' },
    };
    const c = colors[color] || colors.violet;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ scale: 1.02, y: -5 }}
        >
            <TiltCard
                style={{
                    background: 'rgba(17,17,27,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 20,
                    padding: 24,
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow Effect */}
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: c.glow,
                        filter: 'blur(60px)',
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: c.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 8px 24px ${c.glow}`,
                            }}
                        >
                            <Icon style={{ width: 24, height: 24, color: 'white' }} />
                        </motion.div>
                        {trend && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: delay + 0.3, type: 'spring' }}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    background: trend > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: trend > 0 ? '#34d399' : '#f87171',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                <HiOutlineTrendingUp style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
                                {Math.abs(trend)}%
                            </motion.div>
                        )}
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.2 }}
                        style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}
                    >
                        {loading ? (
                            <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: 100, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }}
                            />
                        ) : (
                            typeof value === 'number' ? <AnimatedCounter value={value} /> : value
                        )}
                    </motion.div>
                    <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{title}</div>
                </div>
            </TiltCard>
        </motion.div>
    );
};

// Animated Ring Progress
const AnimatedRingProgress = ({ percentage, size = 160, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const controls = useAnimation();

    useEffect(() => {
        controls.start({ strokeDashoffset: circumference - (percentage / 100) * circumference });
    }, [percentage, circumference, controls]);

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth} strokeLinecap="round" filter="url(#glow)"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={controls}
                    transition={{ duration: 2, ease: 'easeOut' }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    {percentage}%
                </motion.span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Completed</span>
            </div>
        </div>
    );
};

// Live Activity Pulse
const LivePulse = ({ color = '#10b981' }) => (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
        <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.5 }}
        />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
    </span>
);

// Project Card with Hover Effects
const ProjectCard = ({ project, index, onClick }) => {
    const statusColors = {
        active: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
        completed: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
        pending: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    };
    const s = statusColors[project.status] || statusColors.pending;

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 8 }}
            onClick={onClick}
            style={{
                padding: 20,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <motion.div
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 4, height: 40, borderRadius: 2, background: project.color || '#8b5cf6' }} />
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white' }}>{project.name}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{project.client || 'Personal'}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                    {project.status === 'active' && <LivePulse color={s.text} />} {project.status}
                </span>
            </div>
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600, color: '#a78bfa' }}>{project.progress || 0}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${project.color || '#8b5cf6'}, #06b6d4)` }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

// Task Item with Checkbox Animation
const TaskItem = ({ task, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ x: 4, background: 'rgba(255,255,255,0.05)' }}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
        }}
    >
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: task.completed ? 'none' : '2px solid rgba(255,255,255,0.2)',
                background: task.completed ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {task.completed && <HiOutlineCheckCircle style={{ color: 'white', width: 16, height: 16 }} />}
        </motion.div>
        <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, color: task.completed ? '#6b7280' : 'white', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</p>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{task.time || 'All day'}</span>
        </div>
        {task.priority === 'high' && <HiOutlineFire style={{ color: '#f97316', width: 18, height: 18 }} />}
    </motion.div>
);

// Main Dashboard
const WorkDashboard = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [showGreeting, setShowGreeting] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsData, tasksData, budgetsData] = await Promise.all([
                    projectsAPI.getAll().catch(() => []),
                    tasksAPI.getAll().catch(() => []),
                    budgetsAPI.getAll().catch(() => []),
                ]);
                setProjects(projectsData || []);
                setTasks(tasksData || []);
                setBudgets(budgetsData || []);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        setTimeout(() => setShowGreeting(false), 3000);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good Morning', emoji: '☀️', color: '#fb923c' };
        if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️', color: '#06b6d4' };
        return { text: 'Good Evening', emoji: '🌙', color: '#8b5cf6' };
    };

    const greeting = getGreeting();
    const activeProjects = projects.filter(p => p.status === 'active').length;
    // Calculate total budget from projects value (not budgets)
    const totalBudget = projects.reduce((s, p) => s + parseFloat(p.value || 0), 0);
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0]);

    // Format budget for display (full number, no abbreviation)
    const formatBudget = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <FloatingOrbs />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Animated Greeting */}
                <AnimatePresence>
                    {showGreeting && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'fixed',
                                top: 20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '12px 24px',
                                borderRadius: 30,
                                background: 'rgba(17,17,27,0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                zIndex: 100,
                            }}
                        >
                            <span style={{ fontSize: 20 }}>{greeting.emoji}</span>
                            <span style={{ color: 'white', fontWeight: 600 }}>{greeting.text}, {user?.name?.split(' ')[0] || 'User'}!</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 30 }}
                >
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ fontSize: 36, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        >
                            Dashboard
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: '#9ca3af', marginTop: 4, fontSize: 14 }}
                        >
                            {new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </motion.p>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(139,92,246,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/work/projects')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 24px',
                            borderRadius: 14,
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                    >
                        <HiOutlinePlus style={{ width: 18, height: 18 }} />
                        New Project
                    </motion.button>
                </motion.div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                    <GlowMetricCard title="Active Projects" value={activeProjects} icon={HiOutlineFolder} color="violet" trend={12} loading={loading} delay={0} />
                    <GlowMetricCard title="Total Budget" value={formatBudget(totalBudget)} icon={HiOutlineCurrencyDollar} color="emerald" trend={8} loading={loading} delay={0.1} />
                    <GlowMetricCard title="Tasks Done" value={completedTasks} icon={HiOutlineCheckCircle} color="cyan" trend={-5} loading={loading} delay={0.2} />
                    <GlowMetricCard title="Productivity" value={`${taskProgress}%`} icon={HiOutlineLightningBolt} color="orange" loading={loading} delay={0.3} />
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Projects */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ background: 'rgba(17,17,27,0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <HiOutlineSparkles style={{ color: '#a78bfa' }} />
                                Active Projects
                            </h2>
                            <motion.button whileHover={{ x: 4 }} onClick={() => navigate('/work/projects')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View All <HiOutlineChevronRight />
                            </motion.button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {projects.slice(0, 4).map((p, i) => (
                                <ProjectCard key={p.id} project={p} index={i} onClick={() => navigate('/work/projects')} />
                            ))}
                            {projects.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 48, marginBottom: 12 }}>🚀</motion.div>
                                    <p style={{ color: '#6b7280' }}>No projects yet. Start your journey!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{ background: 'rgba(17,17,27,0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}
                        >
                            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: 'white' }}>Task Progress</h3>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <AnimatedRingProgress percentage={taskProgress} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16,185,129,0.1)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>{completedTasks}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Done</div>
                                </div>
                                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(249,115,22,0.1)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fb923c' }}>{tasks.length - completedTasks}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Pending</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Today's Tasks */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ background: 'rgba(17,17,27,0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.06)', flex: 1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <HiOutlineCalendar style={{ color: '#22d3ee' }} />
                                    Today
                                </h3>
                                <LivePulse />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {todayTasks.slice(0, 4).map((t, i) => <TaskItem key={t.id} task={t} index={i} />)}
                                {todayTasks.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 30 }}>
                                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 32 }}>📅</motion.div>
                                        <p style={{ color: '#6b7280', fontSize: 13 }}>No tasks for today</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

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

export default WorkDashboard;
