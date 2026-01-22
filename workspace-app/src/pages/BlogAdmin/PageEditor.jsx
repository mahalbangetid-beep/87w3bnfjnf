import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    HiOutlineArrowLeft, HiOutlineEye, HiOutlineRefresh,
    HiOutlineGlobeAlt, HiOutlineSearch, HiOutlineDocumentText,
    HiOutlineCog, HiOutlineEyeOff, HiOutlineCheck, HiOutlineSave
} from 'react-icons/hi';
import { pagesAPI } from '../../services/api';

const PageEditor = () => {
    const navigate = useNavigate();
    const { slug } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [showPreview, setShowPreview] = useState(false);

    const [page, setPage] = useState({
        title: '',
        subtitle: '',
        content: '',
        sections: [],
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        isPublished: true
    });

    // Page type info
    const pageInfo = {
        about: {
            name: 'About Page',
            description: 'Your company\'s story, mission, values, and team',
            icon: '🏢',
            hasRichContent: false, // Uses sections instead of rich content
            hasSections: true
        },
        privacy: {
            name: 'Privacy Policy',
            description: 'How you collect, use, and protect user data',
            icon: '🔒',
            hasRichContent: true,
            hasSections: false
        },
        terms: {
            name: 'Terms of Service',
            description: 'Legal terms and conditions for using your service',
            icon: '📜',
            hasRichContent: true,
            hasSections: false
        },
        security: {
            name: 'Security Page',
            description: 'Your security measures and compliance information',
            icon: '🛡️',
            hasRichContent: true,
            hasSections: false
        }
    };

    const currentPageInfo = pageInfo[slug] || { name: 'Page', description: '', icon: '📄', hasRichContent: true };

    // Quill modules
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                ['link'],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    }), []);

    const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'indent', 'blockquote', 'code-block', 'link', 'align'];

    const fetchPage = useCallback(async () => {
        setLoading(true);
        try {
            const data = await pagesAPI.getAdmin(slug);

            // Parse sections - could be JSON string or already an array
            let parsedSections = [];
            if (data.sections) {
                if (typeof data.sections === 'string') {
                    try {
                        parsedSections = JSON.parse(data.sections);
                    } catch (e) {
                        console.error('Failed to parse sections:', e);
                        parsedSections = [];
                    }
                } else if (Array.isArray(data.sections)) {
                    parsedSections = data.sections;
                }
            }

            // Merge with default structure to ensure all fields exist
            setPage({
                title: data.title || '',
                subtitle: data.subtitle || '',
                content: data.content || '',
                sections: parsedSections,
                metaTitle: data.metaTitle || '',
                metaDescription: data.metaDescription || '',
                metaKeywords: data.metaKeywords || '',
                isPublished: data.isPublished !== undefined ? data.isPublished : true,
                isDefault: data.isDefault || false
            });
            console.log('Loaded page data:', data);
            console.log('Parsed sections:', parsedSections);
        } catch (error) {
            console.error('Error fetching page:', error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await pagesAPI.save(slug, page);
            alert('Page saved successfully!');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset this page to default content? This cannot be undone.')) {
            return;
        }

        try {
            const response = await pagesAPI.reset(slug);
            setPage(response.page);
            alert('Page reset to default');
        } catch (error) {
            console.error('Error resetting page:', error);
            alert('Failed to reset page');
        }
    };

    const updateSection = (sectionId, field, value) => {
        setPage(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId ? { ...s, [field]: value } : s
            )
        }));
    };

    const updateSectionItem = (sectionId, itemIndex, field, value) => {
        setPage(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                const items = [...(s.items || s.members || s.points || [])];
                if (typeof items[itemIndex] === 'object') {
                    items[itemIndex] = { ...items[itemIndex], [field]: value };
                } else {
                    items[itemIndex] = value;
                }
                const itemKey = s.items ? 'items' : s.members ? 'members' : 'points';
                return { ...s, [itemKey]: items };
            })
        }));
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
                .ql-toolbar .ql-stroke { stroke: #9ca3af; }
                .ql-toolbar .ql-fill { fill: #9ca3af; }
                .ql-toolbar .ql-picker { color: #9ca3af; }
                .ql-toolbar .ql-picker-options { background: #1a1a2e; border-color: rgba(255,255,255,0.1); }
                .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #8b5cf6; }
                .ql-toolbar button:hover .ql-fill, .ql-toolbar button.ql-active .ql-fill { fill: #8b5cf6; }
                .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4 { color: #f3f4f6; margin: 24px 0 16px; }
                .ql-editor h1 { font-size: 2em; }
                .ql-editor h2 { font-size: 1.5em; }
                .ql-editor h3 { font-size: 1.25em; }
                .ql-editor p { margin-bottom: 16px; color: #d1d5db; }
                .ql-editor ul, .ql-editor ol { margin-bottom: 16px; padding-left: 24px; }
                .ql-editor li { margin-bottom: 8px; color: #d1d5db; }
                .ql-editor blockquote { border-left: 4px solid #8b5cf6; padding-left: 16px; color: #9ca3af; }
                .ql-editor a { color: #8b5cf6; }
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
                        onClick={() => navigate('/blog-admin/pages')}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '28px' }}>{currentPageInfo.icon}</span>
                            <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                                {currentPageInfo.name}
                            </h1>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {currentPageInfo.description}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <motion.button
                        onClick={handleReset}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                        Reset
                    </motion.button>

                    <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '10px 24px',
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
                        <HiOutlineSave style={{ width: '18px', height: '18px' }} />
                        {saving ? 'Saving...' : 'Save Changes'}
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

            {/* Main Content */}
            <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {/* Content Tab */}
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Title & Subtitle */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={page.title}
                                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        outline: 'none',
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: '600'
                                    }}
                                    placeholder="Page title"
                                />
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={page.subtitle || ''}
                                    onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        outline: 'none',
                                        color: '#9ca3af',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Optional subtitle"
                                />
                            </div>

                            {/* Rich Content Editor (for Privacy, Terms, Security) */}
                            {currentPageInfo.hasRichContent && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                        Page Content
                                    </label>
                                    {page.content !== undefined && (
                                        <ReactQuill
                                            key={`quill-${slug}`}
                                            theme="snow"
                                            value={page.content || ''}
                                            onChange={(content) => setPage(prev => ({ ...prev, content }))}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="Write your page content here..."
                                        />
                                    )}
                                    {page.isDefault && (
                                        <p style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: 'rgba(139,92,246,0.1)',
                                            color: '#a78bfa',
                                            fontSize: '13px'
                                        }}>
                                            💡 This is the default content. Edit and save to customize this page.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Section Editor (for About page) */}
                            {currentPageInfo.hasSections && (
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>
                                        Page Sections ({page.sections?.length || 0} sections)
                                    </h3>

                                    {(!page.sections || page.sections.length === 0) && (
                                        <div style={{
                                            padding: '40px',
                                            textAlign: 'center',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px dashed rgba(255,255,255,0.1)'
                                        }}>
                                            <span style={{ fontSize: '48px' }}>📄</span>
                                            <p style={{ color: '#6b7280', marginTop: '16px' }}>
                                                No sections loaded. Try refreshing the page or check the console for errors.
                                            </p>
                                        </div>
                                    )}

                                    {page.sections && page.sections.length > 0 && page.sections.map((section, sIndex) => (
                                        <motion.div
                                            key={section.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                padding: '24px',
                                                borderRadius: '16px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                marginBottom: '20px'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '16px',
                                                paddingBottom: '16px',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(139,92,246,0.2)',
                                                    color: '#a78bfa',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {section.type}
                                                </span>
                                                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                                    Section {sIndex + 1}
                                                </span>
                                            </div>

                                            {/* Section Title */}
                                            {section.title !== undefined && (
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                        Section Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={section.title || ''}
                                                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid rgba(255,255,255,0.08)',
                                                            outline: 'none',
                                                            color: 'white',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Heading */}
                                            {section.heading !== undefined && (
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                        Heading
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={section.heading || ''}
                                                        onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid rgba(255,255,255,0.08)',
                                                            outline: 'none',
                                                            color: 'white',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Description */}
                                            {section.description !== undefined && (
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={section.description || ''}
                                                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                                                        rows={3}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255,255,255,0.03)',
                                                            border: '1px solid rgba(255,255,255,0.08)',
                                                            outline: 'none',
                                                            color: '#9ca3af',
                                                            fontSize: '14px',
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Items array (for values, stats, timeline) */}
                                            {(section.items || section.members) && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                                                        {section.type === 'team' ? 'Team Members' : 'Items'}
                                                    </label>
                                                    <div style={{ display: 'grid', gap: '12px' }}>
                                                        {(section.items || section.members).map((item, iIndex) => (
                                                            <div
                                                                key={iIndex}
                                                                style={{
                                                                    padding: '16px',
                                                                    borderRadius: '10px',
                                                                    background: 'rgba(0,0,0,0.2)',
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                                                    gap: '12px'
                                                                }}
                                                            >
                                                                {typeof item === 'object' && Object.keys(item).filter(k => !['icon', 'color', 'gradient'].includes(k)).map(key => (
                                                                    <div key={key}>
                                                                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'capitalize' }}>
                                                                            {key}
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={item[key] || ''}
                                                                            onChange={(e) => updateSectionItem(section.id, iIndex, key, e.target.value)}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '8px 12px',
                                                                                borderRadius: '6px',
                                                                                background: 'rgba(255,255,255,0.03)',
                                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                                outline: 'none',
                                                                                color: 'white',
                                                                                fontSize: '13px'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Points array (simple strings) */}
                                            {section.points && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                                                        Points
                                                    </label>
                                                    {section.points.map((point, pIndex) => (
                                                        <input
                                                            key={pIndex}
                                                            type="text"
                                                            value={point}
                                                            onChange={(e) => updateSectionItem(section.id, pIndex, null, e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 14px',
                                                                borderRadius: '8px',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                outline: 'none',
                                                                color: 'white',
                                                                fontSize: '14px',
                                                                marginBottom: '8px'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
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
                            <div style={{
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
                                    🔍 Search Engine Optimization
                                </h3>

                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                            Meta Title <span style={{ color: '#6b7280' }}>({(page.metaTitle || '').length}/60)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={page.metaTitle || ''}
                                            onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
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
                                            placeholder="SEO title for search results"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                            Meta Description <span style={{ color: '#6b7280' }}>({(page.metaDescription || '').length}/160)</span>
                                        </label>
                                        <textarea
                                            value={page.metaDescription || ''}
                                            onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
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
                                            placeholder="Brief description for search engines"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                            Meta Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={page.metaKeywords || ''}
                                            onChange={(e) => setPage({ ...page, metaKeywords: e.target.value })}
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
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <div style={{
                                    marginTop: '32px',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
                                    border: '1px solid rgba(139,92,246,0.2)'
                                }}>
                                    <h4 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px' }}>
                                        Google Search Preview
                                    </h4>
                                    <div style={{
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        fontFamily: 'Arial, sans-serif'
                                    }}>
                                        <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px' }}>
                                            {page.metaTitle || page.title || 'Page Title'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                                            yoursite.com › {slug}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#545454' }}>
                                            {page.metaDescription || page.subtitle || 'Page description will appear here...'}
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
                            <div style={{
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', color: 'white' }}>
                                    ⚙️ Page Settings
                                </h3>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={page.isPublished}
                                        onChange={(e) => setPage({ ...page, isPublished: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                    />
                                    <div>
                                        <span style={{ color: 'white', fontSize: '14px' }}>Published</span>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>
                                            Make this page visible to the public
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PageEditor;
