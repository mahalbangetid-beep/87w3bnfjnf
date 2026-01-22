import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FiPlus, FiSearch, FiFilter, FiGrid, FiList,
    FiMoreVertical, FiEdit2, FiTrash2, FiPhone, FiMail,
    FiUser, FiBriefcase, FiStar, FiRefreshCw, FiTag, FiX, FiCheck, FiCalendar, FiDownload,
    FiSquare, FiCheckSquare, FiLayers, FiUpload, FiAlertCircle
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { crmAPI } from '../../services/api';

const ClientsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [stages, setStages] = useState([]);
    const [viewMode, setViewMode] = useState('kanban'); // kanban or list
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [showTrash, setShowTrash] = useState(false);
    const [draggedClient, setDraggedClient] = useState(null);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [dateFilter, setDateFilter] = useState(''); // all, today, week, month, custom
    const [customDateStart, setCustomDateStart] = useState('');
    const [customDateEnd, setCustomDateEnd] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    // Bulk Actions
    const [selectedClients, setSelectedClients] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showBulkStageMenu, setShowBulkStageMenu] = useState(false);
    const [showBulkTagMenu, setShowBulkTagMenu] = useState(false);

    // Import CSV Modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState([]);
    const [importMapping, setImportMapping] = useState({});
    const [importHeaders, setImportHeaders] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [stagesData, clientsData, tagsData] = await Promise.all([
                crmAPI.getPipelineStages(),
                crmAPI.getClients({ isDeleted: showTrash, priority: filterPriority }),
                crmAPI.getTags()
            ]);
            setStages(Array.isArray(stagesData) ? stagesData : []);
            setTags(Array.isArray(tagsData) ? tagsData : []);

            // Get clients and filter by name client-side (name is encrypted in DB)
            let clientsList = clientsData?.clients || [];
            if (search && clientsList.length > 0) {
                const searchLower = search.toLowerCase();
                clientsList = clientsList.filter(c =>
                    c.name?.toLowerCase().includes(searchLower) ||
                    c.companyName?.toLowerCase().includes(searchLower)
                );
            }
            // Filter by selected tags
            if (selectedTags.length > 0 && clientsList.length > 0) {
                clientsList = clientsList.filter(c =>
                    c.tags && selectedTags.some(tag => c.tags.includes(tag))
                );
            }
            // Filter by date range
            if (dateFilter && clientsList.length > 0) {
                const now = new Date();
                let startDate = null;
                let endDate = new Date();

                if (dateFilter === 'today') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                } else if (dateFilter === 'week') {
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                } else if (dateFilter === 'month') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (dateFilter === 'custom' && customDateStart) {
                    startDate = new Date(customDateStart);
                    if (customDateEnd) {
                        endDate = new Date(customDateEnd);
                        endDate.setHours(23, 59, 59, 999);
                    }
                }

                if (startDate) {
                    clientsList = clientsList.filter(c => {
                        const clientDate = new Date(c.createdAt);
                        return clientDate >= startDate && clientDate <= endDate;
                    });
                }
            }
            setClients(clientsList);
        } catch (error) {
            console.error('Error fetching data:', error);
            setStages([]);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, [showTrash, search, filterPriority, selectedTags, dateFilter, customDateStart, customDateEnd]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDragStart = (e, client) => {
        setDraggedClient(client);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, stageId) => {
        e.preventDefault();
        if (!draggedClient || draggedClient.stageId === stageId) {
            setDraggedClient(null);
            return;
        }

        try {
            await crmAPI.changeClientStage(draggedClient.id, stageId);
            setClients(prev => prev.map(c =>
                c.id === draggedClient.id ? { ...c, stageId } : c
            ));
        } catch (error) {
            console.error('Error changing stage:', error);
        }
        setDraggedClient(null);
    };

    const handleDelete = async (clientId) => {
        if (!window.confirm(t('crm.confirmDelete', 'Are you sure you want to delete this client?'))) return;

        try {
            await crmAPI.deleteClient(clientId);
            setClients(prev => prev.filter(c => c.id !== clientId));
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const handleRestore = async (clientId) => {
        try {
            await crmAPI.restoreClient(clientId);
            setClients(prev => prev.filter(c => c.id !== clientId));
        } catch (error) {
            console.error('Error restoring client:', error);
        }
    };

    const handlePermanentDelete = async (clientId) => {
        if (!window.confirm(t('crm.confirmPermanentDelete', 'Permanently delete this client? This cannot be undone!'))) return;

        try {
            await crmAPI.permanentDeleteClient(clientId);
            setClients(prev => prev.filter(c => c.id !== clientId));
        } catch (error) {
            console.error('Error permanent deleting client:', error);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            vip: '#f59e0b',
            high: '#ef4444',
            medium: '#8b5cf6',
            low: '#6b7280'
        };
        return colors[priority] || '#6b7280';
    };

    const handleExportCSV = () => {
        if (clients.length === 0) {
            alert(t('crm.noDataToExport', 'No data to export'));
            return;
        }

        // Define CSV headers
        const headers = [
            'Name',
            'Company',
            'Stage',
            'Priority',
            'Tags',
            'Primary Contact',
            'Email',
            'Phone',
            'Notes',
            'Created At'
        ];

        // Convert clients to CSV rows
        const rows = clients.map(client => {
            const stage = stages.find(s => s.id === client.stageId);
            const primaryContact = client.contacts?.find(c => c.isPrimary) || client.contacts?.[0];

            return [
                `"${(client.name || '').replace(/"/g, '""')}"`,
                `"${(client.companyName || '').replace(/"/g, '""')}"`,
                `"${(stage?.name || '').replace(/"/g, '""')}"`,
                client.priority || '',
                `"${(client.tags || []).join(', ')}"`,
                `"${(primaryContact?.name || '').replace(/"/g, '""')}"`,
                primaryContact?.email || '',
                primaryContact?.phone || '',
                `"${(client.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                client.createdAt ? new Date(client.createdAt).toLocaleDateString() : ''
            ];
        });

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // CSV Import Handlers
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportError('');
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim());

                if (lines.length < 2) {
                    setImportError('CSV must have at least a header row and one data row');
                    return;
                }

                // Parse header
                const headers = parseCSVLine(lines[0]);
                setImportHeaders(headers);

                // Parse data rows
                const data = lines.slice(1).map(line => parseCSVLine(line));
                setImportData(data);

                // Auto-map common columns
                const autoMapping = {};
                const lowerHeaders = headers.map(h => h.toLowerCase().trim());

                if (lowerHeaders.includes('name') || lowerHeaders.includes('client name')) {
                    autoMapping.name = lowerHeaders.findIndex(h => h === 'name' || h === 'client name');
                }
                if (lowerHeaders.includes('company') || lowerHeaders.includes('company name')) {
                    autoMapping.company = lowerHeaders.findIndex(h => h === 'company' || h === 'company name');
                }
                if (lowerHeaders.includes('email')) {
                    autoMapping.email = lowerHeaders.findIndex(h => h === 'email');
                }
                if (lowerHeaders.includes('phone')) {
                    autoMapping.phone = lowerHeaders.findIndex(h => h === 'phone');
                }
                if (lowerHeaders.includes('priority')) {
                    autoMapping.priority = lowerHeaders.findIndex(h => h === 'priority');
                }
                if (lowerHeaders.includes('notes')) {
                    autoMapping.notes = lowerHeaders.findIndex(h => h === 'notes');
                }

                setImportMapping(autoMapping);
            } catch (err) {
                setImportError('Failed to parse CSV file');
            }
        };

        reader.readAsText(file);
    };

    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const handleImport = async () => {
        if (importData.length === 0) return;
        if (importMapping.name === undefined) {
            setImportError('Please map the Name column (required)');
            return;
        }

        setImporting(true);
        setImportError('');

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const row of importData) {
                try {
                    const clientData = {
                        name: row[importMapping.name] || '',
                        companyName: importMapping.company !== undefined ? row[importMapping.company] : '',
                        priority: importMapping.priority !== undefined ? row[importMapping.priority]?.toLowerCase() || 'medium' : 'medium',
                        notes: importMapping.notes !== undefined ? row[importMapping.notes] : '',
                        stageId: stages[0]?.id || null,
                        contacts: []
                    };

                    // Skip if no name
                    if (!clientData.name.trim()) continue;

                    // Add contact if email or phone
                    if (importMapping.email !== undefined || importMapping.phone !== undefined) {
                        clientData.contacts.push({
                            name: clientData.name,
                            email: importMapping.email !== undefined ? row[importMapping.email] : '',
                            phone: importMapping.phone !== undefined ? row[importMapping.phone] : '',
                            isPrimary: true
                        });
                    }

                    await crmAPI.createClient(clientData);
                    successCount++;
                } catch (err) {
                    errorCount++;
                }
            }

            // Close modal and refresh
            setShowImportModal(false);
            setImportData([]);
            setImportHeaders([]);
            setImportMapping({});
            fetchData();

            alert(t('crm.importSuccess', `Imported ${successCount} clients. ${errorCount > 0 ? `${errorCount} failed.` : ''}`));
        } catch (err) {
            setImportError('Import failed: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    // Bulk Action Handlers
    const toggleClientSelection = (clientId) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const selectAllClients = () => {
        if (selectedClients.length === clients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(clients.map(c => c.id));
        }
    };

    const handleBulkChangeStage = async (stageId) => {
        if (selectedClients.length === 0) return;

        try {
            await Promise.all(
                selectedClients.map(clientId => crmAPI.changeClientStage(clientId, stageId))
            );
            setClients(prev => prev.map(c =>
                selectedClients.includes(c.id) ? { ...c, stageId } : c
            ));
            setSelectedClients([]);
            setShowBulkStageMenu(false);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Error bulk changing stage:', error);
        }
    };

    const handleBulkAddTag = async (tagName) => {
        if (selectedClients.length === 0) return;

        try {
            const updates = selectedClients.map(async (clientId) => {
                const client = clients.find(c => c.id === clientId);
                const currentTags = client?.tags || [];
                if (!currentTags.includes(tagName)) {
                    await crmAPI.updateClient(clientId, { tags: [...currentTags, tagName] });
                    return { id: clientId, tags: [...currentTags, tagName] };
                }
                return null;
            });

            const results = await Promise.all(updates);
            setClients(prev => prev.map(c => {
                const updated = results.find(r => r?.id === c.id);
                return updated ? { ...c, tags: updated.tags } : c;
            }));
            setSelectedClients([]);
            setShowBulkTagMenu(false);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Error bulk adding tag:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) return;
        if (!window.confirm(t('crm.confirmBulkDelete', `Delete ${selectedClients.length} clients?`))) return;

        try {
            await Promise.all(
                selectedClients.map(clientId => crmAPI.deleteClient(clientId))
            );
            setClients(prev => prev.filter(c => !selectedClients.includes(c.id)));
            setSelectedClients([]);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Error bulk deleting:', error);
        }
    };
    const ClientCard = ({ client }) => {
        const [showMenu, setShowMenu] = useState(false);
        const primaryContact = client.contacts?.find(c => c.isPrimary) || client.contacts?.[0];

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                draggable={!showTrash}
                onDragStart={(e) => handleDragStart(e, client)}
                onClick={() => navigate(`/crm/clients/${client.id}`)}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    position: 'relative'
                }}
            >
                {/* Priority Indicator */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 16,
                    width: 40,
                    height: 3,
                    background: getPriorityColor(client.priority),
                    borderRadius: '0 0 4px 4px'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>
                            {client.name}
                        </h4>
                        {client.companyName && (
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiBriefcase size={10} /> {client.companyName}
                            </p>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#6b7280',
                                cursor: 'pointer',
                                padding: 4
                            }}
                        >
                            <FiMoreVertical />
                        </motion.button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{
                                        position: 'absolute',
                                        top: 24,
                                        right: 0,
                                        background: '#1a1a2e',
                                        borderRadius: 8,
                                        padding: 8,
                                        minWidth: 120,
                                        zIndex: 10,
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {showTrash ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRestore(client.id); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#10b981',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    borderRadius: 4
                                                }}
                                            >
                                                <FiRefreshCw size={14} /> {t('common.restore', 'Restore')}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePermanentDelete(client.id); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    borderRadius: 4
                                                }}
                                            >
                                                <FiTrash2 size={14} /> {t('common.permanentDelete', 'Delete Forever')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/crm/clients/${client.id}/edit`); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    borderRadius: 4
                                                }}
                                            >
                                                <FiEdit2 size={14} /> {t('common.edit', 'Edit')}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    borderRadius: 4
                                                }}
                                            >
                                                <FiTrash2 size={14} /> {t('common.delete', 'Delete')}
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Contact Info */}
                {primaryContact && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {primaryContact.email && (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                color: '#6b7280',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px 8px',
                                borderRadius: 4
                            }}>
                                <FiMail size={10} /> {primaryContact.email}
                            </span>
                        )}
                        {primaryContact.phone && (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                color: '#6b7280',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px 8px',
                                borderRadius: 4
                            }}>
                                <FiPhone size={10} /> {primaryContact.phone}
                            </span>
                        )}
                    </div>
                )}

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {client.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#a78bfa',
                                borderRadius: 10
                            }}>
                                {tag}
                            </span>
                        ))}
                        {client.tags.length > 3 && (
                            <span style={{ fontSize: 10, color: '#6b7280' }}>
                                +{client.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </motion.div>
        );
    };

    const KanbanColumn = ({ stage }) => {
        const stageClients = clients.filter(c => c.stageId === stage.id);

        return (
            <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                style={{
                    minWidth: 280,
                    maxWidth: 320,
                    background: 'rgba(17, 17, 27, 0.6)',
                    borderRadius: 16,
                    padding: 16,
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 220px)',
                    overflowY: 'auto'
                }}
            >
                {/* Column Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{stage.icon}</span>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>
                            {stage.name}
                        </h3>
                        <span style={{
                            background: stage.color,
                            color: '#fff',
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontWeight: 600
                        }}>
                            {stageClients.length}
                        </span>
                    </div>
                    <Link to={`/crm/clients/new?stage=${stage.id}`} style={{ color: '#6b7280' }}>
                        <FiPlus />
                    </Link>
                </div>

                {/* Cards */}
                <AnimatePresence>
                    {stageClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </AnimatePresence>

                {stageClients.length === 0 && (
                    <div style={{
                        padding: 24,
                        textAlign: 'center',
                        color: '#4b5563',
                        fontSize: 13,
                        border: '2px dashed rgba(255,255,255,0.1)',
                        borderRadius: 12
                    }}>
                        {t('crm.dropHere', 'Drop clients here')}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48,
                        height: 48,
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px 32px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
        }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#fff' }}>
                        {showTrash ? t('crm.trash', 'Trash') : t('crm.clients', 'Clients')}
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#9ca3af' }}>
                        {clients.length} {t('crm.clientsCount', 'clients')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {/* Export Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportCSV}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <FiDownload /> {t('crm.export', 'Export')}
                    </motion.button>

                    {/* Import Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowImportModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: 12,
                            color: '#10b981',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <FiUpload /> {t('crm.import', 'Import')}
                    </motion.button>

                    <Link to="/crm/clients/new" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                border: 'none',
                                borderRadius: 12,
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <FiPlus /> {t('crm.addClient', 'Add Client')}
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}
            >
                {/* Select All Checkbox (List view only) */}
                {viewMode === 'list' && !showTrash && (
                    <button
                        onClick={selectAllClients}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            background: selectedClients.length > 0 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedClients.length > 0 ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            color: selectedClients.length > 0 ? '#a78bfa' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        {selectedClients.length === clients.length && clients.length > 0 ? <FiCheckSquare /> : <FiSquare />}
                        {selectedClients.length > 0 ? `${selectedClients.length} selected` : t('crm.selectAll', 'Select')}
                    </button>
                )}

                {/* Bulk Actions Menu */}
                {selectedClients.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* Change Stage */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowBulkStageMenu(!showBulkStageMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '10px 14px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: 8,
                                    color: '#a78bfa',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                <FiLayers size={14} /> {t('crm.changeStage', 'Stage')}
                            </button>

                            <AnimatePresence>
                                {showBulkStageMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{
                                            position: 'absolute',
                                            top: 44,
                                            left: 0,
                                            background: '#1a1a2e',
                                            borderRadius: 10,
                                            padding: 8,
                                            minWidth: 180,
                                            zIndex: 100,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {stages.map(stage => (
                                            <button
                                                key={stage.id}
                                                onClick={() => handleBulkChangeStage(stage.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    color: '#d1d5db',
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span>{stage.icon}</span>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                                                {stage.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Add Tag */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowBulkTagMenu(!showBulkTagMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '10px 14px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: 8,
                                    color: '#10b981',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                <FiTag size={14} /> {t('crm.addTag', 'Add Tag')}
                            </button>

                            <AnimatePresence>
                                {showBulkTagMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{
                                            position: 'absolute',
                                            top: 44,
                                            left: 0,
                                            background: '#1a1a2e',
                                            borderRadius: 10,
                                            padding: 8,
                                            minWidth: 160,
                                            zIndex: 100,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {tags.length > 0 ? tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleBulkAddTag(tag.name)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    color: tag.color,
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color }} />
                                                {tag.name}
                                            </button>
                                        )) : (
                                            <p style={{ margin: 0, padding: 12, color: '#6b7280', fontSize: 12, textAlign: 'center' }}>No tags</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Delete */}
                        <button
                            onClick={handleBulkDelete}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 14px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 8,
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: 13
                            }}
                        >
                            <FiTrash2 size={14} /> {t('common.delete', 'Delete')}
                        </button>

                        {/* Clear Selection */}
                        <button
                            onClick={() => setSelectedClients([])}
                            style={{
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: 8,
                                color: '#6b7280',
                                cursor: 'pointer',
                                fontSize: 13
                            }}
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                )}
                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    flex: 1,
                    maxWidth: 300
                }}>
                    <FiSearch style={{ color: '#6b7280' }} />
                    <input
                        type="text"
                        placeholder={t('crm.searchClients', 'Search clients...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#fff',
                            fontSize: 14,
                            width: '100%'
                        }}
                    />
                </div>

                {/* Priority Filter */}
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: '10px 16px',
                        color: '#fff',
                        fontSize: 14,
                        cursor: 'pointer'
                    }}
                >
                    <option value="">{t('crm.allPriorities', 'All Priorities')}</option>
                    <option value="vip">VIP</option>
                    <option value="high">{t('crm.high', 'High')}</option>
                    <option value="medium">{t('crm.medium', 'Medium')}</option>
                    <option value="low">{t('crm.low', 'Low')}</option>
                </select>

                {/* Tags Filter */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: selectedTags.length > 0 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedTags.length > 0 ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            padding: '10px 16px',
                            color: selectedTags.length > 0 ? '#a78bfa' : '#fff',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                    >
                        <FiTag size={14} />
                        {selectedTags.length > 0 ? `${selectedTags.length} Tags` : t('crm.allTags', 'All Tags')}
                    </button>

                    <AnimatePresence>
                        {showTagsDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: 48,
                                    left: 0,
                                    background: '#1a1a2e',
                                    borderRadius: 12,
                                    padding: 12,
                                    minWidth: 200,
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                    zIndex: 100,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Clear button */}
                                {selectedTags.length > 0 && (
                                    <button
                                        onClick={() => { setSelectedTags([]); setShowTagsDropdown(false); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            width: '100%',
                                            padding: '8px 12px',
                                            marginBottom: 8,
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: 'none',
                                            borderRadius: 8,
                                            color: '#ef4444',
                                            fontSize: 13,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FiX size={12} /> Clear All
                                    </button>
                                )}

                                {/* Tags list */}
                                {tags.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => {
                                                    if (selectedTags.includes(tag.name)) {
                                                        setSelectedTags(selectedTags.filter(t => t !== tag.name));
                                                    } else {
                                                        setSelectedTags([...selectedTags, tag.name]);
                                                    }
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '8px 12px',
                                                    background: selectedTags.includes(tag.name) ? `${tag.color}30` : 'transparent',
                                                    border: selectedTags.includes(tag.name) ? `1px solid ${tag.color}50` : '1px solid transparent',
                                                    borderRadius: 8,
                                                    color: selectedTags.includes(tag.name) ? tag.color : '#d1d5db',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: tag.color }} />
                                                {tag.name}
                                                {selectedTags.includes(tag.name) && <FiCheck style={{ marginLeft: 'auto' }} size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13, textAlign: 'center', padding: 16 }}>
                                        {t('crm.noTags', 'No tags available')}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {selectedTags.map(tag => {
                            const tagData = tags.find(t => t.name === tag);
                            return (
                                <span
                                    key={tag}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '4px 10px',
                                        background: `${tagData?.color || '#8b5cf6'}30`,
                                        color: tagData?.color || '#a78bfa',
                                        borderRadius: 20,
                                        fontSize: 12
                                    }}
                                >
                                    {tag}
                                    <FiX
                                        size={12}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                    />
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Date Range Filter */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDateDropdown(!showDateDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: dateFilter ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: dateFilter ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            padding: '10px 16px',
                            color: dateFilter ? '#a78bfa' : '#fff',
                            fontSize: 14,
                            cursor: 'pointer'
                        }}
                    >
                        <FiCalendar size={14} />
                        {dateFilter === 'today' ? t('crm.today', 'Today') :
                            dateFilter === 'week' ? t('crm.thisWeek', 'This Week') :
                                dateFilter === 'month' ? t('crm.thisMonth', 'This Month') :
                                    dateFilter === 'custom' ? t('crm.custom', 'Custom') :
                                        t('crm.allTime', 'All Time')}
                    </button>

                    <AnimatePresence>
                        {showDateDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: 48,
                                    left: 0,
                                    background: '#1a1a2e',
                                    borderRadius: 12,
                                    padding: 12,
                                    minWidth: 220,
                                    zIndex: 100,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Preset Options */}
                                {[
                                    { value: '', label: t('crm.allTime', 'All Time') },
                                    { value: 'today', label: t('crm.today', 'Today') },
                                    { value: 'week', label: t('crm.thisWeek', 'This Week') },
                                    { value: 'month', label: t('crm.thisMonth', 'This Month') },
                                    { value: 'custom', label: t('crm.customRange', 'Custom Range') }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setDateFilter(option.value);
                                            if (option.value !== 'custom') {
                                                setShowDateDropdown(false);
                                                setCustomDateStart('');
                                                setCustomDateEnd('');
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: dateFilter === option.value ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                            border: 'none',
                                            borderRadius: 8,
                                            color: dateFilter === option.value ? '#a78bfa' : '#d1d5db',
                                            fontSize: 13,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            marginBottom: 2
                                        }}
                                    >
                                        {dateFilter === option.value && <FiCheck size={14} />}
                                        {option.label}
                                    </button>
                                ))}

                                {/* Custom Date Range */}
                                {dateFilter === 'custom' && (
                                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                        <label style={{ display: 'block', marginBottom: 8, color: '#9ca3af', fontSize: 12 }}>
                                            {t('crm.startDate', 'Start Date')}
                                        </label>
                                        <input
                                            type="date"
                                            value={customDateStart}
                                            onChange={(e) => setCustomDateStart(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: 8,
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 6,
                                                color: '#fff',
                                                marginBottom: 12
                                            }}
                                        />
                                        <label style={{ display: 'block', marginBottom: 8, color: '#9ca3af', fontSize: 12 }}>
                                            {t('crm.endDate', 'End Date')}
                                        </label>
                                        <input
                                            type="date"
                                            value={customDateEnd}
                                            onChange={(e) => setCustomDateEnd(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: 8,
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 6,
                                                color: '#fff'
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowDateDropdown(false)}
                                            style={{
                                                width: '100%',
                                                marginTop: 12,
                                                padding: '8px 12px',
                                                background: '#8b5cf6',
                                                border: 'none',
                                                borderRadius: 6,
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: 13
                                            }}
                                        >
                                            {t('common.apply', 'Apply')}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Active Date Filter Badge */}
                {dateFilter && dateFilter !== 'custom' && (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                        borderRadius: 20,
                        fontSize: 12
                    }}>
                        <FiCalendar size={10} />
                        {dateFilter === 'today' ? t('crm.today', 'Today') :
                            dateFilter === 'week' ? t('crm.last7Days', 'Last 7 days') :
                                t('crm.thisMonth', 'This Month')}
                        <FiX
                            size={12}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setDateFilter('')}
                        />
                    </span>
                )}

                {dateFilter === 'custom' && customDateStart && (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                        borderRadius: 20,
                        fontSize: 12
                    }}>
                        <FiCalendar size={10} />
                        {customDateStart}{customDateEnd ? ` → ${customDateEnd}` : ''}
                        <FiX
                            size={12}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { setDateFilter(''); setCustomDateStart(''); setCustomDateEnd(''); }}
                        />
                    </span>
                )}

                {/* View Mode Toggle */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
                    <button
                        onClick={() => setViewMode('kanban')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            background: viewMode === 'kanban' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                            border: 'none',
                            borderRadius: 8,
                            color: viewMode === 'kanban' ? '#a78bfa' : '#6b7280',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        <FiGrid /> {t('crm.kanban', 'Kanban')}
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            background: viewMode === 'list' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                            border: 'none',
                            borderRadius: 8,
                            color: viewMode === 'list' ? '#a78bfa' : '#6b7280',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        <FiList /> {t('crm.list', 'List')}
                    </button>
                </div>

                {/* Trash Toggle */}
                <button
                    onClick={() => setShowTrash(!showTrash)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 16px',
                        background: showTrash ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: showTrash ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: showTrash ? '#f87171' : '#6b7280',
                        cursor: 'pointer',
                        fontSize: 13
                    }}
                >
                    <FiTrash2 /> {t('crm.trash', 'Trash')}
                </button>
            </motion.div>

            {/* Kanban Board */}
            {viewMode === 'kanban' && !showTrash && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'flex',
                        gap: 20,
                        overflowX: 'auto',
                        paddingBottom: 20
                    }}
                >
                    {stages.map(stage => (
                        <KanbanColumn key={stage.id} stage={stage} />
                    ))}
                </motion.div>
            )}

            {/* List View or Trash */}
            {(viewMode === 'list' || showTrash) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: 'rgba(17, 17, 27, 0.6)',
                        borderRadius: 16,
                        overflow: 'hidden'
                    }}
                >
                    {clients.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {!showTrash && (
                                        <th style={{ padding: 16, width: 50 }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); selectAllClients(); }}
                                                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
                                            >
                                                {selectedClients.length === clients.length && clients.length > 0 ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                                            </button>
                                        </th>
                                    )}
                                    <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                        {t('crm.name', 'NAME')}
                                    </th>
                                    <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                        {t('crm.company', 'COMPANY')}
                                    </th>
                                    <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                        {t('crm.stage', 'STAGE')}
                                    </th>
                                    <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                        {t('crm.priority', 'PRIORITY')}
                                    </th>
                                    <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                        {t('crm.actions', 'ACTIONS')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr
                                        key={client.id}
                                        onClick={() => navigate(`/crm/clients/${client.id}`)}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            background: selectedClients.includes(client.id) ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                                        }}
                                    >
                                        {!showTrash && (
                                            <td style={{ padding: 16 }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleClientSelection(client.id); }}
                                                    style={{ background: 'transparent', border: 'none', color: selectedClients.includes(client.id) ? '#8b5cf6' : '#6b7280', cursor: 'pointer', padding: 4 }}
                                                >
                                                    {selectedClients.includes(client.id) ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                                                </button>
                                            </td>
                                        )}
                                        <td style={{ padding: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 10,
                                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontSize: 14,
                                                    fontWeight: 600
                                                }}>
                                                    {client.name?.charAt(0)?.toUpperCase() || 'C'}
                                                </div>
                                                <span style={{ color: '#fff', fontWeight: 500 }}>{client.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 16, color: '#9ca3af' }}>
                                            {client.companyName || '-'}
                                        </td>
                                        <td style={{ padding: 16 }}>
                                            {client.stage && (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '4px 12px',
                                                    background: `${client.stage.color}20`,
                                                    color: client.stage.color,
                                                    borderRadius: 20,
                                                    fontSize: 12
                                                }}>
                                                    {client.stage.icon} {client.stage.name}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: 16 }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '4px 12px',
                                                background: `${getPriorityColor(client.priority)}20`,
                                                color: getPriorityColor(client.priority),
                                                borderRadius: 20,
                                                fontSize: 12,
                                                textTransform: 'capitalize'
                                            }}>
                                                {client.priority === 'vip' && <FiStar size={10} />}
                                                {client.priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: 16, textAlign: 'right' }}>
                                            {showTrash ? (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRestore(client.id); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: 'rgba(16, 185, 129, 0.2)',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            color: '#10b981',
                                                            cursor: 'pointer',
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        {t('common.restore', 'Restore')}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handlePermanentDelete(client.id); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            fontSize: 12,
                                                            marginLeft: 8
                                                        }}
                                                    >
                                                        {t('common.deleteForever', 'Delete')}
                                                    </button>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/crm/clients/${client.id}/edit`); }}
                                                        style={{
                                                            padding: 8,
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            color: '#9ca3af',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                                                        style={{
                                                            padding: 8,
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            color: '#ef4444',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 60,
                            color: '#6b7280'
                        }}>
                            <FiUser style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                                {showTrash
                                    ? t('crm.trashEmpty', 'Trash is empty')
                                    : t('crm.noClients', 'No clients found')
                                }
                            </p>
                            {!showTrash && (
                                <Link to="/crm/clients/new" style={{ color: '#8b5cf6', marginTop: 8, display: 'inline-block' }}>
                                    {t('crm.addFirstClient', 'Add your first client')}
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Import CSV Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 20
                        }}
                        onClick={() => setShowImportModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
                                borderRadius: 20,
                                padding: 32,
                                width: '100%',
                                maxWidth: 600,
                                maxHeight: '80vh',
                                overflow: 'auto',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#fff' }}>
                                    <FiUpload style={{ marginRight: 10, color: '#10b981' }} />
                                    {t('crm.importClients', 'Import Clients')}
                                </h2>
                                <button
                                    onClick={() => { setShowImportModal(false); setImportData([]); setImportHeaders([]); setImportError(''); }}
                                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8 }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Error Message */}
                            {importError && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: 12,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: 8,
                                    color: '#ef4444',
                                    marginBottom: 16,
                                    fontSize: 13
                                }}>
                                    <FiAlertCircle /> {importError}
                                </div>
                            )}

                            {/* File Upload */}
                            {importData.length === 0 ? (
                                <div>
                                    <label
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 40,
                                            border: '2px dashed rgba(255,255,255,0.1)',
                                            borderRadius: 16,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FiUpload size={40} style={{ color: '#6b7280', marginBottom: 16 }} />
                                        <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>
                                            {t('crm.dropOrClick', 'Click to upload CSV file')}
                                        </p>
                                        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 12 }}>
                                            CSV with columns: Name, Company, Email, Phone, Priority, Notes
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <>
                                    {/* Column Mapping */}
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#fff' }}>
                                            {t('crm.columnMapping', 'Column Mapping')}
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            {['name', 'company', 'email', 'phone', 'priority', 'notes'].map(field => (
                                                <div key={field}>
                                                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>
                                                        {field} {field === 'name' && '*'}
                                                    </label>
                                                    <select
                                                        value={importMapping[field] ?? ''}
                                                        onChange={(e) => setImportMapping({ ...importMapping, [field]: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                        style={{
                                                            width: '100%',
                                                            padding: 10,
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: 8,
                                                            color: '#fff',
                                                            fontSize: 13
                                                        }}
                                                    >
                                                        <option value="">-- Not mapped --</option>
                                                        {importHeaders.map((h, i) => (
                                                            <option key={i} value={i}>{h}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#fff' }}>
                                            {t('crm.preview', 'Preview')} ({importData.length} rows)
                                        </h3>
                                        <div style={{ maxHeight: 200, overflow: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
                                            <table style={{ width: '100%', fontSize: 12, color: '#9ca3af' }}>
                                                <thead>
                                                    <tr>
                                                        {importHeaders.slice(0, 5).map((h, i) => (
                                                            <th key={i} style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importData.slice(0, 5).map((row, i) => (
                                                        <tr key={i}>
                                                            {row.slice(0, 5).map((cell, j) => (
                                                                <td key={j} style={{ padding: 8, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {importData.length > 5 && (
                                                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
                                                    + {importData.length - 5} more rows
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => { setImportData([]); setImportHeaders([]); setImportMapping({}); }}
                                            style={{
                                                padding: '12px 20px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#9ca3af',
                                                fontSize: 14,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('crm.chooseAnother', 'Choose Another')}
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleImport}
                                            disabled={importing || importMapping.name === undefined}
                                            style={{
                                                padding: '12px 24px',
                                                background: importMapping.name !== undefined ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                cursor: importMapping.name !== undefined ? 'pointer' : 'not-allowed',
                                                opacity: importMapping.name !== undefined ? 1 : 0.5
                                            }}
                                        >
                                            {importing ? t('common.importing', 'Importing...') : t('crm.importClients', 'Import Clients')}
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientsPage;
