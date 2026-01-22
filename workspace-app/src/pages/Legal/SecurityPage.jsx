import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineFingerPrint, HiOutlineKey,
    HiOutlineServer, HiOutlineEye, HiOutlineCloudUpload, HiOutlineRefresh,
    HiOutlineCheckCircle, HiOutlineArrowLeft, HiOutlineArrowUp, HiOutlineDatabase,
    HiOutlineGlobe, HiOutlineChip, HiOutlineBadgeCheck, HiOutlineDesktopComputer,
    HiOutlineDocumentReport, HiOutlineUserGroup
} from 'react-icons/hi';

const SecurityPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [isScanning, setIsScanning] = useState(false);

    const { scrollYProgress } = useScroll({ target: containerRef });

    // Matrix rain effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const charArray = chars.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#8b5cf620';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = charArray[Math.floor(Math.random() * charArray.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        return () => clearInterval(interval);
    }, []);

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

    // Simulate security scan
    const startScan = useCallback(() => {
        setIsScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsScanning(false), 1000);
                    return 100;
                }
                return prev + Math.random() * 3;
            });
        }, 50);
    }, []);

    const securityFeatures = [
        {
            icon: HiOutlineLockClosed,
            title: 'End-to-End Encryption',
            color: '#8b5cf6',
            description: 'All your data is encrypted using AES-256 encryption, the same standard used by banks and governments worldwide.',
            stats: '256-bit'
        },
        {
            icon: HiOutlineFingerPrint,
            title: 'Two-Factor Authentication',
            color: '#06b6d4',
            description: 'Add an extra layer of security with 2FA using authenticator apps, SMS, or biometric verification.',
            stats: '2FA'
        },
        {
            icon: HiOutlineServer,
            title: 'Secure Infrastructure',
            color: '#10b981',
            description: 'Our servers are hosted in SOC 2 Type II certified data centers with 24/7 monitoring and redundancy.',
            stats: '99.99%'
        },
        {
            icon: HiOutlineEye,
            title: 'Privacy by Design',
            color: '#f59e0b',
            description: 'We collect only essential data and never sell your information to third parties. Your privacy is our priority.',
            stats: 'GDPR'
        },
        {
            icon: HiOutlineRefresh,
            title: 'Regular Security Audits',
            color: '#ec4899',
            description: 'Independent security firms perform penetration testing and vulnerability assessments quarterly.',
            stats: 'Quarterly'
        },
        {
            icon: HiOutlineCloudUpload,
            title: 'Automated Backups',
            color: '#6366f1',
            description: 'Your data is automatically backed up every hour with point-in-time recovery capabilities.',
            stats: 'Hourly'
        }
    ];

    const certifications = [
        { name: 'SOC 2 Type II', icon: HiOutlineBadgeCheck, color: '#8b5cf6' },
        { name: 'GDPR Compliant', icon: HiOutlineGlobe, color: '#06b6d4' },
        { name: 'ISO 27001', icon: HiOutlineDocumentReport, color: '#10b981' },
        { name: 'CCPA Compliant', icon: HiOutlineUserGroup, color: '#f59e0b' }
    ];

    // Animated Shield Component
    const AnimatedShield = () => (
        <motion.div
            style={{
                position: 'relative',
                width: '200px',
                height: '240px',
                margin: '0 auto 40px'
            }}
        >
            {/* Main shield */}
            <motion.div
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 1.5 }}
                style={{
                    width: '160px',
                    height: '200px',
                    margin: '0 auto',
                    position: 'relative',
                    clipPath: 'polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    boxShadow: '0 20px 60px rgba(16,185,129,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Inner shield */}
                <motion.div
                    style={{
                        width: '120px',
                        height: '150px',
                        clipPath: 'polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    animate={{ scale: [1, 0.95, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <HiOutlineCheckCircle style={{ width: '48px', height: '48px', color: 'white' }} />
                    </motion.div>
                </motion.div>

                {/* Scanning line */}
                <motion.div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                        boxShadow: '0 0 20px rgba(255,255,255,0.5)'
                    }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </motion.div>

            {/* Orbiting particles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: ['#8b5cf6', '#06b6d4', '#10b981', '#ec4899'][i % 4],
                        top: '50%',
                        left: '50%',
                        boxShadow: `0 0 10px ${['#8b5cf6', '#06b6d4', '#10b981', '#ec4899'][i % 4]}`
                    }}
                    animate={{
                        x: Math.cos((i * Math.PI * 2) / 8 + Date.now() / 1000) * 120 - 6,
                        y: Math.sin((i * Math.PI * 2) / 8 + Date.now() / 1000) * 120 - 6
                    }}
                    transition={{
                        duration: 0.1,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                >
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: -4,
                            borderRadius: '50%',
                            background: ['#8b5cf6', '#06b6d4', '#10b981', '#ec4899'][i % 4],
                            opacity: 0.3,
                            filter: 'blur(6px)'
                        }}
                    />
                </motion.div>
            ))}

            {/* Pulse rings */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '160px',
                        height: '200px',
                        transform: 'translate(-50%, -50%)',
                        clipPath: 'polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)',
                        border: '2px solid rgba(16,185,129,0.3)',
                        background: 'transparent'
                    }}
                    animate={{
                        scale: [1, 1.5, 2],
                        opacity: [0.5, 0.2, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: 'easeOut'
                    }}
                />
            ))}
        </motion.div>
    );

    // Hexagonal Grid Background
    const HexGrid = () => (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.1 }}>
            {[...Array(30)].map((_, i) => {
                const row = Math.floor(i / 6);
                const col = i % 6;
                const offset = row % 2 === 0 ? 0 : 80;
                return (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '100px',
                            height: '100px',
                            left: col * 160 + offset,
                            top: row * 90,
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            border: '1px solid #10b981',
                            background: 'transparent'
                        }}
                        animate={{
                            borderColor: ['rgba(16,185,129,0.2)', 'rgba(139,92,246,0.2)', 'rgba(16,185,129,0.2)'],
                            scale: [1, 1.02, 1]
                        }}
                        transition={{
                            duration: 4,
                            delay: i * 0.1,
                            repeat: Infinity
                        }}
                    />
                );
            })}
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
            {/* Matrix rain canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    opacity: 0.3,
                    zIndex: 0
                }}
            />

            {/* Dynamic cursor follower */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 1,
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
                    background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)',
                    transformOrigin: 'left',
                    zIndex: 100,
                    scaleX: scrollYProgress
                }}
            />

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
                <HexGrid />

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
                        backdropFilter: 'blur(10px)',
                        zIndex: 10
                    }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(16,185,129,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HiOutlineArrowLeft />
                    Back to Home
                </motion.button>

                {/* Hero content */}
                <div style={{ textAlign: 'center', zIndex: 1, padding: '0 20px' }}>
                    <AnimatedShield />

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: 'clamp(40px, 8vw, 80px)',
                            fontWeight: '800',
                            marginBottom: '24px',
                            lineHeight: 1.1
                        }}
                    >
                        <span style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Enterprise Security
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            maxWidth: '600px',
                            margin: '0 auto 40px',
                            lineHeight: 1.6
                        }}
                    >
                        Bank-level security protecting your data 24/7.
                        Your trust is our top priority.
                    </motion.p>

                    {/* Security scan button */}
                    <motion.button
                        onClick={startScan}
                        disabled={isScanning}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '16px',
                            border: 'none',
                            background: isScanning
                                ? 'rgba(16,185,129,0.2)'
                                : 'linear-gradient(135deg, #10b981, #06b6d4)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isScanning ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            minWidth: '220px'
                        }}
                        whileHover={!isScanning ? { scale: 1.05 } : {}}
                        whileTap={!isScanning ? { scale: 0.95 } : {}}
                    >
                        {isScanning && (
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                                    zIndex: 0
                                }}
                                animate={{ width: `${scanProgress}%` }}
                            />
                        )}
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isScanning ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                                    </motion.div>
                                    {scanProgress >= 100 ? 'Secure!' : `Scanning... ${Math.floor(scanProgress)}%`}
                                </>
                            ) : (
                                <>
                                    <HiOutlineShieldCheck style={{ width: '20px', height: '20px' }} />
                                    Run Security Check
                                </>
                            )}
                        </span>
                    </motion.button>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
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
                        <span style={{ fontSize: '12px' }}>Explore our security</span>
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
                                    background: '#10b981'
                                }}
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Security Features Grid */}
            <section style={{ padding: '100px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                            Multi-Layer Protection
                        </span>
                    </motion.h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                        gap: '24px'
                    }}>
                        {securityFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ delay: index * 0.1 }}
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    padding: '32px',
                                    borderRadius: '24px',
                                    background: hoveredCard === index
                                        ? `linear-gradient(135deg, ${feature.color}15, rgba(255,255,255,0.03))`
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${hoveredCard === index ? feature.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Glow effect */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '200px',
                                        height: '200px',
                                        background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
                                        opacity: hoveredCard === index ? 1 : 0,
                                        transition: 'opacity 0.3s'
                                    }}
                                />

                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <motion.div
                                        animate={hoveredCard === index ? { rotate: 360, scale: 1.1 } : {}}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '20px',
                                            background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                                            border: `1px solid ${feature.color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <feature.icon style={{ width: '28px', height: '28px', color: feature.color }} />
                                    </motion.div>

                                    {/* Stats badge */}
                                    <motion.div
                                        animate={hoveredCard === index ? { scale: 1.1 } : {}}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            background: `${feature.color}20`,
                                            border: `1px solid ${feature.color}40`,
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: feature.color
                                        }}
                                    >
                                        {feature.stats}
                                    </motion.div>
                                </div>

                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    marginBottom: '12px',
                                    color: 'white'
                                }}>
                                    {feature.title}
                                </h3>

                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '15px',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>

                                {/* Animated underline */}
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        height: '3px',
                                        background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                                        width: hoveredCard === index ? '100%' : '0%',
                                        transition: 'width 0.3s'
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ padding: '100px 24px', position: 'relative' }}
            >
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            marginBottom: '20px'
                        }}
                    >
                        <span style={{
                            background: 'linear-gradient(135deg, #fff, #9ca3af)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Certifications & Compliance
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        style={{
                            color: '#6b7280',
                            fontSize: '18px',
                            marginBottom: '60px'
                        }}
                    >
                        We maintain the highest standards of security and compliance
                    </motion.p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '24px',
                        flexWrap: 'wrap'
                    }}>
                        {certifications.map((cert, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, type: 'spring' }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                style={{
                                    padding: '24px 32px',
                                    borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: `${cert.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <cert.icon style={{ width: '24px', height: '24px', color: cert.color }} />
                                </motion.div>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>{cert.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
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
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))',
                        border: '1px solid rgba(16,185,129,0.2)',
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
                            background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #10b981)',
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
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <HiOutlineLockClosed style={{ width: '40px', height: '40px', color: '#10b981' }} />
                    </motion.div>

                    <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                        Your Security is Our Priority
                    </h3>
                    <p style={{ color: '#9ca3af', marginBottom: '32px', lineHeight: 1.6 }}>
                        Have questions about our security practices?
                        Our security team is here to help.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                        <HiOutlineShieldCheck />
                        Contact Security Team
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
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 40px rgba(16,185,129,0.4)',
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

export default SecurityPage;
