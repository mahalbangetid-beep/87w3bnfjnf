import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    FiCopy, FiArrowLeft, FiUsers, FiAlertTriangle,
    FiCheckCircle, FiTrash2, FiExternalLink, FiGitMerge
} from 'react-icons/fi';
import { crmAPI } from '../../services/api';

const DuplicatesPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [duplicates, setDuplicates] = useState([]);

    useEffect(() => {
        fetchDuplicates();
    }, []);

    const fetchDuplicates = async () => {
        try {
            setLoading(true);
            const data = await crmAPI.getDuplicates();
            setDuplicates(data);
        } catch (error) {
            console.error('Error fetching duplicates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!window.confirm(t('crm.confirmDelete', 'Delete this client?'))) return;

        try {
            await crmAPI.deleteClient(clientId);
            await fetchDuplicates();
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const handleMergeClients = async (keepId, mergeId) => {
        if (!window.confirm(t('crm.confirmMerge', 'Merge these clients? All data from the second client will be transferred to the first.'))) return;

        try {
            await crmAPI.mergeClients(keepId, mergeId);
            await fetchDuplicates();
        } catch (error) {
            console.error('Error merging clients:', error);
        }
    };

    const getReasonColor = (reason) => {
        switch (reason) {
            case 'Similar name': return '#8b5cf6';
            case 'Same email': return '#3b82f6';
            case 'Same phone': return '#10b981';
            case 'Same company': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/crm" style={{ color: '#9ca3af' }}>
                        <FiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                            <FiCopy style={{ marginRight: 12, color: '#f59e0b' }} />
                            {t('crm.duplicateDetection', 'Duplicate Detection')}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#9ca3af' }}>
                            {t('crm.duplicatesSubtitle', 'Find and merge duplicate client records')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchDuplicates}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: 13,
                        cursor: 'pointer'
                    }}
                >
                    {t('common.refresh', 'Refresh')}
                </button>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 20,
                    marginBottom: 32
                }}
            >
                <div style={{
                    background: 'rgba(17, 17, 27, 0.8)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(245, 158, 11, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <FiAlertTriangle style={{ color: '#f59e0b', width: 24, height: 24 }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>
                        {loading ? '-' : duplicates.length}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
                        {t('crm.duplicateGroups', 'Duplicate Groups')}
                    </p>
                </div>

                <div style={{
                    background: 'rgba(17, 17, 27, 0.8)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <FiUsers style={{ color: '#ef4444', width: 24, height: 24 }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#ef4444' }}>
                        {loading ? '-' : duplicates.reduce((sum, g) => sum + g.clients.length, 0)}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
                        {t('crm.affectedClients', 'Affected Clients')}
                    </p>
                </div>

                <div style={{
                    background: 'rgba(17, 17, 27, 0.8)',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <FiCheckCircle style={{ color: '#10b981', width: 24, height: 24 }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#10b981' }}>
                        {loading ? '-' : duplicates.length === 0 ? '✓' : '!'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>
                        {duplicates.length === 0 ? t('crm.noDuplicates', 'No Duplicates') : t('crm.needsReview', 'Needs Review')}
                    </p>
                </div>
            </motion.div>

            {/* Duplicate Groups */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: 'rgba(17, 17, 27, 0.8)',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{
                            width: 40, height: 40,
                            border: '3px solid #8b5cf6', borderTopColor: 'transparent',
                            borderRadius: '50%', margin: '0 auto 16px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: '#9ca3af' }}>{t('crm.scanning', 'Scanning for duplicates...')}</p>
                    </div>
                ) : duplicates.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: 'rgba(17, 17, 27, 0.8)',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <FiCheckCircle style={{ width: 48, height: 48, color: '#10b981', marginBottom: 16 }} />
                        <h3 style={{ margin: 0, color: '#fff', fontSize: 18 }}>
                            {t('crm.noDuplicatesFound', 'No Duplicates Found')}
                        </h3>
                        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14 }}>
                            {t('crm.allCleanMessage', 'Your client database looks clean!')}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {duplicates.map((group, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: 'rgba(17, 17, 27, 0.8)',
                                    borderRadius: 16,
                                    padding: 24,
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        background: `${getReasonColor(group.matchReason)}20`,
                                        color: getReasonColor(group.matchReason),
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>
                                        {group.matchReason}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                                        {group.clients.length} potential duplicates
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                                    {group.clients.map((client, i) => (
                                        <div
                                            key={client.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: 16,
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: 12,
                                                border: i === 0 ? '2px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                                                        {client.name}
                                                    </p>
                                                    {i === 0 && (
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: 'rgba(16, 185, 129, 0.2)',
                                                            color: '#10b981',
                                                            borderRadius: 10,
                                                            fontSize: 10,
                                                            fontWeight: 600
                                                        }}>
                                                            KEEP
                                                        </span>
                                                    )}
                                                </div>
                                                {client.companyName && (
                                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                                                        {client.companyName}
                                                    </p>
                                                )}
                                                {client.emails[0] && (
                                                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
                                                        {client.emails[0]}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Link
                                                    to={`/crm/clients/${client.id}`}
                                                    style={{
                                                        width: 32, height: 32,
                                                        borderRadius: 8,
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#8b5cf6'
                                                    }}
                                                >
                                                    <FiExternalLink size={14} />
                                                </Link>
                                                {i > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleMergeClients(group.clients[0].id, client.id)}
                                                            title="Merge into first client"
                                                            style={{
                                                                width: 32, height: 32,
                                                                borderRadius: 8,
                                                                background: 'rgba(16, 185, 129, 0.1)',
                                                                border: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#10b981',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FiGitMerge size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClient(client.id)}
                                                            style={{
                                                                width: 32, height: 32,
                                                                borderRadius: 8,
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#ef4444',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default DuplicatesPage;
