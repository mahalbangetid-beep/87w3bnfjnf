import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineFolder,
    HiOutlineDocument,
    HiOutlinePhotograph,
    HiOutlineFilm,
    HiOutlineMusicNote,
    HiOutlineCode,
    HiOutlineLink,
    HiOutlineCloudUpload,
    HiOutlineRefresh,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineSearch,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineChevronRight,
    HiOutlineDotsVertical,
    HiOutlineTrash,
    HiOutlineExternalLink,
    HiOutlineCheck,
    HiOutlineStar,
} from 'react-icons/hi';
import { workFilesAPI, projectsAPI } from '../../services/api';

// File type icons
const getFileIcon = (type) => {
    const icons = {
        folder: HiOutlineFolder,
        image: HiOutlinePhotograph,
        video: HiOutlineFilm,
        audio: HiOutlineMusicNote,
        code: HiOutlineCode,
        document: HiOutlineDocument,
        link: HiOutlineLink,
    };
    return icons[type] || HiOutlineDocument;
};

// File type colors
const getFileColor = (type) => {
    const colors = {
        folder: '#f59e0b',
        image: '#ec4899',
        video: '#ef4444',
        audio: '#8b5cf6',
        code: '#06b6d4',
        document: '#10b981',
        link: '#6366f1',
    };
    return colors[type] || '#9ca3af';
};

const Assets = () => {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPath, setCurrentPath] = useState([]); // Array of folder objects for breadcrumb
    const [currentParentId, setCurrentParentId] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showGDriveModal, setShowGDriveModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Google Drive state (placeholder - still local)
    const [gDriveConfig, setGDriveConfig] = useState({
        connected: false,
        email: '',
        lastSync: null,
    });

    // Form state for new item
    const [newItemForm, setNewItemForm] = useState({
        type: 'folder',
        name: '',
        url: '',
        fileType: 'document',
        projectId: null,
    });

    // Auto-clear error
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    // Fetch files from API
    const fetchFiles = async (parentId = null) => {
        try {
            setLoading(true);
            const params = {};
            if (parentId) {
                params.parentId = parentId;
            } else {
                params.parentId = 'null';
            }
            if (searchTerm) {
                params.search = searchTerm;
            }
            const data = await workFilesAPI.getAll(params);
            setFiles(data || []);
        } catch {
            setErrorWithTimeout('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    // Load projects from API
    const fetchProjects = async () => {
        try {
            const data = await projectsAPI.getAll();
            setProjects(data || []);
        } catch {
            // Silently fail - projects are optional
        }
    };

    useEffect(() => {
        fetchFiles(currentParentId);
        fetchProjects();
    }, [currentParentId]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFiles(currentParentId);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load Google Drive config from localStorage (still local for now)
    useEffect(() => {
        try {
            const saved = localStorage.getItem('workspace_gdrive_config');
            if (saved) setGDriveConfig(JSON.parse(saved));
        } catch (err) {
            // Ignore
        }
    }, []);

    // Navigate into folder
    const navigateToFolder = (folder) => {
        setCurrentPath([...currentPath, folder]);
        setCurrentParentId(folder.id);
        setSelectedItem(null);
    };

    // Navigate back
    const navigateBack = (index = -1) => {
        if (index === -1) {
            const newPath = currentPath.slice(0, -1);
            setCurrentPath(newPath);
            setCurrentParentId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
        } else if (index === -2) {
            // Go to root
            setCurrentPath([]);
            setCurrentParentId(null);
        } else {
            const newPath = currentPath.slice(0, index + 1);
            setCurrentPath(newPath);
            setCurrentParentId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
        }
        setSelectedItem(null);
    };

    // Create new folder/file
    const handleCreateItem = async () => {
        if (!newItemForm.name.trim()) {
            setErrorWithTimeout('Please enter a name');
            return;
        }

        try {
            const data = {
                name: newItemForm.name,
                type: newItemForm.type,
                fileType: newItemForm.type === 'folder' ? null : newItemForm.fileType,
                url: newItemForm.type !== 'folder' ? newItemForm.url : null,
                parentId: currentParentId,
                projectId: newItemForm.projectId,
            };

            await workFilesAPI.create(data);
            await fetchFiles(currentParentId);
            setShowNewModal(false);
            setNewItemForm({ type: 'folder', name: '', url: '', fileType: 'document', projectId: null });
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to create item');
        }
    };

    // Delete item
    const handleDeleteItem = async () => {
        if (!confirmDelete) return;

        try {
            await workFilesAPI.delete(confirmDelete.id);
            await fetchFiles(currentParentId);
            setConfirmDelete(null);
            setSelectedItem(null);
        } catch (err) {
            setErrorWithTimeout('Failed to delete item');
        }
    };

    // Toggle star
    const handleToggleStar = async (item) => {
        try {
            await workFilesAPI.toggleStar(item.id);
            await fetchFiles(currentParentId);
        } catch (err) {
            setErrorWithTimeout('Failed to update item');
        }
    };

    // Google Drive connect (placeholder - will need actual OAuth)
    const handleGDriveConnect = () => {
        // This is a placeholder - actual implementation would use Google OAuth
        alert('Google Drive integration requires OAuth setup.\n\nTo enable:\n1. Create a Google Cloud Project\n2. Enable Google Drive API\n3. Create OAuth credentials\n4. Add Client ID to the app');
        setShowGDriveModal(false);
    };

    // Google Drive sync (placeholder)
    const handleGDriveSync = () => {
        if (!gDriveConfig.connected) {
            setShowGDriveModal(true);
            return;
        }
        alert('Syncing with Google Drive...');
    };

    // Separate folders and files
    const folders = files.filter(f => f.type === 'folder');
    const regularFiles = files.filter(f => f.type !== 'folder');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>⚠️</span>
                        <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('work.assets.title', 'Assets')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('work.assets.subtitle', 'Manage project files and documents')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Google Drive Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowGDriveModal(true)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: gDriveConfig.connected ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: gDriveConfig.connected ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            color: gDriveConfig.connected ? '#34d399' : '#9ca3af',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <HiOutlineCloudUpload style={{ width: '18px', height: '18px' }} />
                        {gDriveConfig.connected ? 'Connected' : 'Connect Drive'}
                    </motion.button>

                    {gDriveConfig.connected && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={handleGDriveSync}
                            style={{
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: '#9ca3af',
                                cursor: 'pointer',
                            }}
                        >
                            <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNewModal(true)}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        New
                    </motion.button>
                </div>
            </div>

            {/* Breadcrumb & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <button
                        onClick={() => setCurrentPath([])}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: currentPath.length === 0 ? 'rgba(139,92,246,0.2)' : 'transparent',
                            color: currentPath.length === 0 ? '#a78bfa' : '#9ca3af',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        Root
                    </button>
                    {currentPath.map((folder, index) => (
                        <div key={folder.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <HiOutlineChevronRight style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                            <button
                                onClick={() => navigateBack(index)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: index === currentPath.length - 1 ? 'rgba(139,92,246,0.2)' : 'transparent',
                                    color: index === currentPath.length - 1 ? '#a78bfa' : '#9ca3af',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                }}
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', width: '250px' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '16px', height: '16px' }} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Project Folders (only show at root) */}
            {currentPath.length === 0 && projects.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>Project Folders</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                        {projects.map((project) => {
                            // Count items linked to this project
                            const projectItems = files.filter((f) => f.projectId === project.id).length;

                            return (
                                <motion.div
                                    key={project.id}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    onClick={async () => {
                                        // Create project root folder if it doesn't exist, or filter by project
                                        try {
                                            // Fetch files for this project
                                            const params = { projectId: project.id };
                                            const data = await workFilesAPI.getAll(params);
                                            setFiles(data || []);
                                            setCurrentPath([{ id: `project-${project.id}`, name: project.name, projectId: project.id }]);
                                            setCurrentParentId(null);
                                        } catch {
                                            setErrorWithTimeout('Failed to load project files');
                                        }
                                    }}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: `${project.color}15`,
                                        border: `1px solid ${project.color}30`,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${project.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <HiOutlineFolder style={{ width: '22px', height: '22px', color: project.color }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: 'white', fontSize: '14px', margin: 0 }}>{project.name}</p>
                                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>{projectItems} items</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* File Manager */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiOutlineViewGrid style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                        File Manager
                    </h2>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {folders.length} folders, {files.length} files
                    </span>
                </div>

                {/* Grid View */}
                {folders.length === 0 && files.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>This folder is empty</h3>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>Create folders and add files to get started</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowNewModal(true)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: 'rgba(139,92,246,0.2)',
                                color: '#a78bfa',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                            Create New
                        </motion.button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                        {/* Folders */}
                        {folders.map((folder) => {
                            const Icon = getFileIcon('folder');
                            const color = folder.type === 'project-folder' ? (projects.find((p) => p.id === folder.projectId)?.color || '#f59e0b') : getFileColor('folder');

                            return (
                                <motion.div
                                    key={folder.id}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    onDoubleClick={() => navigateToFolder(folder)}
                                    onClick={() => setSelectedItem(folder)}
                                    style={{
                                        padding: '20px',
                                        borderRadius: '14px',
                                        backgroundColor: selectedItem?.id === folder.id ? `${color}20` : 'rgba(255,255,255,0.03)',
                                        border: selectedItem?.id === folder.id ? `2px solid ${color}50` : '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Icon style={{ width: '28px', height: '28px', color }} />
                                    </div>
                                    <p style={{ fontWeight: '500', color: 'white', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</p>
                                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                        Folder
                                    </p>

                                    {/* Delete button on hover */}
                                    {selectedItem?.id === folder.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDelete(folder);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: 'rgba(239,68,68,0.2)',
                                                color: '#f87171',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Files */}
                        {regularFiles.map((file) => {
                            const Icon = getFileIcon(file.type);
                            const color = getFileColor(file.type);

                            return (
                                <motion.div
                                    key={file.id}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    onClick={() => setSelectedItem(file)}
                                    onDoubleClick={() => file.url && window.open(file.url, '_blank')}
                                    style={{
                                        padding: '20px',
                                        borderRadius: '14px',
                                        backgroundColor: selectedItem?.id === file.id ? `${color}20` : 'rgba(255,255,255,0.03)',
                                        border: selectedItem?.id === file.id ? `2px solid ${color}50` : '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Icon style={{ width: '28px', height: '28px', color }} />
                                    </div>
                                    <p style={{ fontWeight: '500', color: 'white', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{file.type}</p>

                                    {/* Actions on select */}
                                    {selectedItem?.id === file.id && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                                            {file.url && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(file.url, '_blank');
                                                    }}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: 'rgba(139,92,246,0.2)',
                                                        color: '#a78bfa',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <HiOutlineExternalLink style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmDelete(file);
                                                }}
                                                style={{
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: 'rgba(239,68,68,0.2)',
                                                    color: '#f87171',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Google Drive Info */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiOutlineCloudUpload style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>Google Drive Integration</h3>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                            {gDriveConfig.connected
                                ? `Connected as ${gDriveConfig.email} • Last sync: ${gDriveConfig.lastSync || 'Never'}`
                                : 'Connect your Google Drive to sync files across devices'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowGDriveModal(true)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: gDriveConfig.connected ? 'rgba(239,68,68,0.1)' : 'rgba(66,133,244,0.2)',
                            color: gDriveConfig.connected ? '#f87171' : '#60a5fa',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        {gDriveConfig.connected ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>

            {/* New Item Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>Create New</h2>
                                <button onClick={() => setShowNewModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Type Selection */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Type</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['folder', 'link', 'document', 'image', 'video', 'audio', 'code'].map((type) => {
                                            const Icon = getFileIcon(type);
                                            const color = getFileColor(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewItemForm({ ...newItemForm, type })}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '10px',
                                                        border: newItemForm.type === type ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
                                                        backgroundColor: newItemForm.type === type ? `${color}20` : 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Icon style={{ width: '20px', height: '20px', color }} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={newItemForm.name}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                                        placeholder={newItemForm.type === 'folder' ? 'Folder name' : 'File name'}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                {/* URL (for non-folders) */}
                                {newItemForm.type !== 'folder' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>URL / Link (optional)</label>
                                        <input
                                            type="text"
                                            value={newItemForm.url}
                                            onChange={(e) => setNewItemForm({ ...newItemForm, url: e.target.value })}
                                            placeholder="https://drive.google.com/..."
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateItem} className="btn-glow" style={{ flex: 1, fontSize: '14px' }}>
                                        Create
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google Drive Modal */}
            <AnimatePresence>
                {showGDriveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '450px', padding: '32px', textAlign: 'center' }}
                        >
                            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <HiOutlineCloudUpload style={{ width: '36px', height: '36px', color: 'white' }} />
                            </div>

                            <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                                {gDriveConfig.connected ? 'Google Drive Connected' : 'Connect Google Drive'}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                                {gDriveConfig.connected
                                    ? `Signed in as ${gDriveConfig.email}`
                                    : 'Sync your files with Google Drive for access anywhere'}
                            </p>

                            {!gDriveConfig.connected ? (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleGDriveConnect}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: '#4285F4',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="white">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </motion.button>
                                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '16px' }}>
                                        Note: OAuth setup required for production use
                                    </p>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowGDriveModal(false)}
                                        style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGDriveConfig({ connected: false, email: '', lastSync: null });
                                            localStorage.removeItem('workspace_gdrive_config');
                                            setShowGDriveModal(false);
                                        }}
                                        style={{ flex: 1, padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <HiOutlineTrash style={{ width: '28px', height: '28px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
                                Delete {confirmDelete.type === 'folder' ? 'Folder' : 'File'}?
                            </h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>
                                "{confirmDelete.name}"
                            </p>
                            {confirmDelete.type === 'folder' && (
                                <p style={{ fontSize: '12px', color: '#f87171', margin: '0 0 24px 0' }}>
                                    All contents inside will also be deleted!
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={handleDeleteItem} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Assets;
