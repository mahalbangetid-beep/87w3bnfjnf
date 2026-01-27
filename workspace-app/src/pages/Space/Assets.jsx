import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineCollection,
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineExternalLink,
    HiOutlineDownload,
    HiOutlineSearch,
    HiOutlinePhotograph,
    HiOutlineDocumentText,
    HiOutlineLink,
    HiOutlineCode,
    HiOutlineFolder,
} from 'react-icons/hi';
import { projectPlansAPI, spaceAPI } from '../../services/api';

const typeConfig = {
    image: { label: 'Image', icon: HiOutlinePhotograph, color: '#ec4899' },
    document: { label: 'Document', icon: HiOutlineDocumentText, color: '#06b6d4' },
    link: { label: 'Link', icon: HiOutlineLink, color: '#8b5cf6' },
    code: { label: 'Code/Repo', icon: HiOutlineCode, color: '#10b981' },
    other: { label: 'Other', icon: HiOutlineFolder, color: '#f59e0b' },
};

const SpaceAssets = () => {
    const { t } = useTranslation();
    const [assets, setAssets] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterProject, setFilterProject] = useState('all');

    // Auto-clear error after 5 seconds
    const setErrorWithTimeout = (message) => {
        setError(message);
        setTimeout(() => setError(''), 5000);
    };

    const [formData, setFormData] = useState({
        name: '',
        type: 'link',
        url: '',
        description: '',
        projectId: null,
    });

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectsData, assetsData] = await Promise.all([
                projectPlansAPI.getAll(),
                spaceAPI.getAssets(),
            ]);
            setProjects(projectsData || []);
            setAssets(assetsData || []);
        } catch {
            setErrorWithTimeout(t('errors.generic', 'Failed to load assets'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Confirm delete state
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Filter assets
    const filteredAssets = assets.filter(asset => {
        const matchSearch = asset.name.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || asset.type === filterType;
        const matchProject = filterProject === 'all' || asset.projectId === parseInt(filterProject);
        return matchSearch && matchType && matchProject;
    });

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Please enter an asset name');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingAsset) {
                const updated = await spaceAPI.updateAsset(editingAsset.id, formData);
                setAssets(assets.map(a => a.id === editingAsset.id ? updated : a));
            } else {
                const created = await spaceAPI.createAsset(formData);
                setAssets([created, ...assets]);
            }
            setShowModal(false);
            setEditingAsset(null);
            setFormData({ name: '', type: 'link', url: '', description: '', projectId: null });
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to save asset');
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = (asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            type: asset.type,
            url: asset.url || '',
            description: asset.description || '',
            projectId: asset.projectId,
        });
        setShowModal(true);
    };

    // Handle delete
    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await spaceAPI.deleteAsset(confirmDelete);
            setAssets(assets.filter(a => a.id !== confirmDelete));
            setConfirmDelete(null);
        } catch (err) {
            setErrorWithTimeout(err.message || 'Failed to delete asset');
        }
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.name || null;
    };


    // Stats
    const stats = {
        total: assets.length,
        images: assets.filter(a => a.type === 'image').length,
        documents: assets.filter(a => a.type === 'document').length,
        links: assets.filter(a => a.type === 'link').length,
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading assets...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('space.assets.title', 'Space Assets')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{t('space.assets.subtitle', 'Manage resources for your personal projects')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchData}
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <HiOutlineRefresh style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEditingAsset(null); setFormData({ name: '', type: 'link', url: '', description: '', projectId: null }); setShowModal(true); }}
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        Add Asset
                    </motion.button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Total Assets', value: stats.total, color: '#8b5cf6', icon: HiOutlineCollection },
                    { label: 'Images', value: stats.images, color: '#ec4899', icon: HiOutlinePhotograph },
                    { label: 'Documents', value: stats.documents, color: '#06b6d4', icon: HiOutlineDocumentText },
                    { label: 'Links', value: stats.links, color: '#10b981', icon: HiOutlineLink },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                        style={{ padding: '16px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon style={{ width: '18px', height: '18px', color: stat.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#6b7280' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assets..."
                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Types</option>
                    {Object.entries(typeConfig).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Assets Grid */}
            {filteredAssets.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <HiOutlineCollection style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No assets yet</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Add resources to manage for your projects!</p>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowModal(true)} className="btn-glow" style={{ fontSize: '14px' }}>
                        Add Asset
                    </motion.button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filteredAssets.map((asset, index) => {
                        const typeInfo = typeConfig[asset.type] || typeConfig.other;
                        const IconComponent = typeInfo.icon;

                        return (
                            <motion.div
                                key={asset.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '20px' }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${typeInfo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComponent style={{ width: '20px', height: '20px', color: typeInfo.color }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {asset.url && (
                                            <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textDecoration: 'none' }}>
                                                <HiOutlineExternalLink style={{ width: '14px', height: '14px' }} />
                                            </a>
                                        )}
                                        <button onClick={() => handleEdit(asset)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                            <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                        </button>
                                        <button onClick={() => setConfirmDelete(asset.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                                            <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Name & Type */}
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{asset.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}>
                                        {typeInfo.label}
                                    </span>
                                    {getProjectName(asset.projectId) && (
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>• {getProjectName(asset.projectId)}</span>
                                    )}
                                </div>

                                {/* Description */}
                                {asset.description && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{asset.description}</p>
                                )}

                                {/* URL Preview */}
                                {asset.url && (
                                    <div style={{ marginTop: '12px', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                                        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.url}</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '500px', padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{editingAsset ? 'Edit Asset' : 'Add Asset'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Asset name..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        {Object.entries(typeConfig).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="URL (https://...)"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                />

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Link to Project</label>
                                    <select
                                        value={formData.projectId || ''}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value ? parseInt(e.target.value) : null })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description (optional)..."
                                    rows={3}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-glow" style={{ flex: 1, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : editingAsset ? 'Update' : 'Add Asset'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>{t('common.confirmDelete', 'Delete Asset?')}</h3>
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>{t('space.assets.deleteWarning', 'This action cannot be undone.')}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConfirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                                    {t('common.delete', 'Delete')}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 1023px) {
                    div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 767px) {
                    div[style*="grid-template-columns: repeat(2"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default SpaceAssets;
