import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineRefresh, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineTrendingDown,
    HiOutlineCalendar, HiOutlineDownload
} from 'react-icons/hi';
import { financeAPI } from '../../services/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const Laporan = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState(null);
    const [cashflowData, setCashflowData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [monthly, cashflow] = await Promise.all([
                financeAPI.getMonthlyReport(selectedMonth.year, selectedMonth.month),
                financeAPI.getCashflowReport(12)
            ]);
            setMonthlyData(monthly);
            setCashflowData(cashflow);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = monthlyData?.incomeByCategory?.reduce((sum, c) => sum + parseFloat(c.dataValues?.total || c.total || 0), 0) || 0;
    const totalExpense = monthlyData?.expenseByCategory?.reduce((sum, c) => sum + parseFloat(c.dataValues?.total || c.total || 0), 0) || 0;
    const netProfit = totalIncome - totalExpense;

    const maxCashflow = Math.max(...cashflowData.map(d => Math.max(d.income || 0, d.expense || 0)), 1);

    const getMonthName = (month) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[month - 1];
    };

    const prevMonth = () => {
        setSelectedMonth(prev => {
            if (prev.month === 1) return { year: prev.year - 1, month: 12 };
            return { ...prev, month: prev.month - 1 };
        });
    };

    const nextMonth = () => {
        setSelectedMonth(prev => {
            if (prev.month === 12) return { year: prev.year + 1, month: 1 };
            return { ...prev, month: prev.month + 1 };
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('finance.reports.title', 'Financial Reports')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('finance.reports.subtitle', 'Analyze income, expenses, and cash flow')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchData}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                >
                    <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                </motion.button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {[
                    { key: 'monthly', label: t('finance.reports.monthly'), icon: HiOutlineCalendar },
                    { key: 'cashflow', label: t('finance.reports.cashflow'), icon: HiOutlineChartBar }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: activeTab === tab.key ? 'rgba(139,92,246,0.2)' : 'transparent',
                            color: activeTab === tab.key ? '#a78bfa' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <tab.icon style={{ width: '18px', height: '18px' }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Monthly Report Tab */}
            {activeTab === 'monthly' && (
                <>
                    {/* Month Selector */}
                    <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                        <button onClick={prevMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>
                            {t('finance.reports.previous')}
                        </button>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                            {getMonthName(selectedMonth.month)} {selectedMonth.year}
                        </h2>
                        <button onClick={nextMonth} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>
                            {t('finance.reports.next')}
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card"
                            style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineTrendingUp style={{ width: '22px', height: '22px', color: '#34d399' }} />
                                </div>
                                <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('finance.reports.totalIncome')}</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: '700', color: '#34d399', margin: 0 }}>
                                {loading ? '...' : formatCurrency(totalIncome)}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card"
                            style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineTrendingDown style={{ width: '22px', height: '22px', color: '#f87171' }} />
                                </div>
                                <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('finance.reports.totalExpense')}</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: '700', color: '#f87171', margin: 0 }}>
                                {loading ? '...' : formatCurrency(totalExpense)}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card"
                            style={{ padding: '24px', background: netProfit >= 0 ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.05))' : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.05))' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: netProfit >= 0 ? 'rgba(139,92,246,0.2)' : 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HiOutlineChartBar style={{ width: '22px', height: '22px', color: netProfit >= 0 ? '#a78bfa' : '#f87171' }} />
                                </div>
                                <span style={{ fontSize: '14px', color: '#9ca3af' }}>{t('finance.reports.netProfitLoss')}</span>
                            </div>
                            <p style={{ fontSize: '28px', fontWeight: '700', color: netProfit >= 0 ? '#a78bfa' : '#f87171', margin: 0 }}>
                                {loading ? '...' : formatCurrency(netProfit)}
                            </p>
                        </motion.div>
                    </div>

                    {/* Category Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                        {/* Income by Category */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card"
                            style={{ padding: '24px' }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <HiOutlineTrendingUp style={{ color: '#34d399' }} />
                                {t('finance.reports.incomeByCategory')}
                            </h3>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>{t('common.loading')}</div>
                            ) : !monthlyData?.incomeByCategory?.length ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>{t('finance.reports.noData')}</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {monthlyData.incomeByCategory.map((cat, i) => {
                                        const amount = parseFloat(cat.dataValues?.total || cat.total || 0);
                                        const percent = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                                        return (
                                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '13px', color: '#d1d5db' }}>
                                                        {cat.FinanceCategory?.icon || '💰'} {cat.FinanceCategory?.name || 'Lainnya'}
                                                    </span>
                                                    <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '600' }}>{formatCurrency(amount)}</span>
                                                </div>
                                                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                                                        style={{ height: '100%', backgroundColor: cat.FinanceCategory?.color || '#34d399', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Expense by Category */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card"
                            style={{ padding: '24px' }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <HiOutlineTrendingDown style={{ color: '#f87171' }} />
                                {t('finance.reports.expenseByCategory')}
                            </h3>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>{t('common.loading')}</div>
                            ) : !monthlyData?.expenseByCategory?.length ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>{t('finance.reports.noData')}</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {monthlyData.expenseByCategory.map((cat, i) => {
                                        const amount = parseFloat(cat.dataValues?.total || cat.total || 0);
                                        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                                        return (
                                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '13px', color: '#d1d5db' }}>
                                                        {cat.FinanceCategory?.icon || '💸'} {cat.FinanceCategory?.name || 'Lainnya'}
                                                    </span>
                                                    <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '600' }}>{formatCurrency(amount)}</span>
                                                </div>
                                                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ delay: 0.6 + i * 0.05, duration: 0.8 }}
                                                        style={{ height: '100%', backgroundColor: cat.FinanceCategory?.color || '#f87171', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}

            {/* Cash Flow Tab */}
            {activeTab === 'cashflow' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                >
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>
                        {t('finance.reports.cashflowLast12Months')}
                    </h3>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('common.loading')}</div>
                    ) : cashflowData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('finance.reports.noData')}</div>
                    ) : (
                        <>
                            {/* Chart */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px', gap: '8px', marginBottom: '20px' }}>
                                {cashflowData.map((item, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '200px' }}>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${((item.income || 0) / maxCashflow) * 180}px` }}
                                                transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                                                style={{ width: '12px', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '4px 4px 0 0' }}
                                                title={`Pemasukan: ${formatCurrency(item.income)}`}
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${((item.expense || 0) / maxCashflow) * 180}px` }}
                                                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                                                style={{ width: '12px', background: 'linear-gradient(to top, #ef4444, #f87171)', borderRadius: '4px 4px 0 0' }}
                                                title={`Pengeluaran: ${formatCurrency(item.expense)}`}
                                            />
                                        </div>
                                        <span style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center' }}>
                                            {item.month?.split(' ')[0]?.substring(0, 3)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#34d399' }} />
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t('sidebar.income')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f87171' }} />
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{t('sidebar.expense')}</span>
                                </div>
                            </div>

                            {/* Detail Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af', fontWeight: '500' }}>{t('finance.reports.period')}</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#9ca3af', fontWeight: '500' }}>{t('sidebar.income')}</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#9ca3af', fontWeight: '500' }}>{t('sidebar.expense')}</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#9ca3af', fontWeight: '500' }}>{t('finance.reports.net')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cashflowData.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px', color: 'white' }}>{item.month}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', color: '#34d399' }}>{formatCurrency(item.income)}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', color: '#f87171' }}>{formatCurrency(item.expense)}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', color: item.net >= 0 ? '#34d399' : '#f87171', fontWeight: '600' }}>
                                                    {formatCurrency(item.net)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '12px', color: 'white', fontWeight: '600' }}>{t('finance.reports.total')}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#34d399', fontWeight: '600' }}>
                                                {formatCurrency(cashflowData.reduce((sum, d) => sum + (d.income || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#f87171', fontWeight: '600' }}>
                                                {formatCurrency(cashflowData.reduce((sum, d) => sum + (d.expense || 0), 0))}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: cashflowData.reduce((sum, d) => sum + (d.net || 0), 0) >= 0 ? '#34d399' : '#f87171' }}>
                                                {formatCurrency(cashflowData.reduce((sum, d) => sum + (d.net || 0), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Laporan;
