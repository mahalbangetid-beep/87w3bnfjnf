import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineDocumentReport,
    HiOutlineSparkles,
    HiOutlineDownload,
    HiOutlineShare,
    HiOutlineCalendar,
    HiOutlineFolder,
    HiOutlineCurrencyDollar,
    HiOutlineChartBar,
    HiOutlineClock,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlinePrinter,
    HiOutlineEye,
} from 'react-icons/hi';

// Storage keys
const PROJECTS_STORAGE_KEY = 'workspace_projects';
const BUDGET_STORAGE_KEY = 'workspace_budgets';
const EXPENSES_STORAGE_KEY = 'workspace_expenses';
const TASKS_STORAGE_KEY = 'workspace_tasks';
const REPORTS_STORAGE_KEY = 'workspace_reports';

// Format currency to Rupiah
const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Load functions
const loadData = (key, defaultValue = []) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
    } catch (error) {
        console.error(`Error loading ${key}:`, error);
    }
    return defaultValue;
};

const Reporting = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    const [dateRange, setDateRange] = useState('month');
    const [showPreview, setShowPreview] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);

    // Load all data
    useEffect(() => {
        setProjects(loadData(PROJECTS_STORAGE_KEY));
        setBudgets(loadData(BUDGET_STORAGE_KEY));
        setExpenses(loadData(EXPENSES_STORAGE_KEY));
        setTasks(loadData(TASKS_STORAGE_KEY));
        setReports(loadData(REPORTS_STORAGE_KEY));
    }, []);

    // Save reports
    useEffect(() => {
        if (reports.length > 0) {
            localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
        }
    }, [reports]);

    // Calculate report data
    const reportData = useMemo(() => {
        const filteredProjects = selectedProject === 'all'
            ? projects
            : projects.filter(p => p.id === parseInt(selectedProject));

        // Project stats
        const totalProjects = filteredProjects.length;
        const activeProjects = filteredProjects.filter(p => p.status === 'active').length;
        const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
        const reviewProjects = filteredProjects.filter(p => p.status === 'review').length;

        // Budget stats
        const projectIds = filteredProjects.map(p => p.id);
        const projectBudgets = budgets.filter(b => projectIds.includes(b.projectId));
        const projectExpenses = expenses.filter(e => projectIds.includes(e.projectId));

        const totalBudget = projectBudgets.reduce((sum, b) => sum + b.amount, 0);
        const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remainingBudget = totalBudget - totalExpenses;
        const budgetUsedPercent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

        // Task stats
        const projectTasks = tasks.filter(t => projectIds.includes(t.projectId));
        const completedTasks = projectTasks.filter(t => t.completed).length;
        const pendingTasks = projectTasks.filter(t => !t.completed).length;
        const taskCompletionRate = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

        // Project details
        const projectDetails = filteredProjects.map(project => {
            const budget = budgets.find(b => b.projectId === project.id);
            const projectExp = expenses.filter(e => e.projectId === project.id);
            const spent = projectExp.reduce((sum, e) => sum + e.amount, 0);
            const budgetAmount = budget?.amount || 0;
            const remaining = budgetAmount - spent;
            const progress = project.customProgress || 0;

            // Days calculation
            const endDate = new Date(project.endDate);
            const today = new Date();
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            return {
                ...project,
                budgetAmount,
                spent,
                remaining,
                progress,
                daysRemaining,
                isOverBudget: remaining < 0,
                isOverdue: daysRemaining < 0,
            };
        });

        // Expense by category
        const expenseByCategory = {};
        projectExpenses.forEach(e => {
            if (!expenseByCategory[e.category]) {
                expenseByCategory[e.category] = 0;
            }
            expenseByCategory[e.category] += e.amount;
        });

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            reviewProjects,
            totalBudget,
            totalExpenses,
            remainingBudget,
            budgetUsedPercent,
            completedTasks,
            pendingTasks,
            taskCompletionRate,
            projectDetails,
            expenseByCategory,
            recentExpenses: projectExpenses.slice(0, 5),
        };
    }, [projects, budgets, expenses, tasks, selectedProject]);

    // Generate report
    const generateReport = () => {
        setGeneratingReport(true);

        setTimeout(() => {
            const newReport = {
                id: Date.now(),
                title: `Report - ${selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id === parseInt(selectedProject))?.name}`,
                dateRange,
                createdAt: new Date().toISOString(),
                data: reportData,
            };

            setReports([newReport, ...reports.slice(0, 9)]);
            setGeneratingReport(false);
            setShowPreview(true);
        }, 1500);
    };

    // Export report (placeholder)
    const exportReport = (format) => {
        alert(`Exporting report as ${format.toUpperCase()}...\n\nThis feature will be available with full implementation.`);
    };

    // Category names
    const categoryNames = {
        software: 'Software & Tools',
        hardware: 'Hardware',
        service: 'Services',
        marketing: 'Marketing',
        operations: 'Operations',
        other: 'Other',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.reporting.title', 'Reporting')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.reporting.subtitle', 'Generate and view project reports')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowPreview(true)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: '#9ca3af',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <HiOutlineEye style={{ width: '18px', height: '18px' }} />
                        Preview
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generateReport}
                        disabled={generatingReport}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: generatingReport ? 0.7 : 1 }}
                    >
                        {generatingReport ? (
                            <HiOutlineRefresh style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <HiOutlineSparkles style={{ width: '18px', height: '18px' }} />
                        )}
                        {generatingReport ? 'Generating...' : 'Generate Report'}
                    </motion.button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Project</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                            minWidth: '200px',
                        }}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Period</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineFolder style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Projects</p>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>{reportData.totalProjects}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                        <span style={{ color: '#34d399' }}>{reportData.activeProjects} active</span>
                        <span style={{ color: '#6b7280' }}>•</span>
                        <span style={{ color: '#fb923c' }}>{reportData.reviewProjects} review</span>
                        <span style={{ color: '#6b7280' }}>•</span>
                        <span style={{ color: '#06b6d4' }}>{reportData.completedProjects} done</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineChartBar style={{ width: '20px', height: '20px', color: '#34d399' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Budget</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#34d399', margin: 0 }}>{formatRupiah(reportData.totalBudget)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCurrencyDollar style={{ width: '20px', height: '20px', color: '#f87171' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Spent</p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: '#f87171', margin: 0 }}>{formatRupiah(reportData.totalExpenses)}</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: reportData.remainingBudget >= 0 ? '#34d399' : '#f87171' }}>
                        {reportData.remainingBudget >= 0 ? `${formatRupiah(reportData.remainingBudget)} remaining` : `${formatRupiah(Math.abs(reportData.remainingBudget))} over budget`}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCheck style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Task Completion</p>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4', margin: 0 }}>{reportData.taskCompletionRate.toFixed(0)}%</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {reportData.completedTasks} completed, {reportData.pendingTasks} pending
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Project Details */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Project Status</h2>
                    {reportData.projectDetails.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>No projects found. Create projects to see reports.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reportData.projectDetails.map(project => (
                                <div key={project.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${project.color}30` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: project.color }} />
                                            <div>
                                                <p style={{ fontWeight: '600', color: 'white', fontSize: '14px', margin: 0 }}>{project.name}</p>
                                                <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{project.client}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {project.isOverBudget && (
                                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>Over Budget</span>
                                            )}
                                            {project.isOverdue && (
                                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>Overdue</span>
                                            )}
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: `${project.color}20`, color: project.color, textTransform: 'capitalize' }}>{project.status}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Budget</p>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#34d399', margin: '2px 0 0 0' }}>{formatRupiah(project.budgetAmount)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Spent</p>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#f87171', margin: '2px 0 0 0' }}>{formatRupiah(project.spent)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Progress</p>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: project.color, margin: '2px 0 0 0' }}>{project.progress}%</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Days Left</p>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: project.daysRemaining < 0 ? '#f87171' : project.daysRemaining < 7 ? '#fb923c' : 'white', margin: '2px 0 0 0' }}>
                                                {project.daysRemaining < 0 ? `${Math.abs(project.daysRemaining)}d overdue` : `${project.daysRemaining}d`}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: project.color, borderRadius: '10px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Budget Usage */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Budget Usage</h2>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <p style={{ fontSize: '36px', fontWeight: '700', color: reportData.budgetUsedPercent > 100 ? '#f87171' : reportData.budgetUsedPercent > 80 ? '#fb923c' : '#34d399', margin: 0 }}>
                                {reportData.budgetUsedPercent.toFixed(1)}%
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>of total budget used</p>
                        </div>
                        <div style={{ height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(reportData.budgetUsedPercent, 100)}%` }}
                                transition={{ duration: 1 }}
                                style={{
                                    height: '100%',
                                    background: reportData.budgetUsedPercent > 100 ? '#ef4444' : reportData.budgetUsedPercent > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                                    borderRadius: '10px',
                                }}
                            />
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Expense Breakdown</h2>
                        {Object.keys(reportData.expenseByCategory).length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No expenses recorded</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {Object.entries(reportData.expenseByCategory).map(([cat, amount]) => (
                                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#d1d5db' }}>{categoryNames[cat] || cat}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{formatRupiah(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export Options */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Export Report</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => exportReport('pdf')}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <HiOutlineDownload style={{ width: '18px', height: '18px', color: '#f87171' }} />
                                Download PDF
                            </button>
                            <button
                                onClick={() => exportReport('excel')}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <HiOutlineDownload style={{ width: '18px', height: '18px', color: '#34d399' }} />
                                Download Excel
                            </button>
                            <button
                                onClick={() => window.print()}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <HiOutlinePrinter style={{ width: '18px', height: '18px', color: '#06b6d4' }} />
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Generated Reports</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {reports.slice(0, 6).map(report => (
                            <motion.div
                                key={report.id}
                                whileHover={{ y: -3 }}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <HiOutlineDocumentReport style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', color: 'white', fontSize: '13px', margin: 0 }}>{report.title}</p>
                                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
                                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '800px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                backgroundColor: '#0f0f23',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '32px',
                            }}
                        >
                            {/* Report Header */}
                            <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>Project Report</h1>
                                <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>
                                    {selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id === parseInt(selectedProject))?.name}
                                </p>
                                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                                    Generated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Summary */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Budget</p>
                                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#34d399', margin: '4px 0 0 0' }}>{formatRupiah(reportData.totalBudget)}</p>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total Expenses</p>
                                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#f87171', margin: '4px 0 0 0' }}>{formatRupiah(reportData.totalExpenses)}</p>
                                </div>
                            </div>

                            {/* Projects Table */}
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Project Details</h3>
                            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Project</th>
                                            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Budget</th>
                                            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Spent</th>
                                            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Progress</th>
                                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.projectDetails.map(project => (
                                            <tr key={project.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px 8px', fontSize: '13px', color: 'white' }}>{project.name}</td>
                                                <td style={{ padding: '12px 8px', fontSize: '13px', color: '#34d399', textAlign: 'right' }}>{formatRupiah(project.budgetAmount)}</td>
                                                <td style={{ padding: '12px 8px', fontSize: '13px', color: '#f87171', textAlign: 'right' }}>{formatRupiah(project.spent)}</td>
                                                <td style={{ padding: '12px 8px', fontSize: '13px', color: 'white', textAlign: 'right' }}>{project.progress}%</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', backgroundColor: `${project.color}20`, color: project.color, textTransform: 'capitalize' }}>{project.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Close button */}
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    style={{ padding: '12px 32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reporting;
