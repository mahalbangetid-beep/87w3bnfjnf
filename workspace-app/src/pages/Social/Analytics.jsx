import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Chart from 'react-apexcharts';
import {
    HiOutlineHeart, HiOutlineEye, HiOutlineShare, HiOutlineUserGroup,
    HiOutlineClock, HiOutlineTrendingUp, HiOutlineSparkles, HiOutlinePhotograph,
    HiOutlineHashtag, HiOutlineCalendar
} from 'react-icons/hi';
import { socialAPI } from '../../services/api';

// Animated Counter
const AnimatedCounter = ({ value, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0; const end = parseInt(value) || 0;
        const timer = setInterval(() => { start += end / 60; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{count.toLocaleString()}{suffix}</span>;
};

// Glowing Orbs Background
const GlowingOrbs = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[{ color: '#ec4899', x: '10%', y: '20%' }, { color: '#8b5cf6', x: '80%', y: '10%' }, { color: '#06b6d4', x: '60%', y: '70%' }].map((orb, i) => (
            <motion.div key={i} animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4 + i, repeat: Infinity }}
                style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: orb.color, filter: 'blur(80px)', left: orb.x, top: orb.y }} />
        ))}
    </div>
);

// Platform Icon with animation
const PlatformBadge = ({ platform, stats, delay }) => {
    const platforms = {
        instagram: { icon: '📸', color: '#E1306C', bg: 'rgba(225,48,108,0.15)' },
        facebook: { icon: '👍', color: '#1877F2', bg: 'rgba(24,119,242,0.15)' },
        twitter: { icon: '🐦', color: '#1DA1F2', bg: 'rgba(29,161,242,0.15)' },
        tiktok: { icon: '🎵', color: '#000000', bg: 'rgba(255,255,255,0.1)' },
        linkedin: { icon: '💼', color: '#0A66C2', bg: 'rgba(10,102,194,0.15)' },
    };
    const p = platforms[platform] || platforms.instagram;

    return (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay }} whileHover={{ scale: 1.05, y: -5 }}
            style={{ background: 'rgba(17,17,27,0.9)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 24, border: `1px solid ${p.color}40`, position: 'relative', overflow: 'hidden' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', border: `2px dashed ${p.color}30` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} style={{ width: 56, height: 56, borderRadius: 16, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{p.icon}</motion.div>
                <div><h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{platform}</h3><p style={{ margin: 0, fontSize: 13, color: p.color }}>Connected</p></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}><AnimatedCounter value={stats.followers || 0} /></div><div style={{ fontSize: 11, color: '#6b7280' }}>Followers</div></div>
                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 20, fontWeight: 700, color: p.color }}>{stats.engagement || 0}%</div><div style={{ fontSize: 11, color: '#6b7280' }}>Engagement</div></div>
            </div>
        </motion.div>
    );
};

// Stat Card
const MetricCard = ({ icon: Icon, title, value, change, color, delay }) => (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: 'spring' }} whileHover={{ y: -5 }}
        style={{ background: 'rgba(17,17,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon style={{ width: 22, height: 22, color }} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{title}</div><div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{value}</div></div>
            {change && <div style={{ padding: '4px 10px', borderRadius: 20, background: change > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: change > 0 ? '#34d399' : '#f87171', fontSize: 12, fontWeight: 600 }}>{change > 0 ? '+' : ''}{change}%</div>}
        </div>
    </motion.div>
);

// Chart Card
const ChartCard = ({ title, children, delay }) => (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        style={{ background: 'rgba(17,17,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: 'white' }}>{title}</h3>
        {children}
    </motion.div>
);

const SocialAnalytics = () => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [acc, p] = await Promise.all([socialAPI.getAccounts().catch(() => []), socialAPI.getPosts().catch(() => [])]);
            setAccounts(acc || []);
            setPosts(p || []);
        };
        fetchData();
    }, []);

    // Mock data for visualization - use stable fallback values (not random)
    const totalFollowers = accounts.reduce((s, a, i) => s + (a.followers || (5000 + i * 1000)), 0) || 15000;
    const avgEngagement = 4.7;
    const totalPosts = posts.length || 24;
    const totalReach = totalFollowers * 3;

    // Best posting times heatmap data
    const heatmapData = [
        { name: 'Mon', data: [20, 35, 50, 70, 60, 45, 80, 90, 85, 65, 50, 40] },
        { name: 'Tue', data: [30, 40, 55, 80, 75, 50, 85, 95, 80, 60, 45, 35] },
        { name: 'Wed', data: [25, 35, 60, 75, 65, 55, 90, 100, 85, 55, 40, 30] },
        { name: 'Thu', data: [35, 45, 65, 85, 70, 60, 88, 92, 78, 58, 42, 32] },
        { name: 'Fri', data: [40, 50, 55, 70, 60, 50, 75, 85, 70, 50, 35, 25] },
        { name: 'Sat', data: [60, 70, 65, 60, 55, 45, 50, 60, 55, 45, 40, 35] },
        { name: 'Sun', data: [55, 65, 60, 55, 50, 40, 45, 55, 50, 40, 35, 30] },
    ];

    const heatmapOptions = {
        chart: { type: 'heatmap', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 } },
        colors: ['#8b5cf6'],
        dataLabels: { enabled: false },
        xaxis: { categories: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'], labels: { style: { colors: '#9ca3af', fontSize: '10px' } } },
        yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '11px' } } },
        plotOptions: { heatmap: { radius: 4, colorScale: { ranges: [{ from: 0, to: 40, color: '#1e1e3f', name: 'Low' }, { from: 41, to: 70, color: '#6d28d9', name: 'Medium' }, { from: 71, to: 100, color: '#8b5cf6', name: 'High' }] } } },
        tooltip: { theme: 'dark' },
        grid: { show: false },
    };

    const lineChartData = [{ name: 'Instagram', data: [1200, 1800, 2400, 3200, 4100, 5000] }, { name: 'Facebook', data: [800, 1100, 1500, 1900, 2200, 2800] }, { name: 'Twitter', data: [500, 700, 900, 1200, 1600, 2100] }];
    const lineChartOptions = {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 } },
        colors: ['#E1306C', '#1877F2', '#1DA1F2'],
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5, strokeWidth: 0 },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], labels: { style: { colors: '#9ca3af' } } },
        yaxis: { labels: { style: { colors: '#9ca3af' }, formatter: v => `${(v / 1000).toFixed(1)}K` } },
        legend: { labels: { colors: '#9ca3af' } },
        tooltip: { theme: 'dark' },
    };

    const contentTypeData = [45, 30, 15, 10];
    const contentTypeOptions = {
        chart: { type: 'polarArea', background: 'transparent', animations: { enabled: true, speed: 800 } },
        colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        labels: ['Photos', 'Videos', 'Stories', 'Reels'],
        stroke: { width: 1, colors: ['#0f0f23'] },
        fill: { opacity: 0.8 },
        legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
        plotOptions: { polarArea: { rings: { strokeWidth: 0 }, spokes: { strokeWidth: 0 } } },
        tooltip: { theme: 'dark' },
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <GlowingOrbs />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 30 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Social Analytics</h1>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>Track your social media performance</p>
                </motion.div>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 30 }}>
                    <MetricCard icon={HiOutlineUserGroup} title="Total Followers" value={<AnimatedCounter value={totalFollowers} />} change={12} color="#8b5cf6" delay={0} />
                    <MetricCard icon={HiOutlineHeart} title="Avg Engagement" value={`${avgEngagement}%`} change={8} color="#ec4899" delay={0.1} />
                    <MetricCard icon={HiOutlinePhotograph} title="Total Posts" value={totalPosts} change={-3} color="#06b6d4" delay={0.2} />
                    <MetricCard icon={HiOutlineEye} title="Total Reach" value={<AnimatedCounter value={totalReach} />} change={25} color="#10b981" delay={0.3} />
                </div>

                {/* Platform Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}>
                    {['instagram', 'facebook', 'twitter'].map((p, i) => (
                        <PlatformBadge key={p} platform={p} stats={{ followers: 5000 + i * 2000, engagement: 4 + i * 0.5 }} delay={0.4 + i * 0.1} />
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                    <ChartCard title="📈 Followers Growth" delay={0.7}>
                        <Chart options={lineChartOptions} series={lineChartData} type="line" height={300} />
                    </ChartCard>
                    <ChartCard title="📊 Content Performance" delay={0.8}>
                        <Chart options={contentTypeOptions} series={contentTypeData} type="polarArea" height={300} />
                    </ChartCard>
                </div>

                <ChartCard title="🔥 Best Posting Times" delay={0.9}>
                    <Chart options={heatmapOptions} series={heatmapData} type="heatmap" height={280} />
                </ChartCard>
            </div>

            <style>{`@media (max-width: 1023px) { div[style*="repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } div[style*="repeat(3"] { grid-template-columns: 1fr !important; } div[style*="2fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
};

export default SocialAnalytics;
