import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineSparkles } from 'react-icons/hi';

const pageInfo = {
    // Social Module placeholders
    '/social/sosmed-posting': { title: 'Social Media Posting', description: 'Schedule and publish posts', icon: '📱' },
    '/social/analytics': { title: 'Social Analytics', description: 'Track social media performance', icon: '📊' },
    '/social/engagement': { title: 'Engagement', description: 'Manage audience interactions', icon: '💬' },
    '/social/settings': { title: 'Social Settings', description: 'Configure social preferences', icon: '⚙️' },
    // Finance Module placeholders
    '/finance/transactions': { title: 'Transactions', description: 'View all financial transactions', icon: '💳' },
    '/finance/invoices': { title: 'Invoices', description: 'Manage invoices and billing', icon: '📄' },
    '/finance/reports': { title: 'Finance Reports', description: 'Financial analytics and reports', icon: '📈' },
    '/finance/settings': { title: 'Finance Settings', description: 'Configure finance preferences', icon: '⚙️' },
    // Assets Module placeholders
    '/assets/library': { title: 'Asset Library', description: 'Browse all assets', icon: '📚' },
    '/assets/upload': { title: 'Upload Assets', description: 'Upload new files and media', icon: '⬆️' },
    '/assets/categories': { title: 'Categories', description: 'Organize assets by category', icon: '📁' },
    '/assets/settings': { title: 'Assets Settings', description: 'Configure assets preferences', icon: '⚙️' },
};

const PlaceholderPage = ({ title, description }) => {
    const location = useLocation();
    const { t } = useTranslation();
    const info = pageInfo[location.pathname] || { title: title || 'Coming Soon', description: description || 'This page is under construction', icon: '🚧' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    <span className="gradient-text">{info.title}</span>
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>{info.description}</p>
            </div>

            {/* Coming Soon Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '60px 40px', textAlign: 'center' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '48px',
                    }}
                >
                    {info.icon}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 8px 0' }}
                >
                    {t('placeholder.comingSoon', 'Coming Soon')}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px', margin: '0 auto 32px' }}
                >
                    {t('placeholder.comingSoonDesc', "We're working hard to bring you this feature. Stay tuned for updates!")}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
                >
                    <button
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: '#9ca3af',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        {t('placeholder.goBack', 'Go Back')}
                    </button>
                    <button
                        className="btn-glow"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <HiOutlineSparkles style={{ width: '16px', height: '16px' }} />
                        {t('placeholder.notifyMe', 'Notify Me')}
                    </button>
                </motion.div>
            </motion.div>

            {/* Feature Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                    { title: 'Feature 1', description: 'Advanced analytics and reporting', color: '#8b5cf6' },
                    { title: 'Feature 2', description: 'Real-time collaboration tools', color: '#06b6d4' },
                    { title: 'Feature 3', description: 'AI-powered insights', color: '#ec4899' },
                ].map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            backgroundColor: `${feature.color}10`,
                            border: `1px solid ${feature.color}30`,
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${feature.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            <HiOutlineSparkles style={{ width: '20px', height: '20px', color: feature.color }} />
                        </div>
                        <h3 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: '0 0 4px 0' }}>{feature.title}</h3>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PlaceholderPage;
