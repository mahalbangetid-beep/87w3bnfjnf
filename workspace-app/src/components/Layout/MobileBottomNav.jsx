/**
 * Mobile Bottom Navigation Component
 * Shows a fixed bottom nav bar on mobile devices
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineViewGrid,
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineFolder,
    HiOutlineCog,
    HiOutlineChartBar,
    HiOutlineShare,
    HiOutlineCollection
} from 'react-icons/hi';

const MobileBottomNav = () => {
    const { t } = useTranslation();
    const location = useLocation();
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

    // Don't render on desktop or landing/auth pages
    if (!isMobile) return null;
    if (['/login', '/register', '/forgot-password', '/'].includes(location.pathname)) return null;

    const navItems = [
        { path: '/work', icon: HiOutlineViewGrid, label: 'Home' },
        { path: '/finance', icon: HiOutlineCurrencyDollar, label: 'Finance' },
        { path: null, icon: HiOutlinePlus, label: 'Add', isQuickAdd: true },
        { path: '/space', icon: HiOutlineFolder, label: 'Space' },
        { path: '/social', icon: HiOutlineShare, label: 'Social' },
    ];

    const quickAddOptions = [
        { path: '/work/tasks', icon: HiOutlineViewGrid, label: 'Task Baru', color: '#8b5cf6' },
        { path: '/work/notes', icon: HiOutlineFolder, label: 'Catatan Baru', color: '#06b6d4' },
        { path: '/finance/transaksi', icon: HiOutlineCurrencyDollar, label: 'Transaksi', color: '#10b981' },
        { path: '/social/sosmed-posting', icon: HiOutlineShare, label: 'Post Baru', color: '#ec4899' },
    ];

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname.startsWith(path);
    };

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
                                    key={option.path}
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
                {navItems.map((item, index) => {
                    const active = isActive(item.path);

                    if (item.isQuickAdd) {
                        return (
                            <motion.button
                                key="quick-add"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowQuickAdd(!showQuickAdd)}
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: showQuickAdd
                                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                        : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginTop: '-24px',
                                    boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: showQuickAdd ? 45 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <HiOutlinePlus style={{ width: '28px', height: '28px', color: 'white' }} />
                                </motion.div>
                            </motion.button>
                        );
                    }

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
                                padding: '8px 16px',
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
                                        color: active ? '#a78bfa' : '#6b7280',
                                    }}
                                />
                            </motion.div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: active ? '600' : '400',
                                color: active ? '#a78bfa' : '#6b7280',
                            }}>
                                {item.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#a78bfa',
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
