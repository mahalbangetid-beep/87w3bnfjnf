/**
 * Profile Settings - Edit user profile information
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCamera,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlineRefresh
} from 'react-icons/hi';
import SettingsLayout from './SettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfileSettings = () => {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatar: null
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                avatar: null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Send as JSON (avatar upload would need a separate endpoint)
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                bio: formData.bio || ''
            };

            // If avatar is a base64 string from preview, include it
            if (avatarPreview) {
                payload.avatar = avatarPreview;
            }

            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('workspace_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: t('settings.profile.updateSuccess', 'Profile updated successfully!') });
                if (refreshUser) refreshUser();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsLayout>
            <div className="glass-card" style={{ padding: '32px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <HiOutlineUserCircle style={{ color: '#8b5cf6' }} />
                        {t('settings.profile.title', 'Profile Settings')}
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                        {t('settings.profile.subtitle', 'Manage your personal information and how others see you.')}
                    </p>
                </div>

                {/* Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                color: message.type === 'success' ? '#34d399' : '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {message.type === 'success' ? <HiOutlineCheck /> : <HiOutlineExclamation />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    {/* Avatar Section */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        marginBottom: '32px',
                        padding: '24px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: avatarPreview || user?.avatar
                                        ? `url(${avatarPreview || user.avatar}) center/cover`
                                        : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid rgba(139,92,246,0.3)',
                                    boxShadow: '0 0 30px rgba(139,92,246,0.2)',
                                }}
                            >
                                {!avatarPreview && !user?.avatar && (
                                    <span style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>
                                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </motion.div>
                            <label
                                htmlFor="avatar-upload"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '3px solid #0f0f19',
                                }}
                            >
                                <HiOutlineCamera style={{ width: '14px', height: '14px', color: 'white' }} />
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                                {user?.name || 'Your Name'}
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                                {user?.email}
                            </p>
                            <p style={{ color: '#6b7280', fontSize: '12px' }}>
                                {t('settings.profile.avatarHint', 'Click the camera icon to change your photo')}
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.profile.name', 'Full Name')} *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.profile.email', 'Email Address')} *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineMail style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7280',
                                    width: '18px',
                                    height: '18px',
                                }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 44px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.profile.phone', 'Phone Number')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlinePhone style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6b7280',
                                    width: '18px',
                                    height: '18px',
                                }} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+62 812 3456 7890"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 44px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                {t('settings.profile.bio', 'Bio')}
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                placeholder={t('settings.profile.bioPlaceholder', 'Tell us about yourself...')}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-glow"
                            style={{
                                padding: '12px 32px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                    <HiOutlineRefresh />
                                </motion.div>
                            ) : (
                                <HiOutlineCheck />
                            )}
                            {loading ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
};

export default ProfileSettings;
