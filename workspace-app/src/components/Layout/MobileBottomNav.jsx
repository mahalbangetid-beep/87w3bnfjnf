/**
 * Mobile Bottom Navigation Component
 * Dynamic/Contextual navigation that changes based on active module
 */

import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    // General
    HiOutlinePlus,
    HiOutlineHome,
    HiOutlineViewGrid,
    HiOutlineCog,
    // Work
    HiOutlineClipboardList,
    HiOutlineCalendar,
    HiOutlineFolder,
    HiOutlineDocumentText,
    HiOutlineBriefcase,
    // Finance
    HiOutlineCurrencyDollar,
    HiOutlineCreditCard,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineChartPie,
    HiOutlineReceiptTax,
    // Space
    HiOutlineLocationMarker,
    HiOutlineCollection,
    HiOutlineNewspaper,
    HiOutlineFlag,
    HiOutlineCube,
    // Social
    HiOutlineShare,
    HiOutlineGlobe,
    HiOutlinePencilAlt,
    HiOutlineHashtag,
    HiOutlineChartBar,
    // Assets
    HiOutlineLibrary,
    HiOutlineBookmark,
    // CRM
    HiOutlineUserGroup,
    HiOutlineUsers,
    // WhatsApp
    HiOutlineChatAlt2,
    HiOutlineBell,
    // System
    HiOutlineLockClosed,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

// Define navigation items for each module
const MODULE_NAV_ITEMS = {
    work: [
        { path: '/work', icon: HiOutlineViewGrid, label: 'Dashboard', exact: true },
        { path: '/work/calendar', icon: HiOutlineCalendar, label: 'Calendar' },
        { path: '/work/projects', icon: HiOutlineBriefcase, label: 'Projects' },
        { path: '/work/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    ],
    finance: [
        { path: '/finance', icon: HiOutlineChartPie, label: 'Overview', exact: true },
        { path: '/finance/pengeluaran', icon: HiOutlineTrendingDown, label: 'Expense' },
        { path: '/finance/tagihan', icon: HiOutlineReceiptTax, label: 'Tagihan' },
        { path: '/finance/saldo', icon: HiOutlineCreditCard, label: 'Saldo' },
    ],
    space: [
        { path: '/space', icon: HiOutlineLocationMarker, label: 'Dashboard', exact: true },
        { path: '/space/projects-plan', icon: HiOutlineNewspaper, label: 'Projects' },
        { path: '/space/targeting', icon: HiOutlineFlag, label: 'Goals' },
        { path: '/space/assets', icon: HiOutlineCube, label: 'Assets' },
    ],
    social: [
        { path: '/social', icon: HiOutlineChartBar, label: 'Dashboard', exact: true },
        { path: '/social/sosmed-posting', icon: HiOutlinePencilAlt, label: 'Posting' },
        { path: '/social/blog-posting', icon: HiOutlineGlobe, label: 'Blog' },
        { path: '/social/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
    ],
    assets: [
        { path: '/assets', icon: HiOutlineLibrary, label: 'Overview', exact: true },
        { path: '/assets/accounts', icon: HiOutlineCreditCard, label: 'Accounts' },
        { path: '/assets/management', icon: HiOutlineCollection, label: 'Items' },
        { path: '/assets/bookmark', icon: HiOutlineBookmark, label: 'Bookmarks' },
    ],
    crm: [
        { path: '/crm', icon: HiOutlineUserGroup, label: 'Dashboard', exact: true },
        { path: '/crm/clients', icon: HiOutlineUsers, label: 'Clients' },
        { path: '/crm/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
        { path: '/crm/reminders', icon: HiOutlineBell, label: 'Reminders' },
    ],
    whatsapp: [
        { path: '/whatsapp', icon: FaWhatsapp, label: 'Dashboard', exact: true },
        { path: '/whatsapp/alerts', icon: HiOutlineBell, label: 'Alerts' },
        { path: '/whatsapp/settings', icon: HiOutlineCog, label: 'Settings' },
        { path: '/work', icon: HiOutlineHome, label: 'Home' },
    ],
    system: [
        { path: '/system', icon: HiOutlineCog, label: 'Settings', exact: true },
        { path: '/system/users', icon: HiOutlineUsers, label: 'Users' },
        { path: '/system/security', icon: HiOutlineLockClosed, label: 'Security' },
        { path: '/work', icon: HiOutlineHome, label: 'Home' },
    ],
    // Default/main navigation (when not in specific module)
    main: [
        { path: '/work', icon: HiOutlineViewGrid, label: 'Work' },
        { path: '/finance', icon: HiOutlineCurrencyDollar, label: 'Finance' },
        { path: '/space', icon: HiOutlineFolder, label: 'Space' },
        { path: '/social', icon: HiOutlineShare, label: 'Social' },
    ],
};

// Quick add options for each module
const MODULE_QUICK_ADD = {
    work: [
        { path: '/work/calendar', icon: HiOutlineCalendar, label: 'New Event', color: '#8b5cf6', action: 'add' },
        { path: '/work/notes', icon: HiOutlineDocumentText, label: 'Note Baru', color: '#06b6d4', action: 'add' },
        { path: '/work/projects', icon: HiOutlineBriefcase, label: 'Project Baru', color: '#10b981', action: 'add' },
    ],
    finance: [
        { path: '/finance/pengeluaran', icon: HiOutlineTrendingDown, label: 'Pengeluaran', color: '#ef4444', action: 'expense' },
        { path: '/finance/pemasukan', icon: HiOutlineTrendingUp, label: 'Pemasukan', color: '#10b981', action: 'income' },
        { path: '/finance/tagihan', icon: HiOutlineReceiptTax, label: 'Tagihan Baru', color: '#f59e0b', action: 'add' },
    ],
    space: [
        { path: '/space/projects-plan', icon: HiOutlineNewspaper, label: 'Project Baru', color: '#8b5cf6', action: 'add' },
        { path: '/space/targeting', icon: HiOutlineFlag, label: 'Goal Baru', color: '#10b981', action: 'add' },
        { path: '/space', icon: HiOutlineLocationMarker, label: 'Track Lokasi', color: '#06b6d4', action: 'track' },
    ],
    social: [
        { path: '/social/sosmed-posting', icon: HiOutlinePencilAlt, label: 'Post Baru', color: '#ec4899', action: 'add' },
        { path: '/social/blog-posting', icon: HiOutlineGlobe, label: 'Blog Post', color: '#3b82f6', action: 'add' },
        { path: '/social/schedule-post', icon: HiOutlineCalendar, label: 'Schedule', color: '#8b5cf6', action: 'add' },
    ],
    assets: [
        { path: '/assets/management', icon: HiOutlineCube, label: 'Asset Baru', color: '#8b5cf6', action: 'add' },
        { path: '/assets/accounts', icon: HiOutlineCreditCard, label: 'Account Baru', color: '#10b981', action: 'add' },
        { path: '/assets/bookmark', icon: HiOutlineBookmark, label: 'Bookmark', color: '#f59e0b', action: 'add' },
    ],
    crm: [
        { path: '/crm/clients', icon: HiOutlineUsers, label: 'Client Baru', color: '#8b5cf6', action: 'add' },
        { path: '/crm/reminders', icon: HiOutlineBell, label: 'Reminder', color: '#f59e0b', action: 'add' },
    ],
    whatsapp: [
        { path: '/whatsapp/settings', icon: HiOutlineCog, label: 'Setup WhatsApp', color: '#25D366', action: 'setup' },
        { path: '/whatsapp/alerts', icon: HiOutlineBell, label: 'Alert Baru', color: '#06b6d4', action: 'add' },
    ],
    main: [
        { path: '/work/calendar', icon: HiOutlineCalendar, label: 'Event Baru', color: '#8b5cf6', action: 'add' },
        { path: '/finance/pengeluaran', icon: HiOutlineCurrencyDollar, label: 'Transaksi', color: '#10b981', action: 'add' },
        { path: '/work/notes', icon: HiOutlineDocumentText, label: 'Note Baru', color: '#06b6d4', action: 'add' },
        { path: '/social/sosmed-posting', icon: HiOutlinePencilAlt, label: 'Post Baru', color: '#ec4899', action: 'add' },
    ],
};

const MobileBottomNav = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Detect current module from path
    const currentModule = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith('/work')) return 'work';
        if (path.startsWith('/finance')) return 'finance';
        if (path.startsWith('/space')) return 'space';
        if (path.startsWith('/social')) return 'social';
        if (path.startsWith('/assets')) return 'assets';
        if (path.startsWith('/crm')) return 'crm';
        if (path.startsWith('/whatsapp')) return 'whatsapp';
        if (path.startsWith('/system')) return 'system';
        return 'main';
    }, [location.pathname]);

    // Get nav items for current module
    const navItems = useMemo(() => {
        return MODULE_NAV_ITEMS[currentModule] || MODULE_NAV_ITEMS.main;
    }, [currentModule]);

    // Get quick add options for current module
    const quickAddOptions = useMemo(() => {
        return MODULE_QUICK_ADD[currentModule] || MODULE_QUICK_ADD.main;
    }, [currentModule]);

    // Don't render on desktop or landing/auth pages
    if (!isMobile) return null;
    if (['/login', '/register', '/forgot-password', '/'].includes(location.pathname)) return null;

    const isActive = (item) => {
        if (!item.path) return false;
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    };

    // Module color theme
    const getModuleColor = () => {
        switch (currentModule) {
            case 'work': return '#8b5cf6';
            case 'finance': return '#10b981';
            case 'space': return '#f59e0b';
            case 'social': return '#ec4899';
            case 'assets': return '#06b6d4';
            case 'crm': return '#3b82f6';
            case 'whatsapp': return '#25D366';
            case 'system': return '#6b7280';
            default: return '#8b5cf6';
        }
    };

    const moduleColor = getModuleColor();

    return (
        <>
            {/* Quick Add Overlay */}
            <AnimatePresence>
                {showQuickAdd && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQuickAdd(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 998,
                            }}
                        />

                        {/* Quick Add Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            style={{
                                position: 'fixed',
                                bottom: '90px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                zIndex: 999,
                                width: 'calc(100% - 32px)',
                                maxWidth: '300px',
                            }}
                        >
                            {quickAddOptions.map((option, index) => (
                                <motion.div
                                    key={`${option.path}-${option.action}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <NavLink
                                        to={option.path}
                                        onClick={() => setShowQuickAdd(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '14px 18px',
                                            borderRadius: '14px',
                                            background: 'rgba(17,17,27,0.95)',
                                            border: `1px solid ${option.color}30`,
                                            textDecoration: 'none',
                                            color: 'white',
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: `${option.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <option.icon style={{ width: '20px', height: '20px', color: option.color }} />
                                        </div>
                                        <span style={{ fontSize: '15px', fontWeight: '500' }}>{option.label}</span>
                                    </NavLink>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    background: 'rgba(17,17,27,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    zIndex: 997,
                }}
            >
                {/* First 2 nav items */}
                {navItems.slice(0, 2).map((item) => {
                    const active = isActive(item);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                padding: '8px 12px',
                                position: 'relative',
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: active ? 1.1 : 1,
                                    y: active ? -2 : 0
                                }}
                            >
                                <item.icon
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        color: active ? moduleColor : '#6b7280',
                                    }}
                                />
                            </motion.div>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: active ? '600' : '400',
                                color: active ? moduleColor : '#6b7280',
                            }}>
                                {item.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: moduleColor,
                                    }}
                                />
                            )}
                        </NavLink>
                    );
                })}

                {/* Center FAB Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: 'none',
                        background: showQuickAdd
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : `linear-gradient(135deg, ${moduleColor}, ${moduleColor}aa)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '-24px',
                        boxShadow: `0 4px 20px ${moduleColor}60`,
                    }}
                >
                    <motion.div
                        animate={{ rotate: showQuickAdd ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <HiOutlinePlus style={{ width: '28px', height: '28px', color: 'white' }} />
                    </motion.div>
                </motion.button>

                {/* Last 2 nav items */}
                {navItems.slice(2, 4).map((item) => {
                    const active = isActive(item);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                padding: '8px 12px',
                                position: 'relative',
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: active ? 1.1 : 1,
                                    y: active ? -2 : 0
                                }}
                            >
                                <item.icon
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        color: active ? moduleColor : '#6b7280',
                                    }}
                                />
                            </motion.div>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: active ? '600' : '400',
                                color: active ? moduleColor : '#6b7280',
                            }}>
                                {item.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator2"
                                    style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: moduleColor,
                                    }}
                                />
                            )}
                        </NavLink>
                    );
                })}
            </motion.nav>
        </>
    );
};

export default MobileBottomNav;
