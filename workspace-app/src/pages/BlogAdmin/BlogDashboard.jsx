import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlinePlus,
    HiOutlineDocumentText, HiOutlineEyeOff, HiOutlineCalendar,
    HiOutlineSearch, HiOutlineFilter, HiOutlineChartBar,
    HiOutlineBookOpen, HiOutlineClock, HiOutlineCheck, HiOutlinePencilAlt
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BlogDashboard = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [stats, setStats] = useState({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0,
        pendingComments: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [deleteModal, setDeleteModal] = useState({ open: false, article: null });

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/blog-system/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/blog-system/admin/articles', {
                params: {
                    page: pagination.page,
                    status: statusFilter,
                    search: searchQuery
                }
            });
            setArticles(response.data.articles);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, statusFilter, searchQuery]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleDelete = async () => {
        if (!deleteModal.article) return;

        try {
            await api.delete(`/blog-system/admin/articles/${deleteModal.article.id}`);
            setDeleteModal({ open: false, article: null });
            fetchArticles();
            fetchStats();
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Failed to delete article');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            published: { bg: 'rgba(16,185,129,0.2)', color: '#10b981', icon: HiOutlineCheck },
            draft: { bg: 'rgba(107,114,128,0.2)', color: '#6b7280', icon: HiOutlinePencilAlt },
            scheduled: { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: HiOutlineCalendar }
        };
        const style = styles[status] || styles.draft;
        const Icon = style.icon;

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'capitalize'
            }}>
                <Icon style={{ width: '14px', height: '14px' }} />
                {status}
            </span>
        );
    };

    const statCards = [
        {
            label: 'Total Articles',
            value: stats.totalArticles,
            icon: HiOutlineDocumentText,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
        },
        {
            label: 'Published',
            value: stats.publishedArticles,
            icon: HiOutlineCheck,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        {
            label: 'Drafts',
            value: stats.draftArticles,
            icon: HiOutlinePencilAlt,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
        },
        {
            label: 'Total Views',
            value: stats.totalViews,
            icon: HiOutlineChartBar,
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
        }
    ];

    return (
        <div style={{
            padding: '32px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <HiOutlineBookOpen style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
                        Blog Dashboard
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                        Create and manage your blog articles
                    </p>
                </div>

                <motion.button
                    onClick={() => navigate('/blog-admin/create')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <HiOutlinePlus style={{ width: '20px', height: '20px' }} />
                    New Article
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: stat.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <stat.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>{stat.label}</p>
                        <p style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <HiOutlineSearch style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'white',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <HiOutlineFilter style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" style={{ background: '#1a1a2e' }}>All Status</option>
                        <option value="published" style={{ background: '#1a1a2e' }}>Published</option>
                        <option value="draft" style={{ background: '#1a1a2e' }}>Draft</option>
                        <option value="scheduled" style={{ background: '#1a1a2e' }}>Scheduled</option>
                    </select>
                </div>
            </div>

            {/* Articles Table */}
            <div style={{
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid rgba(139,92,246,0.2)',
                                borderTopColor: '#8b5cf6',
                                borderRadius: '50%',
                                margin: '0 auto'
                            }}
                        />
                    </div>
                ) : articles.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <HiOutlineDocumentText style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No articles found</p>
                        <motion.button
                            onClick={() => navigate('/blog-admin/create')}
                            whileHover={{ scale: 1.02 }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#8b5cf6',
                                color: 'white',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Create your first article
                        </motion.button>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Article</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Views</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '16px 20px', textAlign: 'right', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr
                                    key={article.id}
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '8px',
                                                background: article.featuredImage
                                                    ? `url(${article.featuredImage}) center/cover`
                                                    : `linear-gradient(135deg, ${article.category?.color || '#8b5cf6'}40, ${article.category?.color || '#06b6d4'}20)`
                                            }} />
                                            <div>
                                                <p style={{ color: 'white', fontWeight: '500', marginBottom: '2px' }}>{article.title}</p>
                                                <p style={{ color: '#6b7280', fontSize: '12px' }}>
                                                    <HiOutlineClock style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                                                    {article.readingTime || 0} min read
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {getStatusBadge(article.status)}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {article.category ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                background: `${article.category.color}20`,
                                                color: article.category.color,
                                                fontSize: '12px'
                                            }}>
                                                {article.category.name}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Uncategorized</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '14px' }}>
                                        {article.views || 0}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '14px' }}>
                                        {formatDate(article.publishedAt || article.createdAt)}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {article.status === 'published' && (
                                                <motion.button
                                                    onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'transparent',
                                                        color: '#9ca3af',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="View"
                                                >
                                                    <HiOutlineEye style={{ width: '18px', height: '18px' }} />
                                                </motion.button>
                                            )}
                                            <motion.button
                                                onClick={() => navigate(`/blog-admin/edit/${article.id}`)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    background: 'rgba(139,92,246,0.1)',
                                                    color: '#8b5cf6',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Edit"
                                            >
                                                <HiOutlinePencil style={{ width: '18px', height: '18px' }} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => setDeleteModal({ open: true, article })}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239,68,68,0.3)',
                                                    background: 'rgba(239,68,68,0.1)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Delete"
                                            >
                                                <HiOutlineTrash style={{ width: '18px', height: '18px' }} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteModal({ open: false, article: null })}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                padding: '32px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                maxWidth: '400px',
                                width: '90%'
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: 'rgba(239,68,68,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{ textAlign: 'center', marginBottom: '12px', color: 'white', fontSize: '20px' }}>
                                Delete Article?
                            </h3>
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
                                Are you sure you want to delete "{deleteModal.article?.title}"? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <motion.button
                                    onClick={() => setDeleteModal({ open: false, article: null })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'transparent',
                                        color: 'white',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleDelete}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogDashboard;
