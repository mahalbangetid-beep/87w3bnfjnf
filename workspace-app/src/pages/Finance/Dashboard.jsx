import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCreditCard, HiOutlinePlus,
    HiOutlineRefresh, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineCalendar
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

// Format currency based on language
const formatCurrency = (amount, language = 'id') => {
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    const currency = language === 'id' ? 'IDR' : 'USD';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format month label from ISO format (2026-01) based on language
const formatMonthLabel = (isoMonth, language = 'id') => {
    if (!isoMonth) return '';
    const [year, month] = isoMonth.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short' });
};

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [cashflowData, setCashflowData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dashboard, cashflow] = await Promise.all([
                financeAPI.getDashboard().catch(() => null),
                financeAPI.getCashflowReport(6).catch(() => [])
            ]);
            setDashboardData(dashboard);
            setCashflowData(cashflow);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = dashboardData ? {
        totalBalance: dashboardData.totalBalance || 0,
        monthlyIncome: dashboardData.monthlyIncome || 0,
        monthlyExpense: dashboardData.monthlyExpense || 0,
        monthlyNet: dashboardData.monthlyNet || 0
    } : { totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0, monthlyNet: 0 };

    const incomePercent = stats.monthlyIncome > 0 ?
        Math.min(100, (stats.monthlyIncome / (stats.monthlyIncome + stats.monthlyExpense)) * 100) : 0;
    const expensePercent = stats.monthlyExpense > 0 ?
        Math.min(100, (stats.monthlyExpense / (stats.monthlyIncome + stats.monthlyExpense)) * 100) : 0;

    const maxCashflow = Math.max(...cashflowData.map(d => Math.max(d.income || 0, d.expense || 0)), 1);

    // Quick actions with translation keys
    const quickActions = [
        { label: t('finance.quickActions.viewBalance', 'View Balance'), path: '/finance/saldo', icon: HiOutlineCreditCard, color: '#8b5cf6' },
        { label: t('sidebar.bills', 'Bills'), path: '/finance/tagihan', icon: HiOutlineCalendar, color: '#ef4444' },
        { label: t('sidebar.income', 'Income'), path: '/finance/pemasukan', icon: HiOutlineTrendingUp, color: '#10b981' },
        { label: t('sidebar.expense', 'Expense'), path: '/finance/pengeluaran', icon: HiOutlineTrendingDown, color: '#f59e0b' },
        { label: t('sidebar.report', 'Report'), path: '/finance/laporan', icon: HiOutlineClock, color: '#06b6d4' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.dashboard.title', 'Finance Dashboard')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.dashboard.subtitle', 'Manage your income, expenses, and finances')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchData}
                        style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: '#9ca3af',
                            cursor: 'pointer'
                        }}
                    >
                        <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/finance/pemasukan')}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {t('finance.transactions.newTransaction', 'Add Transaction')}
                    </motion.button>
                </div>
            </div>

            {/* Balance Card + Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {/* Balance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))', cursor: 'pointer' }}
                    onClick={() => navigate('/finance/saldo')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCreditCard style={{ width: '24px', height: '24px', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#d1d5db' }}>{t('finance.dashboard.totalBalance', 'Total Balance')}</span>
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: '0 0 8px 0' }}>
                        {loading ? '...' : formatCurrency(stats.totalBalance, i18n.language)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }}>
                        {dashboardData?.accountCount || 0} {t('finance.accountsConnected', 'accounts connected')}
                    </div>
                </motion.div>

                {/* Income */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => navigate('/finance/pemasukan')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineTrendingUp style={{ width: '24px', height: '24px', color: '#34d399' }} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('finance.incomeThisMonth', 'Income This Month')}</span>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#34d399', margin: '0 0 8px 0' }}>
                        {loading ? '...' : formatCurrency(stats.monthlyIncome, i18n.language)}
                    </p>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${incomePercent}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                            style={{ height: '100%', backgroundColor: '#34d399', borderRadius: '10px' }}
                        />
                    </div>
                </motion.div>

                {/* Expense */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => navigate('/finance/pengeluaran')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineTrendingDown style={{ width: '24px', height: '24px', color: '#f87171' }} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('finance.expenseThisMonth', 'Expense This Month')}</span>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#f87171', margin: '0 0 8px 0' }}>
                        {loading ? '...' : formatCurrency(stats.monthlyExpense, i18n.language)}
                    </p>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${expensePercent}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                            style={{ height: '100%', backgroundColor: '#f87171', borderRadius: '10px' }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                    {t('finance.quickActions.title', 'Quick Actions')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {quickActions.map((action, i) => (
                        <motion.button
                            key={action.path}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${action.color}30`,
                                backgroundColor: `${action.color}10`,
                                color: action.color,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <action.icon style={{ width: '20px', height: '20px' }} />
                            {action.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Chart + Bills + Transactions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {/* Cash Flow Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>{t('finance.cashflowLast6Months')}</h2>
                    {cashflowData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            {t('finance.noData')}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px' }}>
                            {cashflowData.map((item, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px' }}>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${((item.income || 0) / maxCashflow) * 140}px` }}
                                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                            style={{ width: '12px', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '4px 4px 0 0' }}
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${((item.expense || 0) / maxCashflow) * 140}px` }}
                                            transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                                            style={{ width: '12px', background: 'linear-gradient(to top, #ef4444, #f87171)', borderRadius: '4px 4px 0 0' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>{formatMonthLabel(item.month, i18n.language)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#34d399' }} />
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t('sidebar.income')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f87171' }} />
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t('sidebar.expense')}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Upcoming Bills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>{t('finance.upcomingBills')}</h2>
                        <button
                            onClick={() => navigate('/finance/tagihan')}
                            style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '13px', cursor: 'pointer' }}
                        >
                            {t('finance.viewAll')}
                        </button>
                    </div>
                    {!dashboardData?.upcomingBills || dashboardData.upcomingBills.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <HiOutlineCalendar style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('finance.noBills')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {dashboardData.upcomingBills.map((bill, i) => {
                                const dueDate = new Date(bill.dueDate);
                                const isOverdue = dueDate < new Date();
                                return (
                                    <motion.div
                                        key={bill.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            backgroundColor: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                                            border: isOverdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '24px' }}>{bill.icon || '📄'}</span>
                                            <div>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{bill.name}</p>
                                                <p style={{ color: isOverdue ? '#f87171' : '#6b7280', fontSize: '12px', margin: 0 }}>
                                                    {isOverdue && <HiOutlineExclamationCircle style={{ display: 'inline', marginRight: '4px' }} />}
                                                    {dueDate.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{ color: '#f87171', fontWeight: '600', fontSize: '14px' }}>
                                            {formatCurrency(bill.amount)}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card"
                style={{ padding: '24px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>{t('finance.recentTransactions')}</h2>
                    <button
                        onClick={() => navigate('/finance/pemasukan')}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '13px', cursor: 'pointer' }}
                    >
                        {t('finance.viewAll')}
                    </button>
                </div>
                {!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <HiOutlineClock style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                        <p style={{ color: '#9ca3af', fontSize: '14px' }}>{t('finance.noTransactionsYet')}</p>
                        <button
                            onClick={() => navigate('/finance/pemasukan')}
                            style={{
                                marginTop: '12px',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {t('finance.addFirstTransaction')}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {dashboardData.recentTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.03)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: tx.type === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {tx.FinanceCategory?.icon || (tx.type === 'income' ?
                                            <HiOutlineTrendingUp style={{ color: '#34d399' }} /> :
                                            <HiOutlineTrendingDown style={{ color: '#f87171' }} />)}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: 0 }}>
                                            {tx.description || tx.FinanceCategory?.name || 'Transaksi'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                                            {tx.FinanceAccount?.name} • {new Date(tx.transactionDate).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default FinanceDashboard;
