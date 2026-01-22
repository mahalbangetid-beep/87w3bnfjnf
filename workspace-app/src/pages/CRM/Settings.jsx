import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FiSettings, FiLayers, FiTag, FiGrid, FiPlus, FiEdit2,
    FiTrash2, FiCheck, FiX, FiMove, FiAlertCircle
} from 'react-icons/fi';
import { crmAPI } from '../../services/api';

const CRMSettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('stages');
    const [loading, setLoading] = useState(true);

    // Pipeline Stages
    const [stages, setStages] = useState([]);
    const [editingStage, setEditingStage] = useState(null);
    const [newStage, setNewStage] = useState({ name: '', color: '#8b5cf6', icon: '📋' });
    const [showNewStage, setShowNewStage] = useState(false);

    // Tags
    const [tags, setTags] = useState([]);
    const [editingTag, setEditingTag] = useState(null);
    const [newTag, setNewTag] = useState({ name: '', color: '#8b5cf6' });
    const [showNewTag, setShowNewTag] = useState(false);

    // Custom Fields
    const [customFields, setCustomFields] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [newField, setNewField] = useState({ name: '', type: 'text', isRequired: false });
    const [showNewField, setShowNewField] = useState(false);

    // Error/Success messages
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stagesData, tagsData, fieldsData] = await Promise.all([
                crmAPI.getPipelineStages(),
                crmAPI.getTags(),
                crmAPI.getCustomFields()
            ]);
            setStages(Array.isArray(stagesData) ? stagesData : []);
            setTags(Array.isArray(tagsData) ? tagsData : []);
            setCustomFields(Array.isArray(fieldsData) ? fieldsData : []);
        } catch (error) {
            console.error('Error fetching settings:', error);
            showMessage('error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // ========== PIPELINE STAGES ==========
    const handleCreateStage = async () => {
        if (!newStage.name.trim()) return;
        try {
            const created = await crmAPI.createPipelineStage(newStage);
            setStages([...stages, created]);
            setNewStage({ name: '', color: '#8b5cf6', icon: '📋' });
            setShowNewStage(false);
            showMessage('success', 'Stage created');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleUpdateStage = async () => {
        if (!editingStage) return;
        try {
            await crmAPI.updatePipelineStage(editingStage.id, editingStage);
            setStages(stages.map(s => s.id === editingStage.id ? editingStage : s));
            setEditingStage(null);
            showMessage('success', 'Stage updated');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleDeleteStage = async (id) => {
        if (!window.confirm(t('crm.confirmDeleteStage', 'Delete this stage? Clients in this stage must be moved first.'))) return;
        try {
            await crmAPI.deletePipelineStage(id);
            setStages(stages.filter(s => s.id !== id));
            showMessage('success', 'Stage deleted');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleReorderStages = async (newOrder) => {
        setStages(newOrder);
        try {
            await crmAPI.reorderPipelineStages(newOrder.map(s => s.id));
        } catch (error) {
            showMessage('error', 'Failed to reorder');
            fetchData();
        }
    };

    // ========== TAGS ==========
    const handleCreateTag = async () => {
        if (!newTag.name.trim()) return;
        try {
            const created = await crmAPI.createTag(newTag);
            setTags([...tags, created]);
            setNewTag({ name: '', color: '#8b5cf6' });
            setShowNewTag(false);
            showMessage('success', 'Tag created');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag) return;
        try {
            await crmAPI.updateTag(editingTag.id, editingTag);
            setTags(tags.map(t => t.id === editingTag.id ? editingTag : t));
            setEditingTag(null);
            showMessage('success', 'Tag updated');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleDeleteTag = async (id) => {
        if (!window.confirm(t('crm.confirmDeleteTag', 'Delete this tag?'))) return;
        try {
            await crmAPI.deleteTag(id);
            setTags(tags.filter(t => t.id !== id));
            showMessage('success', 'Tag deleted');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    // ========== CUSTOM FIELDS ==========
    const handleCreateField = async () => {
        if (!newField.name.trim()) return;
        try {
            const created = await crmAPI.createCustomField(newField);
            setCustomFields([...customFields, created]);
            setNewField({ name: '', type: 'text', isRequired: false });
            setShowNewField(false);
            showMessage('success', 'Custom field created');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleUpdateField = async () => {
        if (!editingField) return;
        try {
            await crmAPI.updateCustomField(editingField.id, editingField);
            setCustomFields(customFields.map(f => f.id === editingField.id ? editingField : f));
            setEditingField(null);
            showMessage('success', 'Custom field updated');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const handleDeleteField = async (id) => {
        if (!window.confirm(t('crm.confirmDeleteField', 'Delete this custom field?'))) return;
        try {
            await crmAPI.deleteCustomField(id);
            setCustomFields(customFields.filter(f => f.id !== id));
            showMessage('success', 'Custom field deleted');
        } catch (error) {
            showMessage('error', error.message);
        }
    };

    const iconOptions = ['📋', '🎯', '💼', '📞', '🤝', '✅', '❌', '⭐', '🔥', '💰', '📈', '🚀', '💎', '🎉', '⏳', '📌'];
    const colorOptions = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 48, height: 48, border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%' }}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiSettings style={{ color: '#8b5cf6' }} />
                    {t('crm.settings', 'CRM Settings')}
                </h1>
                <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                    {t('crm.settingsDescription', 'Manage your pipeline, tags, and custom fields')}
                </p>
            </motion.div>

            {/* Message Toast */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed', top: 20, right: 20, zIndex: 1000,
                            padding: '12px 20px', borderRadius: 10,
                            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                            color: '#fff', display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        {message.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { id: 'stages', icon: FiLayers, label: t('crm.pipelineStages', 'Pipeline Stages') },
                    { id: 'tags', icon: FiTag, label: t('crm.tags', 'Tags') },
                    { id: 'fields', icon: FiGrid, label: t('crm.customFields', 'Custom Fields') }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 10,
                            background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: activeTab === tab.id ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            color: activeTab === tab.id ? '#a78bfa' : '#9ca3af',
                            cursor: 'pointer', fontSize: 14, fontWeight: 500
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Pipeline Stages Tab */}
            {activeTab === 'stages' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(17, 17, 27, 0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.pipelineStages', 'Pipeline Stages')} ({stages.length})
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowNewStage(!showNewStage)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}
                        >
                            <FiPlus /> {t('crm.addStage', 'Add Stage')}
                        </motion.button>
                    </div>

                    {/* New Stage Form */}
                    <AnimatePresence>
                        {showNewStage && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                                <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                        <select value={newStage.icon} onChange={(e) => setNewStage({ ...newStage, icon: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 18, width: 60 }}>
                                            {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                        <input type="text" placeholder="Stage name..." value={newStage.name} onChange={(e) => setNewStage({ ...newStage, name: e.target.value })} style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                        <input type="color" value={newStage.color} onChange={(e) => setNewStage({ ...newStage, color: e.target.value })} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleCreateStage} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}><FiCheck /> Save</button>
                                        <button onClick={() => setShowNewStage(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stages List (Draggable) */}
                    <Reorder.Group axis="y" values={stages} onReorder={handleReorderStages} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {stages.map(stage => (
                            <Reorder.Item key={stage.id} value={stage} style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: 'grab' }}>
                                    <FiMove style={{ color: '#6b7280' }} />
                                    <span style={{ fontSize: 20 }}>{stage.icon}</span>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: stage.color }} />
                                    {editingStage?.id === stage.id ? (
                                        <>
                                            <input type="text" value={editingStage.name} onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })} style={{ flex: 1, padding: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff' }} />
                                            <button onClick={handleUpdateStage} style={{ padding: 8, background: 'rgba(16, 185, 129, 0.2)', border: 'none', borderRadius: 6, color: '#10b981', cursor: 'pointer' }}><FiCheck /></button>
                                            <button onClick={() => setEditingStage(null)} style={{ padding: 8, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}><FiX /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ flex: 1, color: '#fff', fontWeight: 500 }}>{stage.name}</span>
                                            {stage.stageType && <span style={{ padding: '2px 8px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: 10, fontSize: 10, textTransform: 'uppercase' }}>{stage.stageType}</span>}
                                            <button onClick={() => setEditingStage(stage)} style={{ padding: 8, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><FiEdit2 size={14} /></button>
                                            <button onClick={() => handleDeleteStage(stage.id)} style={{ padding: 8, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                                        </>
                                    )}
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {stages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                            <FiLayers style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                            <p>{t('crm.noStages', 'No pipeline stages defined')}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Tags Tab */}
            {activeTab === 'tags' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(17, 17, 27, 0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.tags', 'Tags')} ({tags.length})
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowNewTag(!showNewTag)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}
                        >
                            <FiPlus /> {t('crm.addTag', 'Add Tag')}
                        </motion.button>
                    </div>

                    {/* New Tag Form */}
                    <AnimatePresence>
                        {showNewTag && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                                <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                        <input type="text" placeholder="Tag name..." value={newTag.name} onChange={(e) => setNewTag({ ...newTag, name: e.target.value })} style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {colorOptions.map(c => (
                                                <button key={c} onClick={() => setNewTag({ ...newTag, color: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: newTag.color === c ? '2px solid #fff' : 'none', cursor: 'pointer' }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleCreateTag} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}><FiCheck /> Save</button>
                                        <button onClick={() => setShowNewTag(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tags Grid */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {tags.map(tag => (
                            <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: `${tag.color}20`, borderRadius: 20, border: `1px solid ${tag.color}40` }}>
                                {editingTag?.id === tag.id ? (
                                    <>
                                        <input type="text" value={editingTag.name} onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })} style={{ padding: 4, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 4, color: '#fff', width: 100 }} />
                                        <button onClick={handleUpdateTag} style={{ padding: 4, background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}><FiCheck size={12} /></button>
                                        <button onClick={() => setEditingTag(null)} style={{ padding: 4, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><FiX size={12} /></button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ color: tag.color, fontWeight: 500, fontSize: 13 }}>{tag.name}</span>
                                        <button onClick={() => setEditingTag(tag)} style={{ padding: 4, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><FiEdit2 size={12} /></button>
                                        <button onClick={() => handleDeleteTag(tag.id)} style={{ padding: 4, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 size={12} /></button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {tags.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                            <FiTag style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                            <p>{t('crm.noTags', 'No tags created yet')}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Custom Fields Tab */}
            {activeTab === 'fields' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(17, 17, 27, 0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                            {t('crm.customFields', 'Custom Fields')} ({customFields.length})
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowNewField(!showNewField)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}
                        >
                            <FiPlus /> {t('crm.addField', 'Add Field')}
                        </motion.button>
                    </div>

                    {/* New Field Form */}
                    <AnimatePresence>
                        {showNewField && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                                <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 12 }}>
                                        <input type="text" placeholder="Field name..." value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                        <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}>
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="select">Dropdown</option>
                                            <option value="checkbox">Checkbox</option>
                                        </select>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                            <input type="checkbox" checked={newField.isRequired} onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })} />
                                            Required
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleCreateField} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}><FiCheck /> Save</button>
                                        <button onClick={() => setShowNewField(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Fields List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {customFields.map(field => (
                            <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <FiGrid style={{ color: '#6b7280' }} />
                                {editingField?.id === field.id ? (
                                    <>
                                        <input type="text" value={editingField.name} onChange={(e) => setEditingField({ ...editingField, name: e.target.value })} style={{ flex: 1, padding: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff' }} />
                                        <button onClick={handleUpdateField} style={{ padding: 8, background: 'rgba(16, 185, 129, 0.2)', border: 'none', borderRadius: 6, color: '#10b981', cursor: 'pointer' }}><FiCheck /></button>
                                        <button onClick={() => setEditingField(null)} style={{ padding: 8, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}><FiX /></button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1, color: '#fff', fontWeight: 500 }}>{field.name}</span>
                                        <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 12, color: '#9ca3af', textTransform: 'uppercase' }}>{field.type}</span>
                                        {field.isRequired && <span style={{ padding: '2px 8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: 10, fontSize: 10 }}>Required</span>}
                                        <button onClick={() => setEditingField(field)} style={{ padding: 8, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><FiEdit2 size={14} /></button>
                                        <button onClick={() => handleDeleteField(field.id)} style={{ padding: 8, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 size={14} /></button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {customFields.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                            <FiGrid style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                            <p>{t('crm.noCustomFields', 'No custom fields defined')}</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default CRMSettings;
