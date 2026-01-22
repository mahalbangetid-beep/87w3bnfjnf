import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineDocumentText, HiOutlinePencil, HiOutlineEye,
    HiOutlineGlobeAlt, HiOutlineLockClosed, HiOutlineShieldCheck,
    HiOutlineInformationCircle, HiOutlineExternalLink
} from 'react-icons/hi';
import { pagesAPI } from '../../services/api';

const PagesList = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Static pages configuration
    const staticPages = [
        {
            slug: 'about',
            icon: HiOutlineInformationCircle,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            description: 'Your company story, mission, values, and team information'
        },
        {
            slug: 'privacy',
            icon: HiOutlineLockClosed,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            description: 'Privacy policy explaining how you handle user data'
        },
        {
            slug: 'terms',
            icon: HiOutlineDocumentText,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            description: 'Terms of service and conditions for using your platform'
        },
        {
            slug: 'security',
            icon: HiOutlineShieldCheck,
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            description: 'Security measures and compliance information'
        }
    ];

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const data = await pagesAPI.getAll();
            setPages(data);
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPageData = (slug) => {
        return pages.find(p => p.slug === slug) || null;
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
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
                        border: '3px solid rgba(139,92,246,0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg, #ffffff, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    📄 Manage Pages
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ color: '#9ca3af', fontSize: '15px' }}
                >
                    Edit the content of your static pages. Changes will be reflected immediately.
                </motion.p>
            </div>

            {/* Pages Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
            }}>
                {staticPages.map((pageConfig, index) => {
                    const pageData = getPageData(pageConfig.slug);
                    const Icon = pageConfig.icon;
                    const isCustomized = pageData && !pageData.isDefault;

                    return (
                        <motion.div
                            key={pageConfig.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, boxShadow: `0 20px 40px ${pageConfig.color}20` }}
                            style={{
                                padding: '28px',
                                borderRadius: '20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => navigate(`/blog-admin/pages/${pageConfig.slug}`)}
                        >
                            {/* Background gradient on hover */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: pageConfig.gradient,
                                opacity: 0.03,
                                transition: 'opacity 0.3s'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* Icon & Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: pageConfig.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {isCustomized ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: 'rgba(16,185,129,0.2)',
                                                color: '#10b981',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                Customized
                                            </span>
                                        ) : (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: 'rgba(107,114,128,0.2)',
                                                color: '#9ca3af',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    marginBottom: '8px',
                                    textTransform: 'capitalize',
                                    color: 'white'
                                }}>
                                    {pageData?.title || pageConfig.slug.replace('-', ' ')} Page
                                </h3>

                                {/* Description */}
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    marginBottom: '20px'
                                }}>
                                    {pageConfig.description}
                                </p>

                                {/* Last Updated */}
                                {pageData?.updatedAt && (
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        marginBottom: '20px'
                                    }}>
                                        Last updated: {new Date(pageData.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/blog-admin/pages/${pageConfig.slug}`);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: pageConfig.gradient,
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                                        Edit Page
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/${pageConfig.slug}`, '_blank');
                                        }}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'transparent',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <HiOutlineExternalLink style={{ width: '18px', height: '18px' }} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '40px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(139,92,246,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <HiOutlineGlobeAlt style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                </div>
                <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                        Pro Tip
                    </h4>
                    <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
                        All changes are saved automatically when you click "Save Changes". You can reset any page
                        to its default content at any time. The About page uses a section-based editor for complex
                        layouts, while Privacy, Terms, and Security pages use a rich text editor.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PagesList;
