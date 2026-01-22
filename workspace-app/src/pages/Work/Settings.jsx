import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineCog, HiOutlineChip, HiOutlineColorSwatch, HiOutlineBell } from 'react-icons/hi';
import { useTheme } from '../../contexts/ThemeContext';

const settingSections = [
    { id: 'general', name: 'General', icon: HiOutlineCog },
    { id: 'ai', name: 'AI Assistant', icon: HiOutlineChip },
    { id: 'appearance', name: 'Appearance', icon: HiOutlineColorSwatch },
    { id: 'notifications', name: 'Notifications', icon: HiOutlineBell },
];

const Toggle = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        style={{
            width: '48px',
            height: '26px',
            borderRadius: '13px',
            border: 'none',
            backgroundColor: enabled ? '#8b5cf6' : '#4b5563',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.3s ease',
        }}
    >
        <motion.div
            animate={{ x: enabled ? 24 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '4px' }}
        />
    </button>
);

const Settings = () => {
    const { t } = useTranslation();
    const { darkMode, toggleDarkMode, compactMode, toggleCompactMode } = useTheme();
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState({
        projectView: 'grid',
        defaultReporting: 'weekly',
        aiEnabled: true,
        aiAutoSuggest: true,
        darkMode: true,
        compactMode: false,
        emailNotifications: true,
        pushNotifications: false,
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{ display: 'flex', gap: '24px' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', flexShrink: 0 }}>
                <div className="glass-card" style={{ padding: '8px' }}>
                    {settingSections.map(section => (
                        <motion.button
                            key={section.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: activeSection === section.id ? 'rgba(139,92,246,0.2)' : 'transparent',
                                cursor: 'pointer',
                                color: activeSection === section.id ? '#a78bfa' : '#9ca3af',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: activeSection === section.id ? '600' : '400',
                            }}
                        >
                            <section.icon style={{ width: '20px', height: '20px' }} />
                            {section.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div className="glass-card" style={{ padding: '28px' }}>
                    {activeSection === 'general' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>General Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>Default Project View</label>
                                    <select
                                        value={settings.projectView}
                                        onChange={(e) => setSettings(prev => ({ ...prev, projectView: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px' }}
                                    >
                                        <option value="grid">Grid View</option>
                                        <option value="list">List View</option>
                                        <option value="kanban">Kanban View</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>Default Reporting</label>
                                    <select
                                        value={settings.defaultReporting}
                                        onChange={(e) => setSettings(prev => ({ ...prev, defaultReporting: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px' }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'ai' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>AI Assistant Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Enable AI Assistant</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Get AI-powered suggestions and help</p>
                                    </div>
                                    <Toggle enabled={settings.aiEnabled} onToggle={() => handleToggle('aiEnabled')} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Auto-Suggest</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Get AI suggestions while typing</p>
                                    </div>
                                    <Toggle enabled={settings.aiAutoSuggest} onToggle={() => handleToggle('aiAutoSuggest')} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Appearance Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Dark Mode</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Use dark theme throughout the app</p>
                                    </div>
                                    <Toggle enabled={darkMode} onToggle={toggleDarkMode} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Compact Mode</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Reduce spacing for more content</p>
                                    </div>
                                    <Toggle enabled={compactMode} onToggle={toggleCompactMode} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>Notification Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Email Notifications</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Receive updates via email</p>
                                    </div>
                                    <Toggle enabled={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <h3 style={{ fontWeight: '500', color: 'white', fontSize: '14px', margin: '0 0 4px 0' }}>Push Notifications</h3>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Receive browser notifications</p>
                                    </div>
                                    <Toggle enabled={settings.pushNotifications} onToggle={() => handleToggle('pushNotifications')} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
