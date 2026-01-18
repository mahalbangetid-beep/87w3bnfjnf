import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Chart from 'react-apexcharts';
import {
    HiOutlineFolder, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamation,
    HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineFire,
    HiOutlineUserGroup, HiOutlineLightningBolt
} from 'react-icons/hi';
import { projectsAPI, tasksAPI } from '../../services/api';

// Animated Value
const AnimatedValue = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0; const end = parseInt(value) || 0;
        const timer = setInterval(() => { start += end / 40; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{count}</span>;
};

// Floating Lines Background
const FloatingLines = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
            <motion.div key={i} initial={{ x: '-100%', opacity: 0 }} animate={{ x: '200%', opacity: [0, 0.3, 0] }} transition={{ duration: 8, delay: i * 1.5, repeat: Infinity }}
                style={{ position: 'absolute', top: `${10 + i * 12}%`, height: 1, width: '50%', background: 'linear-gradient(90deg, transparent, #8b5cf640, transparent)' }} />
        ))}
    </div>
);

// Stat Card with Animated Ring
const RingStat = ({ value, max, label, color, icon: Icon, delay }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const radius = 36; const circumference = 2 * Math.PI * radius;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: 'spring' }} whileHover={{ scale: 1.05 }}
            style={{ background: 'rgba(17,17,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 16px' }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <motion.circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                        transition={{ duration: 1.5, delay: delay + 0.3, ease: 'easeOut' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 24, height: 24, color }} />
                </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}><AnimatedValue value={value} /></div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>{label}</div>
        </motion.div>
    );
};

// Timeline Item
const TimelineItem = ({ project, isLast, delay }) => (
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} style={{ display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div whileHover={{ scale: 1.2 }} style={{ width: 16, height: 16, borderRadius: '50%', background: project.color || '#8b5cf6', boxShadow: `0 0 20px ${project.color || '#8b5cf6'}50` }} />
            {!isLast && <div style={{ width: 2, flex: 1, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', marginTop: 8 }} />}
        </div>
        <div style={{ flex: 1, paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white' }}>{project.name}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{project.client || 'Personal Project'}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: project.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)', color: project.status === 'completed' ? '#34d399' : '#a78bfa' }}>{project.status}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }} transition={{ duration: 1, delay: delay + 0.2 }}
                    style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${project.color || '#8b5cf6'}, #06b6d4)` }} />
            </div>
        </div>
    </motion.div>
);

// Chart Card
const ChartCard = ({ title, icon: Icon, children, delay, height = 'auto' }) => (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        style={{ background: 'rgba(17,17,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.08)', height }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            {Icon && <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon style={{ width: 20, height: 20, color: '#a78bfa' }} /></div>}
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>{title}</h3>
        </div>
        {children}
    </motion.div>
);

const WorkAnalytics = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [p, t] = await Promise.all([projectsAPI.getAll().catch(() => []), tasksAPI.getAll().catch(() => [])]);
            setProjects(p || []);
            setTasks(t || []);
        };
        fetchData();
    }, []);

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.date) < new Date()).length;
    const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0;
    const productivityScore = Math.min(100, Math.round((completedTasks / (tasks.length || 1)) * 100));

    // Gantt-like Timeline data (rangeBar)
    const ganttData = projects.slice(0, 5).map(p => ({
        x: p.name?.slice(0, 15) || 'Project',
        y: [new Date(p.startDate || Date.now()).getTime(), new Date(p.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000).getTime()],
        fillColor: p.color || '#8b5cf6'
    }));

    const ganttOptions = {
        chart: { type: 'rangeBar', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 } },
        plotOptions: { bar: { horizontal: true, borderRadius: 6, rangeBarGroupRows: true } },
        xaxis: { type: 'datetime', labels: { style: { colors: '#9ca3af', fontSize: '11px' }, datetimeFormatter: { month: 'MMM' } }, axisBorder: { show: false } },
        yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '12px' } } },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        tooltip: { theme: 'dark', x: { format: 'dd MMM yyyy' } },
        legend: { show: false },
    };

    // Burndown chart data
    const burndownIdeal = [100, 85, 70, 55, 40, 25, 10, 0];
    const burndownActual = [100, 90, 75, 60, 50, 35, 20, 5];
    const burndownOptions = {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 } },
        colors: ['#6b7280', '#8b5cf6'],
        stroke: { curve: 'smooth', width: [2, 3], dashArray: [5, 0] },
        markers: { size: [0, 5], strokeWidth: 0 },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8'], labels: { style: { colors: '#9ca3af' } } },
        yaxis: { labels: { style: { colors: '#9ca3af' }, formatter: v => `${v}%` } },
        legend: { labels: { colors: '#9ca3af' } },
        tooltip: { theme: 'dark' },
    };

    // Task completion by day
    const weeklyData = [{ name: 'Completed', data: [3, 5, 2, 8, 6, 4, 7] }, { name: 'Added', data: [2, 4, 3, 5, 4, 2, 3] }];
    const weeklyOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 }, stacked: false },
        colors: ['#10b981', '#f59e0b'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#9ca3af' } } },
        yaxis: { labels: { style: { colors: '#9ca3af' } } },
        legend: { labels: { colors: '#9ca3af' } },
        tooltip: { theme: 'dark' },
    };

    // Productivity radar
    const radarData = [{ name: 'This Week', data: [80, 65, 90, 70, 85] }, { name: 'Last Week', data: [60, 70, 75, 60, 70] }];
    const radarOptions = {
        chart: { type: 'radar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#8b5cf6', '#06b6d4'],
        stroke: { width: 2 },
        fill: { opacity: 0.2 },
        markers: { size: 4, strokeWidth: 0 },
        xaxis: { categories: ['Tasks', 'Projects', 'Focus', 'Deadlines', 'Quality'] },
        yaxis: { show: false },
        legend: { labels: { colors: '#9ca3af' } },
        plotOptions: { radar: { polygons: { strokeColors: 'rgba(255,255,255,0.1)', connectorColors: 'rgba(255,255,255,0.1)' } } },
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <FloatingLines />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 30 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Project Analytics</h1>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>Track your productivity and project performance</p>
                </motion.div>

                {/* Ring Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 30 }}>
                    <RingStat value={projects.length} max={20} label="Total Projects" color="#8b5cf6" icon={HiOutlineFolder} delay={0} />
                    <RingStat value={activeProjects} max={projects.length || 1} label="Active" color="#06b6d4" icon={HiOutlineClock} delay={0.1} />
                    <RingStat value={completedProjects} max={projects.length || 1} label="Completed" color="#10b981" icon={HiOutlineCheckCircle} delay={0.2} />
                    <RingStat value={completedTasks} max={tasks.length || 1} label="Tasks Done" color="#f59e0b" icon={HiOutlineLightningBolt} delay={0.3} />
                    <RingStat value={overdueTasks} max={tasks.length || 1} label="Overdue" color="#ef4444" icon={HiOutlineExclamation} delay={0.4} />
                    <RingStat value={productivityScore} max={100} label="Productivity" color="#ec4899" icon={HiOutlineFire} delay={0.5} />
                </div>

                {/* Charts Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                    <ChartCard title="📊 Project Timeline (Gantt)" icon={HiOutlineCalendar} delay={0.6}>
                        {ganttData.length > 0 ? <Chart options={ganttOptions} series={[{ data: ganttData }]} type="rangeBar" height={280} /> : <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No projects to display</p>}
                    </ChartCard>
                    <ChartCard title="📈 Burndown Chart" icon={HiOutlineTrendingUp} delay={0.7}>
                        <Chart options={burndownOptions} series={[{ name: 'Ideal', data: burndownIdeal }, { name: 'Actual', data: burndownActual }]} type="line" height={280} />
                    </ChartCard>
                </div>

                {/* Charts Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <ChartCard title="📅 Weekly Task Activity" icon={HiOutlineChartBar} delay={0.8}>
                        <Chart options={weeklyOptions} series={weeklyData} type="bar" height={280} />
                    </ChartCard>
                    <ChartCard title="🎯 Productivity Radar" icon={HiOutlineUserGroup} delay={0.9}>
                        <Chart options={radarOptions} series={radarData} type="radar" height={280} />
                    </ChartCard>
                </div>

                {/* Timeline */}
                <ChartCard title="📋 Recent Projects" icon={HiOutlineFolder} delay={1}>
                    <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                        {projects.slice(0, 6).map((p, i) => <TimelineItem key={p.id} project={p} isLast={i === Math.min(5, projects.length - 1)} delay={1 + i * 0.1} />)}
                        {projects.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No projects yet. Create your first project!</p>}
                    </div>
                </ChartCard>
            </div>

            <style>{`@media (max-width: 1023px) { div[style*="repeat(6"] { grid-template-columns: repeat(3, 1fr) !important; } div[style*="2fr 1fr"] { grid-template-columns: 1fr !important; } } @media (max-width: 767px) { div[style*="repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
        </div>
    );
};

export default WorkAnalytics;
