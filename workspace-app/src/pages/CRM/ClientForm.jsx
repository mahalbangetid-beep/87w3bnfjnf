import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    FiArrowLeft, FiSave, FiUser, FiBriefcase, FiGlobe, FiMapPin,
    FiPlus, FiTrash2, FiPhone, FiMail, FiMessageSquare, FiStar
} from 'react-icons/fi';
import { crmAPI } from '../../services/api';

const ClientForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stages, setStages] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    const [formData, setFormData] = useState({
        // Basic
        name: '',
        companyName: '',
        notes: '',
        // Company
        industry: '',
        companySize: '',
        website: '',
        budgetRange: '',
        clientType: '',
        source: '',
        // Pipeline
        stageId: searchParams.get('stage') || '',
        priority: 'medium',
        tags: [],
        // Address
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressPostal: '',
        addressCountry: 'Indonesia',
        // Social
        socialLinkedin: '',
        socialInstagram: '',
        socialTwitter: '',
        socialFacebook: '',
        socialTiktok: ''
    });

    const [contacts, setContacts] = useState([
        { name: '', role: '', email: '', phone: '', whatsapp: '', isPrimary: true, preferredContact: 'any' }
    ]);

    useEffect(() => {
        fetchStages();
        fetchTags();
        if (isEdit) fetchClient();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStages = async () => {
        try {
            const data = await crmAPI.getPipelineStages();
            const stagesList = Array.isArray(data) ? data : [];
            setStages(stagesList);
            if (!isEdit && !searchParams.get('stage') && stagesList.length > 0) {
                const defaultStage = stagesList.find(s => s.isDefault) || stagesList[0];
                setFormData(prev => ({ ...prev, stageId: defaultStage.id }));
            }
        } catch (error) {
            console.error('Error fetching stages:', error);
            setStages([]);
        }
    };

    const fetchTags = async () => {
        try {
            const data = await crmAPI.getTags();
            setTags(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tags:', error);
            setTags([]);
        }
    };

    const fetchClient = async () => {
        try {
            setLoading(true);
            const data = await crmAPI.getClient(id);
            setFormData({
                name: data.name || '',
                companyName: data.companyName || '',
                notes: data.notes || '',
                industry: data.industry || '',
                companySize: data.companySize || '',
                website: data.website || '',
                budgetRange: data.budgetRange || '',
                clientType: data.clientType || '',
                source: data.source || '',
                stageId: data.stageId || '',
                priority: data.priority || 'medium',
                tags: data.tags || [],
                addressStreet: data.addressStreet || '',
                addressCity: data.addressCity || '',
                addressState: data.addressState || '',
                addressPostal: data.addressPostal || '',
                addressCountry: data.addressCountry || 'Indonesia',
                socialLinkedin: data.socialLinkedin || '',
                socialInstagram: data.socialInstagram || '',
                socialTwitter: data.socialTwitter || '',
                socialFacebook: data.socialFacebook || '',
                socialTiktok: data.socialTiktok || ''
            });
            if (data.contacts && data.contacts.length > 0) {
                setContacts(data.contacts.map(c => ({
                    id: c.id,
                    name: c.name || '',
                    role: c.role || '',
                    email: c.email || '',
                    phone: c.phone || '',
                    whatsapp: c.whatsapp || '',
                    isPrimary: c.isPrimary || false,
                    preferredContact: c.preferredContact || 'any'
                })));
            }
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContactChange = (index, field, value) => {
        setContacts(prev => prev.map((c, i) => {
            if (i === index) {
                if (field === 'isPrimary' && value) {
                    // Unset other primaries
                    return { ...c, isPrimary: true };
                }
                return { ...c, [field]: value };
            }
            if (field === 'isPrimary' && value) {
                return { ...c, isPrimary: false };
            }
            return c;
        }));
    };

    const addContact = () => {
        setContacts(prev => [...prev, {
            name: '', role: '', email: '', phone: '', whatsapp: '',
            isPrimary: false, preferredContact: 'any'
        }]);
    };

    const removeContact = (index) => {
        if (contacts.length === 1) return;
        setContacts(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = (tagName) => {
        if (!tagName || formData.tags.includes(tagName)) return;
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagName] }));
        setNewTag('');
    };

    const removeTag = (tagName) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagName) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert(t('crm.nameRequired', 'Client name is required'));
            return;
        }

        try {
            setSaving(true);

            // Filter out empty contacts
            const validContacts = contacts.filter(c => c.name.trim());

            let clientId = id;
            if (isEdit) {
                // Update client
                await crmAPI.updateClient(id, formData);

                // Handle contacts separately for edit mode
                for (const contact of validContacts) {
                    if (contact.id) {
                        // Update existing contact
                        await crmAPI.updateContact(contact.id, { ...contact, clientId });
                    } else {
                        // Create new contact
                        await crmAPI.createContact({ ...contact, clientId });
                    }
                }
            } else {
                // Create client with contacts included
                // Backend handles contact creation in createClient endpoint
                const result = await crmAPI.createClient({
                    ...formData,
                    contacts: validContacts
                });
                clientId = result.id;
            }

            navigate(`/crm/clients/${clientId}`);
        } catch (error) {
            console.error('Error saving client:', error);
            alert(t('crm.saveError', 'Error saving client'));
        } finally {
            setSaving(false);
        }
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

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'transparent', border: 'none',
                            color: '#9ca3af', cursor: 'pointer', fontSize: 14
                        }}
                    >
                        <FiArrowLeft /> {t('common.back', 'Back')}
                    </button>
                </div>

                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                    {isEdit ? t('crm.editClient', 'Edit Client') : t('crm.addClient', 'Add Client')}
                </h1>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
                    {/* Main Form */}
                    <div>
                        {/* Basic Info */}
                        <FormSection title={t('crm.basicInfo', 'Basic Information')} icon="👤">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <FormField label={t('crm.name', 'Client Name')} required>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('crm.enterName', 'Enter client name')}
                                        style={inputStyle}
                                    />
                                </FormField>
                                <FormField label={t('crm.company', 'Company/Business')}>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder={t('crm.enterCompany', 'Enter company name')}
                                        style={inputStyle}
                                    />
                                </FormField>
                            </div>
                            <FormField label={t('crm.notes', 'Notes')}>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder={t('crm.enterNotes', 'Add notes about this client...')}
                                    rows={4}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </FormField>
                        </FormSection>

                        {/* Company Details */}
                        <FormSection title={t('crm.companyDetails', 'Company Details')} icon="🏢">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <FormField label={t('crm.industry', 'Industry')}>
                                    <input
                                        type="text"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        placeholder={t('crm.enterIndustry', 'e.g., Technology, Marketing')}
                                        style={inputStyle}
                                    />
                                </FormField>
                                <FormField label={t('crm.companySize', 'Company Size')}>
                                    <select name="companySize" value={formData.companySize} onChange={handleChange} style={inputStyle}>
                                        <option value="">Select size</option>
                                        <option value="solo">Solo / Individual</option>
                                        <option value="small">Small (2-10)</option>
                                        <option value="medium">Medium (11-50)</option>
                                        <option value="large">Large (51-200)</option>
                                        <option value="enterprise">Enterprise (200+)</option>
                                    </select>
                                </FormField>
                                <FormField label={t('crm.website', 'Website')}>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://"
                                        style={inputStyle}
                                    />
                                </FormField>
                                <FormField label={t('crm.budget', 'Budget Range')}>
                                    <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} style={inputStyle}>
                                        <option value="">Select budget</option>
                                        <option value="<5jt">&lt; 5 juta</option>
                                        <option value="5-15jt">5 - 15 juta</option>
                                        <option value="15-50jt">15 - 50 juta</option>
                                        <option value="50-100jt">50 - 100 juta</option>
                                        <option value=">100jt">&gt; 100 juta</option>
                                    </select>
                                </FormField>
                                <FormField label={t('crm.clientType', 'Client Type')}>
                                    <select name="clientType" value={formData.clientType} onChange={handleChange} style={inputStyle}>
                                        <option value="">Select type</option>
                                        <option value="b2b">B2B</option>
                                        <option value="b2c">B2C</option>
                                        <option value="personal">Personal</option>
                                        <option value="agency">Agency</option>
                                    </select>
                                </FormField>
                                <FormField label={t('crm.source', 'Source')}>
                                    <input
                                        type="text"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        placeholder={t('crm.enterSource', 'How did they find you?')}
                                        style={inputStyle}
                                    />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* Address */}
                        <FormSection title={t('crm.address', 'Address')} icon="📍">
                            <FormField label={t('crm.street', 'Street Address')}>
                                <input
                                    type="text"
                                    name="addressStreet"
                                    value={formData.addressStreet}
                                    onChange={handleChange}
                                    placeholder={t('crm.enterStreet', 'Enter street address')}
                                    style={inputStyle}
                                />
                            </FormField>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <FormField label={t('crm.city', 'City')}>
                                    <input type="text" name="addressCity" value={formData.addressCity} onChange={handleChange} style={inputStyle} />
                                </FormField>
                                <FormField label={t('crm.state', 'Province/State')}>
                                    <input type="text" name="addressState" value={formData.addressState} onChange={handleChange} style={inputStyle} />
                                </FormField>
                                <FormField label={t('crm.postal', 'Postal Code')}>
                                    <input type="text" name="addressPostal" value={formData.addressPostal} onChange={handleChange} style={inputStyle} />
                                </FormField>
                            </div>
                            <FormField label={t('crm.country', 'Country')}>
                                <input type="text" name="addressCountry" value={formData.addressCountry} onChange={handleChange} style={inputStyle} />
                            </FormField>
                        </FormSection>

                        {/* Social Media */}
                        <FormSection title={t('crm.socialMedia', 'Social Media')} icon="🌐">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <FormField label="LinkedIn">
                                    <input type="url" name="socialLinkedin" value={formData.socialLinkedin} onChange={handleChange} placeholder="https://linkedin.com/..." style={inputStyle} />
                                </FormField>
                                <FormField label="Instagram">
                                    <input type="url" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange} placeholder="https://instagram.com/..." style={inputStyle} />
                                </FormField>
                                <FormField label="Twitter/X">
                                    <input type="url" name="socialTwitter" value={formData.socialTwitter} onChange={handleChange} placeholder="https://x.com/..." style={inputStyle} />
                                </FormField>
                                <FormField label="Facebook">
                                    <input type="url" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange} placeholder="https://facebook.com/..." style={inputStyle} />
                                </FormField>
                                <FormField label="TikTok">
                                    <input type="url" name="socialTiktok" value={formData.socialTiktok} onChange={handleChange} placeholder="https://tiktok.com/..." style={inputStyle} />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* Contacts */}
                        <FormSection title={t('crm.contacts', 'Contacts')} icon="👥">
                            {contacts.map((contact, index) => (
                                <div key={index} style={{
                                    padding: 20, marginBottom: 16, borderRadius: 12,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: contact.isPrimary ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ color: '#fff', fontWeight: 500 }}>Contact #{index + 1}</span>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={contact.isPrimary}
                                                    onChange={(e) => handleContactChange(index, 'isPrimary', e.target.checked)}
                                                    style={{ accentColor: '#8b5cf6' }}
                                                />
                                                <span style={{ fontSize: 12, color: contact.isPrimary ? '#a78bfa' : '#6b7280' }}>Primary</span>
                                            </label>
                                        </div>
                                        {contacts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeContact(index)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none', borderRadius: 6, padding: 8,
                                                    color: '#ef4444', cursor: 'pointer'
                                                }}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <input
                                            type="text"
                                            placeholder={t('crm.contactName', 'Contact name')}
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="text"
                                            placeholder={t('crm.role', 'Role/Position')}
                                            value={contact.role}
                                            onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="email"
                                            placeholder={t('crm.email', 'Email')}
                                            value={contact.email}
                                            onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="tel"
                                            placeholder={t('crm.phone', 'Phone')}
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="tel"
                                            placeholder={t('crm.whatsapp', 'WhatsApp')}
                                            value={contact.whatsapp}
                                            onChange={(e) => handleContactChange(index, 'whatsapp', e.target.value)}
                                            style={inputStyle}
                                        />
                                        <select
                                            value={contact.preferredContact}
                                            onChange={(e) => handleContactChange(index, 'preferredContact', e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="any">Any method</option>
                                            <option value="email">Prefer Email</option>
                                            <option value="phone">Prefer Phone</option>
                                            <option value="whatsapp">Prefer WhatsApp</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addContact}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    width: '100%', padding: 12,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#6b7280', cursor: 'pointer'
                                }}
                            >
                                <FiPlus /> {t('crm.addContact', 'Add Contact')}
                            </button>
                        </FormSection>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Pipeline Stage */}
                        <FormSection title={t('crm.pipelineStage', 'Pipeline Stage')} icon="🔄">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {stages.map(stage => (
                                    <label
                                        key={stage.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                                            borderRadius: 10, cursor: 'pointer',
                                            background: formData.stageId == stage.id ? `${stage.color}20` : 'rgba(255,255,255,0.03)',
                                            border: formData.stageId == stage.id ? `1px solid ${stage.color}40` : '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="stageId"
                                            value={stage.id}
                                            checked={formData.stageId == stage.id}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: 18 }}>{stage.icon}</span>
                                        <span style={{ color: formData.stageId == stage.id ? '#fff' : '#9ca3af' }}>{stage.name}</span>
                                    </label>
                                ))}
                            </div>
                        </FormSection>

                        {/* Priority */}
                        <FormSection title={t('crm.priority', 'Priority')} icon="⭐">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                {[
                                    { value: 'low', label: 'Low', color: '#6b7280' },
                                    { value: 'medium', label: 'Medium', color: '#8b5cf6' },
                                    { value: 'high', label: 'High', color: '#ef4444' },
                                    { value: 'vip', label: 'VIP', color: '#f59e0b', icon: '⭐' }
                                ].map(p => (
                                    <label
                                        key={p.value}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            padding: 12, borderRadius: 10, cursor: 'pointer',
                                            background: formData.priority === p.value ? `${p.color}20` : 'rgba(255,255,255,0.03)',
                                            border: formData.priority === p.value ? `1px solid ${p.color}40` : '1px solid rgba(255,255,255,0.05)',
                                            color: formData.priority === p.value ? p.color : '#6b7280'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={p.value}
                                            checked={formData.priority === p.value}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                        />
                                        {p.icon && <span>{p.icon}</span>}
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                        </FormSection>

                        {/* Tags */}
                        <FormSection title={t('crm.tags', 'Tags')} icon="🏷️">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {formData.tags.map((tag, i) => (
                                    <span key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 20,
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        color: '#a78bfa', fontSize: 12
                                    }}>
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0 }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    placeholder={t('crm.addTag', 'Add tag...')}
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag(newTag);
                                        }
                                    }}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => addTag(newTag)}
                                    style={{
                                        padding: '0 16px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                        border: 'none', borderRadius: 8,
                                        color: '#fff', cursor: 'pointer'
                                    }}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280' }}>Existing tags:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {tags.filter(t => !formData.tags.includes(t.name)).slice(0, 10).map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => addTag(tag.name)}
                                                style={{
                                                    padding: '4px 10px', borderRadius: 12,
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: 'none', color: '#9ca3af',
                                                    fontSize: 11, cursor: 'pointer'
                                                }}
                                            >
                                                + {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </FormSection>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={saving}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                width: '100%', padding: 16,
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                border: 'none', borderRadius: 12,
                                color: '#fff', fontSize: 16, fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            <FiSave /> {saving ? t('common.saving', 'Saving...') : isEdit ? t('common.saveChanges', 'Save Changes') : t('crm.createClient', 'Create Client')}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Styles
const inputStyle = {
    width: '100%',
    padding: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    outline: 'none'
};

// Helper Components
const FormSection = ({ title, icon, children }) => (
    <div style={{
        background: 'rgba(17, 17, 27, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.08)'
    }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{icon}</span> {title}
        </h3>
        {children}
    </div>
);

const FormField = ({ label, required, children }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#9ca3af' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
    </div>
);

export default ClientForm;
