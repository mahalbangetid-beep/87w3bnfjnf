import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiArrowLeft, FiEdit2, FiTrash2, FiPhone, FiMail, FiGlobe,
    FiMapPin, FiCalendar, FiClock, FiPlus, FiMessageSquare,
    FiUser, FiBriefcase, FiLinkedin, FiInstagram, FiTwitter,
    FiFacebook, FiStar, FiChevronRight, FiCheck, FiX, FiBell,
    FiFileText, FiDownload, FiUpload
} from 'react-icons/fi';
import { crmAPI } from '../../services/api';

const ClientDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [showAddReminder, setShowAddReminder] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [newActivity, setNewActivity] = useState({ type: 'note', title: '', content: '' });
    const [newReminder, setNewReminder] = useState({ title: '', remindAt: '', description: '' });
    const [newContact, setNewContact] = useState({ name: '', role: '', email: '', phone: '', whatsapp: '', isPrimary: false });

    // Documents
    const [documents, setDocuments] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const fetchClient = async () => {
        try {
            setLoading(true);
            const data = await crmAPI.getClient(id);
            setClient(data);
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const docs = await crmAPI.getDocuments(id);
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchClient();
            fetchDocuments();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUploadDocument = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            await crmAPI.uploadDocument(id, file);
            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm(t('crm.confirmDeleteDocument', 'Delete this document?'))) return;

        try {
            await crmAPI.deleteDocument(docId);
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        const iconMap = {
            '.pdf': '📄',
            '.doc': '📝',
            '.docx': '📝',
            '.xls': '📊',
            '.xlsx': '📊',
            '.jpg': '🖼️',
            '.jpeg': '🖼️',
            '.png': '🖼️',
            '.gif': '🖼️',
            '.txt': '📃',
            '.csv': '📊'
        };
        return iconMap[fileType?.toLowerCase()] || '📎';
    };

    const handleAddActivity = async () => {
        if (!newActivity.title) return;

        try {
            await crmAPI.createActivity({
                clientId: id,
                ...newActivity
            });
            await fetchClient();
            setNewActivity({ type: 'note', title: '', content: '' });
            setShowAddActivity(false);
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    };

    const handleAddReminder = async () => {
        if (!newReminder.title || !newReminder.remindAt) return;

        try {
            await crmAPI.createReminder({
                clientId: id,
                ...newReminder
            });
            await fetchClient();
            setNewReminder({ title: '', remindAt: '', description: '' });
            setShowAddReminder(false);
        } catch (error) {
            console.error('Error adding reminder:', error);
        }
    };

    const handleCompleteReminder = async (reminderId) => {
        try {
            await crmAPI.completeReminder(reminderId);
            await fetchClient();
        } catch (error) {
            console.error('Error completing reminder:', error);
        }
    };

    const handleAddContact = async () => {
        if (!newContact.name.trim()) return;

        try {
            await crmAPI.createContact({
                clientId: id,
                ...newContact
            });
            await fetchClient();
            setNewContact({ name: '', role: '', email: '', phone: '', whatsapp: '', isPrimary: false });
            setShowAddContact(false);
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const handleEditContact = async () => {
        if (!editingContact || !editingContact.name.trim()) return;

        try {
            await crmAPI.updateContact(editingContact.id, editingContact);
            await fetchClient();
            setEditingContact(null);
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (!window.confirm(t('crm.confirmDeleteContact', 'Are you sure you want to delete this contact?'))) return;

        try {
            await crmAPI.deleteContact(contactId);
            await fetchClient();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm(t('crm.confirmDeleteActivity', 'Delete this activity?'))) return;

        try {
            await crmAPI.deleteActivity(activityId);
            await fetchClient();
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        if (!window.confirm(t('crm.confirmDeleteReminder', 'Delete this reminder?'))) return;

        try {
            await crmAPI.deleteReminder(reminderId);
            await fetchClient();
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('crm.confirmDelete', 'Are you sure you want to delete this client?'))) return;

        try {
            await crmAPI.deleteClient(id);
            navigate('/crm/clients');
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = { vip: '#f59e0b', high: '#ef4444', medium: '#8b5cf6', low: '#6b7280' };
        return colors[priority] || '#6b7280';
    };

    const getActivityIcon = (type) => {
        const icons = {
            note: '📝', call: '📞', email: '📧', meeting: '🤝',
            message: '💬', stage_change: '🔄', updated: '✏️', reminder: '🔔'
        };
        return icons[type] || '📋';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48, height: 48,
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    if (!client) {
        return (
            <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                <FiUser style={{ width: 64, height: 64, marginBottom: 16, opacity: 0.5 }} />
                <h2>{t('crm.clientNotFound', 'Client not found')}</h2>
                <Link to="/crm/clients" style={{ color: '#8b5cf6' }}>← Back to clients</Link>
            </div>
        );
    }

    const primaryContact = client.contacts?.find(c => c.isPrimary) || client.contacts?.[0];

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 24 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <button
                        onClick={() => navigate('/crm/clients')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'transparent', border: 'none',
                            color: '#9ca3af', cursor: 'pointer', fontSize: 14
                        }}
                    >
                        <FiArrowLeft /> {t('common.back', 'Back')}
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 80, height: 80, borderRadius: 20,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, fontWeight: 700, color: '#fff',
                            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                        }}>
                            {client.logo ? (
                                <img src={client.logo} alt="" style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover' }} />
                            ) : (
                                client.name?.charAt(0)?.toUpperCase() || 'C'
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                                    {client.name}
                                </h1>
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 12px',
                                    background: `${getPriorityColor(client.priority)}20`,
                                    color: getPriorityColor(client.priority),
                                    borderRadius: 20, fontSize: 12, textTransform: 'capitalize'
                                }}>
                                    {client.priority === 'vip' && <FiStar size={10} />}
                                    {client.priority}
                                </span>
                            </div>

                            {client.companyName && (
                                <p style={{ margin: '0 0 8px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiBriefcase size={14} /> {client.companyName}
                                </p>
                            )}

                            {client.stage && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 16px', borderRadius: 20,
                                    background: `${client.stage.color}20`,
                                    color: client.stage.color, fontSize: 13
                                }}>
                                    {client.stage.icon} {client.stage.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <Link to={`/crm/clients/${id}/edit`} style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '12px 20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14
                                }}
                            >
                                <FiEdit2 /> {t('common.edit', 'Edit')}
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDelete}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '12px 20px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 12, color: '#ef4444', cursor: 'pointer', fontSize: 14
                            }}
                        >
                            <FiTrash2 /> {t('common.delete', 'Delete')}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, width: 'fit-content' }}>
                {[
                    { id: 'overview', label: t('crm.overview', 'Overview') },
                    { id: 'contacts', label: t('crm.contacts', 'Contacts') },
                    { id: 'activities', label: t('crm.activities', 'Activities') },
                    { id: 'reminders', label: t('crm.reminders', 'Reminders') },
                    { id: 'documents', label: t('crm.documents', 'Documents') }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 20px', borderRadius: 8, border: 'none',
                            background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                            color: activeTab === tab.id ? '#a78bfa' : '#6b7280',
                            cursor: 'pointer', fontSize: 14, fontWeight: 500
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                {/* Main Content */}
                <div>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Company Details */}
                            <div style={{
                                background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24, marginBottom: 20,
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                    {t('crm.companyDetails', 'Company Details')}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    <InfoItem label={t('crm.industry', 'Industry')} value={client.industry} />
                                    <InfoItem label={t('crm.companySize', 'Company Size')} value={client.companySize} />
                                    <InfoItem label={t('crm.budget', 'Budget Range')} value={client.budgetRange} />
                                    <InfoItem label={t('crm.clientType', 'Client Type')} value={client.clientType} />
                                    <InfoItem label={t('crm.source', 'Source')} value={client.source} />
                                    {client.website && (
                                        <div>
                                            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{t('crm.website', 'Website')}</p>
                                            <a href={client.website} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiGlobe size={14} /> {client.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            {(client.addressCity || client.addressStreet) && (
                                <div style={{
                                    background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                    borderRadius: 16, padding: 24, marginBottom: 20,
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiMapPin size={18} /> {t('crm.address', 'Address')}
                                    </h3>
                                    <p style={{ margin: 0, color: '#d1d5db', lineHeight: 1.6 }}>
                                        {client.addressStreet && <>{client.addressStreet}<br /></>}
                                        {client.addressCity}{client.addressState && `, ${client.addressState}`} {client.addressPostal}
                                        {client.addressCountry && <><br />{client.addressCountry}</>}
                                    </p>
                                </div>
                            )}

                            {/* Social Media */}
                            {(client.socialLinkedin || client.socialInstagram || client.socialTwitter || client.socialFacebook) && (
                                <div style={{
                                    background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                    borderRadius: 16, padding: 24, marginBottom: 20,
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                        {t('crm.socialMedia', 'Social Media')}
                                    </h3>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        {client.socialLinkedin && <SocialLink icon={FiLinkedin} url={client.socialLinkedin} color="#0a66c2" />}
                                        {client.socialInstagram && <SocialLink icon={FiInstagram} url={client.socialInstagram} color="#e4405f" />}
                                        {client.socialTwitter && <SocialLink icon={FiTwitter} url={client.socialTwitter} color="#1da1f2" />}
                                        {client.socialFacebook && <SocialLink icon={FiFacebook} url={client.socialFacebook} color="#1877f2" />}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {client.notes && (
                                <div style={{
                                    background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                    borderRadius: 16, padding: 24,
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                        {t('crm.notes', 'Notes')}
                                    </h3>
                                    <p style={{ margin: 0, color: '#d1d5db', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {client.notes}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Contacts Tab */}
                    {activeTab === 'contacts' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{
                                background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24,
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                        {t('crm.contacts', 'Contacts')} ({client.contacts?.length || 0})
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setShowAddContact(!showAddContact)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '8px 16px',
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            border: 'none', borderRadius: 8,
                                            color: '#fff', cursor: 'pointer', fontSize: 13
                                        }}
                                    >
                                        <FiPlus /> {t('crm.addContact', 'Add Contact')}
                                    </motion.button>
                                </div>

                                {/* Add Contact Form */}
                                <AnimatePresence>
                                    {showAddContact && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ marginBottom: 20, overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                                    <input type="text" placeholder={t('crm.contactName', 'Name')} value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                    <input type="text" placeholder={t('crm.role', 'Role')} value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                    <input type="email" placeholder={t('crm.email', 'Email')} value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                    <input type="tel" placeholder={t('crm.phone', 'Phone')} value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                    <input type="tel" placeholder={t('crm.whatsapp', 'WhatsApp')} value={newContact.whatsapp} onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })} style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
                                                        <input type="checkbox" checked={newContact.isPrimary} onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })} />
                                                        {t('crm.primary', 'Primary Contact')}
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={handleAddContact} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}><FiCheck /> Save</button>
                                                    <button onClick={() => setShowAddContact(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {client.contacts && client.contacts.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {client.contacts.map(contact => (
                                            <div key={contact.id} style={{
                                                padding: 16, borderRadius: 12,
                                                background: 'rgba(255,255,255,0.03)',
                                                border: contact.isPrimary ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                            <span style={{ fontWeight: 600, color: '#fff' }}>{contact.name}</span>
                                                            {contact.isPrimary && (
                                                                <span style={{
                                                                    padding: '2px 8px', borderRadius: 10,
                                                                    background: 'rgba(139, 92, 246, 0.2)',
                                                                    color: '#a78bfa', fontSize: 10
                                                                }}>PRIMARY</span>
                                                            )}
                                                        </div>
                                                        {contact.role && <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 13 }}>{contact.role}</p>}
                                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                                            {contact.email && (
                                                                <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 13 }}>
                                                                    <FiMail size={12} /> {contact.email}
                                                                </a>
                                                            )}
                                                            {contact.phone && (
                                                                <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 13 }}>
                                                                    <FiPhone size={12} /> {contact.phone}
                                                                </a>
                                                            )}
                                                            {contact.whatsapp && (
                                                                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#25d366', fontSize: 13 }}>
                                                                    <FiMessageSquare size={12} /> WhatsApp
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => setEditingContact(contact)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button onClick={() => handleDeleteContact(contact.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                        <FiUser style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                                        <p>{t('crm.noContacts', 'No contacts added yet')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Activities Tab */}
                    {activeTab === 'activities' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{
                                background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24,
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                        {t('crm.activityTimeline', 'Activity Timeline')}
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setShowAddActivity(true)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '8px 16px',
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            border: 'none', borderRadius: 8,
                                            color: '#fff', cursor: 'pointer', fontSize: 13
                                        }}
                                    >
                                        <FiPlus /> {t('crm.addActivity', 'Add Activity')}
                                    </motion.button>
                                </div>

                                {/* Add Activity Form */}
                                <AnimatePresence>
                                    {showAddActivity && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ marginBottom: 20, overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                                                    <select
                                                        value={newActivity.type}
                                                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                                                        style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                                    >
                                                        <option value="note">📝 Note</option>
                                                        <option value="call">📞 Call</option>
                                                        <option value="email">📧 Email</option>
                                                        <option value="meeting">🤝 Meeting</option>
                                                        <option value="message">💬 Message</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder={t('crm.activityTitle', 'Title...')}
                                                        value={newActivity.title}
                                                        onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                                        style={{ padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                                    />
                                                </div>
                                                <textarea
                                                    placeholder={t('crm.activityContent', 'Content (optional)...')}
                                                    value={newActivity.content}
                                                    onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                                                    rows={3}
                                                    style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', resize: 'vertical' }}
                                                />
                                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                    <button onClick={handleAddActivity} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
                                                        <FiCheck /> Save
                                                    </button>
                                                    <button onClick={() => setShowAddActivity(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Activity Timeline */}
                                {client.activities && client.activities.length > 0 ? (
                                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                                        <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'rgba(139, 92, 246, 0.2)' }} />
                                        {client.activities.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                style={{ position: 'relative', marginBottom: 16, paddingLeft: 20 }}
                                            >
                                                <div style={{
                                                    position: 'absolute', left: -15, top: 4,
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    background: '#1a1a2e', border: '2px solid #8b5cf6',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 10
                                                }}>
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <span style={{ fontWeight: 500, color: '#fff' }}>{activity.title || activity.type}</span>
                                                            {activity.content && <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 13 }}>{activity.content}</p>}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <span style={{ fontSize: 11, color: '#6b7280' }}>{formatDateTime(activity.createdAt)}</span>
                                                            <button
                                                                onClick={() => handleDeleteActivity(activity.id)}
                                                                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                        <FiClock style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                                        <p>{t('crm.noActivities', 'No activities yet')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Reminders Tab */}
                    {activeTab === 'reminders' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{
                                background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24,
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                                        {t('crm.reminders', 'Reminders')}
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setShowAddReminder(true)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '8px 16px',
                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            border: 'none', borderRadius: 8,
                                            color: '#fff', cursor: 'pointer', fontSize: 13
                                        }}
                                    >
                                        <FiPlus /> {t('crm.addReminder', 'Add Reminder')}
                                    </motion.button>
                                </div>

                                {/* Add Reminder Form */}
                                <AnimatePresence>
                                    {showAddReminder && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ marginBottom: 20, overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <input
                                                    type="text"
                                                    placeholder={t('crm.reminderTitle', 'Reminder title...')}
                                                    value={newReminder.title}
                                                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                                    style={{ width: '100%', padding: 10, marginBottom: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                                />
                                                <input
                                                    type="datetime-local"
                                                    value={newReminder.remindAt}
                                                    onChange={(e) => setNewReminder({ ...newReminder, remindAt: e.target.value })}
                                                    style={{ width: '100%', padding: 10, marginBottom: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                                />
                                                <textarea
                                                    placeholder={t('crm.reminderDescription', 'Description (optional)...')}
                                                    value={newReminder.description}
                                                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                                                    rows={2}
                                                    style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', resize: 'vertical' }}
                                                />
                                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                                    <button onClick={handleAddReminder} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
                                                        <FiCheck /> Save
                                                    </button>
                                                    <button onClick={() => setShowAddReminder(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {client.reminders && client.reminders.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {client.reminders.map(reminder => {
                                            const isOverdue = new Date(reminder.remindAt) < new Date();
                                            return (
                                                <div key={reminder.id} style={{
                                                    padding: 16, borderRadius: 12,
                                                    background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <span style={{ fontWeight: 500, color: '#fff' }}>{reminder.title}</span>
                                                            {reminder.description && <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>{reminder.description}</p>}
                                                            <p style={{ margin: '8px 0 0', fontSize: 12, color: isOverdue ? '#ef4444' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <FiCalendar size={12} /> {formatDateTime(reminder.remindAt)}
                                                                {isOverdue && <span style={{ color: '#ef4444', marginLeft: 8 }}>OVERDUE</span>}
                                                            </p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button
                                                                onClick={() => handleCompleteReminder(reminder.id)}
                                                                style={{
                                                                    padding: '6px 12px', borderRadius: 6,
                                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                                    border: 'none', color: '#10b981',
                                                                    cursor: 'pointer', fontSize: 12
                                                                }}
                                                            >
                                                                <FiCheck /> Done
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReminder(reminder.id)}
                                                                style={{
                                                                    padding: '6px 12px', borderRadius: 6,
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: 'none', color: '#ef4444',
                                                                    cursor: 'pointer', fontSize: 12
                                                                }}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                        <FiBell style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                                        <p>{t('crm.noReminders', 'No reminders set')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24,
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
                                    {t('crm.documents', 'Documents')}
                                </h2>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    borderRadius: 10,
                                    color: '#fff',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: uploadingDoc ? 'not-allowed' : 'pointer',
                                    opacity: uploadingDoc ? 0.7 : 1
                                }}>
                                    <FiUpload />
                                    {uploadingDoc ? t('common.uploading', 'Uploading...') : t('crm.uploadFile', 'Upload File')}
                                    <input
                                        type="file"
                                        onChange={handleUploadDocument}
                                        disabled={uploadingDoc}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                                    />
                                </label>
                            </div>

                            <div>
                                {documents.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: 16,
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: 12,
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span style={{ fontSize: 28 }}>{getFileIcon(doc.fileType)}</span>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                                                            {doc.originalName}
                                                        </p>
                                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                                                            {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <a
                                                        href={crmAPI.downloadDocument(doc.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <FiDownload size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                        <FiFileText style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                                        <p>{t('crm.noDocuments', 'No documents uploaded yet')}</p>
                                        <p style={{ fontSize: 12, marginTop: 8 }}>
                                            {t('crm.supportedFormats', 'Supported: PDF, DOC, XLS, Images, TXT, CSV')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Quick Stats */}
                    <div style={{
                        background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                        borderRadius: 16, padding: 24, marginBottom: 20,
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                            {t('crm.quickStats', 'Quick Stats')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <StatRow label={t('crm.created', 'Created')} value={formatDate(client.createdAt)} color="#8b5cf6" />
                            <StatRow label={t('crm.lastContact', 'Last Contact')} value={formatDate(client.lastContactedAt)} color="#10b981" />
                            <StatRow label={t('crm.nextFollowup', 'Next Follow-up')} value={formatDate(client.nextFollowupAt)} color="#f59e0b" />
                            <StatRow label={t('crm.contactsCount', 'Contacts')} value={client.contacts?.length || 0} color="#06b6d4" />
                            <StatRow label={t('crm.activitiesCount', 'Activities')} value={client.activities?.length || 0} color="#ec4899" />
                        </div>
                    </div>

                    {/* Primary Contact */}
                    {primaryContact && (
                        <div style={{
                            background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                            borderRadius: 16, padding: 24, marginBottom: 20,
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                                {t('crm.primaryContact', 'Primary Contact')}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, fontWeight: 600, color: '#fff'
                                }}>
                                    {primaryContact.name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{primaryContact.name}</p>
                                    {primaryContact.role && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{primaryContact.role}</p>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {primaryContact.email && (
                                    <a href={`mailto:${primaryContact.email}`} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                                        color: '#d1d5db', textDecoration: 'none', fontSize: 13
                                    }}>
                                        <FiMail size={16} style={{ color: '#8b5cf6' }} /> {primaryContact.email}
                                    </a>
                                )}
                                {primaryContact.phone && (
                                    <a href={`tel:${primaryContact.phone}`} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                                        color: '#d1d5db', textDecoration: 'none', fontSize: 13
                                    }}>
                                        <FiPhone size={16} style={{ color: '#10b981' }} /> {primaryContact.phone}
                                    </a>
                                )}
                                {primaryContact.whatsapp && (
                                    <a href={`https://wa.me/${primaryContact.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                                        background: 'rgba(37, 211, 102, 0.1)', borderRadius: 8,
                                        color: '#25d366', textDecoration: 'none', fontSize: 13
                                    }}>
                                        <FiMessageSquare size={16} /> WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                        <div style={{
                            background: 'rgba(17, 17, 27, 0.8)', backdropFilter: 'blur(20px)',
                            borderRadius: 16, padding: 24,
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                                {t('crm.tags', 'Tags')}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {client.tags.map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '6px 12px', borderRadius: 20,
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        color: '#a78bfa', fontSize: 12
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Contact Modal */}
            <AnimatePresence>
                {editingContact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingContact(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.7)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(17, 17, 27, 0.95)', backdropFilter: 'blur(20px)',
                                borderRadius: 16, padding: 24, width: 480,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 20px', color: '#fff' }}>{t('crm.editContact', 'Edit Contact')}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <input type="text" placeholder="Name" value={editingContact.name || ''} onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <input type="text" placeholder="Role" value={editingContact.role || ''} onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <input type="email" placeholder="Email" value={editingContact.email || ''} onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <input type="tel" placeholder="Phone" value={editingContact.phone || ''} onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <input type="tel" placeholder="WhatsApp" value={editingContact.whatsapp || ''} onChange={(e) => setEditingContact({ ...editingContact, whatsapp: e.target.value })} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
                                    <input type="checkbox" checked={editingContact.isPrimary || false} onChange={(e) => setEditingContact({ ...editingContact, isPrimary: e.target.checked })} />
                                    Primary Contact
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingContact(null)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleEditContact} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Save Changes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Components
const InfoItem = ({ label, value }) => (
    <div>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, color: '#d1d5db', textTransform: 'capitalize' }}>{value || '-'}</p>
    </div>
);

const SocialLink = ({ icon: Icon, url, color }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 10,
        background: `${color}20`, color
    }}>
        <Icon size={18} />
    </a>
);

const StatRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: 13 }}>{label}</span>
        <span style={{ color, fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
);

export default ClientDetail;
