import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineHeart,
    HiOutlineUsers, HiOutlineCode, HiOutlineStar, HiOutlineArrowLeft,
    HiOutlineChevronDown, HiOutlinePlay, HiOutlineCheck
} from 'react-icons/hi';
import { pagesAPI } from '../../services/api';

const AboutPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const missionRef = useRef(null);
    const valuesRef = useRef(null);
    const journeyRef = useRef(null);
    const teamRef = useRef(null);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [activeValue, setActiveValue] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [pageData, setPageData] = useState(null);

    const { scrollYProgress } = useScroll({ target: containerRef });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Parallax transforms
    const heroY = useTransform(smoothProgress, [0, 0.3], [0, -150]);
    const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        // Fetch page data from API
        const fetchPageData = async () => {
            try {
                const data = await pagesAPI.getPublic('about');
                setPageData(data);
            } catch (error) {
                console.error('Error fetching about page:', error);
            }
        };
        fetchPageData();

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        const handleScroll = () => setScrollY(window.scrollY);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Helper function to get section data
    const getSection = (type) => {
        if (!pageData?.sections) return null;
        return pageData.sections.find(s => s.type === type || s.id === type);
    };

    // Floating orbs configuration
    const orbs = useMemo(() =>
        [...Array(8)].map((_, i) => ({
            id: i,
            size: 100 + Math.random() * 200,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 20 + Math.random() * 20,
            delay: i * 2,
            color: ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b'][i % 4]
        })),
        []);

    // DNA Helix particles
    const dnaParticles = useMemo(() =>
        [...Array(40)].map((_, i) => ({
            id: i,
            angle: (i / 40) * Math.PI * 4,
            radius: 80,
            size: 4 + Math.random() * 4,
            color: i % 2 === 0 ? '#8b5cf6' : '#06b6d4'
        })),
        []);

    // Values data - use from API or defaults
    const defaultValues = [
        {
            icon: HiOutlineLightningBolt,
            title: 'Innovation',
            description: 'Pushing boundaries and embracing cutting-edge technology to solve complex problems.',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
        },
        {
            icon: HiOutlineHeart,
            title: 'Passion',
            description: 'We love what we do. Every line of code is crafted with care and dedication.',
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
        },
        {
            icon: HiOutlineUsers,
            title: 'Collaboration',
            description: 'Great things happen when brilliant minds work together towards a common goal.',
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #10b981)'
        },
        {
            icon: HiOutlineGlobe,
            title: 'Impact',
            description: 'Building solutions that make a real difference in people\'s lives worldwide.',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
        }
    ];

    const iconMap = {
        'lightning': HiOutlineLightningBolt,
        'heart': HiOutlineHeart,
        'users': HiOutlineUsers,
        'globe': HiOutlineGlobe,
        'star': HiOutlineStar,
        'code': HiOutlineCode
    };

    const valuesSection = getSection('values');
    const values = valuesSection?.items?.map((item, i) => ({
        icon: iconMap[item.icon] || defaultValues[i]?.icon || HiOutlineStar,
        title: item.title,
        description: item.description,
        color: item.color || defaultValues[i]?.color || '#8b5cf6',
        gradient: `linear-gradient(135deg, ${item.color || defaultValues[i]?.color || '#8b5cf6'}, ${defaultValues[i]?.color || '#06b6d4'})`
    })) || defaultValues;

    // Journey milestones - use from API or defaults
    const defaultMilestones = [
        { year: '2020', title: 'The Beginning', description: 'Started with a vision to revolutionize productivity', icon: '🚀' },
        { year: '2021', title: 'First Launch', description: 'Released v1.0 to overwhelmingly positive response', icon: '🎉' },
        { year: '2022', title: 'Global Expansion', description: 'Reached users in over 50 countries worldwide', icon: '🌍' },
        { year: '2023', title: 'AI Integration', description: 'Introduced AI-powered features for smarter workflows', icon: '🤖' },
        { year: '2024', title: 'Enterprise Ready', description: 'Launched enterprise solutions for large teams', icon: '🏢' },
        { year: '2025', title: 'The Future', description: 'Continuing to innovate and shape the future of work', icon: '✨' }
    ];
    const timelineSection = getSection('timeline');
    const milestones = timelineSection?.items || defaultMilestones;

    // Team members - use from API or defaults
    const defaultTeam = [
        { name: 'Alex Chen', role: 'Founder & CEO', avatar: '👨‍💼', specialty: 'Vision & Strategy' },
        { name: 'Sarah Johnson', role: 'CTO', avatar: '👩‍💻', specialty: 'Engineering' },
        { name: 'Mike Williams', role: 'Head of Design', avatar: '👨‍🎨', specialty: 'UX/UI' },
        { name: 'Emily Brown', role: 'Head of Product', avatar: '👩‍🔬', specialty: 'Innovation' }
    ];
    const teamSection = getSection('team');
    const team = teamSection?.members || defaultTeam;

    // Stats - use from API or defaults
    const defaultStats = [
        { number: '100K+', label: 'Active Users', suffix: '' },
        { number: '50+', label: 'Countries', suffix: '' },
        { number: '99.9', label: 'Uptime', suffix: '%' },
        { number: '4.9', label: 'Rating', suffix: '/5' }
    ];
    const statsSection = getSection('stats');
    const stats = statsSection?.items || defaultStats;

    // Get hero and mission data from API
    const heroSection = getSection('hero');
    const missionSection = getSection('mission');

    // Section component with reveal animation
    const RevealSection = ({ children, className }) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 80 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={className}
            >
                {children}
            </motion.div>
        );
    };

    // Counter animation component
    const AnimatedCounter = ({ value, suffix = '' }) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true });
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (isInView) {
                const target = parseFloat(value);
                const duration = 2000;
                const steps = 60;
                const increment = target / steps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        setCount(target);
                        clearInterval(timer);
                    } else {
                        setCount(current);
                    }
                }, duration / steps);

                return () => clearInterval(timer);
            }
        }, [isInView, value]);

        return (
            <span ref={ref}>
                {typeof count === 'number' && count % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}
                {suffix}
            </span>
        );
    };

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '100vh',
                background: '#050508',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                overflowX: 'hidden',
                position: 'relative'
            }}
        >
            {/* Animated background orbs */}
            {orbs.map((orb) => (
                <motion.div
                    key={orb.id}
                    style={{
                        position: 'fixed',
                        width: `${orb.size}px`,
                        height: `${orb.size}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${orb.color}30 0%, transparent 70%)`,
                        left: `${orb.x}%`,
                        top: `${orb.y}%`,
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -40, 60, 0],
                        scale: [1, 1.2, 0.9, 1]
                    }}
                    transition={{
                        duration: orb.duration,
                        delay: orb.delay,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}

            {/* Mouse follower with trail effect */}
            <motion.div
                style={{
                    position: 'fixed',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                    filter: 'blur(40px)'
                }}
                animate={{
                    x: mousePosition.x - 300,
                    y: mousePosition.y - 300
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
                    background: scrollY > 100 ? 'rgba(5,5,8,0.9)' : 'transparent',
                    backdropFilter: scrollY > 100 ? 'blur(20px)' : 'none',
                    borderBottom: scrollY > 100 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'all 0.3s'
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

                <motion.div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '32px'
                    }}
                >
                    {['Mission', 'Values', 'Journey', 'Team'].map((item, i) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            whileHover={{ color: '#8b5cf6' }}
                            style={{
                                color: '#9ca3af',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            {item}
                        </motion.a>
                    ))}
                </motion.div>
            </motion.nav>

            {/* Hero Section with 3D DNA Helix */}
            <motion.section
                ref={heroRef}
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    y: heroY,
                    scale: heroScale,
                    opacity: heroOpacity
                }}
            >
                {/* Animated DNA Helix */}
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '600px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    perspective: '1000px'
                }}>
                    {dnaParticles.map((particle, i) => (
                        <motion.div
                            key={particle.id}
                            style={{
                                position: 'absolute',
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                borderRadius: '50%',
                                background: particle.color,
                                boxShadow: `0 0 20px ${particle.color}`,
                                left: '50%',
                                top: '50%'
                            }}
                            animate={{
                                x: Math.cos(particle.angle + scrollY * 0.005) * particle.radius,
                                y: (i / 40) * 600 - 300 + Math.sin(scrollY * 0.01) * 10,
                                z: Math.sin(particle.angle + scrollY * 0.005) * particle.radius,
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                x: { duration: 0.1 },
                                y: { duration: 0.1 },
                                z: { duration: 0.1 },
                                scale: { duration: 2, repeat: Infinity }
                            }}
                        />
                    ))}

                    {/* Connecting lines */}
                    {dnaParticles.slice(0, -1).map((particle, i) => {
                        if (i % 4 === 0) {
                            return (
                                <motion.div
                                    key={`line-${i}`}
                                    style={{
                                        position: 'absolute',
                                        width: '160px',
                                        height: '2px',
                                        background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                                        left: '50%',
                                        top: '50%',
                                        transformOrigin: 'left center',
                                        opacity: 0.3
                                    }}
                                    animate={{
                                        y: (i / 40) * 600 - 300,
                                        rotate: (particle.angle + scrollY * 0.005) * (180 / Math.PI)
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            );
                        }
                        return null;
                    })}
                </div>

                {/* Hero Content */}
                <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 10,
                    padding: '0 24px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            marginBottom: '32px'
                        }}
                    >
                        <HiOutlineSparkles style={{ color: '#8b5cf6' }} />
                        <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '500' }}>
                            {heroSection?.badge || 'Innovating Since 2020'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{
                            fontSize: 'clamp(48px, 10vw, 120px)',
                            fontWeight: '900',
                            lineHeight: 0.9,
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 50%, #06b6d4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {heroSection?.title || pageData?.title || 'About Us'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        style={{
                            fontSize: 'clamp(16px, 2vw, 22px)',
                            color: '#9ca3af',
                            maxWidth: '600px',
                            margin: '0 auto 48px',
                            lineHeight: 1.7
                        }}
                    >
                        {heroSection?.subtitle || pageData?.subtitle || "We're on a mission to transform how people work, creating tools that unlock human potential and make productivity feel effortless."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        style={{
                            position: 'absolute',
                            bottom: '-200px',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <HiOutlineChevronDown style={{ width: '32px', height: '32px', color: '#6b7280' }} />
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Stats Section with Floating Cards */}
            <section style={{ padding: '100px 24px', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px'
                    }}>
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                whileHover={{
                                    y: -10,
                                    boxShadow: '0 30px 60px rgba(139,92,246,0.3)',
                                    borderColor: 'rgba(139,92,246,0.5)'
                                }}
                                style={{
                                    padding: '40px 30px',
                                    borderRadius: '24px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <motion.div
                                    style={{
                                        fontSize: '48px',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: '8px'
                                    }}
                                >
                                    <AnimatedCounter value={stat.number.replace(/[^0-9.]/g, '')} suffix={stat.suffix || (stat.number.includes('+') ? '+' : '')} />
                                </motion.div>
                                <p style={{ color: '#9ca3af', fontSize: '14px' }}>{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section with Morphing Shape */}
            <section id="mission" ref={missionRef} style={{ padding: '150px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <RevealSection>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                            {/* Morphing shape */}
                            <div style={{ position: 'relative', height: '500px' }}>
                                <motion.div
                                    animate={{
                                        borderRadius: [
                                            '60% 40% 30% 70%/60% 30% 70% 40%',
                                            '30% 60% 70% 40%/50% 60% 30% 60%',
                                            '60% 40% 30% 70%/60% 30% 70% 40%'
                                        ]
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        width: '400px',
                                        height: '400px',
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        filter: 'blur(60px)'
                                    }}
                                />
                                <motion.div
                                    animate={{
                                        borderRadius: [
                                            '30% 60% 70% 40%/50% 60% 30% 60%',
                                            '60% 40% 30% 70%/60% 30% 70% 40%',
                                            '30% 60% 70% 40%/50% 60% 30% 60%'
                                        ],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        width: '350px',
                                        height: '350px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <motion.span
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ fontSize: '120px' }}
                                    >
                                        🎯
                                    </motion.span>
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div>
                                <motion.span
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(139,92,246,0.1)',
                                        color: '#a78bfa',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        marginBottom: '24px'
                                    }}
                                >
                                    {missionSection?.title || 'Our Mission'}
                                </motion.span>

                                <h2 style={{
                                    fontSize: '48px',
                                    fontWeight: '800',
                                    lineHeight: 1.2,
                                    marginBottom: '24px'
                                }}>
                                    {missionSection?.heading || <>Empowering{' '}
                                        <span style={{
                                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            Productivity
                                        </span>
                                        {' '}for Everyone</>}
                                </h2>

                                <p style={{
                                    fontSize: '18px',
                                    color: '#9ca3af',
                                    lineHeight: 1.8,
                                    marginBottom: '32px'
                                }}>
                                    {missionSection?.description || "We believe that everyone deserves access to powerful tools that help them achieve their goals. Our platform combines elegant design with intelligent features to create an experience that's both powerful and delightful to use."}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {(missionSection?.points || ['Simplify complex workflows', 'Boost team collaboration', 'Enable data-driven decisions']).map((item, i) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <HiOutlineCheck style={{ width: '14px', height: '14px', color: 'white' }} />
                                            </div>
                                            <span style={{ color: '#d1d5db', fontSize: '16px' }}>{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* Values Section with Interactive Cards */}
            <section id="values" ref={valuesRef} style={{ padding: '150px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <RevealSection>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <motion.span
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: 'rgba(6,182,212,0.1)',
                                    color: '#22d3ee',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    marginBottom: '24px'
                                }}
                            >
                                Our Values
                            </motion.span>
                            <h2 style={{
                                fontSize: '48px',
                                fontWeight: '800',
                                marginBottom: '16px'
                            }}>
                                What Drives Us
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                                These core values guide everything we do and define who we are as a company.
                            </p>
                        </div>
                    </RevealSection>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px'
                    }}>
                        {values.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onHoverStart={() => setActiveValue(i)}
                                onHoverEnd={() => setActiveValue(null)}
                                whileHover={{ y: -10 }}
                                style={{
                                    padding: '40px 30px',
                                    borderRadius: '24px',
                                    background: activeValue === i
                                        ? `linear-gradient(135deg, ${value.color}20, transparent)`
                                        : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${activeValue === i ? value.color + '50' : 'rgba(255,255,255,0.08)'}`,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Animated background on hover */}
                                <motion.div
                                    animate={{
                                        scale: activeValue === i ? 1 : 0,
                                        opacity: activeValue === i ? 1 : 0
                                    }}
                                    style={{
                                        position: 'absolute',
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        background: value.gradient,
                                        filter: 'blur(60px)',
                                        top: '-50px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        opacity: 0.3
                                    }}
                                />

                                <motion.div
                                    animate={{
                                        scale: activeValue === i ? 1.1 : 1,
                                        rotate: activeValue === i ? 360 : 0
                                    }}
                                    transition={{ duration: 0.6 }}
                                    style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '20px',
                                        background: value.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                >
                                    <value.icon style={{ width: '32px', height: '32px', color: 'white' }} />
                                </motion.div>

                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    marginBottom: '12px',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {value.title}
                                </h3>
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Journey Timeline Section */}
            <section id="journey" ref={journeyRef} style={{ padding: '150px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <RevealSection>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <motion.span
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: 'rgba(236,72,153,0.1)',
                                    color: '#f472b6',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    marginBottom: '24px'
                                }}
                            >
                                Our Journey
                            </motion.span>
                            <h2 style={{ fontSize: '48px', fontWeight: '800' }}>
                                The Story So Far
                            </h2>
                        </div>
                    </RevealSection>

                    {/* Timeline */}
                    <div style={{ position: 'relative' }}>
                        {/* Vertical line */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: 'linear-gradient(180deg, #8b5cf6, #06b6d4, #ec4899)',
                            transform: 'translateX(-50%)'
                        }} />

                        {milestones.map((milestone, i) => (
                            <motion.div
                                key={milestone.year}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
                                    paddingRight: i % 2 === 0 ? 'calc(50% + 40px)' : 0,
                                    paddingLeft: i % 2 !== 0 ? 'calc(50% + 40px)' : 0,
                                    marginBottom: '60px',
                                    position: 'relative'
                                }}
                            >
                                {/* Dot on timeline */}
                                <motion.div
                                    whileInView={{ scale: [0, 1.2, 1] }}
                                    viewport={{ once: true }}
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: '#8b5cf6',
                                        border: '4px solid #050508',
                                        zIndex: 2
                                    }}
                                />

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    style={{
                                        padding: '30px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        maxWidth: '400px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '40px' }}>{milestone.icon}</span>
                                        <div>
                                            <span style={{
                                                display: 'block',
                                                color: '#8b5cf6',
                                                fontSize: '14px',
                                                fontWeight: '700'
                                            }}>
                                                {milestone.year}
                                            </span>
                                            <h4 style={{ fontSize: '20px', fontWeight: '700' }}>
                                                {milestone.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 }}>
                                        {milestone.description}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section with 3D Cards */}
            <section id="team" ref={teamRef} style={{ padding: '150px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <RevealSection>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <motion.span
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: 'rgba(16,185,129,0.1)',
                                    color: '#34d399',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    marginBottom: '24px'
                                }}
                            >
                                The Team
                            </motion.span>
                            <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>
                                Meet the Creators
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                                A passionate team of innovators, designers, and engineers building the future of productivity.
                            </p>
                        </div>
                    </RevealSection>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '30px'
                    }}>
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                whileHover={{
                                    y: -15,
                                    rotateY: 5,
                                    rotateX: -5
                                }}
                                style={{
                                    padding: '40px 30px',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    perspective: '1000px',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        fontSize: '50px',
                                        boxShadow: '0 20px 40px rgba(139,92,246,0.3)'
                                    }}
                                >
                                    {member.avatar}
                                </motion.div>

                                <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                                    {member.name}
                                </h4>
                                <p style={{
                                    color: '#8b5cf6',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    {member.role}
                                </p>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '12px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'inline-block'
                                }}>
                                    {member.specialty}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '150px 24px 100px', position: 'relative' }}>
                <RevealSection>
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: '80px 60px',
                        borderRadius: '40px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                        border: '1px solid rgba(139,92,246,0.3)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Animated rings */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 2, 1],
                                    opacity: [0.3, 0, 0.3]
                                }}
                                transition={{
                                    duration: 4,
                                    delay: i * 1.5,
                                    repeat: Infinity
                                }}
                                style={{
                                    position: 'absolute',
                                    width: '300px',
                                    height: '300px',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(139,92,246,0.3)',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        ))}

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                background: 'conic-gradient(from 0deg, transparent, rgba(139,92,246,0.1), transparent)',
                                opacity: 0.5
                            }}
                        />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ fontSize: '60px', display: 'block', marginBottom: '24px' }}
                            >
                                🚀
                            </motion.span>

                            <h2 style={{
                                fontSize: '40px',
                                fontWeight: '800',
                                marginBottom: '16px'
                            }}>
                                Ready to Get Started?
                            </h2>
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '18px',
                                marginBottom: '40px',
                                maxWidth: '500px',
                                margin: '0 auto 40px'
                            }}>
                                Join thousands of users who are already transforming their productivity with our platform.
                            </p>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <motion.button
                                    onClick={() => navigate('/register')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '16px 40px',
                                        borderRadius: '14px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <HiOutlinePlay style={{ width: '20px', height: '20px' }} />
                                    Get Started Free
                                </motion.button>

                                <motion.button
                                    onClick={() => navigate('/landing')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '16px 40px',
                                        borderRadius: '14px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Learn More
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '40px 24px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    © 2025 Workspace. Built with 💜 for productivity enthusiasts everywhere.
                </p>
            </footer>
        </div>
    );
};

export default AboutPage;
