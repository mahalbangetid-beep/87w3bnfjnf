import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCog,
    HiOutlineSave,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineCheck,
    HiOutlineBell,
    HiOutlineColorSwatch,
    HiOutlineDatabase,
    HiOutlineExclamation,
} from 'react-icons/hi';
import { spaceAPI, ideaProjectsAPI } from '../../services/api';

const SpaceSettings = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        defaultProjectColor: '#8b5cf6',
        defaultPriority: 'medium',
        defaultStatus: 'idea',
        showCompletedGoals: true,
        enableNotifications: true,
        currency: 'IDR',
        dateFormat: 'YYYY-MM-DD',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        projects: 0,
        milestones: 0,
        goals: 0,
        assets: 0,
        budgets: 0,
        transactions: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Load settings from localStorage (settings still local)
                const storedSettings = localStorage.getItem('spaceSettings');
                if (storedSettings) {
                    setSettings(JSON.parse(storedSettings));
                }

                // Fetch stats from API
                const [projects, assets, budgets, transactions, spaceStats] = await Promise.all([
                    ideaProjectsAPI.getAll().catch(() => []),
                    spaceAPI.getAssets().catch(() => []),
                    spaceAPI.getBudgets().catch(() => []),
                    spaceAPI.getTransactions().catch(() => []),
                    spaceAPI.getStats().catch(() => ({})),
                ]);

                setStats({
                    projects: projects?.length || 0,
                    milestones: spaceStats?.totalMilestones || 0,
                    goals: spaceStats?.totalGoals || 0,
                    assets: assets?.length || 0,
                    budgets: budgets?.length || 0,
                    transactions: transactions?.length || 0,
                });
            } catch {
                // Stats load error - use defaults
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleSave = () => {
        setSaving(true);
        localStorage.setItem('spaceSettings', JSON.stringify(settings));
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 500);
    };

    // Note: Data clearing would require API calls to delete all items
    // For now, we show a message explaining the data is stored in the database

    const colorOptions = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    <span className="gradient-text">{t('space.settings.title', 'Space Settings')}</span>
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.settings.subtitle', 'Configure your personal project workspace preferences')}</p>
            </div>

            {/* Default Settings */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineColorSwatch style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Default Values</h2>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Configure defaults for new projects</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Default Color */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Default Project Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {colorOptions.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSettings({ ...settings, defaultProjectColor: color })}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        border: settings.defaultProjectColor === color ? '2px solid white' : '2px solid transparent',
                                        backgroundColor: color,
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Default Priority */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Default Priority</label>
                        <select
                            value={settings.defaultPriority}
                            onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value })}
                            style={{ width: '100%', maxWidth: '300px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Default Status */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Default Project Status</label>
                        <select
                            value={settings.defaultStatus}
                            onChange={(e) => setSettings({ ...settings, defaultStatus: e.target.value })}
                            style={{ width: '100%', maxWidth: '300px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                        >
                            <option value="idea">Idea</option>
                            <option value="planning">Planning</option>
                            <option value="development">Development</option>
                        </select>
                    </div>

                    {/* Currency */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            style={{ width: '100%', maxWidth: '300px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                        >
                            <option value="IDR">Indonesian Rupiah (IDR)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineBell style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Preferences</h2>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Customize your experience</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Show Completed Goals */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div>
                            <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>Show Completed Goals</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Display achieved goals in the targeting page</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, showCompletedGoals: !settings.showCompletedGoals })}
                            style={{
                                width: '48px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                backgroundColor: settings.showCompletedGoals ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                left: settings.showCompletedGoals ? '24px' : '4px',
                                transition: 'left 0.2s',
                            }} />
                        </button>
                    </div>

                    {/* Enable Notifications */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div>
                            <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>Enable Notifications</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Get notified about upcoming deadlines</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                            style={{
                                width: '48px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                backgroundColor: settings.enableNotifications ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '4px',
                                left: settings.enableNotifications ? '24px' : '4px',
                                transition: 'left 0.2s',
                            }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineDatabase style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Data Management</h2>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Manage your stored data</p>
                    </div>
                </div>

                {/* Storage Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Assets', value: stats.assets },
                        { label: 'Budgets', value: stats.budgets },
                        { label: 'Transactions', value: stats.transactions },
                        { label: 'Projects', value: stats.projects },
                        { label: 'Milestones', value: stats.milestones },
                        { label: 'Goals', value: stats.goals },
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                            <p style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>{loading ? '-' : item.value}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Database Storage Info */}
                <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                }}>
                    <HiOutlineDatabase style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <p style={{ fontWeight: '500', color: '#34d399', fontSize: '13px', margin: 0 }}>Data Stored Securely</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                            Your Space data (assets, budgets, transactions, projects, milestones, goals) is stored securely in the database.
                            To delete individual items, use the respective pages.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="btn-glow"
                style={{ padding: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
            >
                {saved ? (
                    <>
                        <HiOutlineCheck style={{ width: '18px', height: '18px' }} />
                        Saved!
                    </>
                ) : saving ? (
                    'Saving...'
                ) : (
                    <>
                        <HiOutlineSave style={{ width: '18px', height: '18px' }} />
                        Save Settings
                    </>
                )}
            </motion.button>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 767px) {
                    div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    );
};

export default SpaceSettings;
