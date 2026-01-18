import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlinePhotograph, HiOutlineX, HiOutlineHashtag, HiOutlineSparkles,
    HiOutlineClock, HiOutlinePaperAirplane, HiOutlineDocumentDuplicate,
    HiOutlineEmojiHappy, HiOutlineTrash, HiOutlinePlus, HiOutlineCollection,
    HiOutlineRefresh, HiOutlineChevronDown, HiOutlineCheck, HiOutlineSave
} from 'react-icons/hi';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { socialAPI, aiAPI } from '../../services/api';

// Platform configurations
const PLATFORMS = {
    all: { name: 'All Platforms', icon: '🌐', color: '#8b5cf6', limit: 280 },
    instagram: { name: 'Instagram', icon: FaInstagram, color: '#E4405F', limit: 2200 },
    facebook: { name: 'Facebook', icon: FaFacebookF, color: '#1877F2', limit: 63206 },
    twitter: { name: 'Twitter/X', icon: FaXTwitter, color: '#000000', limit: 280 },
    linkedin: { name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2', limit: 3000 },
};

const SosmedPosting = () => {
    const { t } = useTranslation();
    // State
    const [activePlatform, setActivePlatform] = useState('all');
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [hashtagInput, setHashtagInput] = useState('');
    const [hashtagCollections, setHashtagCollections] = useState([]);
    const [showHashtagPanel, setShowHashtagPanel] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDrafts, setShowDrafts] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'facebook', 'twitter', 'linkedin']);
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // Auto-clear messages after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };
    const setSuccessWithTimeout = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 5000);
    };

    // Fetch data on mount
    useEffect(() => {
        fetchHashtagCollections();
        fetchDrafts();
        fetchConnectedAccounts();
    }, []);

    const fetchHashtagCollections = async () => {
        try {
            const data = await socialAPI.getHashtags();
            setHashtagCollections(data);
        } catch (error) {
            // Silent fail - hashtags may not be set up
        }
    };

    const fetchDrafts = async () => {
        try {
            const data = await socialAPI.getPosts({ status: 'draft' });
            setDrafts(data.posts || []);
            const queueData = await socialAPI.getPosts({ status: 'queued' });
            setQueue(queueData.posts || []);
        } catch (error) {
            // Silent fail - drafts may be empty
        }
    };

    const fetchConnectedAccounts = async () => {
        try {
            const data = await socialAPI.getAccounts();
            setConnectedAccounts(data);
        } catch (error) {
            // Silent fail - accounts may not be connected
        }
    };

    // Character count
    const getCharLimit = () => {
        if (activePlatform === 'all') {
            return Math.min(...selectedPlatforms.map(p => PLATFORMS[p]?.limit || 280));
        }
        return PLATFORMS[activePlatform]?.limit || 280;
    };

    const charCount = content.length;
    const charLimit = getCharLimit();
    const isOverLimit = charCount > charLimit;

    // Platform toggle for "All" mode
    const togglePlatform = (platform) => {
        if (activePlatform !== 'all') return;
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    // Media handling
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addMediaFiles(files);
    };

    const addMediaFiles = (files) => {
        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image'
        }));
        setMediaFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 files
    };

    const removeMedia = (index) => {
        setMediaFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    // Drag & Drop
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneRef.current?.classList.add('drag-over');
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneRef.current?.classList.remove('drag-over');
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneRef.current?.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image') || file.type.startsWith('video')
        );
        addMediaFiles(files);
    }, []);

    // Hashtag handling
    const addHashtag = () => {
        if (!hashtagInput.trim()) return;
        const tag = hashtagInput.trim().replace(/^#/, '');
        if (!hashtags.includes(tag)) {
            setHashtags(prev => [...prev, tag]);
        }
        setHashtagInput('');
    };

    const removeHashtag = (tag) => {
        setHashtags(prev => prev.filter(t => t !== tag));
    };

    const loadHashtagCollection = (collection) => {
        const newTags = collection.hashtags.filter(t => !hashtags.includes(t));
        setHashtags(prev => [...prev, ...newTags]);
        socialAPI.useHashtag(collection.id).catch(() => { /* Silent fail */ });
    };

    // AI Content Generation
    const generateAIContent = async () => {
        if (!aiPrompt.trim()) return;

        setAiLoading(true);
        try {
            const result = await aiAPI.generateCaption({
                topic: aiPrompt,
                platform: activePlatform === 'all' ? 'general' : activePlatform,
                tone: 'professional'
            });
            setContent(result.content || '');
            setSuccessWithTimeout(t('social.success.contentGenerated', 'Content generated successfully'));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.aiGeneration', 'Failed to generate content'));
        } finally {
            setAiLoading(false);
        }
    };

    const generateAIHashtags = async () => {
        if (!content.trim()) return;

        setAiLoading(true);
        try {
            const result = await aiAPI.generateHashtags({
                content,
                count: 10
            });
            // Parse hashtags from result
            if (result.content) {
                const tags = result.content.split('\n').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
                setHashtags(prev => [...new Set([...prev, ...tags])]);
                setSuccessWithTimeout(t('social.success.hashtagsGenerated', 'Hashtags generated successfully'));
            }
        } catch (error) {
            setErrorWithTimeout(t('social.errors.aiHashtags', 'Failed to generate hashtags'));
        } finally {
            setAiLoading(false);
        }
    };

    // Save & Submit actions
    const saveDraft = async () => {
        setLoading(true);
        try {
            await socialAPI.createPost({
                content,
                mediaUrls: mediaFiles.map(m => m.preview),
                hashtags,
                platforms: activePlatform === 'all' ? selectedPlatforms : [activePlatform],
                status: 'draft'
            });
            fetchDrafts();
            clearForm();
            setSuccessWithTimeout(t('social.success.draftSaved', 'Draft saved successfully'));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.saveDraft', 'Failed to save draft'));
        } finally {
            setLoading(false);
        }
    };

    const addToQueue = async () => {
        setLoading(true);
        try {
            await socialAPI.createPost({
                content,
                mediaUrls: mediaFiles.map(m => m.preview),
                hashtags,
                platforms: activePlatform === 'all' ? selectedPlatforms : [activePlatform],
                status: 'queued'
            });
            fetchDrafts();
            clearForm();
            setSuccessWithTimeout(t('social.success.addedToQueue', 'Added to queue successfully'));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.addToQueue', 'Failed to add to queue'));
        } finally {
            setLoading(false);
        }
    };

    const schedulePost = async () => {
        if (!scheduleDate || !scheduleTime) return;

        setLoading(true);
        try {
            const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            await socialAPI.createPost({
                content,
                mediaUrls: mediaFiles.map(m => m.preview),
                hashtags,
                platforms: activePlatform === 'all' ? selectedPlatforms : [activePlatform],
                status: 'scheduled',
                scheduledAt
            });
            setShowScheduleModal(false);
            clearForm();
            setSuccessWithTimeout(t('social.success.postScheduled', 'Post scheduled successfully'));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.schedule', 'Failed to schedule post'));
        } finally {
            setLoading(false);
        }
    };

    const publishNow = async () => {
        setLoading(true);
        try {
            const post = await socialAPI.createPost({
                content,
                mediaUrls: mediaFiles.map(m => m.preview),
                hashtags,
                platforms: activePlatform === 'all' ? selectedPlatforms : [activePlatform],
                status: 'draft'
            });
            await socialAPI.publishPost(post.id);
            clearForm();
            setSuccessWithTimeout(t('social.success.postPublished', 'Post published successfully'));
        } catch (error) {
            setErrorWithTimeout(t('social.errors.publish', 'Failed to publish post'));
        } finally {
            setLoading(false);
        }
    };

    const loadDraft = (draft) => {
        setContent(draft.content || '');
        setHashtags(draft.hashtags || []);
        if (draft.platforms?.length === 1) {
            setActivePlatform(draft.platforms[0]);
        } else {
            setActivePlatform('all');
            setSelectedPlatforms(draft.platforms || []);
        }
        setShowDrafts(false);
    };

    const clearForm = () => {
        setContent('');
        setMediaFiles([]);
        setHashtags([]);
        setAiPrompt('');
    };

    // Render platform icon
    const renderPlatformIcon = (platform, size = 20) => {
        const config = PLATFORMS[platform];
        if (!config) return null;
        if (typeof config.icon === 'string') {
            return <span style={{ fontSize: size }}>{config.icon}</span>;
        }
        const Icon = config.icon;
        return <Icon style={{ width: size, height: size }} />;
    };

    return (
        <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 100px)' }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                            <span className="gradient-text">{t('social.posting.title', 'Social Media Posting')}</span>
                        </h1>
                        <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                            {t('social.posting.subtitle', 'Create and schedule posts across all your social platforms')}
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

                {/* Platform Tabs */}
                <div className="glass-card" style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {Object.entries(PLATFORMS).map(([key, platform]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActivePlatform(key)}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: activePlatform === key ? `${platform.color}20` : 'transparent',
                                    color: activePlatform === key ? platform.color : '#9ca3af',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: activePlatform === key ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {renderPlatformIcon(key)}
                                <span className="hide-mobile">{platform.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Platform Selection (for "All" mode) */}
                <AnimatePresence>
                    {activePlatform === 'all' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card"
                            style={{ padding: '16px' }}
                        >
                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                                Select platforms to post to:
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {Object.entries(PLATFORMS).filter(([k]) => k !== 'all').map(([key, platform]) => (
                                    <motion.button
                                        key={key}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => togglePlatform(key)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: `2px solid ${selectedPlatforms.includes(key) ? platform.color : 'rgba(255,255,255,0.1)'}`,
                                            backgroundColor: selectedPlatforms.includes(key) ? `${platform.color}20` : 'transparent',
                                            color: selectedPlatforms.includes(key) ? platform.color : '#6b7280',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {renderPlatformIcon(key, 16)}
                                        {platform.name}
                                        {selectedPlatforms.includes(key) && (
                                            <HiOutlineCheck style={{ width: '14px', height: '14px' }} />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post Composer */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    {/* Content Editor */}
                    <div style={{ marginBottom: '20px' }}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind? Write your post here..."
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${isOverLimit ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                color: 'white',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'transparent',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    <HiOutlineEmojiHappy style={{ width: '16px', height: '16px' }} />
                                </button>
                                <button
                                    onClick={() => setShowAIPanel(true)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        backgroundColor: 'rgba(139,92,246,0.1)',
                                        color: '#a78bfa',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <HiOutlineSparkles style={{ width: '14px', height: '14px' }} />
                                    AI Caption
                                </button>
                                <span style={{ fontSize: '11px', color: '#6b7280', alignSelf: 'center' }}>
                                    💡 Write keywords first for better results
                                </span>
                            </div>
                            <span style={{
                                fontSize: '13px',
                                color: isOverLimit ? '#ef4444' : charCount > charLimit * 0.9 ? '#f59e0b' : '#6b7280'
                            }}>
                                {charCount} / {charLimit}
                            </span>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            padding: '24px',
                            borderRadius: '12px',
                            border: '2px dashed rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            textAlign: 'center',
                            marginBottom: '20px',
                            transition: 'all 0.2s'
                        }}
                        className="drop-zone"
                    >
                        {mediaFiles.length > 0 ? (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {mediaFiles.map((media, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={media.preview}
                                            alt={`Media ${index + 1}`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <button
                                            onClick={() => removeMedia(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <HiOutlineX style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '8px',
                                        border: '2px dashed rgba(255,255,255,0.2)',
                                        backgroundColor: 'transparent',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <HiOutlinePlus style={{ width: '24px', height: '24px' }} />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <HiOutlinePhotograph style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto' }} />
                                <p style={{ color: '#9ca3af', marginTop: '12px', fontSize: '14px' }}>
                                    Drag & drop images or videos here, or{' '}
                                    <span
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        browse
                                    </span>
                                </p>
                                <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                                    Maximum 10 files • PNG, JPG, GIF, MP4
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Hashtags */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                                <HiOutlineHashtag style={{ display: 'inline', marginRight: '6px' }} />
                                Hashtags ({hashtags.length})
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setShowHashtagPanel(!showHashtagPanel)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: showHashtagPanel ? 'rgba(139,92,246,0.2)' : 'transparent',
                                        color: showHashtagPanel ? '#a78bfa' : '#9ca3af',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <HiOutlineCollection style={{ width: '14px', height: '14px' }} />
                                    Collections
                                </button>
                                <button
                                    onClick={generateAIHashtags}
                                    disabled={aiLoading || !content}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        backgroundColor: 'rgba(139,92,246,0.1)',
                                        color: '#a78bfa',
                                        cursor: content ? 'pointer' : 'not-allowed',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        opacity: content ? 1 : 0.5
                                    }}
                                >
                                    <HiOutlineSparkles style={{ width: '14px', height: '14px' }} />
                                    AI Suggest
                                </button>
                            </div>
                        </div>

                        {/* Hashtag Collections Panel */}
                        <AnimatePresence>
                            {showHashtagPanel && hashtagCollections.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {hashtagCollections.map(collection => (
                                            <button
                                                key={collection.id}
                                                onClick={() => loadHashtagCollection(collection)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '16px',
                                                    border: `1px solid ${collection.color || '#8b5cf6'}40`,
                                                    backgroundColor: `${collection.color || '#8b5cf6'}10`,
                                                    color: collection.color || '#8b5cf6',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {collection.name} ({collection.hashtags?.length || 0})
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hashtag Input */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input
                                type="text"
                                value={hashtagInput}
                                onChange={(e) => setHashtagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                                placeholder="Add hashtag..."
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
                            <button
                                onClick={addHashtag}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                            </button>
                        </div>

                        {/* Hashtag Tags */}
                        {hashtags.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {hashtags.map((tag, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '16px',
                                            backgroundColor: 'rgba(139,92,246,0.15)',
                                            color: '#a78bfa',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        #{tag}
                                        <HiOutlineX
                                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                            onClick={() => removeHashtag(tag)}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Assistant */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                                <HiOutlineSparkles style={{ display: 'inline', marginRight: '6px', color: '#8b5cf6' }} />
                                AI Content Generator
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
                                    width: '16px',
                                    height: '16px',
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
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(139,92,246,0.05)',
                                        border: '1px solid rgba(139,92,246,0.2)'
                                    }}
                                >
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Describe what you want to post about... (e.g., 'Write an engaging post about our new product launch')"
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
                                            outline: 'none',
                                            marginBottom: '12px'
                                        }}
                                    />
                                    <button
                                        onClick={generateAIContent}
                                        disabled={aiLoading || !aiPrompt}
                                        className="btn-glow"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            opacity: aiPrompt ? 1 : 0.5,
                                            cursor: aiPrompt ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {aiLoading ? (
                                            <HiOutlineRefresh style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <HiOutlineSparkles style={{ width: '18px', height: '18px' }} />
                                        )}
                                        Generate Content
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={saveDraft}
                            disabled={loading || !content}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: '#9ca3af',
                                cursor: content ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: content ? 1 : 0.5
                            }}
                        >
                            <HiOutlineSave style={{ width: '18px', height: '18px' }} />
                            Save Draft
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={addToQueue}
                            disabled={loading || !content}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: '#9ca3af',
                                cursor: content ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: content ? 1 : 0.5
                            }}
                        >
                            <HiOutlineDocumentDuplicate style={{ width: '18px', height: '18px' }} />
                            Add to Queue
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowScheduleModal(true)}
                            disabled={loading || !content}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: '1px solid rgba(6,182,212,0.3)',
                                backgroundColor: 'rgba(6,182,212,0.1)',
                                color: '#06b6d4',
                                cursor: content ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                opacity: content ? 1 : 0.5
                            }}
                        >
                            <HiOutlineClock style={{ width: '18px', height: '18px' }} />
                            Schedule
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={publishNow}
                            disabled={loading || !content || isOverLimit}
                            className="btn-glow"
                            style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: content && !isOverLimit ? 1 : 0.5,
                                cursor: content && !isOverLimit ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <HiOutlinePaperAirplane style={{ width: '18px', height: '18px' }} />
                            Post Now
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
                                Drafts & Queue
                            </h3>
                            {drafts.length === 0 && queue.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                                    No drafts or queued posts yet
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[...drafts, ...queue].map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontSize: '14px', marginBottom: '4px' }}>
                                                    {item.content?.substring(0, 80)}...
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {item.platforms?.map(p => (
                                                        <span key={p} style={{ color: PLATFORMS[p]?.color }}>
                                                            {renderPlatformIcon(p, 14)}
                                                        </span>
                                                    ))}
                                                    <span style={{
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: item.status === 'draft' ? 'rgba(107,114,128,0.2)' : 'rgba(245,158,11,0.2)',
                                                        color: item.status === 'draft' ? '#9ca3af' : '#f59e0b'
                                                    }}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => loadDraft(item)}
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
                                                <button
                                                    onClick={() => socialAPI.deletePost(item.id).then(fetchDrafts)}
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
                        Live Preview
                    </h3>

                    {/* Preview Card */}
                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: activePlatform === 'twitter' ? '#000' : '#fff',
                        color: activePlatform === 'twitter' ? '#fff' : '#000'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: activePlatform === 'instagram' ? '50%' : '8px',
                                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                U
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>Your Name</p>
                                <p style={{
                                    fontSize: '12px',
                                    margin: 0,
                                    color: activePlatform === 'twitter' ? '#71767b' : '#65676b'
                                }}>
                                    @username • Just now
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <p style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                            {content || 'Your post content will appear here...'}
                        </p>

                        {/* Hashtags */}
                        {hashtags.length > 0 && (
                            <p style={{ fontSize: '14px', color: '#1d9bf0', marginBottom: '12px' }}>
                                {hashtags.map(t => `#${t}`).join(' ')}
                            </p>
                        )}

                        {/* Media Preview */}
                        {mediaFiles.length > 0 && (
                            <div style={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginBottom: '12px'
                            }}>
                                <img
                                    src={mediaFiles[0].preview}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover'
                                    }}
                                />
                                {mediaFiles.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        fontSize: '12px'
                                    }}>
                                        +{mediaFiles.length - 1} more
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Engagement Mockup */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            paddingTop: '12px',
                            borderTop: `1px solid ${activePlatform === 'twitter' ? '#2f3336' : '#ced0d4'}`
                        }}>
                            <span style={{ fontSize: '12px', color: activePlatform === 'twitter' ? '#71767b' : '#65676b' }}>💬 0</span>
                            <span style={{ fontSize: '12px', color: activePlatform === 'twitter' ? '#71767b' : '#65676b' }}>🔄 0</span>
                            <span style={{ fontSize: '12px', color: activePlatform === 'twitter' ? '#71767b' : '#65676b' }}>❤️ 0</span>
                        </div>
                    </div>

                    {/* Platform Info */}
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: PLATFORMS[activePlatform]?.color }}>
                                {renderPlatformIcon(activePlatform)}
                            </span>
                            <span style={{ fontSize: '14px', color: 'white' }}>
                                {PLATFORMS[activePlatform]?.name}
                            </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                            Character limit: {charLimit.toLocaleString()}
                        </p>
                        {connectedAccounts.filter(a => a.platform === activePlatform || activePlatform === 'all').length === 0 && (
                            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>
                                ⚠️ No account connected
                            </p>
                        )}
                    </div>
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
                                Schedule Post
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
                .drop-zone.drag-over {
                    border-color: #8b5cf6 !important;
                    background-color: rgba(139, 92, 246, 0.1) !important;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 1024px) {
                    .hide-tablet { display: none !important; }
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default SosmedPosting;
