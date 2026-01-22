import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineCube,
    HiOutlineCreditCard, HiOutlineChartBar, HiOutlineFolder, HiOutlineDocumentText,
    HiOutlineCalendar, HiOutlineCollection, HiOutlineShare, HiOutlinePencilAlt,
    HiOutlineMap, HiOutlineTrendingUp, HiOutlineShieldCheck,
    HiOutlineUsers, HiOutlineChip, HiOutlineBookmark, HiOutlineUserCircle, HiOutlineUserGroup,
    HiOutlinePlay, HiOutlineArrowRight, HiOutlineCheck,
    HiOutlineMenu, HiOutlineX, HiOutlineRefresh, HiOutlineInformationCircle,
    HiOutlineMail, HiOutlineDocument, HiOutlineLockClosed, HiOutlineGlobeAlt,
    HiOutlineCode, HiOutlineChat, HiOutlineArrowUp
} from 'react-icons/hi';

// Styles object
const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
        color: 'white',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: 'hidden'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
    },
    gradientText: {
        background: 'linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    glassCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
    },
    button: {
        padding: '14px 32px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
    }
};

// Module data
const modules = [
    {
        id: 'work',
        name: 'Work',
        icon: HiOutlineLightningBolt,
        color: '#8b5cf6',
        description: 'Project management, notes, tasks, calendar, reporting, and budget tracking',
        features: ['Projects', 'Notes', 'Tasks', 'Calendar', 'Reporting', 'Budget']
    },
    {
        id: 'space',
        name: 'Space',
        icon: HiOutlineSparkles,
        color: '#06b6d4',
        description: 'Strategic planning with roadmaps, milestones, and targeting',
        features: ['Roadmap', 'Milestones', 'Goals', 'Targeting', 'Projects Plan']
    },
    {
        id: 'social',
        name: 'Social Stack',
        icon: HiOutlineShare,
        color: '#ec4899',
        description: 'Social media management with multi-platform posting and AI content',
        features: ['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn', 'AI Content']
    },
    {
        id: 'finance',
        name: 'Finance',
        icon: HiOutlineCreditCard,
        color: '#10b981',
        description: 'Complete financial management with accounts, bills, and reports',
        features: ['Saldo', 'Bills', 'Income', 'Expense', 'Reports']
    },
    {
        id: 'assets',
        name: 'Assets',
        icon: HiOutlineCube,
        color: '#f59e0b',
        description: 'Secure password manager and digital asset storage',
        features: ['Accounts', 'Passwords', 'Notes', 'Bookmarks']
    },
    {
        id: 'crm',
        name: 'CRM',
        icon: HiOutlineUserGroup,
        color: '#6366f1',
        description: 'Complete client relationship management with pipeline and analytics',
        features: ['Clients', 'Pipeline', 'Documents', 'Analytics', 'Reports']
    }
];

const features = [
    { icon: HiOutlineFolder, title: 'Project Management', desc: 'Organize projects with Kanban boards', color: '#8b5cf6' },
    { icon: HiOutlineDocumentText, title: 'Rich Notes', desc: 'Create notes with markdown support', color: '#06b6d4' },
    { icon: HiOutlineCalendar, title: 'Smart Calendar', desc: 'Never miss deadlines', color: '#ec4899' },
    { icon: HiOutlineChartBar, title: 'Analytics & Reports', desc: 'Beautiful charts and insights', color: '#10b981' },
    { icon: HiOutlineShare, title: 'Social Integration', desc: 'Connect all social platforms', color: '#f59e0b' },
    { icon: HiOutlineChip, title: 'AI Powered', desc: 'Generate content with AI', color: '#6366f1' },
    { icon: HiOutlineUserCircle, title: 'Password Manager', desc: 'Secure encrypted storage', color: '#ef4444' },
    { icon: HiOutlineBookmark, title: 'Bookmarks', desc: 'Save favorite resources', color: '#14b8a6' },
    { icon: HiOutlineMap, title: 'Roadmap Planning', desc: 'Plan with milestones', color: '#a855f7' },
    { icon: HiOutlineTrendingUp, title: 'Finance Tracking', desc: 'Track income & expenses', color: '#22c55e' },
    { icon: HiOutlineUsers, title: 'Team Collaboration', desc: 'Roles and permissions', color: '#3b82f6' },
    { icon: HiOutlineGlobe, title: 'API Integrations', desc: 'Connect favorite tools', color: '#f97316' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(0);
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveModule(prev => (prev + 1) % modules.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={styles.page}>
            {/* Background Effects */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    top: '-200px',
                    left: '-200px',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                    top: '30%',
                    right: '-150px',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
                    bottom: '-100px',
                    left: '30%',
                    filter: 'blur(60px)'
                }} />
            </div>

            {/* Progress Bar */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
                    transformOrigin: 'left',
                    zIndex: 100,
                    scaleX: scrollYProgress
                }}
            />

            {/* ULTRA CREATIVE NAVBAR */}
            {(() => {
                const [hoveredItem, setHoveredItem] = useState(null);
                const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
                const [scrolled, setScrolled] = useState(false);
                const navRef = useRef(null);

                useEffect(() => {
                    const handleScroll = () => setScrolled(window.scrollY > 50);
                    const handleMouseMove = (e) => {
                        if (navRef.current) {
                            const rect = navRef.current.getBoundingClientRect();
                            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                        }
                    };
                    window.addEventListener('scroll', handleScroll);
                    window.addEventListener('mousemove', handleMouseMove);
                    return () => {
                        window.removeEventListener('scroll', handleScroll);
                        window.removeEventListener('mousemove', handleMouseMove);
                    };
                }, []);

                const menuItems = [
                    { label: 'Features', href: '#features', color: '#8b5cf6' },
                    { label: 'Modules', href: '#modules', color: '#06b6d4' },
                    { label: 'Blog', href: '/blog', color: '#ec4899' },
                    { label: 'About', href: '/about', color: '#10b981' }
                ];

                // Text scramble effect
                const ScrambleText = ({ text, isHovered }) => {
                    const [displayText, setDisplayText] = useState(text);
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

                    useEffect(() => {
                        if (isHovered) {
                            let iteration = 0;
                            const interval = setInterval(() => {
                                setDisplayText(text.split('').map((char, i) => {
                                    if (i < iteration) return text[i];
                                    return chars[Math.floor(Math.random() * chars.length)];
                                }).join(''));
                                iteration += 1 / 3;
                                if (iteration >= text.length) clearInterval(interval);
                            }, 30);
                            return () => clearInterval(interval);
                        } else {
                            setDisplayText(text);
                        }
                    }, [isHovered, text]);

                    return <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{displayText}</span>;
                };

                return (
                    <motion.nav
                        ref={navRef}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                        style={{
                            position: 'fixed',
                            width: '100%',
                            zIndex: 50,
                            padding: '12px 0',
                        }}
                    >
                        {/* Navbar Container */}
                        <div style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            padding: '0 24px',
                        }}>
                            <motion.div
                                animate={{
                                    background: scrolled ? 'rgba(10,10,20,0.95)' : 'rgba(10,10,20,0.6)',
                                    boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)',
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 28px',
                                    borderRadius: '20px',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Animated gradient border */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: -1,
                                        borderRadius: '21px',
                                        padding: '1px',
                                        background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6)',
                                        backgroundSize: '300% 100%',
                                        zIndex: -1,
                                        opacity: 0.5,
                                    }}
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                />

                                {/* Aurora effect following mouse */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                                        pointerEvents: 'none',
                                        filter: 'blur(30px)',
                                    }}
                                    animate={{ x: mousePos.x - 100, y: mousePos.y - 100 }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                />

                                {/* Logo Section */}
                                <motion.div
                                    style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', position: 'relative' }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {/* Animated particles around logo */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                background: ['#8b5cf6', '#06b6d4', '#ec4899'][i % 3],
                                            }}
                                            animate={{
                                                x: [0, Math.cos(i * 60 * Math.PI / 180) * 30, 0],
                                                y: [0, Math.sin(i * 60 * Math.PI / 180) * 30, 0],
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.5, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.3,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    ))}

                                    {/* Morphing logo container */}
                                    <motion.div
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                        }}
                                        animate={{
                                            borderRadius: ['14px', '22px', '14px'],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        whileHover={{
                                            scale: 1.1,
                                            boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                                        }}
                                    >
                                        {/* Inner glow */}
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                inset: -4,
                                                borderRadius: '18px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                filter: 'blur(10px)',
                                                opacity: 0.5,
                                            }}
                                            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <HiOutlineSparkles style={{ width: '22px', height: '22px', color: 'white', position: 'relative', zIndex: 1 }} />
                                        </motion.div>
                                    </motion.div>

                                    {/* Brand name with gradient animation */}
                                    <motion.span
                                        style={{
                                            fontSize: '22px',
                                            fontWeight: '800',
                                            background: 'linear-gradient(90deg, #a78bfa, #06b6d4, #ec4899, #a78bfa)',
                                            backgroundSize: '200% 100%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    >
                                        Workspace
                                    </motion.span>
                                </motion.div>

                                {/* Menu Items - Desktop */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {menuItems.map((item, i) => (
                                        <motion.a
                                            key={item.label}
                                            href={item.href}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * i + 0.3 }}
                                            onMouseEnter={() => setHoveredItem(i)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            style={{
                                                textDecoration: 'none',
                                                padding: '10px 18px',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: hoveredItem === i ? 'white' : '#9ca3af',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {/* Hover background */}
                                            <AnimatePresence>
                                                {hoveredItem === i && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: `${item.color}20`,
                                                            borderRadius: '12px',
                                                            border: `1px solid ${item.color}40`,
                                                        }}
                                                    />
                                                )}
                                            </AnimatePresence>

                                            {/* Animated underline */}
                                            <motion.div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '6px',
                                                    left: '18px',
                                                    right: '18px',
                                                    height: '2px',
                                                    background: `linear-gradient(90deg, ${item.color}, transparent)`,
                                                    borderRadius: '2px',
                                                }}
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{
                                                    scaleX: hoveredItem === i ? 1 : 0,
                                                    opacity: hoveredItem === i ? 1 : 0
                                                }}
                                                transition={{ duration: 0.2 }}
                                            />

                                            <span style={{ position: 'relative', zIndex: 1 }}>
                                                <ScrambleText text={item.label} isHovered={hoveredItem === i} />
                                            </span>
                                        </motion.a>
                                    ))}
                                </div>

                                {/* CTA Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* Language Switcher */}
                                    <LanguageSwitcher variant="toggle" showLabel={false} />

                                    <motion.button
                                        onClick={() => navigate('/login')}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '12px',
                                            color: '#9ca3af',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                        whileHover={{
                                            color: 'white',
                                            borderColor: 'rgba(139,92,246,0.5)',
                                            boxShadow: '0 0 20px rgba(139,92,246,0.2)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Login
                                    </motion.button>

                                    <motion.button
                                        onClick={() => navigate('/register')}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        style={{
                                            padding: '10px 24px',
                                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: '0 0 30px rgba(139,92,246,0.5)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Shimmer effect */}
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                            }}
                                            animate={{ left: ['−100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                        />
                                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Get Started
                                            <motion.span
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <HiOutlineArrowRight style={{ width: '16px', height: '16px' }} />
                                            </motion.span>
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.nav>
                );
            })()}

            {/* ULTRA CREATIVE HERO SECTION */}
            {(() => {
                const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
                const heroRef = useRef(null);
                const [typedText, setTypedText] = useState('');
                const fullText = 'Transform Your';
                const [showCursor, setShowCursor] = useState(true);
                const [counters, setCounters] = useState({ modules: 0, features: 0, uptime: 0 });

                // Typewriter effect
                useEffect(() => {
                    let i = 0;
                    const typeInterval = setInterval(() => {
                        if (i <= fullText.length) {
                            setTypedText(fullText.slice(0, i));
                            i++;
                        } else {
                            clearInterval(typeInterval);
                        }
                    }, 100);
                    return () => clearInterval(typeInterval);
                }, []);

                // Cursor blink
                useEffect(() => {
                    const cursorInterval = setInterval(() => {
                        setShowCursor(prev => !prev);
                    }, 530);
                    return () => clearInterval(cursorInterval);
                }, []);

                // Counter animation
                useEffect(() => {
                    const duration = 2000;
                    const steps = 60;
                    const interval = duration / steps;
                    let step = 0;
                    const timer = setInterval(() => {
                        step++;
                        const progress = step / steps;
                        setCounters({
                            modules: Math.round(6 * progress),
                            features: Math.round(50 * progress),
                            uptime: Math.round(99.9 * progress * 10) / 10
                        });
                        if (step >= steps) clearInterval(timer);
                    }, interval);
                    return () => clearInterval(timer);
                }, []);

                // Mouse parallax
                useEffect(() => {
                    const handleMouseMove = (e) => {
                        if (heroRef.current) {
                            const rect = heroRef.current.getBoundingClientRect();
                            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
                            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
                            setMousePosition({ x, y });
                        }
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    return () => window.removeEventListener('mousemove', handleMouseMove);
                }, []);

                // Floating module icons data
                const floatingModules = [
                    { icon: HiOutlineLightningBolt, color: '#8b5cf6', label: 'Work', angle: 0 },
                    { icon: HiOutlineSparkles, color: '#06b6d4', label: 'Space', angle: 60 },
                    { icon: HiOutlineShare, color: '#ec4899', label: 'Social', angle: 120 },
                    { icon: HiOutlineCreditCard, color: '#10b981', label: 'Finance', angle: 180 },
                    { icon: HiOutlineCube, color: '#f59e0b', label: 'Assets', angle: 240 },
                    { icon: HiOutlineShieldCheck, color: '#6366f1', label: 'System', angle: 300 },
                ];

                return (
                    <section
                        ref={heroRef}
                        style={{
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: '100px',
                            paddingBottom: '60px',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated Grid Background */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.3 }}>
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={`h-${i}`}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: `${i * 5}%`,
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
                                    }}
                                    animate={{ opacity: [0.1, 0.4, 0.1], scaleX: [0.8, 1, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                                />
                            ))}
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={`v-${i}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: `${i * 5}%`,
                                        width: '1px',
                                        background: 'linear-gradient(180deg, transparent, rgba(6,182,212,0.3), transparent)',
                                    }}
                                    animate={{ opacity: [0.1, 0.3, 0.1], scaleY: [0.8, 1, 0.8] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.15 }}
                                />
                            ))}
                        </div>

                        {/* Floating Particles */}
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                style={{
                                    position: 'absolute',
                                    width: Math.random() * 4 + 2,
                                    height: Math.random() * 4 + 2,
                                    borderRadius: '50%',
                                    background: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][i % 4],
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -30 - Math.random() * 50, 0],
                                    x: [0, (Math.random() - 0.5) * 30, 0],
                                    opacity: [0.2, 0.8, 0.2],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 4,
                                    repeat: Infinity,
                                    delay: Math.random() * 3,
                                }}
                            />
                        ))}

                        {/* Orbiting Module Cards */}
                        <div style={{
                            position: 'absolute',
                            width: '800px',
                            height: '800px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                        }}>
                            {floatingModules.map((module, i) => {
                                const radius = 320;
                                const baseAngle = module.angle;
                                return (
                                    <motion.div
                                        key={module.label}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                        }}
                                        animate={{
                                            x: Math.cos((baseAngle + 360) * Math.PI / 180) * radius - 35,
                                            y: Math.sin((baseAngle + 360) * Math.PI / 180) * radius - 35,
                                            rotate: [0, 10, -10, 0],
                                        }}
                                        transition={{
                                            x: { duration: 20, repeat: Infinity, ease: 'linear' },
                                            y: { duration: 20, repeat: Infinity, ease: 'linear' },
                                            rotate: { duration: 4, repeat: Infinity, delay: i * 0.5 },
                                        }}
                                    >
                                        <motion.div
                                            style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '20px',
                                                background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                                                border: `1px solid ${module.color}40`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px',
                                                backdropFilter: 'blur(10px)',
                                                boxShadow: `0 10px 40px ${module.color}20`,
                                            }}
                                            animate={{
                                                y: [0, -10, 0],
                                                boxShadow: [
                                                    `0 10px 40px ${module.color}20`,
                                                    `0 20px 60px ${module.color}40`,
                                                    `0 10px 40px ${module.color}20`,
                                                ],
                                            }}
                                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                                        >
                                            <module.icon style={{ width: '28px', height: '28px', color: module.color }} />
                                            <span style={{ fontSize: '10px', color: module.color, fontWeight: '600' }}>{module.label}</span>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Main Content */}
                        <motion.div
                            style={{
                                ...styles.container,
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 10,
                            }}
                            animate={{
                                x: mousePosition.x * -20,
                                y: mousePosition.y * -20,
                            }}
                            transition={{ type: 'spring', damping: 50, stiffness: 200 }}
                        >
                            {/* Animated Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 20px',
                                    borderRadius: '50px',
                                    background: 'rgba(139,92,246,0.1)',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    marginBottom: '40px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Shimmer effect */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    }}
                                    animate={{ left: ['−100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                />
                                <motion.span
                                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '500' }}>All-in-One Productivity Platform</span>
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <HiOutlineArrowRight style={{ color: '#a78bfa', width: '16px', height: '16px' }} />
                                </motion.span>
                            </motion.div>

                            {/* Main Headline with Typewriter */}
                            <div style={{ marginBottom: '24px' }}>
                                <motion.h1
                                    style={{
                                        fontSize: 'clamp(48px, 10vw, 80px)',
                                        fontWeight: '800',
                                        lineHeight: 1.05,
                                        margin: 0,
                                    }}
                                >
                                    {/* Typewriter text */}
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {typedText}
                                        <motion.span
                                            style={{
                                                borderRight: showCursor ? '3px solid #8b5cf6' : '3px solid transparent',
                                                marginLeft: '2px',
                                            }}
                                        />
                                    </motion.span>
                                    <br />

                                    {/* Animated gradient word */}
                                    <motion.span
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
                                        style={{
                                            display: 'inline-block',
                                            background: 'linear-gradient(90deg, #a78bfa, #06b6d4, #ec4899, #f59e0b, #a78bfa)',
                                            backgroundSize: '200% 100%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            position: 'relative',
                                        }}
                                    >
                                        <motion.span
                                            style={{ display: 'inline-block' }}
                                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        >
                                            {'Workflow'.split('').map((char, i) => (
                                                <motion.span
                                                    key={i}
                                                    style={{ display: 'inline-block' }}
                                                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                                    transition={{ delay: 1.6 + i * 0.1, type: 'spring', bounce: 0.4 }}
                                                    whileHover={{ scale: 1.2, color: '#ec4899' }}
                                                >
                                                    {char}
                                                </motion.span>
                                            ))}
                                        </motion.span>

                                        {/* Glowing underline */}
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                bottom: '-10px',
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
                                                borderRadius: '4px',
                                            }}
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            animate={{ scaleX: 1, opacity: 1 }}
                                            transition={{ delay: 2.5, duration: 0.8 }}
                                        />
                                    </motion.span>
                                </motion.h1>
                            </div>

                            {/* Animated Subtitle */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.8 }}
                                style={{
                                    fontSize: '20px',
                                    color: '#9ca3af',
                                    maxWidth: '650px',
                                    margin: '0 auto 48px',
                                    lineHeight: 1.7
                                }}
                            >
                                {'6 powerful modules in one platform.'.split(' ').map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2.8 + i * 0.1 }}
                                        style={{ display: 'inline-block', marginRight: '6px' }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                                <br />
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 3.5 }}
                                    style={{ color: 'white', fontWeight: '500' }}
                                >
                                    Everything you need to succeed.
                                </motion.span>
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 3.8, type: 'spring' }}
                                style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '70px' }}
                            >
                                {/* Primary CTA */}
                                <motion.button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        padding: '18px 36px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 0 50px rgba(139,92,246,0.6)',
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Ripple effect */}
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.3), transparent 70%)',
                                        }}
                                        animate={{ scale: [0, 2], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span style={{ position: 'relative', zIndex: 1 }}>Start Free Trial</span>
                                    <motion.span
                                        style={{ position: 'relative', zIndex: 1 }}
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <HiOutlineArrowRight style={{ width: '18px', height: '18px' }} />
                                    </motion.span>
                                </motion.button>

                                {/* Secondary CTA */}
                                <motion.button
                                    style={{
                                        padding: '18px 36px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    whileHover={{
                                        background: 'rgba(255,255,255,0.1)',
                                        borderColor: 'rgba(139,92,246,0.5)',
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'rgba(236,72,153,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <HiOutlinePlay style={{ width: '18px', height: '18px', marginLeft: '2px', color: '#ec4899' }} />
                                    </motion.div>
                                    Watch Demo
                                </motion.button>
                            </motion.div>

                            {/* Stats with Animation */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 4.2 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '32px',
                                    maxWidth: '700px',
                                    margin: '0 auto',
                                    padding: '30px 40px',
                                    borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                {[
                                    { value: counters.modules, suffix: '+', label: 'Modules', color: '#8b5cf6' },
                                    { value: counters.features, suffix: '+', label: 'Features', color: '#06b6d4' },
                                    { value: counters.uptime, suffix: '%', label: 'Uptime', color: '#10b981' },
                                    { value: '24/7', suffix: '', label: 'Support', color: '#ec4899' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        style={{ textAlign: 'center' }}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 4.3 + i * 0.1, type: 'spring' }}
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <motion.div
                                            style={{
                                                fontSize: '36px',
                                                fontWeight: '800',
                                                color: stat.color,
                                            }}
                                        >
                                            {typeof stat.value === 'number' ? stat.value : stat.value}{stat.suffix}
                                        </motion.div>
                                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 5 }}
                            style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    width: '30px',
                                    height: '50px',
                                    borderRadius: '20px',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    paddingTop: '8px',
                                }}
                            >
                                <motion.div
                                    animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        width: '6px',
                                        height: '10px',
                                        borderRadius: '4px',
                                        background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)',
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    </section>
                );
            })()}

            {/* ULTRA CREATIVE MODULES SECTION */}
            {(() => {
                const [activeModule, setActiveModule] = useState(null);
                const [hoveredModule, setHoveredModule] = useState(null);
                const sectionRef = useRef(null);
                const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

                useEffect(() => {
                    const handleMouseMove = (e) => {
                        if (sectionRef.current) {
                            const rect = sectionRef.current.getBoundingClientRect();
                            setMousePos({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top
                            });
                        }
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    return () => window.removeEventListener('mousemove', handleMouseMove);
                }, []);

                return (
                    <section
                        id="modules"
                        ref={sectionRef}
                        style={{
                            padding: '120px 0',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated background mesh */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            {/* Gradient orbs */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    width: '600px',
                                    height: '600px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                                    filter: 'blur(60px)',
                                }}
                                animate={{
                                    x: [mousePos.x - 300, mousePos.x - 300],
                                    y: [mousePos.y - 300, mousePos.y - 300],
                                }}
                                transition={{ type: 'spring', damping: 50, stiffness: 100 }}
                            />

                            {/* Connecting lines between modules */}
                            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
                                {[...Array(6)].map((_, i) => (
                                    <motion.line
                                        key={i}
                                        x1="20%"
                                        y1={`${20 + i * 12}%`}
                                        x2="80%"
                                        y2={`${25 + i * 10}%`}
                                        stroke="url(#lineGradient)"
                                        strokeWidth="1"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, delay: i * 0.2 }}
                                    />
                                ))}
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="50%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div style={styles.container}>
                            {/* Section Header with Split Animation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                style={{ textAlign: 'center', marginBottom: '80px' }}
                            >
                                {/* Animated Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        borderRadius: '50px',
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        marginBottom: '24px',
                                    }}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <HiOutlineSparkles style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                                    </motion.div>
                                    <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>Powerful Modules</span>
                                </motion.div>

                                {/* Title with word animation */}
                                <h2 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
                                    {'Six Modules,'.split(' ').map((word, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 40, rotateX: -45 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.15, type: 'spring' }}
                                            style={{ display: 'inline-block', marginRight: '12px' }}
                                        >
                                            {word}
                                        </motion.span>
                                    ))}
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4, type: 'spring', bounce: 0.4 }}
                                        style={{
                                            display: 'inline-block',
                                            background: 'linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        One Platform
                                    </motion.span>
                                </h2>

                                {/* Subtitle */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                    style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}
                                >
                                    Everything you need to manage your work, plan your future, and grow your business
                                </motion.p>
                            </motion.div>

                            {/* Interactive Module Cards - Hexagon-inspired Layout */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '24px',
                                maxWidth: '1100px',
                                margin: '0 auto',
                            }}>
                                {modules.map((module, i) => {
                                    const isHovered = hoveredModule === i;
                                    const isActive = activeModule === i;

                                    return (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 60, scale: 0.9 }}
                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1, type: 'spring', bounce: 0.3 }}
                                            onMouseEnter={() => setHoveredModule(i)}
                                            onMouseLeave={() => setHoveredModule(null)}
                                            onClick={() => setActiveModule(isActive ? null : i)}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                perspective: '1000px',
                                            }}
                                        >
                                            <motion.div
                                                animate={{
                                                    rotateY: isHovered ? 5 : 0,
                                                    rotateX: isHovered ? -5 : 0,
                                                    scale: isHovered ? 1.02 : 1,
                                                    z: isHovered ? 50 : 0,
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                style={{
                                                    background: isHovered
                                                        ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(${module.color === '#8b5cf6' ? '139,92,246' : module.color === '#06b6d4' ? '6,182,212' : module.color === '#ec4899' ? '236,72,153' : module.color === '#10b981' ? '16,185,129' : module.color === '#f59e0b' ? '245,158,11' : '99,102,241'},0.1))`
                                                        : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${isHovered ? module.color + '50' : 'rgba(255,255,255,0.08)'}`,
                                                    borderRadius: '24px',
                                                    padding: '32px',
                                                    backdropFilter: 'blur(20px)',
                                                    overflow: 'hidden',
                                                    transformStyle: 'preserve-3d',
                                                }}
                                            >
                                                {/* Animated border glow */}
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: -1,
                                                        borderRadius: '25px',
                                                        padding: '1px',
                                                        background: `linear-gradient(135deg, ${module.color}, transparent, ${module.color})`,
                                                        backgroundSize: '200% 200%',
                                                        opacity: isHovered ? 0.6 : 0,
                                                        zIndex: -1,
                                                    }}
                                                    animate={isHovered ? { backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] } : {}}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                />

                                                {/* Spotlight effect */}
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        width: '200px',
                                                        height: '200px',
                                                        borderRadius: '50%',
                                                        background: `radial-gradient(circle, ${module.color}30 0%, transparent 70%)`,
                                                        pointerEvents: 'none',
                                                        opacity: isHovered ? 1 : 0,
                                                        filter: 'blur(20px)',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                    }}
                                                />

                                                {/* Header */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                                                    {/* Animated Icon Container */}
                                                    <motion.div
                                                        animate={isHovered ? {
                                                            scale: [1, 1.1, 1],
                                                            rotate: [0, 5, -5, 0],
                                                        } : {}}
                                                        transition={{ duration: 0.5 }}
                                                        style={{
                                                            width: '64px',
                                                            height: '64px',
                                                            borderRadius: '20px',
                                                            background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
                                                            border: `1px solid ${module.color}40`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        {/* Icon glow */}
                                                        <motion.div
                                                            style={{
                                                                position: 'absolute',
                                                                inset: -8,
                                                                borderRadius: '28px',
                                                                background: module.color,
                                                                filter: 'blur(20px)',
                                                                opacity: isHovered ? 0.4 : 0,
                                                            }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                        <motion.div
                                                            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                                                            transition={{ duration: 8, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
                                                        >
                                                            <module.icon style={{ width: '32px', height: '32px', color: module.color, position: 'relative', zIndex: 1 }} />
                                                        </motion.div>
                                                    </motion.div>

                                                    <div style={{ flex: 1 }}>
                                                        <motion.h3
                                                            style={{
                                                                fontSize: '22px',
                                                                fontWeight: '700',
                                                                marginBottom: '4px',
                                                                color: isHovered ? 'white' : '#e5e7eb',
                                                            }}
                                                        >
                                                            {module.name}
                                                        </motion.h3>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: isHovered ? '60px' : '30px' }}
                                                            style={{
                                                                height: '3px',
                                                                background: `linear-gradient(90deg, ${module.color}, transparent)`,
                                                                borderRadius: '2px',
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Module number */}
                                                    <motion.div
                                                        animate={{
                                                            scale: isHovered ? 1.1 : 1,
                                                            rotate: isHovered ? -10 : 0,
                                                        }}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '12px',
                                                            background: `${module.color}20`,
                                                            border: `1px solid ${module.color}30`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            color: module.color,
                                                        }}
                                                    >
                                                        0{i + 1}
                                                    </motion.div>
                                                </div>

                                                {/* Description */}
                                                <motion.p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#9ca3af',
                                                        lineHeight: 1.6,
                                                        marginBottom: '20px',
                                                    }}
                                                >
                                                    {module.description}
                                                </motion.p>

                                                {/* Feature Tags with stagger animation */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {module.features.map((feature, fi) => (
                                                        <motion.span
                                                            key={feature}
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                                y: isHovered ? [0, -3, 0] : 0,
                                                            }}
                                                            transition={{
                                                                delay: fi * 0.05,
                                                                y: { delay: fi * 0.1, duration: 0.5 }
                                                            }}
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            style={{
                                                                padding: '8px 14px',
                                                                borderRadius: '10px',
                                                                background: isHovered ? `${module.color}25` : `${module.color}15`,
                                                                color: module.color,
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                border: `1px solid ${isHovered ? module.color + '40' : 'transparent'}`,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {feature}
                                                        </motion.span>
                                                    ))}
                                                </div>

                                                {/* Expand arrow */}
                                                <motion.div
                                                    animate={{
                                                        y: isHovered ? [0, 5, 0] : 0,
                                                        opacity: isHovered ? 1 : 0.5,
                                                    }}
                                                    transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                                                    style={{
                                                        marginTop: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        fontSize: '13px',
                                                        color: module.color,
                                                    }}
                                                >
                                                    <span>Explore {module.name}</span>
                                                    <HiOutlineArrowRight style={{ width: '14px', height: '14px' }} />
                                                </motion.div>

                                                {/* Corner decorations */}
                                                <motion.div
                                                    animate={{ opacity: isHovered ? 0.6 : 0.2 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        width: '40px',
                                                        height: '40px',
                                                        borderTop: `2px solid ${module.color}`,
                                                        borderRight: `2px solid ${module.color}`,
                                                        borderRadius: '0 12px 0 0',
                                                    }}
                                                />
                                                <motion.div
                                                    animate={{ opacity: isHovered ? 0.6 : 0.2 }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '12px',
                                                        left: '12px',
                                                        width: '40px',
                                                        height: '40px',
                                                        borderBottom: `2px solid ${module.color}`,
                                                        borderLeft: `2px solid ${module.color}`,
                                                        borderRadius: '0 0 0 12px',
                                                    }}
                                                />
                                            </motion.div>

                                            {/* Floating particles on hover */}
                                            <AnimatePresence>
                                                {isHovered && [...Array(8)].map((_, pi) => (
                                                    <motion.div
                                                        key={pi}
                                                        initial={{
                                                            scale: 0,
                                                            x: '50%',
                                                            y: '50%',
                                                            opacity: 0
                                                        }}
                                                        animate={{
                                                            scale: [0, 1, 0],
                                                            x: `${50 + (Math.random() - 0.5) * 100}%`,
                                                            y: `${50 + (Math.random() - 0.5) * 100}%`,
                                                            opacity: [0, 1, 0],
                                                        }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ duration: 1.5, delay: pi * 0.1 }}
                                                        style={{
                                                            position: 'absolute',
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: module.color,
                                                            pointerEvents: 'none',
                                                        }}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Bottom CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8 }}
                                style={{ textAlign: 'center', marginTop: '60px' }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '16px 32px',
                                        borderRadius: '14px',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        background: 'rgba(139,92,246,0.1)',
                                        color: '#a78bfa',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    Explore All Modules
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <HiOutlineArrowRight style={{ width: '18px', height: '18px' }} />
                                    </motion.span>
                                </motion.button>
                            </motion.div>
                        </div>
                    </section>
                );
            })()}

            {/* Features Section */}
            {/* ULTRA CREATIVE FEATURES SECTION - BENTO GRID */}
            {(() => {
                const [hoveredFeature, setHoveredFeature] = useState(null);
                const [visibleCount, setVisibleCount] = useState(0);
                const featuresRef = useRef(null);

                // Staggered visibility
                useEffect(() => {
                    const observer = new IntersectionObserver(
                        (entries) => {
                            if (entries[0].isIntersecting) {
                                const timer = setInterval(() => {
                                    setVisibleCount(prev => {
                                        if (prev >= features.length) {
                                            clearInterval(timer);
                                            return prev;
                                        }
                                        return prev + 1;
                                    });
                                }, 100);
                            }
                        },
                        { threshold: 0.2 }
                    );
                    if (featuresRef.current) observer.observe(featuresRef.current);
                    return () => observer.disconnect();
                }, []);

                // Extended features with sizes for bento grid - structured layout
                const gridPositions = [
                    { col: '1 / 3', row: '1 / 3', size: 'large' },      // 0: Large card top-left
                    { col: '3 / 4', row: '1 / 2', size: 'normal' },     // 1: Normal top-right
                    { col: '3 / 4', row: '2 / 3', size: 'normal' },     // 2: Normal below 1
                    { col: '1 / 2', row: '3 / 4', size: 'normal' },     // 3: Normal row 3
                    { col: '2 / 4', row: '3 / 4', size: 'wide' },       // 4: Wide card row 3
                    { col: '1 / 2', row: '4 / 6', size: 'tall' },       // 5: Tall card left
                    { col: '2 / 3', row: '4 / 5', size: 'normal' },     // 6: Normal
                    { col: '3 / 4', row: '4 / 5', size: 'normal' },     // 7: Normal
                    { col: '2 / 4', row: '5 / 6', size: 'wide' },       // 8: Wide card
                    { col: '1 / 2', row: '6 / 7', size: 'normal' },     // 9: Normal
                    { col: '2 / 3', row: '6 / 7', size: 'normal' },     // 10: Normal
                    { col: '3 / 4', row: '6 / 7', size: 'normal' },     // 11: Normal
                ];
                const bentoFeatures = features.map((f, i) => ({
                    ...f,
                    gridPos: gridPositions[i] || { col: 'auto', row: 'auto', size: 'normal' },
                    stats: ['98%', '50+', '24/7', '∞', '100%', '10x', '5★', '99.9%', '60+', '500+', '1000+', '∞'][i],
                    statsLabel: ['Satisfaction', 'Templates', 'Support', 'Storage', 'Secure', 'Faster', 'Rating', 'Uptime', 'Integrations', 'Users', 'Projects', 'Possibilities'][i],
                }));

                return (
                    <section
                        id="features"
                        ref={featuresRef}
                        style={{
                            padding: '120px 0',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated background dots */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            {[...Array(50)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: '2px',
                                        height: '2px',
                                        borderRadius: '50%',
                                        background: 'rgba(139,92,246,0.3)',
                                        left: `${(i % 10) * 10 + 5}%`,
                                        top: `${Math.floor(i / 10) * 20 + 10}%`,
                                    }}
                                    animate={{
                                        opacity: [0.2, 0.6, 0.2],
                                        scale: [1, 1.5, 1],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </div>

                        <div style={styles.container}>
                            {/* Section Header */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                style={{ textAlign: 'center', marginBottom: '80px' }}
                            >
                                {/* Animated counter badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 24px',
                                        borderRadius: '50px',
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                                        border: '1px solid rgba(16,185,129,0.3)',
                                        marginBottom: '24px',
                                    }}
                                >
                                    <motion.span
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: '800',
                                            color: '#10b981',
                                        }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {features.length}+
                                    </motion.span>
                                    <span style={{ color: '#6ee7b7', fontSize: '14px', fontWeight: '500' }}>Powerful Features</span>
                                </motion.div>

                                {/* Title with character animation */}
                                <h2 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
                                    {'Packed with'.split('').map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.03, type: 'spring' }}
                                            style={{ display: 'inline-block' }}
                                        >
                                            {char === ' ' ? '\u00A0' : char}
                                        </motion.span>
                                    ))}
                                    {' '}
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
                                        style={{
                                            display: 'inline-block',
                                            background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Features
                                    </motion.span>
                                </h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.8 }}
                                    style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}
                                >
                                    Everything you need to be productive
                                </motion.p>
                            </motion.div>

                            {/* Bento Grid - 3 Column Layout */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gridTemplateRows: 'repeat(6, 160px)',
                                gap: '20px',
                                maxWidth: '1000px',
                                margin: '0 auto',
                            }}>
                                {bentoFeatures.map((feature, i) => {
                                    const isHovered = hoveredFeature === i;
                                    const isVisible = i < visibleCount;
                                    const isLarge = feature.gridPos.size === 'large';
                                    const isTall = feature.gridPos.size === 'tall';

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                            animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
                                            transition={{ type: 'spring', bounce: 0.3 }}
                                            onMouseEnter={() => setHoveredFeature(i)}
                                            onMouseLeave={() => setHoveredFeature(null)}
                                            style={{
                                                gridColumn: feature.gridPos.col,
                                                gridRow: feature.gridPos.row,
                                                position: 'relative',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: isHovered ? 1.02 : 1,
                                                    y: isHovered ? -5 : 0,
                                                }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                                style={{
                                                    height: '100%',
                                                    background: isHovered
                                                        ? `linear-gradient(135deg, rgba(255,255,255,0.08), ${feature.color}15)`
                                                        : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${isHovered ? feature.color + '50' : 'rgba(255,255,255,0.08)'}`,
                                                    borderRadius: '24px',
                                                    padding: (isLarge || isTall) ? '28px' : '20px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Animated gradient border */}
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: -1,
                                                        borderRadius: '25px',
                                                        padding: '1px',
                                                        background: `linear-gradient(45deg, ${feature.color}, transparent 50%, ${feature.color})`,
                                                        backgroundSize: '200% 200%',
                                                        opacity: isHovered ? 0.8 : 0,
                                                        zIndex: -1,
                                                    }}
                                                    animate={isHovered ? { backgroundPosition: ['0% 0%', '100% 100%'] } : {}}
                                                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                                                />

                                                {/* Spotlight */}
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        width: '150px',
                                                        height: '150px',
                                                        borderRadius: '50%',
                                                        background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)`,
                                                        filter: 'blur(20px)',
                                                        opacity: isHovered ? 1 : 0,
                                                        top: '20%',
                                                        right: '10%',
                                                    }}
                                                />

                                                {/* Content */}
                                                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                    {/* Header */}
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: feature.size === 'large' ? '24px' : '16px' }}>
                                                        {/* Icon */}
                                                        <motion.div
                                                            animate={isHovered ? {
                                                                scale: [1, 1.15, 1],
                                                                rotate: [0, 5, -5, 0],
                                                            } : {}}
                                                            transition={{ duration: 0.6 }}
                                                            style={{
                                                                width: (isLarge || isTall) ? '56px' : '48px',
                                                                height: (isLarge || isTall) ? '56px' : '48px',
                                                                borderRadius: '14px',
                                                                background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                                                                border: `1px solid ${feature.color}40`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                position: 'relative',
                                                            }}
                                                        >
                                                            {/* Icon glow */}
                                                            <motion.div
                                                                animate={{ opacity: isHovered ? 0.6 : 0 }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    inset: -10,
                                                                    borderRadius: '24px',
                                                                    background: feature.color,
                                                                    filter: 'blur(20px)',
                                                                }}
                                                            />
                                                            <motion.div
                                                                animate={isHovered ? { rotate: 360 } : {}}
                                                                transition={{ duration: 4, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
                                                            >
                                                                <feature.icon style={{
                                                                    width: (isLarge || isTall) ? '28px' : '24px',
                                                                    height: (isLarge || isTall) ? '28px' : '24px',
                                                                    color: feature.color,
                                                                    position: 'relative',
                                                                    zIndex: 1,
                                                                }} />
                                                            </motion.div>
                                                        </motion.div>

                                                        {/* Stats badge */}
                                                        {(isLarge || isTall) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 }}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    borderRadius: '12px',
                                                                    background: `${feature.color}20`,
                                                                    border: `1px solid ${feature.color}30`,
                                                                }}
                                                            >
                                                                <motion.div
                                                                    animate={{ scale: isHovered ? [1, 1.1, 1] : 1 }}
                                                                    transition={{ duration: 0.5 }}
                                                                    style={{ fontSize: '20px', fontWeight: '800', color: feature.color, textAlign: 'center' }}
                                                                >
                                                                    {feature.stats}
                                                                </motion.div>
                                                                <div style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>{feature.statsLabel}</div>
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Text content */}
                                                    <div style={{ flex: 1 }}>
                                                        <motion.h3
                                                            style={{
                                                                fontSize: (isLarge || isTall) ? '18px' : '15px',
                                                                fontWeight: '700',
                                                                marginBottom: '6px',
                                                                color: isHovered ? 'white' : '#e5e7eb',
                                                            }}
                                                        >
                                                            {feature.title}
                                                        </motion.h3>
                                                        <p style={{
                                                            fontSize: (isLarge || isTall) ? '13px' : '12px',
                                                            color: '#9ca3af',
                                                            lineHeight: 1.5,
                                                            marginBottom: (isLarge || isTall) ? '16px' : '8px',
                                                        }}>
                                                            {feature.desc}
                                                        </p>
                                                    </div>

                                                    {/* Progress bar (for large/tall cards) */}
                                                    {(isLarge || isTall) && (
                                                        <div>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px',
                                                                fontSize: '12px',
                                                                color: '#6b7280',
                                                            }}>
                                                                <span>Performance</span>
                                                                <span style={{ color: feature.color }}>{feature.stats}</span>
                                                            </div>
                                                            <div style={{
                                                                height: '6px',
                                                                background: 'rgba(255,255,255,0.1)',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden',
                                                            }}>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: '85%' }}
                                                                    viewport={{ once: true }}
                                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                                    style={{
                                                                        height: '100%',
                                                                        background: `linear-gradient(90deg, ${feature.color}, ${feature.color}80)`,
                                                                        borderRadius: '3px',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Arrow indicator */}
                                                    <motion.div
                                                        animate={{
                                                            x: isHovered ? 5 : 0,
                                                            opacity: isHovered ? 1 : 0.5,
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: (isLarge || isTall) ? '28px' : '20px',
                                                            right: (isLarge || isTall) ? '28px' : '20px',
                                                            color: feature.color,
                                                        }}
                                                    >
                                                        <HiOutlineArrowRight style={{ width: '18px', height: '18px' }} />
                                                    </motion.div>
                                                </div>

                                                {/* Floating particles */}
                                                <AnimatePresence>
                                                    {isHovered && [...Array(5)].map((_, pi) => (
                                                        <motion.div
                                                            key={pi}
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{
                                                                scale: [0, 1, 0],
                                                                opacity: [0, 0.8, 0],
                                                                x: (Math.random() - 0.5) * 100,
                                                                y: -50 - Math.random() * 50,
                                                            }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 1, delay: pi * 0.1 }}
                                                            style={{
                                                                position: 'absolute',
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                background: feature.color,
                                                                left: '50%',
                                                                bottom: '30%',
                                                                pointerEvents: 'none',
                                                            }}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Feature count summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '40px',
                                    marginTop: '60px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {[
                                    { num: '12+', label: 'Core Features', color: '#8b5cf6' },
                                    { num: '6', label: 'Modules', color: '#06b6d4' },
                                    { num: '∞', label: 'Possibilities', color: '#ec4899' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        style={{
                                            textAlign: 'center',
                                            padding: '20px 40px',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                            style={{ fontSize: '32px', fontWeight: '800', color: item.color }}
                                        >
                                            {item.num}
                                        </motion.div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>
                );
            })()}

            {/* ULTRA CREATIVE CTA SECTION */}
            {(() => {
                const [isHovered, setIsHovered] = useState(false);
                const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
                const ctaRef = useRef(null);

                useEffect(() => {
                    const handleMouseMove = (e) => {
                        if (ctaRef.current) {
                            const rect = ctaRef.current.getBoundingClientRect();
                            setMousePos({
                                x: (e.clientX - rect.left) / rect.width,
                                y: (e.clientY - rect.top) / rect.height,
                            });
                        }
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    return () => window.removeEventListener('mousemove', handleMouseMove);
                }, []);

                const orbitIcons = [
                    { icon: HiOutlineLightningBolt, color: '#8b5cf6' },
                    { icon: HiOutlineSparkles, color: '#06b6d4' },
                    { icon: HiOutlineShare, color: '#ec4899' },
                    { icon: HiOutlineCreditCard, color: '#10b981' },
                    { icon: HiOutlineCube, color: '#f59e0b' },
                    { icon: HiOutlineShieldCheck, color: '#6366f1' },
                ];

                return (
                    <section
                        ref={ctaRef}
                        style={{
                            padding: '120px 0',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={styles.container}>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                style={{
                                    padding: '80px 60px',
                                    borderRadius: '40px',
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.06), rgba(236,72,153,0.05))',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Animated gradient mesh background */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: `
                                            radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(139,92,246,0.15) 0%, transparent 50%),
                                            radial-gradient(circle at ${100 - mousePos.x * 100}% ${100 - mousePos.y * 100}%, rgba(6,182,212,0.12) 0%, transparent 50%),
                                            radial-gradient(circle at 50% 50%, rgba(236,72,153,0.08) 0%, transparent 60%)
                                        `,
                                        opacity: 0.6,
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Animated border glow */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: -1,
                                        borderRadius: '41px',
                                        padding: '1px',
                                        background: 'linear-gradient(90deg, rgba(139,92,246,0.4), rgba(6,182,212,0.4), rgba(236,72,153,0.4), rgba(16,185,129,0.4), rgba(139,92,246,0.4))',
                                        backgroundSize: '300% 100%',
                                        zIndex: -1,
                                        opacity: 0.5,
                                    }}
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                />

                                {/* Floating particles */}
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            width: Math.random() * 6 + 3,
                                            height: Math.random() * 6 + 3,
                                            borderRadius: '50%',
                                            background: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][i % 4],
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            opacity: 0.6,
                                        }}
                                        animate={{
                                            y: [0, -40, 0],
                                            x: [0, (Math.random() - 0.5) * 30, 0],
                                            opacity: [0.3, 0.8, 0.3],
                                            scale: [1, 1.3, 1],
                                        }}
                                        transition={{
                                            duration: 4 + Math.random() * 3,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    />
                                ))}

                                {/* Orbiting icons ring */}
                                <div style={{
                                    position: 'absolute',
                                    width: '500px',
                                    height: '500px',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none',
                                }}>
                                    {orbitIcons.map((item, i) => {
                                        const angle = (360 / orbitIcons.length) * i;
                                        return (
                                            <motion.div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    top: '50%',
                                                }}
                                                animate={{
                                                    rotate: 360,
                                                }}
                                                transition={{
                                                    duration: 20,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            >
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        transform: `rotate(${angle}deg) translateX(220px) rotate(-${angle}deg)`,
                                                    }}
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        delay: i * 0.3,
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '16px',
                                                        background: `${item.color}20`,
                                                        border: `1px solid ${item.color}40`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backdropFilter: 'blur(10px)',
                                                    }}>
                                                        <item.icon style={{ width: '24px', height: '24px', color: item.color }} />
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Main content */}
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    {/* Animated badge */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 20px',
                                            borderRadius: '50px',
                                            background: 'rgba(16,185,129,0.2)',
                                            border: '1px solid rgba(16,185,129,0.3)',
                                            marginBottom: '30px',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#10b981',
                                            }}
                                        />
                                        <span style={{ color: '#6ee7b7', fontSize: '14px', fontWeight: '500' }}>
                                            Limited Time Offer
                                        </span>
                                        <motion.span
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            🎉
                                        </motion.span>
                                    </motion.div>

                                    {/* Title with word animation */}
                                    <h2 style={{
                                        fontSize: 'clamp(32px, 5vw, 52px)',
                                        fontWeight: '800',
                                        marginBottom: '20px',
                                        lineHeight: 1.2,
                                    }}>
                                        {'Ready to'.split(' ').map((word, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1, type: 'spring' }}
                                                style={{ display: 'inline-block', marginRight: '12px' }}
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                                            style={{
                                                display: 'inline-block',
                                                background: 'linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            Transform
                                        </motion.span>
                                        <br />
                                        <motion.span
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.4, type: 'spring' }}
                                            style={{ display: 'inline-block' }}
                                        >
                                            Your Workflow?
                                        </motion.span>
                                    </h2>

                                    {/* Subtitle */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.6 }}
                                        style={{
                                            color: '#9ca3af',
                                            fontSize: '18px',
                                            marginBottom: '40px',
                                            maxWidth: '500px',
                                            margin: '0 auto 40px',
                                        }}
                                    >
                                        Join <motion.span
                                            style={{ color: '#06b6d4', fontWeight: '600' }}
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            10,000+
                                        </motion.span> users who have already revolutionized their productivity
                                    </motion.p>

                                    {/* CTA Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.8 }}
                                        style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}
                                    >
                                        {/* Primary button with magnetic effect */}
                                        <motion.button
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                            onClick={() => navigate('/register')}
                                            style={{
                                                padding: '20px 48px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                                                color: '#8b5cf6',
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: '0 0 60px rgba(255,255,255,0.4)',
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {/* Shimmer effect */}
                                            <motion.div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '-100%',
                                                    width: '100%',
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
                                                }}
                                                animate={{ left: ['−100%', '200%'] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                            />
                                            <span style={{ position: 'relative', zIndex: 1 }}>Get Started Free</span>
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                style={{ position: 'relative', zIndex: 1 }}
                                            >
                                                <HiOutlineArrowRight style={{ width: '20px', height: '20px' }} />
                                            </motion.span>

                                            {/* Confetti particles on hover */}
                                            <AnimatePresence>
                                                {isHovered && [...Array(12)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0, x: 0, y: 0 }}
                                                        animate={{
                                                            scale: [0, 1, 0],
                                                            x: (Math.random() - 0.5) * 150,
                                                            y: -60 - Math.random() * 80,
                                                            rotate: Math.random() * 360,
                                                        }}
                                                        exit={{ scale: 0 }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        style={{
                                                            position: 'absolute',
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: i % 2 === 0 ? '50%' : '2px',
                                                            background: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'][i % 5],
                                                            left: '50%',
                                                            top: '50%',
                                                        }}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.button>

                                        {/* Secondary button */}
                                        <motion.button
                                            style={{
                                                padding: '20px 36px',
                                                borderRadius: '20px',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                background: 'transparent',
                                                color: 'white',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                            }}
                                            whileHover={{
                                                borderColor: 'rgba(139,92,246,0.5)',
                                                background: 'rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            <HiOutlinePlay style={{ width: '20px', height: '20px' }} />
                                            Watch Demo
                                        </motion.button>
                                    </motion.div>

                                    {/* Trust badges */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 1 }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '40px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {[
                                            { icon: HiOutlineCheck, text: 'Free 14-day trial' },
                                            { icon: HiOutlineCheck, text: 'No credit card required' },
                                            { icon: HiOutlineCheck, text: 'Cancel anytime' },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 1 + i * 0.1 }}
                                                whileHover={{ scale: 1.05 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(16,185,129,0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <item.icon style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                                </motion.div>
                                                <span style={{ color: '#9ca3af', fontSize: '14px' }}>{item.text}</span>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>

                                {/* Wave decoration at bottom */}
                                <svg
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        width: '100%',
                                        height: '80px',
                                        opacity: 0.3,
                                    }}
                                    viewBox="0 0 1200 120"
                                    preserveAspectRatio="none"
                                >
                                    <motion.path
                                        d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
                                        fill="url(#waveGradient)"
                                        animate={{
                                            d: [
                                                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
                                                "M0,60 C150,0 350,120 600,60 C850,0 1050,120 1200,60 L1200,120 L0,120 Z",
                                                "M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z",
                                            ],
                                        }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <defs>
                                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="50%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </motion.div>
                        </div>
                    </section>
                );
            })()}

            {/* ULTRA CREATIVE FOOTER */}
            {(() => {
                const [hoveredLink, setHoveredLink] = useState(null);
                const [hoveredSocial, setHoveredSocial] = useState(null);
                const [email, setEmail] = useState('');
                const [isSubscribed, setIsSubscribed] = useState(false);

                const footerLinks = [
                    {
                        title: 'Product',
                        links: [
                            { name: 'Features', icon: HiOutlineSparkles },
                            { name: 'Modules', icon: HiOutlineCube },
                            { name: 'Pricing', icon: HiOutlineCreditCard },
                            { name: 'Changelog', icon: HiOutlineRefresh },
                        ]
                    },
                    {
                        title: 'Company',
                        links: [
                            { name: 'About', icon: HiOutlineInformationCircle },
                            { name: 'Blog', icon: HiOutlineDocumentText },
                            { name: 'Careers', icon: HiOutlineUsers },
                            { name: 'Contact', icon: HiOutlineMail },
                        ]
                    },
                    {
                        title: 'Legal',
                        links: [
                            { name: 'Privacy', icon: HiOutlineShieldCheck, href: '/privacy' },
                            { name: 'Terms', icon: HiOutlineDocument, href: '/terms' },
                            { name: 'Security', icon: HiOutlineLockClosed, href: '/security' },
                        ]
                    },
                ];

                const socialLinks = [
                    { name: 'Twitter', icon: HiOutlineGlobeAlt, color: '#1DA1F2' },
                    { name: 'GitHub', icon: HiOutlineCode, color: '#ffffff' },
                    { name: 'LinkedIn', icon: HiOutlineShare, color: '#0A66C2' },
                    { name: 'Discord', icon: HiOutlineChat, color: '#5865F2' },
                ];

                const scrollToTop = () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };

                return (
                    <footer style={{
                        padding: '100px 0 40px',
                        position: 'relative',
                        zIndex: 1,
                        overflow: 'hidden',
                    }}>
                        {/* Animated mesh background */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            {/* Gradient orbs */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    width: '400px',
                                    height: '400px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                                    left: '-10%',
                                    top: '20%',
                                    filter: 'blur(60px)',
                                }}
                                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                                transition={{ duration: 10, repeat: Infinity }}
                            />
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    width: '300px',
                                    height: '300px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
                                    right: '10%',
                                    bottom: '30%',
                                    filter: 'blur(60px)',
                                }}
                                animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                                transition={{ duration: 12, repeat: Infinity }}
                            />

                            {/* Floating particles */}
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: '3px',
                                        height: '3px',
                                        borderRadius: '50%',
                                        background: ['#8b5cf6', '#06b6d4', '#ec4899'][i % 3],
                                        left: `${10 + i * 6}%`,
                                        top: `${20 + (i % 5) * 15}%`,
                                        opacity: 0.4,
                                    }}
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.2, 0.5, 0.2],
                                    }}
                                    transition={{
                                        duration: 4 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Top gradient border */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #ec4899, transparent)',
                                opacity: 0.5,
                            }}
                            animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        />

                        <div style={styles.container}>
                            {/* Main footer content */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '50px',
                                    marginBottom: '60px',
                                    position: 'relative',
                                }}
                            >
                                {/* Brand column */}
                                <div>
                                    {/* Animated logo */}
                                    <motion.div
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <motion.div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                            }}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            {/* Logo glow */}
                                            <motion.div
                                                style={{
                                                    position: 'absolute',
                                                    inset: -5,
                                                    borderRadius: '18px',
                                                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                    filter: 'blur(15px)',
                                                    opacity: 0.4,
                                                }}
                                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <HiOutlineSparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                                            </motion.div>
                                        </motion.div>
                                        <span style={{ fontSize: '20px', fontWeight: '800' }}>Workspace</span>
                                    </motion.div>

                                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, marginBottom: '24px', maxWidth: '280px' }}>
                                        The all-in-one productivity platform for modern teams and individuals. Transform the way you work.
                                    </p>

                                    {/* Newsletter signup */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', fontWeight: '500' }}>
                                            Subscribe to our newsletter
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <motion.div
                                                style={{ position: 'relative', flex: 1 }}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                    }}
                                                />
                                            </motion.div>
                                            <motion.button
                                                onClick={() => {
                                                    if (email) {
                                                        setIsSubscribed(true);
                                                        setTimeout(() => setIsSubscribed(false), 3000);
                                                    }
                                                }}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: isSubscribed ? '#10b981' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isSubscribed ? (
                                                    <>
                                                        <HiOutlineCheck style={{ width: '16px', height: '16px' }} />
                                                        Done
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiOutlineMail style={{ width: '16px', height: '16px' }} />
                                                        Join
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Link columns */}
                                {footerLinks.map((col, colIndex) => (
                                    <motion.div
                                        key={colIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * colIndex }}
                                    >
                                        <motion.h4
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                marginBottom: '20px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <motion.div
                                                animate={{ rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, delay: colIndex * 0.5 }}
                                            >
                                                {colIndex === 0 && <HiOutlineCube style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />}
                                                {colIndex === 1 && <HiOutlineUsers style={{ width: '16px', height: '16px', color: '#06b6d4' }} />}
                                                {colIndex === 2 && <HiOutlineShieldCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />}
                                            </motion.div>
                                            {col.title}
                                        </motion.h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {col.links.map((link, linkIndex) => {
                                                const linkId = `${colIndex}-${linkIndex}`;
                                                const isHovered = hoveredLink === linkId;
                                                return (
                                                    <motion.li
                                                        key={link.name}
                                                        style={{ marginBottom: '14px' }}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: 0.05 * linkIndex }}
                                                    >
                                                        <motion.a
                                                            href={link.href || '#'}
                                                            onMouseEnter={() => setHoveredLink(linkId)}
                                                            onMouseLeave={() => setHoveredLink(null)}
                                                            style={{
                                                                color: isHovered ? 'white' : '#6b7280',
                                                                textDecoration: 'none',
                                                                fontSize: '14px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                            }}
                                                            whileHover={{ x: 5 }}
                                                        >
                                                            <motion.div
                                                                animate={{
                                                                    scale: isHovered ? 1.2 : 1,
                                                                    rotate: isHovered ? 10 : 0,
                                                                }}
                                                            >
                                                                <link.icon style={{
                                                                    width: '14px',
                                                                    height: '14px',
                                                                    color: isHovered ? '#8b5cf6' : '#6b7280',
                                                                }} />
                                                            </motion.div>
                                                            {link.name}
                                                            <motion.span
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{
                                                                    opacity: isHovered ? 1 : 0,
                                                                    x: isHovered ? 0 : -10,
                                                                }}
                                                            >
                                                                <HiOutlineArrowRight style={{ width: '12px', height: '12px' }} />
                                                            </motion.span>
                                                        </motion.a>
                                                    </motion.li>
                                                );
                                            })}
                                        </ul>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Bottom section */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                style={{
                                    paddingTop: '40px',
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '24px',
                                }}
                            >
                                {/* Copyright with animated year */}
                                <motion.p
                                    style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <motion.span
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    >
                                        ⚡
                                    </motion.span>
                                    ©
                                    <motion.span
                                        style={{ color: '#8b5cf6', fontWeight: '600' }}
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        2026
                                    </motion.span>
                                    Workspace. Made with
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ color: '#ec4899' }}
                                    >
                                        ❤️
                                    </motion.span>
                                </motion.p>

                                {/* Social links */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {socialLinks.map((social, i) => {
                                        const isHoveredSoc = hoveredSocial === i;
                                        return (
                                            <motion.a
                                                key={social.name}
                                                href="#"
                                                onMouseEnter={() => setHoveredSocial(i)}
                                                onMouseLeave={() => setHoveredSocial(null)}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    background: isHoveredSoc ? `${social.color}20` : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${isHoveredSoc ? social.color + '50' : 'rgba(255,255,255,0.08)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textDecoration: 'none',
                                                    position: 'relative',
                                                }}
                                                whileHover={{ y: -5, scale: 1.1 }}
                                            >
                                                {/* Glow effect */}
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: -5,
                                                        borderRadius: '16px',
                                                        background: social.color,
                                                        filter: 'blur(15px)',
                                                        opacity: isHoveredSoc ? 0.3 : 0,
                                                    }}
                                                />
                                                <motion.div
                                                    animate={isHoveredSoc ? { rotate: 360 } : {}}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <social.icon style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        color: isHoveredSoc ? social.color : '#6b7280',
                                                        position: 'relative',
                                                        zIndex: 1,
                                                    }} />
                                                </motion.div>
                                            </motion.a>
                                        );
                                    })}
                                </div>

                                {/* Back to top button */}
                                <motion.button
                                    onClick={scrollToTop}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                    whileHover={{
                                        y: -3,
                                        background: 'rgba(139,92,246,0.1)',
                                        borderColor: 'rgba(139,92,246,0.3)',
                                        color: 'white',
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.span
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <HiOutlineArrowUp style={{ width: '16px', height: '16px' }} />
                                    </motion.span>
                                    Back to top
                                </motion.button>
                            </motion.div>

                            {/* Decorative bottom wave */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    bottom: -50,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '200px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)',
                                    opacity: 0.5,
                                }}
                                animate={{ width: ['200px', '300px', '200px'] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                        </div>
                    </footer>
                );
            })()}
        </div>
    );
};

export default LandingPage;
