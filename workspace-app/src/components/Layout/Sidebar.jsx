import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../LanguageSwitcher';
import { NotificationCenter } from '../Notifications';
import {
    // Work Module
    HiOutlineViewGrid,
    HiOutlineFolder,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineChartBar,
    HiOutlineChartPie,
    HiOutlineCollection,
    HiOutlineCurrencyDollar,
    HiOutlineCog,
    HiOutlineUserAdd,
    // Space Module
    HiOutlineMap,
    HiOutlineLocationMarker,
    HiOutlineLightningBolt,
    // Social Stack
    HiOutlineShare,
    HiOutlinePencilAlt,
    HiOutlineGlobe,
    // Finance
    HiOutlineCreditCard,
    HiOutlineReceiptTax,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineClipboardList,
    // WhatsApp
    HiOutlineChatAlt2,
    // Assets
    HiOutlineUserCircle,
    HiOutlineCube,
    HiOutlineBookmark,
    // CRM
    HiOutlineUserGroup,
    // System
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineBell,
    HiOutlineChip,
    HiOutlineAdjustments,
    HiOutlineLockClosed,
    // UI
    HiChevronDown,
    HiChevronRight,
    HiOutlineSparkles,
    HiOutlineMenuAlt2,
    HiOutlineX,
    HiOutlineLogout,
    HiOutlineSearch,
    HiOutlineLightBulb,
} from 'react-icons/hi';

// Module configuration with translation keys
const getModules = (t) => [
    {
        id: 'work',
        name: t('sidebar.work', 'Work'),
        icon: HiOutlineLightningBolt,
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/work', icon: HiOutlineViewGrid },
            { name: t('sidebar.projects', 'Projects'), path: '/work/projects', icon: HiOutlineFolder },
            { name: t('sidebar.notes', 'Notes'), path: '/work/notes', icon: HiOutlineDocumentText },
            { name: t('sidebar.calendar', 'Calendar'), path: '/work/calendar', icon: HiOutlineCalendar },
            { name: t('sidebar.reporting', 'Reporting'), path: '/work/reporting', icon: HiOutlineChartBar },
            { name: t('sidebar.analytics', 'Analytics'), path: '/work/analytics', icon: HiOutlineChartPie },
            { name: t('sidebar.invitations', 'Invitations'), path: '/work/invitations', icon: HiOutlineUserAdd },
            { name: t('sidebar.assets', 'Assets'), path: '/work/assets', icon: HiOutlineCollection },
            { name: t('sidebar.budget', 'Budget'), path: '/work/budget', icon: HiOutlineCurrencyDollar },
            { name: t('sidebar.settings', 'Settings'), path: '/work/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'space',
        name: t('sidebar.space', 'Space'),
        icon: HiOutlineSparkles,
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-blue-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/space', icon: HiOutlineViewGrid },
            { name: t('sidebar.projectsPlan', 'Projects Plan'), path: '/space/projects-plan', icon: HiOutlineFolder },
            { name: t('sidebar.roadmap', 'Roadmap'), path: '/space/roadmap', icon: HiOutlineMap },
            { name: t('sidebar.targeting', 'Targeting'), path: '/space/targeting', icon: HiOutlineLocationMarker },
            { name: t('sidebar.calendar', 'Calendar'), path: '/space/calendar', icon: HiOutlineCalendar },
            { name: t('sidebar.assets', 'Assets'), path: '/space/assets', icon: HiOutlineCollection },
            { name: t('sidebar.budget', 'Budget'), path: '/space/budget', icon: HiOutlineCurrencyDollar },
            { name: t('sidebar.finance', 'Finance'), path: '/space/finance', icon: HiOutlineTrendingUp },
            { name: t('sidebar.settings', 'Settings'), path: '/space/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'social',
        name: t('sidebar.social', 'Social Stack'),
        icon: HiOutlineShare,
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/social', icon: HiOutlineViewGrid },
            { name: t('sidebar.posting', 'Sosmed Posting'), path: '/social/sosmed-posting', icon: HiOutlinePencilAlt },
            { name: t('sidebar.schedule', 'Schedule Post'), path: '/social/schedule-post', icon: HiOutlineCalendar },
            { name: t('sidebar.blog', 'Blog/Web Posting'), path: '/social/blog-posting', icon: HiOutlineGlobe },
            { name: t('sidebar.sosmedSettings', 'Sosmed Settings'), path: '/social/sosmed-settings', icon: HiOutlineAdjustments },
            { name: t('sidebar.blogSettings', 'Blog/Web Settings'), path: '/social/blog-settings', icon: HiOutlineCog },
            { name: t('sidebar.analytics', 'Analytics'), path: '/social/analytics', icon: HiOutlineChartPie },
            { name: t('sidebar.settings', 'Settings'), path: '/social/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'finance',
        name: t('sidebar.finance', 'Finance'),
        icon: HiOutlineCreditCard,
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/finance', icon: HiOutlineViewGrid },
            { name: t('sidebar.balance', 'Saldo'), path: '/finance/saldo', icon: HiOutlineCreditCard },
            { name: t('sidebar.bills', 'Tagihan'), path: '/finance/tagihan', icon: HiOutlineReceiptTax },
            { name: t('sidebar.income', 'Pemasukan'), path: '/finance/pemasukan', icon: HiOutlineTrendingUp },
            { name: t('sidebar.expense', 'Pengeluaran'), path: '/finance/pengeluaran', icon: HiOutlineTrendingDown },
            { name: t('sidebar.notes', 'Notes'), path: '/finance/notes', icon: HiOutlineDocumentText },
            { name: t('sidebar.report', 'Laporan'), path: '/finance/laporan', icon: HiOutlineClipboardList },
            { name: t('sidebar.analytics', 'Analytics'), path: '/finance/analytics', icon: HiOutlineChartPie },
            { name: t('sidebar.settings', 'Settings'), path: '/finance/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'whatsapp',
        name: t('sidebar.whatsapp', 'WhatsApp'),
        icon: HiOutlineChatAlt2,
        color: '#25D366',
        gradient: 'from-green-500 to-emerald-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/whatsapp', icon: HiOutlineViewGrid },
            { name: t('sidebar.alerts', 'Custom Alerts'), path: '/whatsapp/alerts', icon: HiOutlineBell },
            { name: t('sidebar.settings', 'Settings'), path: '/whatsapp/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'assets',
        name: t('sidebar.assets', 'Assets'),
        icon: HiOutlineCube,
        color: '#f59e0b',
        gradient: 'from-orange-500 to-amber-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/assets', icon: HiOutlineViewGrid },
            { name: t('sidebar.accounts', 'Account Management'), path: '/assets/accounts', icon: HiOutlineUserCircle },
            { name: t('sidebar.management', 'Asset Management'), path: '/assets/management', icon: HiOutlineCube },
            { name: t('sidebar.notes', 'Notes'), path: '/assets/notes', icon: HiOutlineDocumentText },
            { name: t('sidebar.bookmarks', 'Bookmark'), path: '/assets/bookmark', icon: HiOutlineBookmark },
        ],
    },
    {
        id: 'crm',
        name: t('sidebar.crm', 'CRM'),
        icon: HiOutlineUserGroup,
        color: '#f43f5e',
        gradient: 'from-rose-500 to-pink-600',
        items: [
            { name: t('sidebar.dashboard', 'Dashboard'), path: '/crm', icon: HiOutlineViewGrid },
            { name: t('sidebar.clients', 'Clients'), path: '/crm/clients', icon: HiOutlineUserCircle },
            { name: t('sidebar.reminders', 'Reminders'), path: '/crm/reminders', icon: HiOutlineBell },
            { name: t('sidebar.settings', 'Settings'), path: '/crm/settings', icon: HiOutlineCog },
        ],
    },
    {
        id: 'settings',
        name: t('sidebar.userSettings', 'Settings'),
        icon: HiOutlineCog,
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-600',
        items: [
            { name: t('sidebar.profile', 'Profile'), path: '/settings', icon: HiOutlineUserCircle },
            { name: t('sidebar.account', 'Account'), path: '/settings/account', icon: HiOutlineKey },
            { name: t('sidebar.aiConfig', 'AI Configuration'), path: '/settings/ai', icon: HiOutlineSparkles },
            { name: t('sidebar.notifications', 'Notifications'), path: '/settings/notifications', icon: HiOutlineBell },
            { name: t('sidebar.preferences', 'Preferences'), path: '/settings/preferences', icon: HiOutlineAdjustments },
            { name: t('sidebar.suggestions', 'Suggest Feature'), path: '/settings/suggestions', icon: HiOutlineLightBulb },
        ],
    },
    {
        id: 'system',
        name: t('sidebar.system', 'System Settings'),
        icon: HiOutlineAdjustments,
        color: '#6366f1',
        gradient: 'from-indigo-500 to-violet-600',
        adminOnly: true,
        items: [
            { name: t('sidebar.overview', 'Overview'), path: '/system', icon: HiOutlineChartBar },
            { name: t('sidebar.users', 'User Management'), path: '/system/users', icon: HiOutlineUsers },
            { name: t('sidebar.roleManagement', 'Role Management'), path: '/system/roles', icon: HiOutlineShieldCheck },
            { name: t('sidebar.activityLogs', 'Activity Logs'), path: '/system/activity', icon: HiOutlineClipboardList },
            { name: t('sidebar.settings', 'Settings'), path: '/system/settings', icon: HiOutlineCog },
            { name: t('sidebar.security', 'Security'), path: '/system/security', icon: HiOutlineLockClosed },
        ],
    },
];

const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Determine initial expanded module from current URL path
    const getInitialExpandedModule = () => {
        const path = location.pathname;
        const moduleIds = ['work', 'space', 'social', 'finance', 'whatsapp', 'assets', 'crm', 'settings', 'system'];
        for (const id of moduleIds) {
            if (path.startsWith(`/${id}`)) {
                return [id];
            }
        }
        return ['work']; // Default fallback
    };

    const [expandedModules, setExpandedModules] = useState(getInitialExpandedModule);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [hoveredModule, setHoveredModule] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Get translated modules
    const modules = getModules(t);

    // Track mouse position for spotlight effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Filter modules based on role
    const isAdmin = user?.Role?.name === 'superadmin' || user?.Role?.name === 'admin';

    // Admin only sees System module, regular users see all except System
    const visibleModules = isAdmin
        ? modules.filter(m => m.id === 'system')  // Admin: only System
        : modules.filter(m => !m.adminOnly);       // Users: all except adminOnly (System)

    // Filter items based on search
    const filteredModules = searchQuery
        ? visibleModules.map(m => ({
            ...m,
            items: m.items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(m => m.items.length > 0)
        : visibleModules;

    const toggleModule = (moduleId) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const isModuleActive = (module) => {
        return location.pathname.startsWith(`/${module.id}`);
    };

    const getActiveModule = () => {
        return visibleModules.find(m => isModuleActive(m));
    };

    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 80 },
    };

    return (
        <>
            {/* Mobile Menu Button with animated burger */}
            <motion.button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-xl backdrop-blur-lg border border-white/10 text-white overflow-hidden"
                style={{
                    background: 'rgba(15, 15, 25, 0.8)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    animate={{ rotate: isMobileOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isMobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt2 size={24} />}
                </motion.div>
                {/* Pulsing ring animation */}
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '14px',
                        border: '2px solid',
                        borderColor: getActiveModule()?.color || '#8b5cf6',
                        opacity: 0.5,
                    }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>

            {/* Mobile Overlay with blur effect */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-40 lg:hidden"
                        style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                className={`
                    sidebar fixed top-0 left-0 h-screen z-40
                    flex flex-col
                    transition-all duration-300
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{
                    background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(10, 10, 20, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Animated background mesh */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    {/* Floating orbs */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${getActiveModule()?.color || '#8b5cf6'}15 0%, transparent 70%)`,
                            top: '10%',
                            left: '-20%',
                            filter: 'blur(40px)',
                        }}
                        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                            bottom: '20%',
                            right: '-10%',
                            filter: 'blur(30px)',
                        }}
                        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                </div>

                {/* Logo Section with animated glow */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    position: 'relative',
                }}>
                    <motion.div
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                        whileHover={{ x: 3 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <motion.div style={{ position: 'relative' }}>
                            {/* Logo container */}
                            <motion.div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                >
                                    <HiOutlineSparkles style={{ width: '24px', height: '24px', color: 'white' }} />
                                </motion.div>
                            </motion.div>
                            {/* Animated glow ring */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: -4,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    filter: 'blur(15px)',
                                    opacity: 0.4,
                                    zIndex: 0,
                                }}
                                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>

                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{ flex: 1 }}
                            >
                                <h1 style={{
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Workspace
                                </h1>
                                <p style={{ fontSize: '11px', color: '#6b7280' }}>All-in-one Productivity</p>
                            </motion.div>
                        )}

                        {/* Notification Center */}
                        {!isCollapsed && (
                            <NotificationCenter />
                        )}
                    </motion.div>
                </div>

                {/* Search Section */}
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ padding: '12px 16px' }}
                    >
                        {/* Form wrapper to prevent autofill */}
                        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                            {/* Hidden decoy inputs to trick browser autofill */}
                            <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} tabIndex={-1} />
                            <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} tabIndex={-1} />

                            <motion.div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                }}
                                whileHover={{
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    borderColor: 'rgba(139, 92, 246, 0.3)',
                                }}
                            >
                                <HiOutlineSearch style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="sidebar_navigation_filter_query"
                                    id="sidebar_navigation_filter_query"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    aria-autocomplete="none"
                                    placeholder="Search menu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'white',
                                        fontSize: '13px',
                                    }}
                                />
                                {searchQuery && (
                                    <motion.button
                                        type="button"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                        }}
                                    >
                                        <HiOutlineX style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                                    </motion.button>
                                )}
                            </motion.div>
                        </form>
                    </motion.div>
                )}

                {/* Collapse Toggle (Desktop) */}
                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-12px',
                        top: '70px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a1a2e, #16161a)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        zIndex: 50,
                    }}
                    className="lg:!flex"
                    whileHover={{
                        scale: 1.1,
                        borderColor: 'rgba(139, 92, 246, 0.5)',
                        color: 'white',
                    }}
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HiChevronRight size={14} />
                    </motion.div>
                </motion.button>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredModules.map((module, moduleIndex) => {
                            const isExpanded = expandedModules.includes(module.id);
                            const isActive = isModuleActive(module);
                            const isHovered = hoveredModule === module.id;

                            return (
                                <div key={module.id}>
                                    {/* Module Header */}
                                    <motion.button
                                        onClick={() => toggleModule(module.id)}
                                        onMouseEnter={() => setHoveredModule(module.id)}
                                        onMouseLeave={() => setHoveredModule(null)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: isCollapsed ? '12px' : '12px 14px',
                                            borderRadius: '14px',
                                            border: 'none',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${module.color}20, transparent)`
                                                : isHovered
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'transparent',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        }}
                                        whileHover={{ x: isCollapsed ? 0 : 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Active indicator line */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeModuleLine"
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: '3px',
                                                    height: '60%',
                                                    borderRadius: '0 4px 4px 0',
                                                    background: `linear-gradient(180deg, ${module.color}, ${module.color}80)`,
                                                }}
                                            />
                                        )}

                                        {/* Icon container with glow */}
                                        <motion.div
                                            style={{
                                                position: 'relative',
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '12px',
                                                background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                                                border: `1px solid ${module.color}40`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            animate={isHovered || isActive ? {
                                                scale: 1.05,
                                                boxShadow: `0 0 20px ${module.color}40`,
                                            } : {}}
                                        >
                                            {/* Icon glow */}
                                            <motion.div
                                                style={{
                                                    position: 'absolute',
                                                    inset: -5,
                                                    borderRadius: '16px',
                                                    background: module.color,
                                                    filter: 'blur(15px)',
                                                    opacity: isActive ? 0.3 : 0,
                                                }}
                                                animate={{ opacity: isActive ? [0.2, 0.4, 0.2] : 0 }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            <motion.div
                                                animate={isHovered ? { rotate: 10, scale: 1.1 } : {}}
                                            >
                                                <module.icon
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        color: module.color,
                                                        position: 'relative',
                                                        zIndex: 1,
                                                    }}
                                                />
                                            </motion.div>
                                        </motion.div>

                                        {/* Module name and count */}
                                        {!isCollapsed && (
                                            <>
                                                <div style={{ flex: 1, textAlign: 'left' }}>
                                                    <span
                                                        style={{
                                                            fontWeight: '600',
                                                            fontSize: '14px',
                                                            color: isActive ? 'white' : '#e5e7eb',
                                                        }}
                                                    >
                                                        {module.name}
                                                    </span>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        marginTop: '2px',
                                                    }}>
                                                        {module.items.length} items
                                                    </div>
                                                </div>

                                                {/* Chevron with animation */}
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '8px',
                                                        background: isExpanded ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <HiChevronDown style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                                                </motion.div>
                                            </>
                                        )}

                                        {/* Hover spotlight effect */}
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.5 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: '100px',
                                                    height: '100%',
                                                    background: `linear-gradient(90deg, transparent, ${module.color}10)`,
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        )}
                                    </motion.button>

                                    {/* Module Items with staggered animation */}
                                    <AnimatePresence>
                                        {isExpanded && !isCollapsed && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{
                                                    marginTop: '8px',
                                                    marginLeft: '20px',
                                                    paddingLeft: '16px',
                                                    borderLeft: `2px solid ${module.color}30`,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                }}>
                                                    {module.items.map((item, itemIndex) => {
                                                        const itemId = `${module.id}-${itemIndex}`;
                                                        const isItemHovered = hoveredItem === itemId;

                                                        return (
                                                            <motion.div
                                                                key={item.path}
                                                                initial={{ opacity: 0, x: -15 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: itemIndex * 0.05 }}
                                                            >
                                                                <NavLink
                                                                    to={item.path}
                                                                    end={item.path === `/${module.id}` || item.name.toLowerCase().includes('dashboard') || item.name.toLowerCase().includes('dasbor')}
                                                                    onClick={() => setIsMobileOpen(false)}
                                                                    onMouseEnter={() => setHoveredItem(itemId)}
                                                                    onMouseLeave={() => setHoveredItem(null)}
                                                                    style={{ textDecoration: 'none' }}
                                                                >
                                                                    {({ isActive }) => (
                                                                        <motion.div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '10px',
                                                                                padding: '10px 12px',
                                                                                borderRadius: '10px',
                                                                                background: isActive
                                                                                    ? `linear-gradient(135deg, ${module.color}20, transparent)`
                                                                                    : isItemHovered
                                                                                        ? 'rgba(255,255,255,0.05)'
                                                                                        : 'transparent',
                                                                                position: 'relative',
                                                                            }}
                                                                            whileHover={{ x: 4 }}
                                                                        >
                                                                            {/* Active dot */}
                                                                            {isActive && (
                                                                                <motion.div
                                                                                    layoutId="activeItemDot"
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        left: '-19px',
                                                                                        width: '8px',
                                                                                        height: '8px',
                                                                                        borderRadius: '50%',
                                                                                        background: module.color,
                                                                                        boxShadow: `0 0 10px ${module.color}`,
                                                                                    }}
                                                                                />
                                                                            )}

                                                                            {/* Item icon */}
                                                                            <motion.div
                                                                                animate={isItemHovered ? {
                                                                                    scale: 1.15,
                                                                                    rotate: 5,
                                                                                } : {}}
                                                                            >
                                                                                <item.icon
                                                                                    style={{
                                                                                        width: '16px',
                                                                                        height: '16px',
                                                                                        color: isActive ? module.color : '#9ca3af',
                                                                                    }}
                                                                                />
                                                                            </motion.div>

                                                                            {/* Item name */}
                                                                            <span style={{
                                                                                fontSize: '13px',
                                                                                fontWeight: isActive ? '600' : '400',
                                                                                color: isActive ? 'white' : '#9ca3af',
                                                                                flex: 1,
                                                                            }}>
                                                                                {item.name}
                                                                            </span>

                                                                            {/* Arrow indicator */}
                                                                            <motion.div
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{
                                                                                    opacity: isItemHovered || isActive ? 1 : 0,
                                                                                    x: isItemHovered || isActive ? 0 : -10,
                                                                                }}
                                                                            >
                                                                                <HiChevronRight
                                                                                    style={{
                                                                                        width: '14px',
                                                                                        height: '14px',
                                                                                        color: isActive ? module.color : '#6b7280',
                                                                                    }}
                                                                                />
                                                                            </motion.div>
                                                                        </motion.div>
                                                                    )}
                                                                </NavLink>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                        }}
                        whileHover={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        {/* Avatar with status */}
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {user?.name?.substring(0, 2).toUpperCase() || 'JD'}
                            </motion.div>
                            {/* Online status indicator */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    bottom: -2,
                                    right: -2,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    border: '2px solid #0f0f19',
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>

                        {!isCollapsed && (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {user?.name || 'John Doe'}
                                    </p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#8b5cf6',
                                        }} />
                                        Pro Member
                                    </p>
                                </div>

                                {/* Language Switcher */}
                                <LanguageSwitcher variant="toggle" showLabel={false} />

                                {/* Logout button */}
                                <motion.button
                                    onClick={logout}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                    whileHover={{
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        scale: 1.05,
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiOutlineLogout style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
