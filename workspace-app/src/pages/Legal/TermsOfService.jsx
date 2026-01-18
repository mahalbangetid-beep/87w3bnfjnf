import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineDocumentText, HiOutlineScale, HiOutlineUserGroup, HiOutlineBan,
    HiOutlineRefresh, HiOutlineExclamationCircle, HiOutlineCreditCard, HiOutlineGlobe,
    HiOutlineClipboardCheck, HiOutlineArrowLeft, HiOutlineArrowUp, HiOutlineSparkles,
    HiOutlineLightningBolt, HiOutlineCheck, HiOutlineX
} from 'react-icons/hi';

const TermsOfService = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [activeCard, setActiveCard] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    const { scrollYProgress } = useScroll({ target: containerRef });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const sections = [
        {
            icon: HiOutlineClipboardCheck,
            title: 'Acceptance of Terms',
            color: '#8b5cf6',
            summary: 'By accessing Workspace, you agree to be bound by these Terms of Service.',
            details: [
                'These terms constitute a legally binding agreement between you and Workspace.',
                'You must be at least 18 years old to use our services.',
                'By creating an account, you confirm that you have read and understood these terms.',
                'We may update these terms at any time, and continued use constitutes acceptance.'
            ]
        },
        {
            icon: HiOutlineUserGroup,
            title: 'User Accounts',
            color: '#06b6d4',
            summary: 'You are responsible for maintaining the security of your account.',
            details: [
                'You must provide accurate and complete information during registration.',
                'You are solely responsible for all activities under your account.',
                'Keep your password confidential and notify us of any unauthorized access.',
                'We reserve the right to suspend accounts that violate these terms.'
            ]
        },
        {
            icon: HiOutlineScale,
            title: 'Acceptable Use',
            color: '#10b981',
            summary: 'Use our services responsibly and in accordance with applicable laws.',
            details: [
                'Do not use the service for any unlawful or unauthorized purpose.',
                'Do not attempt to gain unauthorized access to any systems or networks.',
                'Do not interfere with or disrupt the integrity of our services.',
                'Respect the intellectual property rights of others.'
            ]
        },
        {
            icon: HiOutlineBan,
            title: 'Prohibited Activities',
            color: '#ef4444',
            summary: 'Certain activities are strictly prohibited on our platform.',
            details: [
                'Uploading malicious code, viruses, or harmful content.',
                'Harassing, threatening, or intimidating other users.',
                'Collecting user information without proper consent.',
                'Circumventing any security or access controls.'
            ]
        },
        {
            icon: HiOutlineCreditCard,
            title: 'Payment Terms',
            color: '#f59e0b',
            summary: 'Subscription fees and payment terms for premium features.',
            details: [
                'Subscription fees are billed in advance on a monthly or annual basis.',
                'All fees are non-refundable unless otherwise specified.',
                'We may change pricing with 30 days advance notice.',
                'Failed payments may result in service suspension.'
            ]
        },
        {
            icon: HiOutlineRefresh,
            title: 'Service Modifications',
            color: '#ec4899',
            summary: 'We may modify or discontinue services at any time.',
            details: [
                'We reserve the right to modify or discontinue any feature.',
                'Material changes will be communicated via email or in-app notification.',
                'We are not liable for any modification or discontinuation.',
                'You can export your data before service changes take effect.'
            ]
        },
        {
            icon: HiOutlineExclamationCircle,
            title: 'Limitation of Liability',
            color: '#6366f1',
            summary: 'Our liability is limited to the extent permitted by law.',
            details: [
                'We provide services "as is" without warranties of any kind.',
                'We are not liable for indirect, incidental, or consequential damages.',
                'Our total liability shall not exceed amounts paid by you in the past 12 months.',
                'Some jurisdictions do not allow liability limitations, so these may not apply.'
            ]
        },
        {
            icon: HiOutlineGlobe,
            title: 'Governing Law',
            color: '#14b8a6',
            summary: 'These terms are governed by the laws of our jurisdiction.',
            details: [
                'These terms are governed by the laws of the Republic of Indonesia.',
                'Any disputes shall be resolved in the courts of Jakarta.',
                'You waive any objection to the choice of venue.',
                'These terms do not limit any consumer protection rights.'
            ]
        }
    ];

    // 3D Floating Document Animation
    const FloatingDocument = () => (
        <motion.div
            style={{
                position: 'absolute',
                right: '5%',
                top: '15%',
                perspective: '1000px'
            }}
        >
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        width: '180px',
                        height: '220px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, rgba(139,92,246,${0.1 - i * 0.03}), rgba(6,182,212,${0.05 - i * 0.015}))`,
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'absolute',
                        transformStyle: 'preserve-3d',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}
                    initial={{ rotateY: 15, rotateX: 5 }}
                    animate={{
                        rotateY: [15, 20, 15],
                        rotateX: [5, 10, 5],
                        z: [0, 20, 0],
                        y: [i * 15, i * 15 + 10, i * 15]
                    }}
                    transition={{
                        duration: 4,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    {/* Document lines */}
                    {[...Array(6)].map((_, j) => (
                        <motion.div
                            key={j}
                            style={{
                                height: '8px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.1)',
                                width: j === 0 ? '60%' : j === 5 ? '40%' : '100%'
                            }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, delay: j * 0.1, repeat: Infinity }}
                        />
                    ))}
                </motion.div>
            ))}
        </motion.div>
    );

    // Animated Gavel/Scale
    const AnimatedScale = () => (
        <motion.div
            style={{
                position: 'absolute',
                left: '8%',
                top: '25%',
                opacity: 0.3
            }}
        >
            <motion.div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {/* Scale arm */}
                <motion.div
                    style={{
                        width: '8px',
                        height: '100px',
                        background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)',
                        borderRadius: '4px'
                    }}
                />
                {/* Balance beam */}
                <motion.div
                    style={{
                        width: '120px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                        borderRadius: '2px',
                        transformOrigin: 'center'
                    }}
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Left pan */}
                <motion.div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div style={{ width: '2px', height: '30px', background: '#8b5cf6' }} />
                    <div style={{
                        width: '40px',
                        height: '20px',
                        borderRadius: '0 0 20px 20px',
                        background: 'rgba(139,92,246,0.3)',
                        border: '2px solid #8b5cf6'
                    }} />
                </motion.div>
                {/* Right pan */}
                <motion.div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                    animate={{ y: [10, 0, 10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div style={{ width: '2px', height: '30px', background: '#06b6d4' }} />
                    <div style={{
                        width: '40px',
                        height: '20px',
                        borderRadius: '0 0 20px 20px',
                        background: 'rgba(6,182,212,0.3)',
                        border: '2px solid #06b6d4'
                    }} />
                </motion.div>
            </motion.div>
        </motion.div>
    );

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                overflowX: 'hidden',
                position: 'relative'
            }}
        >
            {/* Dynamic cursor follower */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(60px)'
                }}
                animate={{
                    x: mousePosition.x - 250,
                    y: mousePosition.y - 250
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            />

            {/* Progress bar */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)',
                    transformOrigin: 'left',
                    zIndex: 100,
                    scaleX: scrollYProgress
                }}
            />

            {/* Animated grid background */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                pointerEvents: 'none'
            }} />

            {/* Hero Section */}
            <motion.section
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <FloatingDocument />
                <AnimatedScale />

                {/* Hexagon pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1
                }}>
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: '100px',
                                height: '100px',
                                left: `${(i % 4) * 30}%`,
                                top: `${Math.floor(i / 4) * 35}%`,
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                background: `linear-gradient(135deg, ${['#8b5cf6', '#06b6d4', '#ec4899'][i % 3]}20, transparent)`
                            }}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 10 + i * 2,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                        />
                    ))}
                </div>

                {/* Back button */}
                <motion.button
                    onClick={() => navigate('/')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        backdropFilter: 'blur(10px)'
                    }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(6,182,212,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HiOutlineArrowLeft />
                    Back to Home
                </motion.button>

                {/* Hero content */}
                <div style={{ textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
                    {/* Animated document icon */}
                    <motion.div
                        initial={{ scale: 0, rotateY: -180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ type: 'spring', duration: 1.5 }}
                        style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 40px',
                            position: 'relative',
                            perspective: '1000px'
                        }}
                    >
                        <motion.div
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '30px',
                                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 60px rgba(6,182,212,0.4)',
                                transformStyle: 'preserve-3d'
                            }}
                            animate={{
                                rotateY: [0, 10, 0, -10, 0],
                                boxShadow: [
                                    '0 0 60px rgba(6,182,212,0.4)',
                                    '0 0 80px rgba(139,92,246,0.4)',
                                    '0 0 60px rgba(6,182,212,0.4)'
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <HiOutlineDocumentText style={{ width: '60px', height: '60px', color: 'white' }} />
                        </motion.div>

                        {/* Floating checkmarks */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(16,185,129,0.2)',
                                    border: '1px solid rgba(16,185,129,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                initial={{
                                    x: Math.cos(i * Math.PI / 2) * 80,
                                    y: Math.sin(i * Math.PI / 2) * 80
                                }}
                                animate={{
                                    x: Math.cos(i * Math.PI / 2) * 80 + Math.sin(Date.now() / 1000 + i) * 10,
                                    y: Math.sin(i * Math.PI / 2) * 80 + Math.cos(Date.now() / 1000 + i) * 10,
                                    rotate: [0, 360]
                                }}
                                transition={{
                                    rotate: { duration: 10 + i * 2, repeat: Infinity, ease: 'linear' },
                                    default: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                                }}
                            >
                                <HiOutlineCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 'clamp(40px, 8vw, 80px)',
                            fontWeight: '800',
                            marginBottom: '24px',
                            lineHeight: 1.1
                        }}
                    >
                        <span style={{
                            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Terms of Service
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            maxWidth: '600px',
                            margin: '0 auto 40px',
                            lineHeight: 1.6
                        }}
                    >
                        Please read these terms carefully before using our services.
                        They govern your use of the Workspace platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            color: '#6b7280',
                            fontSize: '14px'
                        }}
                    >
                        <HiOutlineDocumentText />
                        <span>Effective: January 2026</span>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1, duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#6b7280'
                        }}
                    >
                        <span style={{ fontSize: '12px' }}>Scroll to read</span>
                        <motion.div
                            style={{
                                width: '24px',
                                height: '40px',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                justifyContent: 'center',
                                paddingTop: '8px'
                            }}
                        >
                            <motion.div
                                style={{
                                    width: '4px',
                                    height: '8px',
                                    borderRadius: '2px',
                                    background: '#06b6d4'
                                }}
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Accordion Sections */}
            <section style={{ padding: '100px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            textAlign: 'center',
                            marginBottom: '60px'
                        }}
                    >
                        <span style={{
                            background: 'linear-gradient(135deg, #fff, #9ca3af)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Key Terms & Conditions
                        </span>
                    </motion.h2>

                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ delay: index * 0.05 }}
                            style={{ marginBottom: '16px' }}
                        >
                            <motion.div
                                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                style={{
                                    padding: '24px',
                                    borderRadius: expandedSection === index ? '20px 20px 0 0' : '20px',
                                    background: expandedSection === index
                                        ? `linear-gradient(135deg, ${section.color}15, rgba(255,255,255,0.02))`
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${expandedSection === index ? section.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                    borderBottom: expandedSection === index ? 'none' : undefined,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'all 0.3s ease'
                                }}
                                whileHover={{
                                    background: expandedSection === index
                                        ? `linear-gradient(135deg, ${section.color}20, rgba(255,255,255,0.03))`
                                        : 'rgba(255,255,255,0.04)'
                                }}
                            >
                                <motion.div
                                    animate={{
                                        rotate: expandedSection === index ? 360 : 0,
                                        scale: expandedSection === index ? 1.1 : 1
                                    }}
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${section.color}30, ${section.color}10)`,
                                        border: `1px solid ${section.color}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <section.icon style={{ width: '24px', height: '24px', color: section.color }} />
                                </motion.div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        marginBottom: '4px',
                                        color: 'white'
                                    }}>
                                        {section.title}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                        {section.summary}
                                    </p>
                                </div>

                                <motion.div
                                    animate={{ rotate: expandedSection === index ? 180 : 0 }}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                            </motion.div>

                            <AnimatePresence>
                                {expandedSection === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{
                                            padding: '24px 24px 24px 100px',
                                            background: `linear-gradient(135deg, ${section.color}08, rgba(255,255,255,0.01))`,
                                            border: `1px solid ${section.color}40`,
                                            borderTop: 'none',
                                            borderRadius: '0 0 20px 20px'
                                        }}>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {section.details.map((detail, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '12px',
                                                            marginBottom: '16px',
                                                            color: '#9ca3af',
                                                            fontSize: '15px',
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '6px',
                                                                background: `${section.color}20`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                                marginTop: '2px'
                                                            }}
                                                        >
                                                            <HiOutlineCheck style={{ width: '12px', height: '12px', color: section.color }} />
                                                        </motion.div>
                                                        {detail}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Agreement Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{
                    padding: '100px 24px',
                    textAlign: 'center',
                    position: 'relative'
                }}
            >
                <motion.div
                    style={{
                        maxWidth: '700px',
                        margin: '0 auto',
                        padding: '48px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(139,92,246,0.05))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated border */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: -2,
                            borderRadius: '34px',
                            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6)',
                            backgroundSize: '300% 100%',
                            zIndex: -1,
                            opacity: 0.3
                        }}
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    />

                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <HiOutlineClipboardCheck style={{ width: '40px', height: '40px', color: '#10b981' }} />
                    </motion.div>

                    <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                        By Using Workspace, You Agree
                    </h3>
                    <p style={{ color: '#9ca3af', marginBottom: '32px', lineHeight: 1.6 }}>
                        Your continued use of our services constitutes acceptance of these terms.
                        If you have any questions, please contact our legal team.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '16px 32px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <HiOutlineCheck />
                            I Agree & Continue
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            style={{
                                padding: '16px 32px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: '#9ca3af',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <HiOutlineX />
                            Decline
                        </motion.button>
                    </div>
                </motion.div>
            </motion.section>

            {/* Back to top button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            right: '40px',
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 40px rgba(6,182,212,0.4)',
                            zIndex: 100
                        }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <HiOutlineArrowUp style={{ width: '24px', height: '24px' }} />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TermsOfService;
