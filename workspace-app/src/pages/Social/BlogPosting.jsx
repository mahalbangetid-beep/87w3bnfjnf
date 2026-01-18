import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineSave, HiOutlineClock, HiOutlinePaperAirplane, HiOutlineSparkles,
    HiOutlinePhotograph, HiOutlineTag, HiOutlineCollection, HiOutlineX,
    HiOutlineChevronDown, HiOutlineRefresh, HiOutlineDocumentText
} from 'react-icons/hi';
import { blogAPI, aiAPI } from '../../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const BlogPosting = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [categoryInput, setCategoryInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [selectedConnection, setSelectedConnection] = useState('');
    const [connections, setConnections] = useState([]);
    const [showSEOPanel, setShowSEOPanel] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAction, setAiAction] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [showDrafts, setShowDrafts] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Auto-clear messages after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };
    const setSuccessWithTimeout = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 5000);
    };

    // Quill Editor Configuration
    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }), []);

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    useEffect(() => {
        fetchConnections();
        fetchDrafts();
    }, []);

    const fetchConnections = async () => {
        try {
            const data = await blogAPI.getConnections();
            setConnections(data);
            if (data.length > 0 && !selectedConnection) {
                setSelectedConnection(data[0].id.toString());
            }
        } catch (error) {
            // Silent fail - connections may not be set up
        }
    };

    const fetchDrafts = async () => {
        try {
            const data = await blogAPI.getPosts({ status: 'draft' });
            setDrafts(data.posts || []);
        } catch (error) {
            // Silent fail - drafts may be empty
        }
    };

    // Generate slug from title
    useEffect(() => {
        if (title && !slug) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [title]);

    // AI Actions
    const handleAIAction = async (action) => {
        setAiLoading(true);
        setAiAction(action);
        try {
            switch (action) {
                case 'outline':
                    if (!title) {
                        setErrorWithTimeout(t('blog.errors.enterTitleFirst', 'Please enter a title first'));
                        break;
                    }
                    const outlineResult = await aiAPI.generateBlog({
                        topic: title,
                        style: 'informative',
                        wordCount: 200
                    });
                    setContent(outlineResult.content || '');
                    setSuccessWithTimeout(t('blog.success.outlineGenerated', 'Outline generated successfully'));
                    break;

                case 'expand':
                    if (!content) {
                        setErrorWithTimeout(t('blog.errors.writeContentFirst', 'Please write some content first'));
                        break;
                    }
                    const expandResult = await aiAPI.generateBlog({
                        topic: title,
                        outline: content,
                        wordCount: 1500
                    });
                    setContent(expandResult.content || '');
                    setSuccessWithTimeout(t('blog.success.contentExpanded', 'Content expanded successfully'));
                    break;

                case 'improve':
                    if (!content) {
                        setErrorWithTimeout(t('blog.errors.writeContentFirst', 'Please write some content first'));
                        break;
                    }
                    const improveResult = await aiAPI.improveContent({
                        content,
                        improvements: ['grammar', 'clarity', 'engagement']
                    });
                    setContent(improveResult.content || content);
                    setSuccessWithTimeout(t('blog.success.contentImproved', 'Content improved successfully'));
                    break;

                case 'seo':
                    const seoResult = await aiAPI.generateSEO({
                        title,
                        content: content.substring(0, 1000)
                    });
                    try {
                        const seoData = JSON.parse(seoResult.content);
                        if (seoData.metaTitle) setMetaTitle(seoData.metaTitle);
                        if (seoData.metaDescription) setMetaDescription(seoData.metaDescription);
                        if (seoData.slug) setSlug(seoData.slug);
                        setSuccessWithTimeout(t('blog.success.seoGenerated', 'SEO metadata generated successfully'));
                    } catch {
                        setSuccessWithTimeout(t('blog.success.seoGenerated', 'SEO metadata generated. Check the content for suggestions.'));
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            const errorMsg = error?.response?.error || error?.message || t('blog.errors.aiActionFailed', 'AI action failed. Please try again.');
            setErrorWithTimeout(errorMsg);
        } finally {
            setAiLoading(false);
            setAiAction('');
        }
    };

    const addCategory = () => {
        if (!categoryInput.trim()) return;
        if (!categories.includes(categoryInput.trim())) {
            setCategories(prev => [...prev, categoryInput.trim()]);
        }
        setCategoryInput('');
    };

    const removeCategory = (cat) => {
        setCategories(prev => prev.filter(c => c !== cat));
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        if (!tags.includes(tagInput.trim())) {
            setTags(prev => [...prev, tagInput.trim()]);
        }
        setTagInput('');
    };

    const removeTag = (tag) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const saveDraft = async () => {
        if (!title) {
            setErrorWithTimeout(t('blog.errors.enterTitle', 'Please enter a title'));
            return;
        }
        setLoading(true);
        try {
            await blogAPI.createPost({
                connectionId: selectedConnection || null,
                title,
                content,
                excerpt,
                featuredImage,
                categories,
                tags,
                status: 'draft',
                metaTitle,
                metaDescription,
                slug
            });
            clearForm();
            fetchDrafts();
            setSuccessWithTimeout(t('blog.success.draftSaved', 'Draft saved successfully'));
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.saveDraftFailed', 'Failed to save draft'));
        } finally {
            setLoading(false);
        }
    };

    const schedulePost = async () => {
        if (!scheduleDate || !scheduleTime) return;

        setLoading(true);
        try {
            const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            await blogAPI.createPost({
                connectionId: selectedConnection || null,
                title,
                content,
                excerpt,
                featuredImage,
                categories,
                tags,
                status: 'scheduled',
                scheduledAt,
                metaTitle,
                metaDescription,
                slug
            });
            setShowScheduleModal(false);
            clearForm();
            setSuccessWithTimeout(t('blog.success.postScheduled', 'Post scheduled successfully'));
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.scheduleFailed', 'Failed to schedule post'));
        } finally {
            setLoading(false);
        }
    };

    const publishNow = async () => {
        if (!title || !content) {
            setErrorWithTimeout(t('blog.errors.enterTitleAndContent', 'Please enter title and content'));
            return;
        }

        setLoading(true);
        try {
            const post = await blogAPI.createPost({
                connectionId: selectedConnection || null,
                title,
                content,
                excerpt,
                featuredImage,
                categories,
                tags,
                status: 'draft',
                metaTitle,
                metaDescription,
                slug
            });
            await blogAPI.publishPost(post.id);
            clearForm();
            setSuccessWithTimeout(t('blog.success.postPublished', 'Post published successfully'));
        } catch (error) {
            setErrorWithTimeout(t('blog.errors.publishFailed', 'Failed to publish post'));
        } finally {
            setLoading(false);
        }
    };

    const loadDraft = (draft) => {
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setExcerpt(draft.excerpt || '');
        setFeaturedImage(draft.featuredImage || '');
        setCategories(draft.categories || []);
        setTags(draft.tags || []);
        setMetaTitle(draft.metaTitle || '');
        setMetaDescription(draft.metaDescription || '');
        setSlug(draft.slug || '');
        if (draft.connectionId) setSelectedConnection(draft.connectionId.toString());
        setShowDrafts(false);
    };

    const clearForm = () => {
        setTitle('');
        setContent('');
        setExcerpt('');
        setFeaturedImage('');
        setCategories([]);
        setTags([]);
        setMetaTitle('');
        setMetaDescription('');
        setSlug('');
    };

    return (
        <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 100px)' }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                            <span className="gradient-text">Blog Posting</span>
                        </h1>
                        <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                            Create and publish blog posts to your connected platforms
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowDrafts(!showDrafts)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: showDrafts ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                                color: showDrafts ? '#a78bfa' : '#9ca3af',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <HiOutlineCollection style={{ width: '18px', height: '18px' }} />
                            Drafts ({drafts.length})
                        </motion.button>
                    </div>
                </div>

                {/* Error/Success Messages */}
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
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#10b981',
                                fontSize: '14px'
                            }}
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Blog Connection Select */}
                {connections.length > 0 && (
                    <div className="glass-card" style={{ padding: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                            Publish to:
                        </label>
                        <select
                            value={selectedConnection}
                            onChange={(e) => setSelectedConnection(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        >
                            <option value="">Select a blog...</option>
                            {connections.map(conn => (
                                <option key={conn.id} value={conn.id}>
                                    {conn.siteName} ({conn.platform})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Title Input */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your blog post title..."
                        style={{
                            width: '100%',
                            padding: '16px 0',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '600',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Content Editor - Rich Text with ReactQuill */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Content</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
                        </span>
                    </div>
                    <div className="quill-container" style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Write your blog post content here..."
                            style={{
                                minHeight: '400px',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                            }}
                        />
                    </div>
                </div>

                {/* Excerpt */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '12px' }}>
                        Excerpt (optional)
                    </label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="A short summary of your post..."
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            color: 'white',
                            fontSize: '14px',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Categories & Tags */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Categories */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '12px' }}>
                                <HiOutlineCollection style={{ display: 'inline', marginRight: '6px' }} />
                                Categories
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                                    placeholder="Add category..."
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button onClick={addCategory} style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}>
                                    Add
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((cat, i) => (
                                    <span key={i} style={{
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(236,72,153,0.15)',
                                        color: '#ec4899',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {cat}
                                        <HiOutlineX style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={() => removeCategory(cat)} />
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '12px' }}>
                                <HiOutlineTag style={{ display: 'inline', marginRight: '6px' }} />
                                Tags
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add tag..."
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <button onClick={addTag} style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#06b6d4',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}>
                                    Add
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {tags.map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(6,182,212,0.15)',
                                        color: '#06b6d4',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {tag}
                                        <HiOutlineX style={{ width: '14px', height: '14px', cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Section */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showSEOPanel ? '16px' : 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                            SEO Settings
                        </span>
                        <button
                            onClick={() => setShowSEOPanel(!showSEOPanel)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer'
                            }}
                        >
                            <HiOutlineChevronDown style={{
                                width: '16px', height: '16px',
                                transform: showSEOPanel ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s'
                            }} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showSEOPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                            >
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="SEO optimized title (max 60 characters)"
                                        maxLength={60}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{metaTitle.length}/60</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder="Compelling description for search results (max 160 characters)"
                                        maxLength={160}
                                        style={{
                                            width: '100%',
                                            minHeight: '60px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            resize: 'none',
                                            outline: 'none'
                                        }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{metaDescription.length}/160</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="url-friendly-slug"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Assistant */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAIPanel ? '16px' : 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                            <HiOutlineSparkles style={{ display: 'inline', marginRight: '6px', color: '#8b5cf6' }} />
                            AI Writing Assistant
                        </span>
                        <button
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#9ca3af',
                                cursor: 'pointer'
                            }}
                        >
                            <HiOutlineChevronDown style={{
                                width: '16px', height: '16px',
                                transform: showAIPanel ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s'
                            }} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showAIPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                    {[
                                        { key: 'outline', label: 'Generate Outline', icon: HiOutlineDocumentText },
                                        { key: 'expand', label: 'Expand Content', icon: HiOutlineSparkles },
                                        { key: 'improve', label: 'Improve Writing', icon: HiOutlineRefresh },
                                        { key: 'seo', label: 'Generate SEO', icon: HiOutlineTag }
                                    ].map(action => (
                                        <motion.button
                                            key={action.key}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAIAction(action.key)}
                                            disabled={aiLoading}
                                            style={{
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(139,92,246,0.3)',
                                                backgroundColor: aiAction === action.key ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                                                color: '#a78bfa',
                                                cursor: aiLoading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontSize: '13px',
                                                opacity: aiLoading && aiAction !== action.key ? 0.5 : 1
                                            }}
                                        >
                                            {aiLoading && aiAction === action.key ? (
                                                <HiOutlineRefresh style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <action.icon style={{ width: '16px', height: '16px' }} />
                                            )}
                                            {action.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={saveDraft}
                            disabled={loading || !title}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: '#9ca3af',
                                cursor: title ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: title ? 1 : 0.5
                            }}
                        >
                            <HiOutlineSave style={{ width: '18px', height: '18px' }} />
                            Save Draft
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowScheduleModal(true)}
                            disabled={loading || !title || !content}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(6,182,212,0.3)',
                                backgroundColor: 'rgba(6,182,212,0.1)',
                                color: '#06b6d4',
                                cursor: title && content ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: title && content ? 1 : 0.5
                            }}
                        >
                            <HiOutlineClock style={{ width: '18px', height: '18px' }} />
                            Schedule
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={publishNow}
                            disabled={loading || !title || !content}
                            className="btn-glow"
                            style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: title && content ? 1 : 0.5,
                                cursor: title && content ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <HiOutlinePaperAirplane style={{ width: '18px', height: '18px' }} />
                            Publish Now
                        </motion.button>
                    </div>
                </div>

                {/* Drafts Panel */}
                <AnimatePresence>
                    {showDrafts && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="glass-card"
                            style={{ padding: '20px' }}
                        >
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                                Drafts
                            </h3>
                            {drafts.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                                    No drafts yet
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {drafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => loadDraft(draft)}
                                        >
                                            <div>
                                                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                                    {draft.title}
                                                </p>
                                                <p style={{ color: '#6b7280', fontSize: '12px' }}>
                                                    {new Date(draft.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    backgroundColor: 'rgba(139,92,246,0.1)',
                                                    color: '#a78bfa',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Load
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Preview Sidebar */}
            <div style={{ width: '320px', flexShrink: 0 }} className="hide-tablet">
                <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                        Preview
                    </h3>

                    {/* Featured Image */}
                    <div style={{
                        width: '100%',
                        height: '150px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        overflow: 'hidden'
                    }}>
                        {featuredImage ? (
                            <img src={featuredImage} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <HiOutlinePhotograph style={{ width: '32px', height: '32px', color: '#6b7280' }} />
                        )}
                    </div>

                    {/* Title Preview */}
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                        {title || 'Your blog post title...'}
                    </h4>

                    {/* Excerpt Preview */}
                    <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '16px' }}>
                        {excerpt || content?.substring(0, 150) || 'Your content preview will appear here...'}
                        {(excerpt?.length > 150 || content?.length > 150) && '...'}
                    </p>

                    {/* Categories & Tags */}
                    {(categories.length > 0 || tags.length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                            {categories.map((cat, i) => (
                                <span key={`cat-${i}`} style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(236,72,153,0.2)',
                                    color: '#ec4899',
                                    fontSize: '11px'
                                }}>
                                    {cat}
                                </span>
                            ))}
                            {tags.map((tag, i) => (
                                <span key={`tag-${i}`} style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(6,182,212,0.2)',
                                    color: '#06b6d4',
                                    fontSize: '11px'
                                }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* SEO Preview */}
                    {showSEOPanel && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                            <p style={{ fontSize: '11px', color: '#10b981', marginBottom: '4px' }}>Search Preview</p>
                            <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500', marginBottom: '4px' }}>
                                {metaTitle || title || 'Page Title'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#10b981', marginBottom: '4px' }}>
                                yoursite.com/{slug || 'url-slug'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {metaDescription || excerpt || 'Meta description...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            <AnimatePresence>
                {showScheduleModal && (
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
                        onClick={() => setShowScheduleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '400px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>
                                <HiOutlineClock style={{ display: 'inline', marginRight: '8px' }} />
                                Schedule Blog Post
                            </h3>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'transparent',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={schedulePost}
                                    disabled={!scheduleDate || !scheduleTime || loading}
                                    className="btn-glow"
                                    style={{
                                        flex: 1,
                                        opacity: scheduleDate && scheduleTime ? 1 : 0.5,
                                        cursor: scheduleDate && scheduleTime ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Schedule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 1024px) {
                    .hide-tablet { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default BlogPosting;
