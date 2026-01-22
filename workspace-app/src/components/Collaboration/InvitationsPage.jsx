import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    HiOutlineCheck, HiOutlineX, HiOutlineFolder, HiOutlineClock,
    HiOutlineUserGroup, HiOutlineSparkles, HiOutlineMail
} from 'react-icons/hi';
import { collaborationAPI } from '../../services/api';

// Floating Orbs
const FloatingOrbs = () => (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[{ x: '10%', y: '20%', color: '#8b5cf6' }, { x: '80%', y: '30%', color: '#06b6d4' }, { x: '70%', y: '70%', color: '#ec4899' }, { x: '20%', y: '80%', color: '#10b981' }].map((orb, i) => (
            <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i }}
                style={{ position: 'absolute', left: orb.x, top: orb.y, width: 250, height: 250, borderRadius: '50%', background: orb.color, filter: 'blur(100px)' }} />
        ))}
    </div>
);

// Invitation Card
const InvitationCard = ({ invitation, onAccept, onDecline, index }) => {
    const [loading, setLoading] = useState(null);

    const handleAction = async (action) => {
        setLoading(action);
        try {
            if (action === 'accept') await onAccept(invitation.inviteToken);
            else await onDecline(invitation.inviteToken);
        } finally {
            setLoading(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50, rotateX: -10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: 0.9, x: 100 }}
            transition={{ delay: index * 0.1, type: 'spring', damping: 20 }} whileHover={{ scale: 1.02, y: -5 }}
            style={{ background: 'rgba(17,17,27,0.9)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 28, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>

            {/* Glow */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: -100, right: -100, width: 200, height: 200, borderRadius: '50%', background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6)', opacity: 0.1, filter: 'blur(40px)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Project Info */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}
                        style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HiOutlineFolder style={{ width: 32, height: 32, color: '#a78bfa' }} />
                    </motion.div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>{invitation.project?.name || 'Project'}</h3>
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af' }}>{invitation.project?.description || 'No description'}</p>
                    </div>
                </div>

                {/* Inviter Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', marginBottom: 20 }}>
                    <motion.div whileHover={{ scale: 1.1 }}
                        style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                        {invitation.invitedBy?.name?.charAt(0) || '?'}
                    </motion.div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 500 }}>{invitation.invitedBy?.name || 'Someone'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>invited you to collaborate</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12 }}>
                        <HiOutlineClock style={{ width: 14, height: 14 }} />
                        {new Date(invitation.invitedAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleAction('decline')} disabled={loading !== null}
                        style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
                        <HiOutlineX style={{ width: 18, height: 18 }} />
                        Decline
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(139,92,246,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => handleAction('accept')} disabled={loading !== null}
                        style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
                        {loading === 'accept' ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><HiOutlineSparkles /></motion.div>
                        ) : (
                            <><HiOutlineCheck style={{ width: 18, height: 18 }} /> Accept & Join</>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// Token Accept Page (for link invites)
const InviteAcceptPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [error, setError] = useState('');
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (token) acceptInvite();
    }, [token]);

    const acceptInvite = async () => {
        try {
            const result = await collaborationAPI.acceptInvite(token);
            setProject(result.project);
            setStatus('success');
            setTimeout(() => navigate(`/work/projects`), 3000);
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
            <FloatingOrbs />

            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}
                style={{ maxWidth: 480, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {status === 'loading' && (
                    <div>
                        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
                            style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineSparkles style={{ width: 40, height: 40, color: '#a78bfa' }} />
                        </motion.div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'white' }}>Joining Project...</h2>
                        <p style={{ margin: '12px 0 0', color: '#9ca3af' }}>Please wait while we process your invitation</p>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
                            style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCheck style={{ width: 50, height: 50, color: 'white' }} />
                        </motion.div>
                        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Aboard! 🎉</h2>
                        <p style={{ margin: '12px 0 0', color: '#9ca3af', fontSize: 16 }}>You've joined <strong style={{ color: 'white' }}>{project?.name || 'the project'}</strong></p>
                        <p style={{ margin: '16px 0 0', color: '#6b7280', fontSize: 14 }}>Redirecting to projects...</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <div style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineX style={{ width: 50, height: 50, color: '#f87171' }} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f87171' }}>Oops! Something went wrong</h2>
                        <p style={{ margin: '12px 0 0', color: '#9ca3af' }}>{error || 'The invitation may have expired or is invalid'}</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/work')}
                            style={{ marginTop: 24, padding: '14px 32px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                            Go to Dashboard
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

// My Invitations Page
const InvitationsPage = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const data = await collaborationAPI.getInvitations();
            setInvitations(data);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (token) => {
        await collaborationAPI.acceptInvite(token);
        setInvitations(prev => prev.filter(i => i.inviteToken !== token));
    };

    const handleDecline = async (token) => {
        await collaborationAPI.declineInvite(token);
        setInvitations(prev => prev.filter(i => i.inviteToken !== token));
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <FloatingOrbs />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 30 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Project Invitations
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: 8 }}>Accept invitations to collaborate with others</p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <HiOutlineSparkles style={{ width: 40, height: 40, color: '#6b7280' }} />
                        </motion.div>
                    </div>
                ) : invitations.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: 80, background: 'rgba(17,17,27,0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                            style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineMail style={{ width: 48, height: 48, color: '#6b7280' }} />
                        </motion.div>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'white' }}>No Pending Invitations</h3>
                        <p style={{ margin: '12px 0 0', color: '#6b7280', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                            When someone invites you to collaborate on a project, it will appear here
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                        <AnimatePresence>
                            {invitations.map((inv, i) => (
                                <InvitationCard key={inv.id} invitation={inv} index={i} onAccept={handleAccept} onDecline={handleDecline} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export { InvitationsPage, InviteAcceptPage, InvitationCard };
export default InvitationsPage;
