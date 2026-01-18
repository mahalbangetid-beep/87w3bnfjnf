import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    HiOutlineArrowLeft, HiOutlineEye, HiOutlinePhotograph,
    HiOutlineTag, HiOutlineFolder, HiOutlineCalendar, HiOutlineCog,
    HiOutlineGlobeAlt, HiOutlineX, HiOutlinePlus, HiOutlineSearch,
    HiOutlineDocumentText, HiOutlineLink, HiOutlineCode, HiOutlineEyeOff
} from 'react-icons/hi';
import api from '../../services/api';

const BlogEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('content'); // content, seo, settings
    const [showPreview, setShowPreview] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    const [article, setArticle] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        categoryId: '',
        tags: [],
        status: 'draft',
        scheduledAt: '',
        isFeatured: false,
        allowComments: true,
        // SEO Fields
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        noIndex: false,
        noFollow: false,
        // URL Slug
        slug: ''
    });

    const [tagInput, setTagInput] = useState('');

    // Quill Editor Modules Configuration
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'check',
        'indent', 'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/blog-system/admin/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchArticle = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.get('/blog-system/admin/articles');
            const found = response.data.articles.find(a => a.id === parseInt(id));
            if (found) {
                setArticle({
                    ...found,
                    tags: found.tags?.map(t => t.name) || [],
                    categoryId: found.categoryId || '',
                    metaTitle: found.metaTitle || '',
                    metaDescription: found.metaDescription || '',
                    metaKeywords: found.metaKeywords || '',
                    canonicalUrl: found.canonicalUrl || '',
                    ogTitle: found.ogTitle || '',
                    ogDescription: found.ogDescription || '',
                    ogImage: found.ogImage || '',
                    twitterTitle: found.twitterTitle || '',
                    twitterDescription: found.twitterDescription || '',
                    twitterImage: found.twitterImage || '',
                    noIndex: found.noIndex || false,
                    noFollow: found.noFollow || false,
                    slug: found.slug || ''
                });
            }
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchArticle();
        }
    }, [fetchCategories, fetchArticle, isEditing]);

    // Calculate word count
    useEffect(() => {
        const text = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        setWordCount(text ? text.split(' ').length : 0);
    }, [article.content]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && article.title && !article.slug) {
            const generatedSlug = article.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 100);
            setArticle(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [article.title, isEditing, article.slug]);

    const handleSave = async (status = article.status) => {
        if (!article.title.trim()) {
            alert('Please enter a title');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...article,
                status,
                categoryId: article.categoryId || null
            };

            if (isEditing) {
                await api.put(`/blog-system/admin/articles/${id}`, payload);
            } else {
                await api.post('/blog-system/admin/articles', payload);
            }

            navigate('/blog-admin');
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
            setArticle({
                ...article,
                tags: [...article.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setArticle({
            ...article,
            tags: article.tags.filter(t => t !== tagToRemove)
        });
    };

    const handleContentChange = (content) => {
        setArticle({ ...article, content });
    };

    const calculateReadingTime = () => {
        const wordsPerMinute = 200;
        return Math.ceil(wordCount / wordsPerMinute) || 1;
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
        <div style={{ minHeight: '100vh' }}>
            {/* Custom Quill Styles */}
            <style>{`
                .ql-toolbar.ql-snow {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px 12px 0 0;
                    padding: 12px;
                }
                .ql-container.ql-snow {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    font-size: 16px;
                    min-height: 400px;
                }
                .ql-editor {
                    min-height: 400px;
                    color: white;
                    line-height: 1.8;
                }
                .ql-editor.ql-blank::before {
                    color: #6b7280;
                    font-style: normal;
                }
                .ql-toolbar .ql-stroke {
                    stroke: #9ca3af;
                }
                .ql-toolbar .ql-fill {
                    fill: #9ca3af;
                }
                .ql-toolbar .ql-picker {
                    color: #9ca3af;
                }
                .ql-toolbar .ql-picker-options {
                    background: #1a1a2e;
                    border-color: rgba(255,255,255,0.1);
                }
                .ql-toolbar button:hover .ql-stroke,
                .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #8b5cf6;
                }
                .ql-toolbar button:hover .ql-fill,
                .ql-toolbar button.ql-active .ql-fill {
                    fill: #8b5cf6;
                }
                .ql-snow .ql-tooltip {
                    background: #1a1a2e;
                    border-color: rgba(255,255,255,0.1);
                    color: white;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .ql-snow .ql-tooltip input[type=text] {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.1);
                    color: white;
                }
                .ql-editor h1 { font-size: 2em; margin-bottom: 16px; }
                .ql-editor h2 { font-size: 1.5em; margin-bottom: 14px; }
                .ql-editor h3 { font-size: 1.25em; margin-bottom: 12px; }
                .ql-editor p { margin-bottom: 16px; }
                .ql-editor blockquote {
                    border-left: 4px solid #8b5cf6;
                    padding-left: 16px;
                    color: #9ca3af;
                    font-style: italic;
                }
                .ql-editor pre.ql-syntax {
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 16px;
                    overflow-x: auto;
                }
                .ql-editor img {
                    max-width: 100%;
                    border-radius: 8px;
                }
                .ql-editor a {
                    color: #8b5cf6;
                }
            `}</style>

            {/* Header */}
            <div style={{
                padding: '16px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <motion.button
                        onClick={() => navigate('/blog-admin')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <HiOutlineArrowLeft style={{ width: '20px', height: '20px' }} />
                    </motion.button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                            {isEditing ? 'Edit Article' : 'New Article'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{calculateReadingTime()} min read</span>
                            <span>•</span>
                            <span style={{
                                color: article.status === 'published' ? '#10b981' : article.status === 'draft' ? '#f59e0b' : '#06b6d4',
                                textTransform: 'capitalize'
                            }}>
                                {article.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <motion.button
                        onClick={() => setShowPreview(!showPreview)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: showPreview ? 'rgba(139,92,246,0.2)' : 'transparent',
                            color: showPreview ? '#8b5cf6' : 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        {showPreview ? <HiOutlineEyeOff style={{ width: '18px', height: '18px' }} /> : <HiOutlineEye style={{ width: '18px', height: '18px' }} />}
                        {showPreview ? 'Edit' : 'Preview'}
                    </motion.button>

                    <motion.button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent',
                            color: 'white',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        Save Draft
                    </motion.button>

                    <motion.button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        <HiOutlineGlobeAlt style={{ width: '18px', height: '18px' }} />
                        {isEditing && article.status === 'published' ? 'Update' : 'Publish'}
                    </motion.button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                padding: '0 32px',
                background: 'rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: '4px'
            }}>
                {[
                    { id: 'content', label: 'Content', icon: HiOutlineDocumentText },
                    { id: 'seo', label: 'SEO', icon: HiOutlineSearch },
                    { id: 'settings', label: 'Settings', icon: HiOutlineCog }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '14px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
                            color: activeTab === tab.id ? '#8b5cf6' : '#9ca3af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon style={{ width: '18px', height: '18px' }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {/* Content Tab */}
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Title */}
                            <input
                                type="text"
                                placeholder="Article title..."
                                value={article.title}
                                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '16px 0',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    marginBottom: '8px'
                                }}
                            />

                            {/* Slug */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '24px',
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                <HiOutlineLink style={{ width: '16px', height: '16px' }} />
                                <span>/blog/</span>
                                <input
                                    type="text"
                                    value={article.slug}
                                    onChange={(e) => setArticle({ ...article, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        color: '#06b6d4',
                                        fontSize: '14px',
                                        outline: 'none',
                                        flex: 1,
                                        maxWidth: '400px'
                                    }}
                                    placeholder="article-slug"
                                />
                            </div>

                            {/* Excerpt */}
                            <textarea
                                placeholder="Write a short excerpt or summary (displayed in search results and social shares)..."
                                value={article.excerpt}
                                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    outline: 'none',
                                    color: '#9ca3af',
                                    fontSize: '16px',
                                    resize: 'none',
                                    marginBottom: '24px'
                                }}
                            />

                            {/* Rich Text Editor or Preview */}
                            {showPreview ? (
                                <div style={{
                                    padding: '32px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    minHeight: '400px'
                                }}>
                                    <h2 style={{ marginBottom: '16px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Preview</h2>
                                    <div
                                        className="article-preview"
                                        style={{ color: 'white', lineHeight: 1.8 }}
                                        dangerouslySetInnerHTML={{ __html: article.content }}
                                    />
                                </div>
                            ) : (
                                <ReactQuill
                                    theme="snow"
                                    value={article.content}
                                    onChange={handleContentChange}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write your article content here... Use the toolbar to format text, add images, links, videos, and more."
                                />
                            )}

                            {/* Quick Actions Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px',
                                marginTop: '24px'
                            }}>
                                {/* Featured Image */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                        <HiOutlinePhotograph style={{ width: '16px', height: '16px' }} />
                                        Featured Image
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        value={article.featuredImage}
                                        onChange={(e) => setArticle({ ...article, featuredImage: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            outline: 'none',
                                            color: 'white',
                                            fontSize: '13px'
                                        }}
                                    />
                                    {article.featuredImage && (
                                        <img
                                            src={article.featuredImage}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                marginTop: '8px'
                                            }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                </div>

                                {/* Category */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                        <HiOutlineFolder style={{ width: '16px', height: '16px' }} />
                                        Category
                                    </label>
                                    <select
                                        value={article.categoryId}
                                        onChange={(e) => setArticle({ ...article, categoryId: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            outline: 'none',
                                            color: 'white',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" style={{ background: '#1a1a2e' }}>Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} style={{ background: '#1a1a2e' }}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                        <HiOutlineTag style={{ width: '16px', height: '16px' }} />
                                        Tags
                                    </label>
                                    <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Add tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                outline: 'none',
                                                color: 'white',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#8b5cf6',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <HiOutlinePlus style={{ width: '16px', height: '16px' }} />
                                        </button>
                                    </form>
                                    {article.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                            {article.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        background: 'rgba(139,92,246,0.2)',
                                                        color: '#a78bfa',
                                                        fontSize: '11px'
                                                    }}
                                                >
                                                    {tag}
                                                    <HiOutlineX
                                                        style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                                                        onClick={() => handleRemoveTag(tag)}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                        <motion.div
                            key="seo"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{ display: 'grid', gap: '24px' }}>
                                {/* Basic SEO */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        🔍 Basic SEO
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Meta Title <span style={{ color: '#6b7280' }}>({article.metaTitle.length}/60)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="SEO title (defaults to article title if empty)"
                                                value={article.metaTitle}
                                                onChange={(e) => setArticle({ ...article, metaTitle: e.target.value })}
                                                maxLength={60}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Meta Description <span style={{ color: '#6b7280' }}>({article.metaDescription.length}/160)</span>
                                            </label>
                                            <textarea
                                                placeholder="Brief description for search engines (defaults to excerpt if empty)"
                                                value={article.metaDescription}
                                                onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                                                maxLength={160}
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    resize: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Meta Keywords <span style={{ color: '#6b7280' }}>(comma separated)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="keyword1, keyword2, keyword3"
                                                value={article.metaKeywords}
                                                onChange={(e) => setArticle({ ...article, metaKeywords: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Canonical URL <span style={{ color: '#6b7280' }}>(optional)</span>
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/original-article"
                                                value={article.canonicalUrl}
                                                onChange={(e) => setArticle({ ...article, canonicalUrl: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Open Graph */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        📘 Facebook / Open Graph
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                OG Title
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Title for Facebook shares (defaults to meta title)"
                                                value={article.ogTitle}
                                                onChange={(e) => setArticle({ ...article, ogTitle: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                OG Description
                                            </label>
                                            <textarea
                                                placeholder="Description for Facebook shares"
                                                value={article.ogDescription}
                                                onChange={(e) => setArticle({ ...article, ogDescription: e.target.value })}
                                                rows={2}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    resize: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                OG Image URL <span style={{ color: '#6b7280' }}>(1200x630 recommended)</span>
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/og-image.jpg"
                                                value={article.ogImage}
                                                onChange={(e) => setArticle({ ...article, ogImage: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Twitter Card */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        🐦 Twitter Card
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Twitter Title
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Title for Twitter shares"
                                                value={article.twitterTitle}
                                                onChange={(e) => setArticle({ ...article, twitterTitle: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Twitter Description
                                            </label>
                                            <textarea
                                                placeholder="Description for Twitter shares"
                                                value={article.twitterDescription}
                                                onChange={(e) => setArticle({ ...article, twitterDescription: e.target.value })}
                                                rows={2}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    resize: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                Twitter Image URL
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/twitter-image.jpg"
                                                value={article.twitterImage}
                                                onChange={(e) => setArticle({ ...article, twitterImage: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced SEO */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        ⚙️ Advanced
                                    </h3>

                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={article.noIndex}
                                                onChange={(e) => setArticle({ ...article, noIndex: e.target.checked })}
                                                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                            />
                                            <div>
                                                <span style={{ color: 'white', fontSize: '14px' }}>noindex</span>
                                                <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>Hide from search engines</p>
                                            </div>
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={article.noFollow}
                                                onChange={(e) => setArticle({ ...article, noFollow: e.target.checked })}
                                                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                            />
                                            <div>
                                                <span style={{ color: 'white', fontSize: '14px' }}>nofollow</span>
                                                <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>Don't follow links</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* SEO Preview */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                                    border: '1px solid rgba(139,92,246,0.2)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        👁️ Google Search Preview
                                    </h3>

                                    <div style={{
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        fontFamily: 'Arial, sans-serif'
                                    }}>
                                        <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px' }}>
                                            {article.metaTitle || article.title || 'Article Title'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                                            yoursite.com › blog › {article.slug || 'article-slug'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#545454', lineHeight: 1.4 }}>
                                            {article.metaDescription || article.excerpt || 'Article description will appear here...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                {/* Publishing */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        📅 Publishing
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                                <HiOutlineCalendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />
                                                Schedule Publication
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={article.scheduledAt}
                                                onChange={(e) => setArticle({ ...article, scheduledAt: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    outline: 'none',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Options */}
                                <div style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'white' }}>
                                        ⚙️ Options
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={article.isFeatured}
                                                onChange={(e) => setArticle({ ...article, isFeatured: e.target.checked })}
                                                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                            />
                                            <div>
                                                <span style={{ color: 'white', fontSize: '14px' }}>Featured Article</span>
                                                <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>Show prominently on homepage</p>
                                            </div>
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={article.allowComments}
                                                onChange={(e) => setArticle({ ...article, allowComments: e.target.checked })}
                                                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                            />
                                            <div>
                                                <span style={{ color: 'white', fontSize: '14px' }}>Allow Comments</span>
                                                <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>Enable reader comments</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BlogEditor;
