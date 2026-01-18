import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineMenu, HiOutlineLogout, HiOutlineBookOpen, HiOutlineDocumentText,
    HiOutlineUser, HiOutlineMoon, HiOutlineSun, HiOutlineChevronLeft, HiOutlineExternalLink,
    HiOutlineCollection
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const BlogLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        // Check if user has blog role
        const userRole = user?.Role?.name?.toLowerCase();
        if (userRole !== 'blog' && userRole !== 'admin' && userRole !== 'master_admin') {
            navigate('/work');
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        {
            path: '/blog-admin',
            icon: HiOutlineBookOpen,
            label: 'Dashboard',
            end: true
        },
        {
            path: '/blog-admin/create',
            icon: HiOutlineDocumentText,
            label: 'New Article'
        },
        {
            path: '/blog-admin/pages',
            icon: HiOutlineCollection,
            label: 'Manage Pages'
        }
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? '72px' : '260px' }}
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'hidden',
                    zIndex: 50
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between'
                }}>
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <HiOutlineBookOpen style={{ width: '22px', height: '22px', color: 'white' }} />
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: '700' }}>Blog Writer</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                        >
                            <HiOutlineChevronLeft style={{ width: '18px', height: '18px' }} />
                        </motion.div>
                    </motion.button>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: sidebarCollapsed ? '14px' : '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                marginBottom: '8px',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                                color: isActive ? '#a78bfa' : '#9ca3af',
                                transition: 'all 0.2s'
                            })}
                        >
                            <item.icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                            <AnimatePresence>
                                {!sidebarCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ fontSize: '14px', fontWeight: '500' }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}

                    {/* View Blog Link */}
                    <a
                        href="/blog"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: sidebarCollapsed ? '14px' : '12px 16px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            marginTop: '16px',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            background: 'rgba(6,182,212,0.1)',
                            color: '#06b6d4',
                            borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <HiOutlineExternalLink style={{ width: '20px', height: '20px' }} />
                        {!sidebarCollapsed && (
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>View Blog</span>
                        )}
                    </a>
                </nav>

                {/* User Section */}
                <div style={{
                    padding: '16px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    {/* User Profile */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        marginBottom: '12px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <HiOutlineUser style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        {!sidebarCollapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {user?.name || 'Blog Writer'}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {user?.Role?.displayName || 'Writer'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            gap: '12px',
                            fontSize: '14px'
                        }}
                    >
                        <HiOutlineLogout style={{ width: '20px', height: '20px' }} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                minWidth: 0,
                overflowY: 'auto'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default BlogLayout;
