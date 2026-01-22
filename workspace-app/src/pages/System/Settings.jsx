import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineUsers, HiOutlineShieldCheck, HiOutlineCog,
    HiOutlineRefresh, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineX, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck,
    HiOutlineUserAdd, HiOutlineClipboardList,
    HiOutlineChartBar, HiOutlineLockClosed, HiOutlineMail,
    HiOutlinePhotograph, HiOutlineGlobeAlt, HiOutlineKey
} from 'react-icons/hi';
import {
    SiFacebook, SiInstagram, SiX, SiTiktok, SiLinkedin, SiGoogle
} from 'react-icons/si';
import { adminAPI, systemAPI, systemSettingsAPI } from '../../services/api';

const TABS = [
    { key: 'overview', label: 'Overview', icon: HiOutlineChartBar, path: '/system' },
    { key: 'users', label: 'User Management', icon: HiOutlineUsers, path: '/system/users' },
    { key: 'roles', label: 'Roles', icon: HiOutlineShieldCheck, path: '/system/roles' },
    { key: 'activity', label: 'Activity Logs', icon: HiOutlineClipboardList, path: '/system/activity' },
    { key: 'settings', label: 'Settings', icon: HiOutlineCog, path: '/system/settings' },
    { key: 'security', label: 'Security', icon: HiOutlineLockClosed, path: '/system/security' },
];

const getTabFromPath = (pathname) => {
    const tab = TABS.find(t => t.path === pathname);
    return tab ? tab.key : 'overview';
};

const SystemSettings = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activities, setActivities] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        roleId: 3,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const tabFromUrl = getTabFromPath(location.pathname);
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [location.pathname]);

    const handleTabClick = (tab) => {
        setActiveTab(tab.key);
        navigate(tab.path);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'overview') {
                const [statsData, rolesData] = await Promise.all([
                    adminAPI.getStats(),
                    adminAPI.getRoles()
                ]);
                setStats(statsData);
                setRoles(rolesData);
            } else if (activeTab === 'users') {
                const [usersData, rolesData] = await Promise.all([
                    adminAPI.getUsers(),
                    adminAPI.getRoles()
                ]);
                setUsers(usersData);
                setRoles(rolesData);
            } else if (activeTab === 'roles') {
                const rolesData = await adminAPI.getRoles();
                setRoles(rolesData);
            } else if (activeTab === 'activity') {
                const activitiesData = await adminAPI.getActivities({ limit: 50 });
                setActivities(activitiesData);
            } else if (activeTab === 'settings' || activeTab === 'security') {
                const settingsData = await systemSettingsAPI.getAll().catch(() => []);
                // Convert array to object
                const settingsObj = {};
                if (Array.isArray(settingsData)) {
                    settingsData.forEach(s => { settingsObj[s.key] = s.value || ''; });
                }
                setSettings(settingsObj);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSetting = async (key, value) => {
        try {
            await systemSettingsAPI.update(key, value);
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            alert(error.message || 'Failed to update setting');
        }
    };

    const resetUserForm = () => {
        setUserForm({ name: '', email: '', password: '', roleId: 3, isActive: true });
        setEditUser(null);
    };

    const openEditUser = (user) => {
        setEditUser(user);
        setUserForm({
            name: user.name,
            email: user.email,
            password: '',
            roleId: user.roleId,
            isActive: user.isActive
        });
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        if (!userForm.name || !userForm.email) {
            alert('Name and email are required');
            return;
        }

        setSaving(true);
        try {
            if (editUser) {
                await adminAPI.updateUser(editUser.id, userForm);
            } else {
                if (!userForm.password) {
                    alert('Password is required for new user');
                    setSaving(false);
                    return;
                }
                await adminAPI.createUser(userForm);
            }
            setShowUserModal(false);
            resetUserForm();
            fetchData();
        } catch (error) {
            alert(error.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await adminAPI.deleteUser(id);
            fetchData();
        } catch (error) {
            alert(error.message || 'Failed to delete user');
        }
    };

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'superadmin': return '#ef4444';
            case 'admin': return '#f59e0b';
            case 'monitoring': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span className="gradient-text">{t('system.settings.title', 'System Administration')}</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                        {t('system.settings.subtitle', 'Manage users, roles, and system configuration')}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchData}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9ca3af', cursor: 'pointer' }}
                >
                    <HiOutlineRefresh style={{ width: '20px', height: '20px' }} />
                </motion.button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                {TABS.map(tab => (
                    <motion.button
                        key={tab.key}
                        type="button"
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(139,92,246,0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabClick(tab)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: activeTab === tab.key ? '2px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: activeTab === tab.key ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.key ? '#a78bfa' : '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: activeTab === tab.key ? '600' : '400'
                        }}
                    >
                        <tab.icon style={{ width: '16px', height: '16px' }} />
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
            ) : error ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h3 style={{ fontSize: '18px', color: '#ef4444', marginBottom: '8px' }}>Error</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
                    <button onClick={fetchData} className="btn-glow">Retry</button>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && <OverviewTab stats={stats} roles={roles} />}
                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            roles={roles}
                            onAdd={() => { resetUserForm(); setShowUserModal(true); }}
                            onEdit={openEditUser}
                            onDelete={handleDeleteUser}
                            getRoleColor={getRoleColor}
                        />
                    )}
                    {activeTab === 'roles' && <RolesTab roles={roles} getRoleColor={getRoleColor} />}
                    {activeTab === 'activity' && <ActivityTab activities={activities} />}
                    {activeTab === 'settings' && (
                        <SettingsTab settings={settings} onUpdate={handleUpdateSetting} />
                    )}
                    {activeTab === 'security' && (
                        <SecurityTab settings={settings} onUpdate={handleUpdateSetting} />
                    )}
                </>
            )}

            {/* User Modal */}
            <AnimatePresence>
                {showUserModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
                        onClick={() => { setShowUserModal(false); resetUserForm(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ padding: '24px', width: '100%', maxWidth: '500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editUser ? 'Edit User' : 'Add User'}
                                </h3>
                                <button onClick={() => { setShowUserModal(false); resetUserForm(); }} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Full name"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Email *</label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="email@example.com"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        Password {editUser ? '(leave empty to keep current)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        value={userForm.password}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Role</label>
                                    <select
                                        value={userForm.roleId}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={userForm.isActive}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>Active user</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button onClick={() => { setShowUserModal(false); resetUserForm(); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                <button onClick={handleSaveUser} disabled={saving} className="btn-glow" style={{ flex: 1, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ========================== TAB COMPONENTS ==========================

// Overview Tab
const OverviewTab = ({ stats, roles }) => {
    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, color: '#8b5cf6', icon: HiOutlineUsers },
        { label: 'Active Users', value: stats?.activeUsers || 0, color: '#10b981', icon: HiOutlineCheck },
        { label: "Today's Logins", value: stats?.todayLogins || 0, color: '#06b6d4', icon: HiOutlineClipboardList },
        { label: 'Total Roles', value: roles?.length || 0, color: '#f59e0b', icon: HiOutlineShieldCheck },
    ];

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '24px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{stat.label}</p>
                                <p style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: '8px 0 0' }}>{stat.value}</p>
                            </div>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Users by Role</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats?.usersByRole?.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        >
                            <span style={{ color: '#d1d5db', fontSize: '14px' }}>{item.Role?.displayName || 'Unknown'}</span>
                            <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{item.count}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

// Users Tab
const UsersTab = ({ users, roles, onAdd, onEdit, onDelete, getRoleColor }) => (
    <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAdd}
                className="btn-glow"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <HiOutlineUserAdd style={{ width: '18px', height: '18px' }} />
                Add User
            </motion.button>
        </div>

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>User</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Role</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Status</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Created</th>
                        <th style={{ padding: '16px', textAlign: 'right', color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                        {user.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{user.name}</p>
                                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', color: getRoleColor(user.Role?.name), backgroundColor: `${getRoleColor(user.Role?.name)}20` }}>
                                    {user.Role?.displayName || 'Unknown'}
                                </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: user.isActive ? '#34d399' : '#6b7280' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: user.isActive ? '#34d399' : '#6b7280' }} />
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => onEdit(user)} style={{ padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer' }}>
                                        <HiOutlinePencil style={{ width: '14px', height: '14px' }} />
                                    </button>
                                    <button onClick={() => onDelete(user.id)} style={{ padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}>
                                        <HiOutlineTrash style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No users found</div>
            )}
        </div>
    </>
);

// Roles Tab
const RolesTab = ({ roles, getRoleColor }) => {
    if (!roles || roles.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>No Roles Found</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Roles are not configured in the system.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {roles.map((role, index) => (
                <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card"
                    style={{ padding: '24px', borderTop: `4px solid ${getRoleColor(role.name)}` }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${getRoleColor(role.name)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineShieldCheck style={{ width: '22px', height: '22px', color: getRoleColor(role.name) }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>{role.displayName}</h3>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{role.name}</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{role.description || 'No description'}</p>
                </motion.div>
            ))}
        </div>
    );
};

// Activity Tab
const ActivityTab = ({ activities }) => {
    const getActionColor = (action) => {
        switch (action) {
            case 'login': return '#10b981';
            case 'logout': return '#6b7280';
            case 'create': return '#8b5cf6';
            case 'update': return '#f59e0b';
            case 'delete': return '#ef4444';
            default: return '#06b6d4';
        }
    };

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getActionColor(activity.action) }} />
                            <div>
                                <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>
                                    <strong>{activity.User?.name || 'Unknown'}</strong> {activity.action} - {activity.module}
                                </p>
                                {activity.details && (
                                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0 0' }}>{activity.details}</p>
                                )}
                            </div>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {new Date(activity.createdAt).toLocaleString()}
                        </span>
                    </motion.div>
                ))}
                {activities.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No activities found</div>
                )}
            </div>
        </div>
    );
};

// Settings Tab - NEW STRUCTURE
const SettingsTab = ({ settings, onUpdate }) => {
    const [values, setValues] = useState(settings);
    const [showSecrets, setShowSecrets] = useState({});
    const [saving, setSaving] = useState({});

    useEffect(() => {
        setValues(settings);
    }, [settings]);

    const handleChange = (key, value) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        await onUpdate(key, values[key]);
        setSaving(prev => ({ ...prev, [key]: false }));
    };

    const toggleSecret = (key) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SettingField = ({ settingKey, label, placeholder, isSecret = false, icon: Icon }) => (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                {Icon && <Icon style={{ width: '14px', height: '14px' }} />}
                {label}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type={isSecret && !showSecrets[settingKey] ? 'password' : 'text'}
                    value={values[settingKey] || ''}
                    onChange={(e) => handleChange(settingKey, e.target.value)}
                    placeholder={placeholder}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                />
                {isSecret && (
                    <button onClick={() => toggleSecret(settingKey)} style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer' }}>
                        {showSecrets[settingKey] ? <HiOutlineEyeOff style={{ width: '16px', height: '16px' }} /> : <HiOutlineEye style={{ width: '16px', height: '16px' }} />}
                    </button>
                )}
                <button
                    onClick={() => handleSave(settingKey)}
                    disabled={saving[settingKey]}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', fontSize: '13px', opacity: saving[settingKey] ? 0.7 : 1 }}
                >
                    {saving[settingKey] ? '...' : 'Save'}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* General Settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiOutlineCog style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                    General Settings
                </h3>
                <SettingField settingKey="APP_NAME" label="Application Name" placeholder="My Workspace" icon={HiOutlineGlobeAlt} />
                <SettingField settingKey="APP_LOGO_URL" label="Logo URL" placeholder="https://example.com/logo.png" icon={HiOutlinePhotograph} />
                <SettingField settingKey="DEFAULT_LANGUAGE" label="Default Language" placeholder="en" icon={HiOutlineGlobeAlt} />
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={values['MAINTENANCE_MODE'] === 'true'}
                            onChange={(e) => {
                                handleChange('MAINTENANCE_MODE', e.target.checked ? 'true' : 'false');
                                onUpdate('MAINTENANCE_MODE', e.target.checked ? 'true' : 'false');
                            }}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#d1d5db' }}>Maintenance Mode</span>
                    </label>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginLeft: '30px' }}>
                        When enabled, users will see a maintenance page
                    </p>
                </div>
            </motion.div>

            {/* Social Media OAuth Settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiOutlineKey style={{ width: '20px', height: '20px', color: '#ec4899' }} />
                    Social Media OAuth
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                    Configure OAuth credentials for users to connect their social media accounts
                </p>

                {/* Google (Login) */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiGoogle style={{ width: '20px', height: '20px', color: '#4285f4' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Google (Login)</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(234,179,8,0.2)', color: '#eab308' }}>Required for Google Login</span>
                    </div>
                    <SettingField settingKey="GOOGLE_CLIENT_ID" label="Client ID" placeholder="xxxxx.apps.googleusercontent.com" />
                    <SettingField settingKey="GOOGLE_CLIENT_SECRET" label="Client Secret" placeholder="••••••••" isSecret />
                </div>

                {/* Facebook */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiFacebook style={{ width: '20px', height: '20px', color: '#1877f2' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Facebook</span>
                    </div>
                    <SettingField settingKey="FACEBOOK_APP_ID" label="App ID" placeholder="1234567890" />
                    <SettingField settingKey="FACEBOOK_APP_SECRET" label="App Secret" placeholder="••••••••" isSecret />
                </div>

                {/* Instagram */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiInstagram style={{ width: '20px', height: '20px', color: '#e4405f' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Instagram</span>
                    </div>
                    <SettingField settingKey="INSTAGRAM_CLIENT_ID" label="Client ID" placeholder="1234567890" />
                    <SettingField settingKey="INSTAGRAM_CLIENT_SECRET" label="Client Secret" placeholder="••••••••" isSecret />
                </div>

                {/* Twitter/X */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiX style={{ width: '20px', height: '20px', color: '#000000' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>X (Twitter)</span>
                    </div>
                    <SettingField settingKey="TWITTER_API_KEY" label="API Key" placeholder="Your API Key" />
                    <SettingField settingKey="TWITTER_API_SECRET" label="API Secret" placeholder="••••••••" isSecret />
                </div>

                {/* TikTok */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiTiktok style={{ width: '20px', height: '20px', color: '#ff0050' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>TikTok</span>
                    </div>
                    <SettingField settingKey="TIKTOK_CLIENT_KEY" label="Client Key" placeholder="Your Client Key" />
                    <SettingField settingKey="TIKTOK_CLIENT_SECRET" label="Client Secret" placeholder="••••••••" isSecret />
                </div>

                {/* LinkedIn */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <SiLinkedin style={{ width: '20px', height: '20px', color: '#0a66c2' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>LinkedIn</span>
                    </div>
                    <SettingField settingKey="LINKEDIN_CLIENT_ID" label="Client ID" placeholder="Your Client ID" />
                    <SettingField settingKey="LINKEDIN_CLIENT_SECRET" label="Client Secret" placeholder="••••••••" isSecret />
                </div>
            </motion.div>

            {/* Email/SMTP Settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiOutlineMail style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                    Email / SMTP Settings
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                    Configure email settings for notifications and password resets
                </p>
                <SettingField settingKey="SMTP_HOST" label="SMTP Host" placeholder="smtp.gmail.com" />
                <SettingField settingKey="SMTP_PORT" label="SMTP Port" placeholder="587" />
                <SettingField settingKey="SMTP_USER" label="SMTP Username" placeholder="your-email@gmail.com" />
                <SettingField settingKey="SMTP_PASSWORD" label="SMTP Password" placeholder="••••••••" isSecret />
                <SettingField settingKey="SMTP_FROM_EMAIL" label="From Email" placeholder="noreply@yourapp.com" />
                <SettingField settingKey="SMTP_FROM_NAME" label="From Name" placeholder="My Workspace" />
            </motion.div>
        </div>
    );
};

// Security Tab - SIMPLIFIED
const SecurityTab = ({ settings, onUpdate }) => {
    const [values, setValues] = useState(settings);
    const [saving, setSaving] = useState({});

    useEffect(() => {
        setValues(settings);
    }, [settings]);

    const handleToggle = async (key, currentValue) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setSaving(prev => ({ ...prev, [key]: true }));
        await onUpdate(key, newValue);
        setValues(prev => ({ ...prev, [key]: newValue }));
        setSaving(prev => ({ ...prev, [key]: false }));
    };

    const handleChange = (key, value) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        await onUpdate(key, values[key]);
        setSaving(prev => ({ ...prev, [key]: false }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiOutlineLockClosed style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                    Security Policies
                </h3>

                {/* Allow 2FA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: 0 }}>Allow Two-Factor Authentication</h4>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
                            Users can optionally enable 2FA on their accounts
                        </p>
                    </div>
                    <button
                        onClick={() => handleToggle('ALLOW_2FA', values['ALLOW_2FA'])}
                        disabled={saving['ALLOW_2FA']}
                        style={{
                            width: '50px',
                            height: '28px',
                            borderRadius: '14px',
                            border: 'none',
                            backgroundColor: values['ALLOW_2FA'] === 'true' ? '#10b981' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            opacity: saving['ALLOW_2FA'] ? 0.7 : 1
                        }}
                    >
                        <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: '3px',
                            left: values['ALLOW_2FA'] === 'true' ? '25px' : '3px',
                            transition: 'all 0.2s'
                        }} />
                    </button>
                </div>

                {/* Minimum Password Length */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: '0 0 4px' }}>Minimum Password Length</h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px' }}>
                        Minimum characters required for user passwords
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number"
                            min="6"
                            max="32"
                            value={values['MIN_PASSWORD_LENGTH'] || '8'}
                            onChange={(e) => handleChange('MIN_PASSWORD_LENGTH', e.target.value)}
                            style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                        <button
                            onClick={() => handleSave('MIN_PASSWORD_LENGTH')}
                            disabled={saving['MIN_PASSWORD_LENGTH']}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', fontSize: '13px' }}
                        >
                            {saving['MIN_PASSWORD_LENGTH'] ? '...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Session Timeout */}
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: '0 0 4px' }}>Session Timeout</h4>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px' }}>
                        Auto-logout users after inactivity (in minutes). Set to 0 for no timeout.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number"
                            min="0"
                            max="10080"
                            value={values['SESSION_TIMEOUT_MINUTES'] || '60'}
                            onChange={(e) => handleChange('SESSION_TIMEOUT_MINUTES', e.target.value)}
                            style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', fontSize: '13px' }}>minutes</span>
                        <button
                            onClick={() => handleSave('SESSION_TIMEOUT_MINUTES')}
                            disabled={saving['SESSION_TIMEOUT_MINUTES']}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', fontSize: '13px' }}
                        >
                            {saving['SESSION_TIMEOUT_MINUTES'] ? '...' : 'Save'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Info Box */}
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <p style={{ fontSize: '13px', color: '#a78bfa', margin: 0 }}>
                    💡 <strong>Note:</strong> Users can enable 2FA in their own account settings at Settings → Account.
                    You only need to allow/disallow the feature system-wide here.
                </p>
            </div>
        </div>
    );
};

export default SystemSettings;
