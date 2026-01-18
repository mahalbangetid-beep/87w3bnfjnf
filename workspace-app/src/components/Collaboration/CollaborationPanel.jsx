import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineUserAdd, HiOutlineLink, HiOutlineCheck, HiOutlineX,
    HiOutlineUsers, HiOutlineClock, HiOutlineClipboard, HiOutlineTrash,
    HiOutlineSparkles, HiOutlineMail, HiOutlineBadgeCheck
} from 'react-icons/hi';
import { collaborationAPI } from '../../services/api';

// Particle Effect Background
const ParticleField = () => {
    const particles = [...Array(30)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        color: ['#8b5cf6', '#06b6d4', '#10b981', '#ec4899'][i % 4]
    }));

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map(p => (
                <motion.div key={p.id}
                    animate={{ y: [0, -50, 0], x: [0, Math.sin(p.id) * 20, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                />
            ))}
        </div>
    );
};

// Animated Avatar Stack
const AvatarStack = ({ users = [], max = 5 }) => {
    const displayed = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {displayed.map((user, i) => (
                <motion.div key={user.id} initial={{ scale: 0, x: -10 }} animate={{ scale: 1, x: 0 }} transition={{ delay: i * 0.1, type: 'spring' }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(17,17,27,0.9)', marginLeft: i > 0 ? -12 : 0, cursor: 'pointer', overflow: 'hidden', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </motion.div>
            ))}
            {remaining > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.3)', border: '2px solid rgba(139,92,246,0.5)', marginLeft: -12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontWeight: 600, fontSize: 12 }}>
                    +{remaining}
                </motion.div>
            )}
        </div>
    );
};

// Collaborator Card
const CollaboratorCard = ({ collaborator, isOwner, onRemove, isCurrentOwner }) => {
    const [isHovered, setIsHovered] = useState(false);
    const user = collaborator.user || collaborator;

    return (
        <motion.div layout initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: -100 }}
            whileHover={{ scale: 1.02 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            {/* Glow Effect */}
            <motion.div animate={{ opacity: isHovered ? 0.5 : 0 }} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))', pointerEvents: 'none' }} />

            {/* Avatar */}
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', flexShrink: 0 }}>
                {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
            </motion.div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>{user.name}</span>
                    {isOwner && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ padding: '2px 8px', borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontSize: 10, fontWeight: 600 }}>
                            Owner
                        </motion.span>
                    )}
                    {collaborator.status === 'pending' && (
                        <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(249,115,22,0.2)', color: '#fb923c', fontSize: 10, fontWeight: 600 }}>
                            Pending
                        </motion.span>
                    )}
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>

            {/* Actions */}
            {!isOwner && isCurrentOwner && collaborator.status === 'accepted' && (
                <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.2)' }} whileTap={{ scale: 0.9 }} onClick={() => onRemove(user.id)}
                    style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineTrash style={{ width: 18, height: 18 }} />
                </motion.button>
            )}
        </motion.div>
    );
};

// Activity Item
const ActivityItem = ({ activity, delay }) => {
    const actionIcons = {
        collaborator_invited: '📨', collaborator_accepted: '✅', collaborator_removed: '👋',
        task_created: '📝', task_completed: '✓', task_updated: '✏️',
        note_created: '📝', note_updated: '📝', project_updated: '🔧'
    };
    const icon = actionIcons[activity.action] || '📌';

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
            style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {icon}
            </motion.div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#d1d5db', fontSize: 13 }}>
                    <span style={{ color: 'white', fontWeight: 500 }}>{activity.User?.name || 'Someone'}</span>
                    {' '}{activity.action.replace(/_/g, ' ')}{activity.targetName ? `: ${activity.targetName}` : ''}
                </p>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 11 }}>
                    {new Date(activity.createdAt).toLocaleString()}
                </p>
            </div>
        </motion.div>
    );
};

// Invite Modal
const InviteModal = ({ projectId, projectName, onClose, onInvited }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleInvite = async () => {
        if (!email) return;
        setLoading(true); setError('');
        try {
            await collaborationAPI.invite(projectId, email);
            setSuccess(`Invitation sent to ${email}!`);
            setEmail('');
            onInvited?.();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
            onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 20 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 440, borderRadius: 24, background: 'linear-gradient(145deg, rgba(30,30,50,0.98), rgba(17,17,27,0.99))', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>

                <ParticleField />

                {/* Header */}
                <div style={{ position: 'relative', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                        style={{ position: 'absolute', top: -30, right: 20, width: 80, height: 80, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', opacity: 0.3, borderRadius: '50%', filter: 'blur(30px)' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiOutlineUsers style={{ width: 22, height: 22, color: '#a78bfa' }} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>Invite Collaborators</h2>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{projectName}</p>
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.2)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                border: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}>
                            <HiOutlineX style={{ width: 20, height: 20 }} />
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 24, position: 'relative' }}>
                    {/* Notifications */}
                    <AnimatePresence>
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
                                style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <HiOutlineBadgeCheck style={{ width: 20, height: 20 }} /> {success}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14 }}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email Invite */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 10 }}>
                            <HiOutlineMail style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Invite by Email
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com"
                                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleInvite} disabled={loading || !email}
                                style={{ padding: '0 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !email ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <HiOutlineUserAdd style={{ width: 18, height: 18 }} />
                                Invite
                            </motion.button>
                        </div>
                        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#6b7280' }}>
                            The user will receive a notification to join your project
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Main Collaboration Panel Component
const CollaborationPanel = ({ projectId, projectName, isOwner = false }) => {
    const [collaborators, setCollaborators] = useState({ owner: null, collaborators: [] });
    const [activities, setActivities] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('team');

    useEffect(() => {
        if (projectId) fetchData();
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [collabData, activityData] = await Promise.all([
                collaborationAPI.getCollaborators(projectId).catch(() => ({ owner: null, collaborators: [] })),
                collaborationAPI.getActivity(projectId, 20).catch(() => [])
            ]);
            setCollaborators(collabData);
            setActivities(activityData);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId) => {
        try {
            await collaborationAPI.removeCollaborator(projectId, userId);
            setCollaborators(prev => ({
                ...prev,
                collaborators: prev.collaborators.filter(c => c.user?.id !== userId)
            }));
        } catch (err) {
            console.error('Failed to remove collaborator:', err);
        }
    };

    const allMembers = [collaborators.owner, ...collaborators.collaborators.filter(c => c.status === 'accepted').map(c => c.user)].filter(Boolean);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(17,17,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>

            {/* Glowing Header */}
            <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
                    style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineUsers style={{ width: 22, height: 22, color: '#a78bfa' }} />
                            Team
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                            {allMembers.length} member{allMembers.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <AvatarStack users={allMembers} max={4} />
                        {isOwner && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowInviteModal(true)}
                                style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                <HiOutlineUserAdd style={{ width: 16, height: 16 }} />
                                Invite
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    {['team', 'activity'].map(tab => (
                        <motion.button key={tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab)}
                            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: activeTab === tab ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)', color: activeTab === tab ? '#a78bfa' : '#6b7280', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                            {tab === 'team' ? '👥' : '📋'} {tab}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <HiOutlineSparkles style={{ width: 24, height: 24 }} />
                        </motion.div>
                    </div>
                ) : activeTab === 'team' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Owner */}
                        {collaborators.owner && (
                            <CollaboratorCard collaborator={collaborators.owner} isOwner={true} isCurrentOwner={isOwner} />
                        )}
                        {/* Collaborators */}
                        <AnimatePresence>
                            {collaborators.collaborators.map((c, i) => (
                                <CollaboratorCard key={c.id} collaborator={c} isOwner={false} isCurrentOwner={isOwner} onRemove={handleRemove} />
                            ))}
                        </AnimatePresence>
                        {collaborators.collaborators.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                <p style={{ margin: 0, fontSize: 14 }}>No collaborators yet</p>
                                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#525a6b' }}>Invite team members to collaborate on this project</p>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div>
                        {activities.length > 0 ? (
                            activities.map((a, i) => <ActivityItem key={a.id} activity={a} delay={i * 0.05} />)
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                <HiOutlineClock style={{ width: 32, height: 32, opacity: 0.5, marginBottom: 12 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No activity yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <InviteModal projectId={projectId} projectName={projectName} onClose={() => setShowInviteModal(false)} onInvited={fetchData} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export { CollaborationPanel, InviteModal, AvatarStack, CollaboratorCard };
export default CollaborationPanel;
