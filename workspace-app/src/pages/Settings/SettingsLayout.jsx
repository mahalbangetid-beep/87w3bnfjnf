/**
 * User Settings - Main Settings Page with Sidebar Navigation
 */
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineUserCircle,
    HiOutlineKey,
    HiOutlineSparkles,
    HiOutlineBell,
    HiOutlineColorSwatch,
    HiOutlineCog,
    HiOutlineLightBulb
} from 'react-icons/hi';

const settingsMenu = [
    { id: 'profile', path: '/settings', icon: HiOutlineUserCircle, label: 'Profile', exact: true },
    { id: 'account', path: '/settings/account', icon: HiOutlineKey, label: 'Account & Security' },
    { id: 'ai', path: '/settings/ai', icon: HiOutlineSparkles, label: 'AI Configuration' },
    { id: 'notifications', path: '/settings/notifications', icon: HiOutlineBell, label: 'Notifications' },
    { id: 'preferences', path: '/settings/preferences', icon: HiOutlineColorSwatch, label: 'Preferences' },
    { id: 'suggestions', path: '/settings/suggestions', icon: HiOutlineLightBulb, label: 'Suggest Feature' },
];

const SettingsLayout = ({ children }) => {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <div style={{
            display: 'flex',
            gap: '24px',
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: 'calc(100vh - 48px)'
        }}>
            {/* Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    width: '250px',
                    flexShrink: 0,
                }}
            >
                <div className="glass-card" style={{ padding: '16px', position: 'sticky', top: '24px' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <HiOutlineCog style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                margin: 0,
                            }}>
                                {t('settings.title', 'Settings')}
                            </h2>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                {t('settings.subtitle', 'Manage your account')}
                            </p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {settingsMenu.map((item) => {
                            const isActive = item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.exact}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            background: isActive
                                                ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))'
                                                : 'transparent',
                                            borderLeft: isActive
                                                ? '3px solid #8b5cf6'
                                                : '3px solid transparent',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <item.icon style={{
                                            width: '20px',
                                            height: '20px',
                                            color: isActive ? '#a78bfa' : '#9ca3af',
                                        }} />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: isActive ? '500' : '400',
                                            color: isActive ? 'white' : '#9ca3af',
                                        }}>
                                            {t(`settings.menu.${item.id}`, item.label)}
                                        </span>
                                    </motion.div>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ flex: 1, minWidth: 0 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SettingsLayout;
