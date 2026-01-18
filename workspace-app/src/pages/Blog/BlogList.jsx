import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    HiOutlineSearch, HiOutlineClock, HiOutlineEye,
    HiOutlineArrowRight, HiOutlineTag, HiOutlineFolder,
    HiOutlineArrowUp, HiOutlineChevronLeft, HiOutlineChevronRight,
    HiOutlineSparkles, HiOutlineBookOpen, HiOutlineHome
} from 'react-icons/hi';
import api from '../../services/api';

const BlogList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const containerRef = useRef(null);

    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || null);
    const [activeTag, setActiveTag] = useState(searchParams.get('tag') || null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const { scrollYProgress } = useScroll({ target: containerRef });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const page = searchParams.get('page') || 1;
            const category = searchParams.get('category') || '';
            const tag = searchParams.get('tag') || '';
            const search = searchParams.get('search') || '';

            const response = await api.get('/blog-system/public/articles', {
                params: { page, limit: 10, category, tag, search }
            });

            setArticles(response.data.articles);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/blog-system/public/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await api.get('/blog-system/public/tags');
            setTags(response.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
            params.set('search', searchQuery);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleCategoryFilter = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug === activeCategory) {
            params.delete('category');
            setActiveCategory(null);
        } else {
            params.set('category', slug);
            setActiveCategory(slug);
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleTagFilter = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug === activeTag) {
            params.delete('tag');
            setActiveTag(null);
        } else {
            params.set('tag', slug);
            setActiveTag(slug);
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // Animated Background Particles
    const particles = useMemo(() =>
        [...Array(25)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            color: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][i % 4],
            duration: 4 + Math.random() * 4
        })),
        []);

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
            {/* Animated cursor follower */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
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
                    background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4)',
                    transformOrigin: 'left',
                    zIndex: 100,
                    scaleX: scrollYProgress
                }}
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
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.id * 0.1
                    }}
                />
            ))}

            {/* Hero Section */}
            <section style={{
                padding: '120px 24px 80px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Geometric background */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '600px',
                            height: '600px',
                            border: '1px solid rgba(139,92,246,0.1)',
                            borderRadius: '50%',
                            top: '-200px',
                            right: '-100px'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            border: '1px solid rgba(6,182,212,0.1)',
                            borderRadius: '50%',
                            bottom: '-100px',
                            left: '-100px'
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '60px'
                        }}
                    >
                        <motion.button
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
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
                        >
                            <HiOutlineHome style={{ width: '18px', height: '18px' }} />
                            Home
                        </motion.button>
                    </motion.div>

                    {/* Hero Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto 32px',
                                borderRadius: '28px',
                                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 60px rgba(236,72,153,0.3)'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <HiOutlineBookOpen style={{ width: '48px', height: '48px', color: 'white' }} />
                            </motion.div>
                        </motion.div>

                        <h1 style={{
                            fontSize: 'clamp(48px, 8vw, 72px)',
                            fontWeight: '800',
                            marginBottom: '20px',
                            lineHeight: 1.1
                        }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Our Blog
                            </span>
                        </h1>

                        <p style={{
                            fontSize: '20px',
                            color: '#9ca3af',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: 1.6
                        }}>
                            Insights, tutorials, and updates to help you achieve more
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSearch}
                        style={{
                            maxWidth: '600px',
                            margin: '0 auto 40px',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <HiOutlineSearch style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    fontSize: '16px'
                                }}
                            />
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Search
                            </motion.button>
                        </div>
                    </motion.form>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center',
                            marginBottom: '20px'
                        }}
                    >
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                onClick={() => handleCategoryFilter(cat.slug)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    border: `1px solid ${activeCategory === cat.slug ? cat.color : 'rgba(255,255,255,0.1)'}`,
                                    background: activeCategory === cat.slug ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                                    color: activeCategory === cat.slug ? cat.color : '#9ca3af',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <HiOutlineFolder style={{ width: '16px', height: '16px' }} />
                                {cat.name}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Tags */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            justifyContent: 'center'
                        }}
                    >
                        {tags.slice(0, 10).map((tag) => (
                            <motion.button
                                key={tag.id}
                                onClick={() => handleTagFilter(tag.slug)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: `1px solid ${activeTag === tag.slug ? tag.color : 'rgba(255,255,255,0.08)'}`,
                                    background: activeTag === tag.slug ? `${tag.color}15` : 'transparent',
                                    color: activeTag === tag.slug ? tag.color : '#6b7280',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <HiOutlineTag style={{ width: '12px', height: '12px' }} />
                                {tag.name}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Articles Grid */}
            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '24px'
                        }}>
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        height: '400px',
                                        borderRadius: '24px',
                                        background: 'rgba(255,255,255,0.03)'
                                    }}
                                />
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center',
                                padding: '80px 20px',
                                color: '#6b7280'
                            }}
                        >
                            <HiOutlineSparkles style={{ width: '64px', height: '64px', margin: '0 auto 20px', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#9ca3af' }}>No articles found</h3>
                            <p>Check back soon for new content!</p>
                        </motion.div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '24px'
                        }}>
                            {articles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onMouseEnter={() => setHoveredCard(article.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onClick={() => navigate(`/blog/${article.slug}`)}
                                    style={{
                                        borderRadius: '24px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        transform: hoveredCard === article.id ? 'translateY(-8px)' : 'translateY(0)',
                                        boxShadow: hoveredCard === article.id
                                            ? '0 20px 60px rgba(139,92,246,0.15)'
                                            : 'none'
                                    }}
                                >
                                    {/* Featured Image */}
                                    <div style={{
                                        height: '180px',
                                        background: article.featuredImage
                                            ? `url(${article.featuredImage}) center/cover`
                                            : `linear-gradient(135deg, ${article.category?.color || '#8b5cf6'}40, ${article.category?.color || '#06b6d4'}20)`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Overlay gradient */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)'
                                        }} />

                                        {/* Category badge */}
                                        {article.category && (
                                            <motion.span
                                                style={{
                                                    position: 'absolute',
                                                    top: '16px',
                                                    left: '16px',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: article.category.color + '30',
                                                    border: `1px solid ${article.category.color}50`,
                                                    color: article.category.color,
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            >
                                                {article.category.name}
                                            </motion.span>
                                        )}

                                        {/* Hover arrow */}
                                        <motion.div
                                            animate={{
                                                opacity: hoveredCard === article.id ? 1 : 0,
                                                x: hoveredCard === article.id ? 0 : -10
                                            }}
                                            style={{
                                                position: 'absolute',
                                                bottom: '16px',
                                                right: '16px',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(10px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <HiOutlineArrowRight style={{ width: '20px', height: '20px' }} />
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            marginBottom: '10px',
                                            color: 'white',
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {article.title}
                                        </h3>

                                        <p style={{
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            lineHeight: 1.5,
                                            marginBottom: '16px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {article.excerpt}
                                        </p>

                                        {/* Meta info */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            paddingTop: '12px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <img
                                                    src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.name}&background=8b5cf6&color=fff`}
                                                    alt={article.author?.name}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                    {article.author?.name}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: '11px',
                                                color: '#6b7280'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <HiOutlineClock style={{ width: '12px', height: '12px' }} />
                                                    {article.readingTime}m
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <HiOutlineEye style={{ width: '12px', height: '12px' }} />
                                                    {article.views}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                marginTop: '60px'
                            }}
                        >
                            <motion.button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                whileHover={pagination.page !== 1 ? { scale: 1.1 } : {}}
                                whileTap={pagination.page !== 1 ? { scale: 0.9 } : {}}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: pagination.page === 1 ? '#4b5563' : 'white',
                                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <HiOutlineChevronLeft style={{ width: '20px', height: '20px' }} />
                            </motion.button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        border: pagination.page === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        background: pagination.page === i + 1
                                            ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                                            : 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: pagination.page === i + 1 ? '700' : '400'
                                    }}
                                >
                                    {i + 1}
                                </motion.button>
                            ))}

                            <motion.button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                whileHover={pagination.page !== pagination.totalPages ? { scale: 1.1 } : {}}
                                whileTap={pagination.page !== pagination.totalPages ? { scale: 0.9 } : {}}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: pagination.page === pagination.totalPages ? '#4b5563' : 'white',
                                    cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <HiOutlineChevronRight style={{ width: '20px', height: '20px' }} />
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </section>

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
        </div>
    );
};

export default BlogList;
