import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Chart from '../../components/UI/SafeChart';
import {
    HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash,
    HiOutlineChartPie, HiOutlineCalendar, HiOutlineSparkles,
    HiOutlineLightningBolt, HiOutlineArrowUp, HiOutlineArrowDown
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

// Animated Number Counter
const AnimatedValue = ({ value, prefix = '', suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseFloat(value) || 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <>{prefix}{count.toLocaleString('id-ID')}{suffix}</>;
};

// Floating Particles - pre-generated positions
const particlePositions = [...Array(20)].map((_, i) => ({
    duration: 3 + (i * 0.1),
    left: `${(i * 5) % 100}%`
}));

const FloatingParticles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particlePositions.map((p, i) => (
            <motion.div
                key={i}
                animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 30, 0], opacity: [0, 1, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: i * 0.2 }}
                style={{
                    position: 'absolute',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 4],
                    left: p.left,
                    bottom: 0,
                }}
            />
        ))}
    </div>
);

// Stat Card with Glow
const StatCard = ({ title, value, change, icon: IconComponent, color, delay = 0 }) => {
    const colors = {
        violet: { bg: 'rgba(139,92,246,0.15)', glow: '#8b5cf6', text: '#a78bfa' },
        emerald: { bg: 'rgba(16,185,129,0.15)', glow: '#10b981', text: '#34d399' },
        cyan: { bg: 'rgba(6,182,212,0.15)', glow: '#06b6d4', text: '#22d3ee' },
        orange: { bg: 'rgba(249,115,22,0.15)', glow: '#f97316', text: '#fb923c' },
        pink: { bg: 'rgba(236,72,153,0.15)', glow: '#ec4899', text: '#f472b6' },
    };
    const c = colors[color] || colors.violet;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.03, y: -5 }}
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
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: c.glow,
                    filter: 'blur(50px)',
                }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: c.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <IconComponent style={{ width: 24, height: 24, color: c.text }} />
                    </motion.div>
                    {change !== undefined && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: delay + 0.3, type: 'spring' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px', borderRadius: 20,
                                background: change >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                color: change >= 0 ? '#34d399' : '#f87171',
                                fontSize: 13, fontWeight: 600,
                            }}
                        >
                            {change >= 0 ? <HiOutlineArrowUp /> : <HiOutlineArrowDown />}
                            {Math.abs(change)}%
                        </motion.div>
                    )}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>{title}</div>
            </div>
        </motion.div>
    );
};

// Chart Card Wrapper
const ChartCard = ({ title, subtitle, children, delay = 0, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        style={{
            background: 'rgba(17,17,27,0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            height: '100%',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            {Icon && (
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon style={{ width: 20, height: 20, color: '#a78bfa' }} />
                </div>
            )}
            <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>{title}</h3>
                {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{subtitle}</p>}
            </div>
        </div>
        {children}
    </motion.div>
);

const FinanceAnalytics = () => {
    useTranslation(); // Keep for future i18n
    const [, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await financeAPI.getTransactions({ limit: 500 }).catch(() => null);
                // Handle different response structures
                const txData = Array.isArray(response) ? response : (response?.transactions || response?.data || []);
                setTransactions(txData);

                // Generate monthly aggregation - use transactionDate field
                const monthly = {};
                txData.forEach(tx => {
                    const dateField = tx.transactionDate || tx.date || tx.createdAt;
                    if (!dateField) return;
                    const month = new Date(dateField).toISOString().slice(0, 7);
                    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
                    if (tx.type === 'income') monthly[month].income += parseFloat(tx.amount) || 0;
                    else if (tx.type === 'expense') monthly[month].expense += parseFloat(tx.amount) || 0;
                });
                const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
                setMonthlyData(sorted.map(([month, data]) => ({ month, ...data })));
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Use mock data if no transactions
    const hasData = transactions.length > 0;
    const mockMonthly = [
        { month: '2026-01', income: 15000000, expense: 8000000 },
        { month: '2026-02', income: 18000000, expense: 10000000 },
        { month: '2026-03', income: 16000000, expense: 9500000 },
        { month: '2026-04', income: 20000000, expense: 11000000 },
        { month: '2026-05', income: 22000000, expense: 12000000 },
        { month: '2026-06', income: 25000000, expense: 14000000 },
    ];
    const displayMonthly = hasData ? monthlyData : mockMonthly;

    // Calculate stats
    const totalIncome = hasData
        ? transactions.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)
        : mockMonthly.reduce((s, m) => s + m.income, 0);
    const totalExpense = hasData
        ? transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)
        : mockMonthly.reduce((s, m) => s + m.expense, 0);
    const netProfit = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    // Calculate change percentages (compare last 2 months)
    const calcChange = (type) => {
        if (displayMonthly.length < 2) return 0;
        const curr = displayMonthly[displayMonthly.length - 1][type] || 0;
        const prev = displayMonthly[displayMonthly.length - 2][type] || 1;
        return Math.round(((curr - prev) / prev) * 100);
    };
    const incomeChange = calcChange('income');
    const expenseChange = calcChange('expense');

    // Category breakdown (mock if no data)
    const categoryData = {};
    if (hasData) {
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category || t.Category?.name || 'Other';
            categoryData[cat] = (categoryData[cat] || 0) + (parseFloat(t.amount) || 0);
        });
    } else {
        // Mock category data
        categoryData['Food & Dining'] = 4500000;
        categoryData['Transportation'] = 2500000;
        categoryData['Shopping'] = 3000000;
        categoryData['Bills & Utilities'] = 2000000;
        categoryData['Entertainment'] = 1500000;
        categoryData['Health'] = 800000;
    }
    const categoryLabels = Object.keys(categoryData);
    const categoryValues = Object.values(categoryData);

    // Chart configurations
    const areaChartOptions = {
        chart: { type: 'area', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800, animateGradually: { enabled: true, delay: 150 } } },
        colors: ['#10b981', '#f43f5e'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } },
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: displayMonthly.map(d => d.month.slice(5)), labels: { style: { colors: '#9ca3af', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '12px' }, formatter: v => `${(v / 1000000).toFixed(1)}M` } },
        legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#9ca3af' } },
        tooltip: { theme: 'dark', y: { formatter: v => `Rp ${v.toLocaleString('id-ID')}` } },
    };

    const donutChartOptions = {
        chart: { type: 'donut', background: 'transparent', animations: { enabled: true, speed: 800, dynamicAnimation: { enabled: true, speed: 350 } } },
        colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'],
        labels: categoryLabels,
        stroke: { width: 0 },
        dataLabels: { enabled: false },
        legend: { show: true, position: 'bottom', labels: { colors: '#9ca3af' } },
        plotOptions: { pie: { donut: { size: '70%', labels: { show: true, name: { color: '#fff' }, value: { color: '#fff', formatter: v => `Rp ${parseInt(v).toLocaleString('id-ID')}` }, total: { show: true, label: 'Total', color: '#9ca3af', formatter: w => `Rp ${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString('id-ID')}` } } } } },
        tooltip: { theme: 'dark' },
    };

    const barChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 800 } },
        colors: ['#8b5cf6'],
        plotOptions: { bar: { borderRadius: 8, columnWidth: '60%', distributed: true } },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: categoryLabels.slice(0, 5), labels: { style: { colors: '#9ca3af', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '12px' }, formatter: v => `${(v / 1000000).toFixed(1)}M` } },
        tooltip: { theme: 'dark', y: { formatter: v => `Rp ${v.toLocaleString('id-ID')}` } },
        legend: { show: false },
    };

    const radialOptions = {
        chart: { type: 'radialBar', background: 'transparent', animations: { enabled: true, speed: 1000 } },
        colors: ['#8b5cf6'],
        plotOptions: { radialBar: { hollow: { size: '70%', background: 'transparent' }, track: { background: 'rgba(255,255,255,0.1)' }, dataLabels: { name: { color: '#9ca3af', fontSize: '14px' }, value: { color: '#fff', fontSize: '32px', fontWeight: 700, formatter: v => `${v}%` } } } },
        labels: ['Savings Rate'],
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <FloatingParticles />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 30 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Finance Analytics
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>Deep insights into your financial patterns</p>
                </motion.div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                    <StatCard title="Total Income" value={<AnimatedValue value={totalIncome} prefix="Rp " />} change={incomeChange} icon={HiOutlineTrendingUp} color="emerald" delay={0} />
                    <StatCard title="Total Expense" value={<AnimatedValue value={totalExpense} prefix="Rp " />} change={expenseChange} icon={HiOutlineTrendingDown} color="pink" delay={0.1} />
                    <StatCard title="Net Profit" value={<AnimatedValue value={Math.abs(netProfit)} prefix={netProfit >= 0 ? 'Rp ' : '-Rp '} />} change={incomeChange - expenseChange} icon={HiOutlineCash} color="cyan" delay={0.2} />
                    <StatCard title="Savings Rate" value={`${savingsRate}%`} icon={HiOutlineLightningBolt} color="violet" delay={0.3} />
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                    <ChartCard title="Income vs Expense Trend" subtitle="Last 6 months comparison" icon={HiOutlineTrendingUp} delay={0.4}>
                        <Chart options={areaChartOptions} series={[{ name: 'Income', data: displayMonthly.map(d => d.income) }, { name: 'Expense', data: displayMonthly.map(d => d.expense) }]} type="area" height={300} />
                    </ChartCard>
                    <ChartCard title="Savings Rate" subtitle="Your financial health" icon={HiOutlineSparkles} delay={0.5}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                            <Chart options={radialOptions} series={[savingsRate]} type="radialBar" height={280} />
                        </div>
                    </ChartCard>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <ChartCard title="Expense by Category" subtitle="Where your money goes" icon={HiOutlineChartPie} delay={0.6}>
                        <Chart options={donutChartOptions} series={categoryValues} type="donut" height={320} />
                    </ChartCard>
                    <ChartCard title="Top Spending Categories" subtitle="Focus areas for saving" icon={HiOutlineCalendar} delay={0.7}>
                        <Chart options={barChartOptions} series={[{ data: categoryValues.slice(0, 5) }]} type="bar" height={320} />
                    </ChartCard>
                </div>
            </div>

            <style>{`
                @media (max-width: 1023px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; } }
                @media (max-width: 767px) { div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
};

export default FinanceAnalytics;
