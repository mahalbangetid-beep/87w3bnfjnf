import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus,
    HiOutlineCalendar, HiOutlineClock, HiOutlineTrash, HiOutlinePencil,
    HiOutlineEye, HiOutlineX, HiOutlineRefresh
} from 'react-icons/hi';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { socialAPI } from '../../services/api';

const PLATFORMS = {
    instagram: { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
    facebook: { name: 'Facebook', icon: FaFacebookF, color: '#1877F2' },
    twitter: { name: 'Twitter/X', icon: FaXTwitter, color: '#000000' },
    linkedin: { name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const SchedulePost = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month');
    const [selectedPost, setSelectedPost] = useState(null);
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [error, setError] = useState('');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    useEffect(() => {
        fetchPosts();
    }, [currentDate]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const data = await socialAPI.getCalendarPosts(year, month);
            setPosts(data || []);
        } catch (error) {
            setErrorWithTimeout(t('social.errors.fetchPosts', 'Failed to fetch scheduled posts'));
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Previous month days
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const prevDays = prevMonth.getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevDays - i,
                isCurrentMonth: false,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevDays - i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
            });
        }

        return days;
    };

    const getPostsForDate = (date) => {
        return posts.filter(post => {
            const postDate = new Date(post.scheduledAt);
            return postDate.toDateString() === date.toDateString();
        }).filter(post => {
            if (filterPlatform === 'all') return true;
            return post.platforms?.includes(filterPlatform);
        });
    };

    const isToday = (date) => {
        return date.toDateString() === new Date().toDateString();
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const deletePost = async (postId) => {
        try {
            await socialAPI.deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            setSelectedPost(null);
        } catch (error) {
            setErrorWithTimeout(t('social.errors.deletePost', 'Failed to delete post'));
        }
    };

    const renderPlatformIcon = (platform, size = 14) => {
        const config = PLATFORMS[platform];
        if (!config) return null;
        const Icon = config.icon;
        return <Icon style={{ width: size, height: size, color: config.color }} />;
    };

    const calendarDays = getCalendarDays();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('social.schedule.title', 'Content Calendar')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('social.schedule.subtitle', 'View and manage your scheduled social media posts')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchPosts}
                        style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: '#9ca3af',
                            cursor: 'pointer'
                        }}
                    >
                        <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/social/sosmed-posting')}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        New Post
                    </motion.button>
                </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            fontSize: '14px'
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Controls */}
            <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigateMonth(-1)}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer'
                            }}
                        >
                            <HiOutlineChevronLeft style={{ width: '20px', height: '20px' }} />
                        </button>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0, minWidth: '180px', textAlign: 'center' }}>
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={() => navigateMonth(1)}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer'
                            }}
                        >
                            <HiOutlineChevronRight style={{ width: '20px', height: '20px' }} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(139,92,246,0.3)',
                                backgroundColor: 'rgba(139,92,246,0.1)',
                                color: '#a78bfa',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Today
                        </button>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setFilterPlatform('all')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: filterPlatform === 'all' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: filterPlatform === 'all' ? 'rgba(139,92,246,0.2)' : 'transparent',
                                color: filterPlatform === 'all' ? '#a78bfa' : '#6b7280',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            All
                        </button>
                        {Object.entries(PLATFORMS).map(([key, platform]) => (
                            <button
                                key={key}
                                onClick={() => setFilterPlatform(key)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: filterPlatform === key ? `1px solid ${platform.color}` : '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: filterPlatform === key ? `${platform.color}20` : 'transparent',
                                    color: filterPlatform === key ? platform.color : '#6b7280',
                                    cursor: 'pointer'
                                }}
                            >
                                {renderPlatformIcon(key, 16)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card" style={{ padding: '20px' }}>
                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                    {DAYS.map(day => (
                        <div key={day} style={{
                            padding: '12px',
                            textAlign: 'center',
                            color: '#9ca3af',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {calendarDays.map((dayInfo, index) => {
                        const dayPosts = getPostsForDate(dayInfo.date);
                        const isSelected = selectedDate?.toDateString() === dayInfo.date.toDateString();

                        return (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedDate(dayInfo.date)}
                                style={{
                                    minHeight: '100px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? 'rgba(139,92,246,0.15)' :
                                        isToday(dayInfo.date) ? 'rgba(6,182,212,0.1)' :
                                            dayInfo.isCurrentMonth ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    border: isSelected ? '2px solid #8b5cf6' :
                                        isToday(dayInfo.date) ? '2px solid #06b6d4' :
                                            '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    opacity: dayInfo.isCurrentMonth ? 1 : 0.4
                                }}
                            >
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: isToday(dayInfo.date) ? '700' : '500',
                                    color: isToday(dayInfo.date) ? '#06b6d4' : dayInfo.isCurrentMonth ? 'white' : '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    {dayInfo.day}
                                </div>

                                {/* Post Indicators */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {dayPosts.slice(0, 3).map((post, i) => (
                                        <div
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                                            style={{
                                                padding: '4px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: 'rgba(139,92,246,0.2)',
                                                fontSize: '10px',
                                                color: '#a78bfa',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            {post.platforms?.slice(0, 2).map(p => renderPlatformIcon(p, 10))}
                                            <span style={{ fontSize: '9px' }}>
                                                {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {dayPosts.length > 3 && (
                                        <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                                            +{dayPosts.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Posts */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{ padding: '20px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                                <HiOutlineCalendar style={{ display: 'inline', marginRight: '8px' }} />
                                {selectedDate.toLocaleDateString(i18n.language || undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: '#9ca3af',
                                    cursor: 'pointer'
                                }}
                            >
                                <HiOutlineX style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>

                        {getPostsForDate(selectedDate).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                <HiOutlineClock style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 12px' }} />
                                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No posts scheduled for this day</p>
                                <button
                                    onClick={() => navigate('/social/sosmed-posting')}
                                    style={{
                                        marginTop: '12px',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Schedule a Post
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {getPostsForDate(selectedDate).map((post) => (
                                    <div
                                        key={post.id}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '10px',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {post.platforms?.map(p => renderPlatformIcon(p, 18))}
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'rgba(6,182,212,0.2)',
                                                    color: '#06b6d4',
                                                    fontSize: '11px'
                                                }}>
                                                    <HiOutlineClock style={{ display: 'inline', marginRight: '4px' }} />
                                                    {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setSelectedPost(post)}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(139,92,246,0.3)',
                                                        backgroundColor: 'rgba(139,92,246,0.1)',
                                                        color: '#a78bfa',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <HiOutlineEye style={{ width: '14px', height: '14px' }} />
                                                </button>
                                                <button
                                                    onClick={() => deletePost(post.id)}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ color: 'white', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                                            {post.content?.substring(0, 150)}
                                            {post.content?.length > 150 && '...'}
                                        </p>
                                        {post.hashtags?.length > 0 && (
                                            <p style={{ color: '#8b5cf6', fontSize: '12px', marginTop: '8px' }}>
                                                {post.hashtags.map(t => `#${t}`).join(' ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setSelectedPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    Post Details
                                </h3>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: '#9ca3af',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    {selectedPost.platforms?.map(p => renderPlatformIcon(p, 20))}
                                    <span style={{
                                        marginLeft: 'auto',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(6,182,212,0.2)',
                                        color: '#06b6d4',
                                        fontSize: '12px'
                                    }}>
                                        {new Date(selectedPost.scheduledAt).toLocaleString()}
                                    </span>
                                </div>

                                <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                                    {selectedPost.content}
                                </p>

                                {selectedPost.hashtags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                        {selectedPost.hashtags.map((tag, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(139,92,246,0.15)',
                                                    color: '#a78bfa',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {selectedPost.mediaUrls?.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedPost.mediaUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt={`Media ${i + 1}`}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => deletePost(selectedPost.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="btn-glow"
                                    style={{ flex: 1 }}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SchedulePost;
