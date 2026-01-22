import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HiOutlineArrowLeft, HiOutlineArrowUp, HiOutlineLockClosed,
    HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlinePrinter,
    HiOutlineMail
} from 'react-icons/hi';
import { pagesAPI } from '../../services/api';

const DynamicLegalPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Extract slug from path (e.g., /privacy -> privacy)
    const pageSlug = location.pathname.replace('/', '');
    const containerRef = useRef(null);

    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({ target: containerRef });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    // Page configurations
    const pageConfigs = {
        privacy: {
            icon: HiOutlineLockClosed,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            emoji: '🔒'
        },
        terms: {
            icon: HiOutlineDocumentText,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            emoji: '📜'
        },
        security: {
            icon: HiOutlineShieldCheck,
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            emoji: '🛡️'
        }
    };

    const config = pageConfigs[pageSlug] || pageConfigs.privacy;

    useEffect(() => {
        fetchPage();

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
    }, [pageSlug]);

    // Default content fallback
    const defaultPageContent = {
        privacy: {
            title: 'Privacy Policy',
            subtitle: 'Your privacy is important to us',
            content: '<h2>1. Introduction</h2><p>This Privacy Policy explains how we collect and use your information.</p><h2>2. Information We Collect</h2><p>We collect information you provide directly to us.</p><h2>3. How We Use Your Information</h2><p>We use the information to provide and improve our services.</p><h2>4. Contact Us</h2><p>Contact us at privacy@workspace.app</p>'
        },
        terms: {
            title: 'Terms of Service',
            subtitle: 'Please read these terms carefully',
            content: '<h2>1. Acceptance of Terms</h2><p>By using this service, you agree to these terms.</p><h2>2. Use of Service</h2><p>You agree to use the service lawfully.</p><h2>3. User Accounts</h2><p>You are responsible for your account.</p><h2>4. Contact Us</h2><p>Contact us at legal@workspace.app</p>'
        },
        security: {
            title: 'Security',
            subtitle: 'Your security is our priority',
            content: '<h2>Our Commitment</h2><p>We take security seriously.</p><h2>Data Encryption</h2><p>All data is encrypted using TLS 1.3.</p><h2>Infrastructure</h2><p>SOC 2 Type II certified data centers.</p><h2>Contact</h2><p>Report issues to security@workspace.app</p>'
        }
    };

    const fetchPage = async () => {
        setLoading(true);
        try {
            const data = await pagesAPI.getPublic(pageSlug);
            setPage(data);
        } catch (error) {
            console.error('Error fetching page:', error);
            // Use default content as fallback
            if (defaultPageContent[pageSlug]) {
                setPage(defaultPageContent[pageSlug]);
            }
        } finally {
            setLoading(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#050508',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '48px',
                        height: '48px',
                        border: `3px solid ${config.color}30`,
                        borderTopColor: config.color,
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    if (!page) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#050508',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '64px' }}>📄</span>
                    <h1 style={{ marginTop: '20px' }}>Page Not Found</h1>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: config.gradient,
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const Icon = config.icon;

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '100vh',
                background: '#050508',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                position: 'relative',
                overflowX: 'hidden'
            }}
        >
            {/* Custom styles for content */}
            <style>{`
                .legal-content h1 { font-size: 2em; font-weight: 700; margin: 32px 0 16px; color: #f3f4f6; }
                .legal-content h2 { font-size: 1.5em; font-weight: 600; margin: 28px 0 14px; color: ${config.color}; }
                .legal-content h3 { font-size: 1.25em; font-weight: 600; margin: 24px 0 12px; color: #d1d5db; }
                .legal-content p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
                .legal-content ul, .legal-content ol { 
                    color: #9ca3af; 
                    padding-left: 24px; 
                    margin-bottom: 16px;
                }
                .legal-content li { 
                    margin-bottom: 10px; 
                    line-height: 1.7;
                    position: relative;
                }
                .legal-content ul li::marker { color: ${config.color}; }
                .legal-content a { color: ${config.color}; text-decoration: underline; }
                .legal-content strong { color: #f3f4f6; }
                .legal-content blockquote {
                    border-left: 4px solid ${config.color};
                    padding-left: 20px;
                    margin: 20px 0;
                    color: #9ca3af;
                    font-style: italic;
                }
            `}</style>

            {/* Animated background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100vh',
                    background: `radial-gradient(ellipse at 50% 0%, ${config.color}15 0%, transparent 50%)`,
                    y: backgroundY,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Mouse follower */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${config.color}08 0%, transparent 60%)`,
                    pointerEvents: 'none',
                    zIndex: 1,
                    filter: 'blur(30px)'
                }}
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 100 }}
            />

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    background: 'rgba(5,5,8,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <motion.button
                    onClick={() => navigate(-1)}
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    <HiOutlineArrowLeft style={{ width: '18px', height: '18px' }} />
                    Back
                </motion.button>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        onClick={() => window.print()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: '#9ca3af',
                            cursor: 'pointer'
                        }}
                    >
                        <HiOutlinePrinter style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                    <motion.button
                        onClick={() => window.location.href = 'mailto:support@workspace.app'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: '#9ca3af',
                            cursor: 'pointer'
                        }}
                    >
                        <HiOutlineMail style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '100px',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 24px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '30px',
                            background: config.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            boxShadow: `0 20px 60px ${config.color}40`
                        }}
                    >
                        <Icon style={{ width: '48px', height: '48px', color: 'white' }} />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: 'clamp(36px, 6vw, 56px)',
                            fontWeight: '800',
                            marginBottom: '16px',
                            background: `linear-gradient(135deg, #ffffff, ${config.color})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {page.title}
                    </motion.h1>

                    {page.subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                fontSize: '18px',
                                color: '#9ca3af',
                                marginBottom: '24px'
                            }}
                        >
                            {page.subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '100px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '13px',
                            color: '#6b7280'
                        }}
                    >
                        Last updated: {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Recently'}
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 24px 100px',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        padding: '48px',
                        borderRadius: '24px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div
                        className="legal-content"
                        dangerouslySetInnerHTML={{ __html: page.content || '<p>No content available.</p>' }}
                    />
                </motion.div>

                {/* Contact Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        marginTop: '40px',
                        padding: '32px',
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${config.color}10, transparent)`,
                        border: `1px solid ${config.color}30`,
                        textAlign: 'center'
                    }}
                >
                    <span style={{ fontSize: '40px' }}>{config.emoji}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '16px 0 8px' }}>
                        Have Questions?
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
                        If you have any questions about this policy, please contact us.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = 'mailto:support@workspace.app'}
                        style={{
                            padding: '14px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            background: config.gradient,
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Contact Support
                    </motion.button>
                </motion.div>
            </section>

            {/* Back to top button */}
            {showBackToTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={scrollToTop}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        bottom: '32px',
                        right: '32px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        background: config.gradient,
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 10px 30px ${config.color}40`,
                        zIndex: 100
                    }}
                >
                    <HiOutlineArrowUp style={{ width: '24px', height: '24px' }} />
                </motion.button>
            )}

            {/* Footer */}
            <footer style={{
                padding: '40px 24px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    © {new Date().getFullYear()} Workspace. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default DynamicLegalPage;
