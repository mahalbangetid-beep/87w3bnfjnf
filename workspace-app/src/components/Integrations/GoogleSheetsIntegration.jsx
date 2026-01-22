import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineCloudUpload, HiOutlineCloudDownload, HiOutlineCheck,
    HiOutlineExternalLink, HiOutlineRefresh, HiOutlineX,
    HiOutlineDocumentText, HiOutlineFolder, HiOutlineChat,
    HiOutlineCurrencyDollar, HiOutlineSparkles, HiOutlineLink
} from 'react-icons/hi';
import { googleSheetsAPI } from '../../services/api';

// Google Logo SVG
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// Particle effect for connected state
const ConnectionParticles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
            <motion.div key={i}
                animate={{ y: [100, -100], opacity: [0, 1, 0], x: Math.sin(i) * 50 }}
                transition={{ duration: 3 + i * 0.2, repeat: Infinity, delay: i * 0.3 }}
                style={{
                    position: 'absolute',
                    left: `${10 + (i * 6)}%`,
                    bottom: 0,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'][i % 4]
                }}
            />
        ))}
    </div>
);

// Export Card Component
const ExportCard = ({ icon: Icon, title, description, count, color, onExport, loading }) => {
    const [exported, setExported] = useState(false);
    const [result, setResult] = useState(null);

    const handleExport = async () => {
        try {
            const data = await onExport();
            setResult(data);
            setExported(true);
        } catch (err) {
            setResult({ error: err.message });
        }
    };

    return (
        <motion.div whileHover={{ scale: 1.02, y: -5 }} style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: color, opacity: 0.1, filter: 'blur(40px)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} style={{ width: 56, height: 56, borderRadius: 16, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 28, height: 28, color }} />
                    </motion.div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white' }}>{title}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{description}</p>
                    </div>
                </div>

                {count !== undefined && (
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                        <strong style={{ color }}>{count}</strong> items to export
                    </p>
                )}

                {result?.spreadsheetUrl ? (
                    <motion.a initial={{ scale: 0 }} animate={{ scale: 1 }} href={result.spreadsheetUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #34A853, #4285F4)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                        <HiOutlineExternalLink /> Open in Google Sheets
                    </motion.a>
                ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport} disabled={loading}
                        style={{ width: '100%', padding: '12px 20px', borderRadius: 12, border: 'none', background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${color}, ${color}cc)`, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {loading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><HiOutlineRefresh /></motion.div>
                        ) : (
                            <><HiOutlineCloudUpload /> Export to Sheets</>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

// Import Section
const ImportSection = ({ onImport }) => {
    const [spreadsheets, setSpreadsheets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSheet, setSelectedSheet] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const fetchSpreadsheets = async () => {
        setLoading(true);
        try {
            const data = await googleSheetsAPI.getSpreadsheets();
            setSpreadsheets(data);
        } catch (err) {
            console.error('Failed to fetch spreadsheets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedSheet) return;
        setImporting(true);
        try {
            const data = await googleSheetsAPI.importTransactions(selectedSheet.id);
            setResult(data);
        } catch (err) {
            setResult({ error: err.message });
        } finally {
            setImporting(false);
        }
    };

    useEffect(() => {
        fetchSpreadsheets();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineCloudDownload style={{ width: 24, height: 24, color: '#06b6d4' }} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white' }}>Import from Sheets</h4>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Sync data back from Google Sheets</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={fetchSpreadsheets}
                    style={{ marginLeft: 'auto', padding: 8, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                    <HiOutlineRefresh style={{ width: 18, height: 18 }} />
                </motion.button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <HiOutlineRefresh style={{ width: 24, height: 24 }} />
                    </motion.div>
                </div>
            ) : spreadsheets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                    <p>No spreadsheets found</p>
                </div>
            ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
                    {spreadsheets.map(sheet => (
                        <motion.div key={sheet.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onClick={() => setSelectedSheet(sheet)}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, cursor: 'pointer', border: selectedSheet?.id === sheet.id ? '1px solid rgba(6,182,212,0.5)' : '1px solid transparent', background: selectedSheet?.id === sheet.id ? 'rgba(6,182,212,0.1)' : 'transparent' }}>
                            <HiOutlineDocumentText style={{ width: 20, height: 20, color: '#34A853' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 14, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sheet.name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{new Date(sheet.modifiedTime).toLocaleDateString()}</p>
                            </div>
                            {selectedSheet?.id === sheet.id && (
                                <HiOutlineCheck style={{ width: 18, height: 18, color: '#06b6d4' }} />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: 12, borderRadius: 10, marginBottom: 16, background: result.error ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${result.error ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: result.error ? '#f87171' : '#34d399', fontSize: 13 }}>
                    {result.error || `Imported ${result.imported} new, updated ${result.updated} existing`}
                </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleImport} disabled={!selectedSheet || importing}
                style={{ width: '100%', padding: '12px 20px', borderRadius: 12, border: 'none', background: !selectedSheet ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: 'white', cursor: !selectedSheet ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !selectedSheet ? 0.5 : 1 }}>
                {importing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><HiOutlineRefresh /></motion.div>
                ) : (
                    <><HiOutlineCloudDownload /> Import Transactions</>
                )}
            </motion.button>
        </motion.div>
    );
};

// Main Component
const GoogleSheetsIntegration = () => {
    const [status, setStatus] = useState({ connected: false, loading: true });
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        checkStatus();
        // Check for callback params
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'google_connected') {
            checkStatus();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const checkStatus = async () => {
        try {
            const data = await googleSheetsAPI.getStatus();
            setStatus({ ...data, loading: false });
        } catch {
            setStatus({ connected: false, loading: false });
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const { authUrl } = await googleSheetsAPI.getAuthUrl();
            window.location.href = authUrl;
        } catch (err) {
            alert('Failed to connect: ' + err.message);
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await googleSheetsAPI.disconnect();
            setStatus({ connected: false, loading: false });
        } catch (err) {
            alert('Failed to disconnect');
        }
    };

    if (status.loading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <HiOutlineSparkles style={{ width: 32, height: 32, color: '#6b7280' }} />
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Connection Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 28, borderRadius: 24, background: status.connected ? 'linear-gradient(135deg, rgba(52,168,83,0.1), rgba(66,133,244,0.1))' : 'rgba(255,255,255,0.03)', border: `1px solid ${status.connected ? 'rgba(52,168,83,0.3)' : 'rgba(255,255,255,0.08)'}`, position: 'relative', overflow: 'hidden' }}>

                {status.connected && <ConnectionParticles />}

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
                    <motion.div whileHover={{ scale: 1.1, rotate: status.connected ? 360 : 0 }} transition={{ duration: 0.5 }}
                        style={{ width: 64, height: 64, borderRadius: 18, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                        <GoogleLogo />
                    </motion.div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                            Google Sheets
                            {status.connected && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    style={{ padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg, #34A853, #4285F4)', fontSize: 11, fontWeight: 600 }}>
                                    Connected ✓
                                </motion.span>
                            )}
                        </h3>
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af' }}>
                            {status.connected ? `Connected as ${status.email}` : 'Connect to export and sync your data'}
                        </p>
                    </div>

                    {status.connected ? (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDisconnect}
                            style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                            Disconnect
                        </motion.button>
                    ) : (
                        <motion.button whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(66,133,244,0.3)' }} whileTap={{ scale: 0.95 }} onClick={handleConnect} disabled={connecting}
                            style={{ padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #4285F4, #34A853)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(66,133,244,0.2)' }}>
                            {connecting ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><HiOutlineRefresh /></motion.div>
                            ) : (
                                <><HiOutlineLink /> Connect Google Account</>
                            )}
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Export/Import Section - Only show when connected */}
            <AnimatePresence>
                {status.connected && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineCloudUpload style={{ color: '#34A853' }} />
                            Export Data
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                            <ExportCard
                                icon={HiOutlineCurrencyDollar}
                                title="Transactions"
                                description="Export all finance transactions"
                                color="#10b981"
                                onExport={googleSheetsAPI.exportTransactions}
                            />
                            <ExportCard
                                icon={HiOutlineFolder}
                                title="Projects & Tasks"
                                description="Export projects with their tasks"
                                color="#8b5cf6"
                                onExport={googleSheetsAPI.exportProjects}
                            />
                            <ExportCard
                                icon={HiOutlineChat}
                                title="Social Posts"
                                description="Export scheduled social content"
                                color="#ec4899"
                                onExport={googleSheetsAPI.exportSocial}
                            />
                        </div>

                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <HiOutlineCloudDownload style={{ color: '#06b6d4' }} />
                            Import Data
                        </h3>
                        <ImportSection />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Setup Instructions */}
            {!status.connected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ padding: 24, borderRadius: 16, background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.2)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#4285F4' }}>⚙️ Setup Required</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>
                        To use Google Sheets integration, admin needs to configure:
                    </p>
                    <ol style={{ margin: '12px 0 0', paddingLeft: 20, fontSize: 13, color: '#9ca3af', lineHeight: 2 }}>
                        <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4285F4' }}>Google Cloud Console</a></li>
                        <li>Create OAuth 2.0 credentials</li>
                        <li>Add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>GOOGLE_CLIENT_ID</code> and <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>GOOGLE_CLIENT_SECRET</code> in System Settings</li>
                        <li>Set redirect URI to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{window.location.origin.replace(':5173', ':5000')}/api/google-sheets/callback</code></li>
                    </ol>
                </motion.div>
            )}
        </div>
    );
};

export default GoogleSheetsIntegration;
