import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    HiOutlineCalendar, HiOutlineClock, HiOutlineEye, HiOutlineHeart,
    HiOutlineShare, HiOutlineBookmark, HiOutlineArrowLeft, HiOutlineArrowUp,
    HiOutlineTag, HiOutlineFolder, HiOutlineChat,
    HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineLink, HiOutlineX
} from 'react-icons/hi';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp, FaCopy } from 'react-icons/fa';
import api from '../../services/api';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTOC, setShowTOC] = useState(false);
    const [tableOfContents, setTableOfContents] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [readingProgress, setReadingProgress] = useState(0);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    // Comment form
    const [commentForm, setCommentForm] = useState({
        authorName: '',
        authorEmail: '',
        content: '',
        parentId: null
    });
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentSuccess, setCommentSuccess] = useState(false);

    useScroll({ target: containerRef });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);

            // Calculate reading progress
            if (contentRef.current) {
                const contentTop = contentRef.current.offsetTop;
                const contentHeight = contentRef.current.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.scrollY;

                const progress = Math.min(100, Math.max(0,
                    ((scrollTop - contentTop + windowHeight * 0.5) / contentHeight) * 100
                ));
                setReadingProgress(progress);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchArticle = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/blog-system/public/articles/${slug}`);
            setArticle(response.data.article);
            setRelatedArticles(response.data.relatedArticles || []);
        } catch (error) {
            console.error('Error fetching article:', error);
            navigate('/blog');
        } finally {
            setLoading(false);
        }
    }, [slug, navigate]);

    const generateTOC = useCallback(() => {
        if (!article?.content) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(article.content, 'text/html');
        const headings = doc.querySelectorAll('h2, h3');

        const toc = Array.from(headings).map((heading, index) => ({
            id: `heading-${index}`,
            text: heading.textContent,
            level: heading.tagName
        }));

        setTableOfContents(toc);
    }, [article?.content]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    useEffect(() => {
        generateTOC();
    }, [generateTOC]);



    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const title = article?.title;

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
        setShowShareModal(false);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentForm.authorName || !commentForm.authorEmail || !commentForm.content) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmittingComment(true);
        try {
            await api.post(`/blog-system/public/articles/${slug}/comments`, commentForm);
            setCommentSuccess(true);
            setCommentForm({ authorName: '', authorEmail: '', content: '', parentId: null });
            setTimeout(() => setCommentSuccess(false), 5000);
        } catch (error) {
            alert('Failed to submit comment. Please try again.');
        } finally {
            setSubmittingComment(false);
        }
    };

    // Floating particles
    const particles = useMemo(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            color: ['#8b5cf6', '#06b6d4', '#ec4899'][i % 3],
            duration: 4 + Math.random() * 4
        })),
        []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
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

    if (!article) {
        return null;
    }

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
            {/* Reading Progress Bar */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4)',
                    zIndex: 200,
                    width: `${readingProgress}%`
                }}
            />

            {/* Cursor follower */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    filter: 'blur(60px)'
                }}
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            />

            {/* Floating particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    style={{
                        position: 'fixed',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        borderRadius: '50%',
                        background: particle.color,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        opacity: 0.2,
                        pointerEvents: 'none'
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity
                    }}
                />
            ))}

            {/* Floating Action Buttons - Left Side */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                    position: 'fixed',
                    left: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    zIndex: 50
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLiked(!liked)}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: liked ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.03)',
                        color: liked ? '#ec4899' : '#9ca3af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <HiOutlineHeart style={{ width: '22px', height: '22px', fill: liked ? '#ec4899' : 'none' }} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setBookmarked(!bookmarked)}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: bookmarked ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: bookmarked ? '#8b5cf6' : '#9ca3af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <HiOutlineBookmark style={{ width: '22px', height: '22px', fill: bookmarked ? '#8b5cf6' : 'none' }} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowShareModal(true)}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <HiOutlineShare style={{ width: '22px', height: '22px' }} />
                </motion.button>
            </motion.div>

            {/* Table of Contents - Right Side */}
            {tableOfContents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        position: 'fixed',
                        right: '24px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        maxWidth: '250px',
                        zIndex: 50
                    }}
                >
                    <motion.div
                        style={{
                            padding: '20px',
                            borderRadius: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div
                            onClick={() => setShowTOC(!showTOC)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                marginBottom: showTOC ? '16px' : 0
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af' }}>
                                TABLE OF CONTENTS
                            </span>
                            {showTOC ? (
                                <HiOutlineChevronUp style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                            ) : (
                                <HiOutlineChevronDown style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                            )}
                        </div>

                        <AnimatePresence>
                            {showTOC && (
                                <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ listStyle: 'none', padding: 0, margin: 0 }}
                                >
                                    {tableOfContents.map((item, index) => (
                                        <motion.li
                                            key={item.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                marginBottom: '8px',
                                                paddingLeft: item.level === 'H3' ? '16px' : 0
                                            }}
                                        >
                                            <a
                                                href={`#${item.id}`}
                                                style={{
                                                    fontSize: item.level === 'H2' ? '13px' : '12px',
                                                    color: activeSection === item.id ? '#8b5cf6' : '#6b7280',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                    transition: 'color 0.2s'
                                                }}
                                            >
                                                {item.text}
                                            </a>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Featured Image */}
                <div style={{
                    height: '500px',
                    background: article.featuredImage
                        ? `url(${article.featuredImage}) center/cover`
                        : `linear-gradient(135deg, ${article.category?.color || '#8b5cf6'}40, ${article.category?.color || '#06b6d4'}20)`,
                    position: 'relative'
                }}>
                    {/* Gradient overlays */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.8) 70%, rgba(10,10,15,1) 100%)'
                    }} />

                    {/* Back button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/blog')}
                        style={{
                            position: 'absolute',
                            top: '40px',
                            left: '40px',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            backdropFilter: 'blur(10px)',
                            zIndex: 10
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <HiOutlineArrowLeft style={{ width: '18px', height: '18px' }} />
                        Back to Blog
                    </motion.button>

                    {/* Article Header */}
                    <div style={{
                        position: 'absolute',
                        bottom: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100%',
                        maxWidth: '800px',
                        padding: '0 24px',
                        textAlign: 'center'
                    }}>
                        {/* Category */}
                        {article.category && (
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: `${article.category.color}30`,
                                    border: `1px solid ${article.category.color}50`,
                                    color: article.category.color,
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '20px'
                                }}
                            >
                                <HiOutlineFolder style={{ width: '14px', height: '14px' }} />
                                {article.category.name}
                            </motion.span>
                        )}

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                fontSize: 'clamp(32px, 5vw, 48px)',
                                fontWeight: '800',
                                lineHeight: 1.2,
                                marginBottom: '24px'
                            }}
                        >
                            {article.title}
                        </motion.h1>

                        {/* Meta */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '24px',
                                flexWrap: 'wrap'
                            }}
                        >
                            {/* Author */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                    src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.name}&background=8b5cf6&color=fff`}
                                    alt={article.author?.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{article.author?.name}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Author</p>
                                </div>
                            </div>

                            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />

                            {/* Date */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                                <HiOutlineCalendar style={{ width: '18px', height: '18px' }} />
                                {formatDate(article.publishedAt)}
                            </div>

                            {/* Reading time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                                <HiOutlineClock style={{ width: '18px', height: '18px' }} />
                                {article.readingTime} min read
                            </div>

                            {/* Views */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                                <HiOutlineEye style={{ width: '18px', height: '18px' }} />
                                {article.views} views
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section ref={contentRef} style={{ padding: '60px 24px 100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Excerpt */}
                    {article.excerpt && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                fontSize: '20px',
                                color: '#9ca3af',
                                lineHeight: 1.8,
                                marginBottom: '40px',
                                fontStyle: 'italic',
                                borderLeft: '4px solid #8b5cf6',
                                paddingLeft: '24px'
                            }}
                        >
                            {article.excerpt}
                        </motion.p>
                    )}

                    {/* Tags */}
                    {article.tags?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginBottom: '40px'
                            }}
                        >
                            {article.tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    to={`/blog?tag=${tag.slug}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        background: `${tag.color}15`,
                                        border: `1px solid ${tag.color}30`,
                                        color: tag.color,
                                        fontSize: '12px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <HiOutlineTag style={{ width: '12px', height: '12px' }} />
                                    {tag.name}
                                </Link>
                            ))}
                        </motion.div>
                    )}

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="article-content"
                        style={{
                            fontSize: '17px',
                            lineHeight: 1.9,
                            color: '#d1d5db'
                        }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Share Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        style={{
                            marginTop: '60px',
                            padding: '32px',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
                            Enjoyed this article? Share it with others!
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            {[
                                { icon: FaTwitter, color: '#1DA1F2', platform: 'twitter' },
                                { icon: FaFacebook, color: '#4267B2', platform: 'facebook' },
                                { icon: FaLinkedin, color: '#0A66C2', platform: 'linkedin' },
                                { icon: FaWhatsapp, color: '#25D366', platform: 'whatsapp' },
                                { icon: FaCopy, color: '#8b5cf6', platform: 'copy' }
                            ].map((item) => (
                                <motion.button
                                    key={item.platform}
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleShare(item.platform)}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        background: `${item.color}20`,
                                        color: item.color,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <item.icon style={{ width: '20px', height: '20px' }} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Comments Section */}
                    {article.allowComments && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{ marginTop: '60px' }}
                        >
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                marginBottom: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <HiOutlineChat style={{ width: '28px', height: '28px', color: '#8b5cf6' }} />
                                Comments ({article.comments?.length || 0})
                            </h3>

                            {/* Comment Form */}
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <input
                                        type="text"
                                        placeholder="Your name *"
                                        value={commentForm.authorName}
                                        onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your email *"
                                        value={commentForm.authorEmail}
                                        onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <textarea
                                    placeholder="Write your comment..."
                                    value={commentForm.content}
                                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        marginBottom: '16px'
                                    }}
                                />
                                <motion.button
                                    type="submit"
                                    disabled={submittingComment}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '14px 28px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: submittingComment ? 'not-allowed' : 'pointer',
                                        opacity: submittingComment ? 0.7 : 1
                                    }}
                                >
                                    {submittingComment ? 'Submitting...' : 'Post Comment'}
                                </motion.button>

                                {commentSuccess && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ color: '#10b981', marginTop: '16px', fontSize: '14px' }}
                                    >
                                        ✓ Comment submitted! It will appear after approval.
                                    </motion.p>
                                )}
                            </form>

                            {/* Existing Comments */}
                            {article.comments?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {article.comments.map((comment) => (
                                        <motion.div
                                            key={comment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            style={{
                                                padding: '24px',
                                                borderRadius: '16px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                <img
                                                    src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}&background=6b7280&color=fff`}
                                                    alt={comment.authorName}
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                                />
                                                <div>
                                                    <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{comment.authorName}</p>
                                                    <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                                                        {formatDate(comment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p style={{ color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>{comment.content}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section style={{ padding: '60px 24px 100px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            textAlign: 'center',
                            marginBottom: '40px'
                        }}>
                            Related Articles
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '24px'
                        }}>
                            {relatedArticles.map((related, index) => (
                                <motion.article
                                    key={related.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/blog/${related.slug}`)}
                                    style={{
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        height: '160px',
                                        background: related.featuredImage
                                            ? `url(${related.featuredImage}) center/cover`
                                            : `linear-gradient(135deg, ${related.category?.color || '#8b5cf6'}40, ${related.category?.color || '#06b6d4'}20)`
                                    }} />
                                    <div style={{ padding: '20px' }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            marginBottom: '8px',
                                            lineHeight: 1.4
                                        }}>
                                            {related.title}
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '12px',
                                            color: '#6b7280'
                                        }}>
                                            <span>{related.author?.name}</span>
                                            <span>•</span>
                                            <span>{related.readingTime} min</span>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowShareModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 200
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                padding: '32px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                maxWidth: '400px',
                                width: '90%'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Share Article</h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#9ca3af',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <HiOutlineX style={{ width: '24px', height: '24px' }} />
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {[
                                    { icon: FaTwitter, color: '#1DA1F2', platform: 'twitter', name: 'Twitter' },
                                    { icon: FaFacebook, color: '#4267B2', platform: 'facebook', name: 'Facebook' },
                                    { icon: FaLinkedin, color: '#0A66C2', platform: 'linkedin', name: 'LinkedIn' },
                                    { icon: FaWhatsapp, color: '#25D366', platform: 'whatsapp', name: 'WhatsApp' }
                                ].map((item) => (
                                    <motion.button
                                        key={item.platform}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleShare(item.platform)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            background: `${item.color}20`,
                                            color: item.color,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <item.icon style={{ width: '24px', height: '24px' }} />
                                        <span style={{ fontSize: '11px' }}>{item.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleShare('copy')}
                                style={{
                                    width: '100%',
                                    marginTop: '16px',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <HiOutlineLink style={{ width: '18px', height: '18px' }} />
                                Copy Link
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back to top */}
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
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 40px rgba(236,72,153,0.4)',
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

            {/* Article Content Styles */}
            <style>{`
                .article-content h2 {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 48px 0 20px;
                    color: white;
                }
                .article-content h3 {
                    font-size: 22px;
                    font-weight: 600;
                    margin: 36px 0 16px;
                    color: white;
                }
                .article-content p {
                    margin-bottom: 20px;
                }
                .article-content a {
                    color: #8b5cf6;
                    text-decoration: underline;
                }
                .article-content ul, .article-content ol {
                    margin: 20px 0;
                    padding-left: 28px;
                }
                .article-content li {
                    margin-bottom: 10px;
                }
                .article-content blockquote {
                    border-left: 4px solid #8b5cf6;
                    padding: 20px 24px;
                    margin: 28px 0;
                    background: rgba(139,92,246,0.1);
                    border-radius: 0 12px 12px 0;
                    font-style: italic;
                }
                .article-content code {
                    background: rgba(139,92,246,0.2);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 14px;
                }
                .article-content pre {
                    background: rgba(0,0,0,0.4);
                    padding: 20px;
                    border-radius: 12px;
                    overflow-x: auto;
                    margin: 24px 0;
                }
                .article-content pre code {
                    background: none;
                    padding: 0;
                }
                .article-content img {
                    max-width: 100%;
                    border-radius: 16px;
                    margin: 28px 0;
                }
            `}</style>
        </div>
    );
};

export default BlogDetail;
