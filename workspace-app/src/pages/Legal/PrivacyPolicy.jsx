import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineEye, HiOutlineUserCircle,
    HiOutlineDatabase, HiOutlineServer, HiOutlineGlobeAlt, HiOutlineMail,
    HiOutlineTrash, HiOutlineDownload, HiOutlineArrowLeft, HiOutlineArrowUp,
    HiOutlineSparkles, HiOutlineFingerPrint, HiOutlineKey, HiOutlineDocumentText
} from 'react-icons/hi';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showBackToTop, setShowBackToTop] = useState(false);

    const { scrollYProgress } = useScroll({ target: containerRef });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

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
            icon: HiOutlineDatabase,
            title: 'Data We Collect',
            color: '#8b5cf6',
            content: [
                'Account information (name, email, profile picture)',
                'Usage data and analytics for service improvement',
                'Device information for security purposes',
                'Content you create, upload, or share within the platform'
            ]
        },
        {
            icon: HiOutlineEye,
            title: 'How We Use Your Data',
            color: '#06b6d4',
            content: [
                'Providing and personalizing our services',
                'Communicating important updates and features',
                'Improving user experience through analytics',
                'Ensuring platform security and preventing fraud'
            ]
        },
        {
            icon: HiOutlineLockClosed,
            title: 'Data Protection',
            color: '#10b981',
            content: [
                'End-to-end encryption for sensitive data',
                'Regular security audits and penetration testing',
                'Secure data centers with 99.9% uptime',
                'Compliance with GDPR, CCPA, and other regulations'
            ]
        },
        {
            icon: HiOutlineServer,
            title: 'Data Storage',
            color: '#f59e0b',
            content: [
                'Data stored on secure cloud infrastructure',
                'Automated backups with disaster recovery',
                'Regional data centers for optimal performance',
                'Data retention policies aligned with legal requirements'
            ]
        },
        {
            icon: HiOutlineUserCircle,
            title: 'Your Rights',
            color: '#ec4899',
            content: [
                'Access and download your personal data anytime',
                'Request data correction or deletion',
                'Opt-out of marketing communications',
                'Data portability to other services'
            ]
        },
        {
            icon: HiOutlineGlobeAlt,
            title: 'Third-Party Services',
            color: '#6366f1',
            content: [
                'Integration partners adhere to our privacy standards',
                'No selling of personal data to third parties',
                'Transparent disclosure of data sharing practices',
                'Regular review of third-party compliance'
            ]
        }
    ];

    // Floating DNA Helix Animation
    const DNAHelix = () => (
        <div style={{ position: 'absolute', right: '10%', top: '20%', opacity: 0.3 }}>
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '60px'
                    }}
                    animate={{
                        y: [i * 40, i * 40 + 10, i * 40],
                        rotateY: [0, 360]
                    }}
                    transition={{
                        duration: 4,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    <motion.div
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#8b5cf6'
                        }}
                        animate={{
                            x: [0, 30, 0, -30, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.15,
                            repeat: Infinity
                        }}
                    />
                    <motion.div
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#06b6d4'
                        }}
                        animate={{
                            x: [0, -30, 0, 30, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.15,
                            repeat: Infinity
                        }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            left: '6px',
                            width: '60px',
                            height: '2px',
                            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                            transformOrigin: 'center'
                        }}
                        animate={{
                            rotate: [0, 180, 360],
                            scaleX: [1, 0.5, 1]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.15,
                            repeat: Infinity
                        }}
                    />
                </motion.div>
            ))}
        </div>
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
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(40px)'
                }}
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            />

            {/* Progress bar */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
                    transformOrigin: 'left',
                    zIndex: 100,
                    scaleX: scrollYProgress
                }}
            />

            {/* Floating particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'fixed',
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        borderRadius: '50%',
                        background: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][i % 4],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.1, 0.5, 0.1]
                    }}
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                />
            ))}

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
                {/* Background geometric shapes */}
                <motion.div
                    style={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        border: '1px solid rgba(139,92,246,0.1)',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        border: '1px solid rgba(6,182,212,0.1)',
                        borderRadius: '50%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    animate={{ rotate: -360, scale: [1, 0.9, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />

                <DNAHelix />

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
                    whileHover={{ scale: 1.05, borderColor: 'rgba(139,92,246,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HiOutlineArrowLeft />
                    Back to Home
                </motion.button>

                {/* Hero content */}
                <div style={{ textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
                    {/* Animated shield icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 1.5 }}
                        style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 40px',
                            position: 'relative'
                        }}
                    >
                        <motion.div
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '30px',
                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 60px rgba(139,92,246,0.4)'
                            }}
                            animate={{
                                boxShadow: [
                                    '0 0 60px rgba(139,92,246,0.4)',
                                    '0 0 80px rgba(6,182,212,0.4)',
                                    '0 0 60px rgba(139,92,246,0.4)'
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <HiOutlineShieldCheck style={{ width: '60px', height: '60px', color: 'white' }} />
                            </motion.div>
                        </motion.div>

                        {/* Orbiting elements */}
                        {[HiOutlineFingerPrint, HiOutlineKey, HiOutlineLockClosed].map((Icon, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    rotate: 360
                                }}
                                transition={{
                                    duration: 8 + i * 2,
                                    repeat: Infinity,
                                    ease: 'linear'
                                }}
                                style={{
                                    position: 'absolute',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)',
                                    top: '50%',
                                    left: '50%',
                                    transformOrigin: `${80 + i * 20}px 0`
                                }}
                            >
                                <Icon style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
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
                            background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Privacy Policy
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
                        Your privacy matters to us. Learn how we collect, use, and protect your personal information.
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
                        <span>Last updated: January 2026</span>
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
                        <span style={{ fontSize: '12px' }}>Scroll to explore</span>
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
                                    background: '#8b5cf6'
                                }}
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Content Sections */}
            <section style={{ padding: '100px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            onViewportEnter={() => setActiveSection(index)}
                            style={{
                                marginBottom: '80px',
                                position: 'relative'
                            }}
                        >
                            {/* Connection line */}
                            {index < sections.length - 1 && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    whileInView={{ scaleY: 1 }}
                                    viewport={{ once: true }}
                                    style={{
                                        position: 'absolute',
                                        left: '32px',
                                        top: '80px',
                                        width: '2px',
                                        height: 'calc(100% + 40px)',
                                        background: `linear-gradient(180deg, ${section.color}, transparent)`,
                                        transformOrigin: 'top'
                                    }}
                                />
                            )}

                            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                {/* Icon */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '20px',
                                        background: `linear-gradient(135deg, ${section.color}30, ${section.color}10)`,
                                        border: `1px solid ${section.color}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        position: 'relative'
                                    }}
                                >
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            inset: -10,
                                            borderRadius: '30px',
                                            background: section.color,
                                            filter: 'blur(20px)',
                                            opacity: 0
                                        }}
                                        whileHover={{ opacity: 0.3 }}
                                    />
                                    <section.icon style={{ width: '28px', height: '28px', color: section.color }} />
                                </motion.div>

                                {/* Content card */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    style={{
                                        flex: 1,
                                        padding: '32px',
                                        borderRadius: '24px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(10px)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Hover gradient */}
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '200px',
                                            height: '200px',
                                            background: `radial-gradient(circle, ${section.color}10 0%, transparent 70%)`,
                                            opacity: 0
                                        }}
                                        whileHover={{ opacity: 1 }}
                                    />

                                    <h3 style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        marginBottom: '20px',
                                        color: 'white'
                                    }}>
                                        {section.title}
                                    </h3>

                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {section.content.map((item, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
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
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                    style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: section.color,
                                                        marginTop: '8px',
                                                        flexShrink: 0
                                                    }}
                                                />
                                                {item}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
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
                        maxWidth: '600px',
                        margin: '0 auto',
                        padding: '48px',
                        borderRadius: '32px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <HiOutlineMail style={{ width: '40px', height: '40px', color: '#a78bfa' }} />
                    </motion.div>

                    <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                        Questions About Your Privacy?
                    </h3>
                    <p style={{ color: '#9ca3af', marginBottom: '32px', lineHeight: 1.6 }}>
                        If you have any questions about this Privacy Policy or our practices,
                        please don't hesitate to contact our data protection team.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <HiOutlineMail />
                        Contact Privacy Team
                    </motion.button>
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
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 40px rgba(139,92,246,0.4)',
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

export default PrivacyPolicy;
