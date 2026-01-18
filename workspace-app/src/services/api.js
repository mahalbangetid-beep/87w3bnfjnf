// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('workspace_token');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 - token expired
            if (response.status === 401) {
                localStorage.removeItem('workspace_token');
                localStorage.removeItem('workspace_user');
                window.location.href = '/login';
            }
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
    login: (data) => apiRequest('/auth/login', { method: 'POST', body: data }),
    loginWithGoogle: (token) => apiRequest('/auth/google', { method: 'POST', body: { token } }),
    getMe: () => apiRequest('/auth/me'),
    updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: data }),
    changePassword: (data) => apiRequest('/auth/password', { method: 'PUT', body: data }),
    forgotPassword: (phone) => apiRequest('/auth/forgot-password', { method: 'POST', body: { phone } }),
    verifyOTP: (phone, otp) => apiRequest('/auth/verify-otp', { method: 'POST', body: { phone, otp } }),
    resetPassword: (resetToken, newPassword) => apiRequest('/auth/reset-password', { method: 'POST', body: { resetToken, newPassword } }),
};

// Projects API
export const projectsAPI = {
    getAll: () => apiRequest('/projects'),
    getOne: (id) => apiRequest(`/projects/${id}`),
    create: (data) => apiRequest('/projects', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
};

// Notes API
export const notesAPI = {
    getAll: (archived = false) => apiRequest(`/notes?archived=${archived}`),
    getOne: (id) => apiRequest(`/notes/${id}`),
    create: (data) => apiRequest('/notes', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/notes/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/notes/${id}`, { method: 'DELETE' }),
    togglePin: (id) => apiRequest(`/notes/${id}/pin`, { method: 'PUT' }),
    toggleArchive: (id) => apiRequest(`/notes/${id}/archive`, { method: 'PUT' }),
};

// Tasks API
export const tasksAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/tasks${query ? `?${query}` : ''}`);
    },
    getOne: (id) => apiRequest(`/tasks/${id}`),
    create: (data) => apiRequest('/tasks', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
    toggleComplete: (id) => apiRequest(`/tasks/${id}/complete`, { method: 'PUT' }),
};

// Budgets API
export const budgetsAPI = {
    getAll: () => apiRequest('/budgets'),
    create: (data) => apiRequest('/budgets', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/budgets/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiRequest(`/budgets/${id}`, { method: 'DELETE' }),
    // Expenses
    getExpenses: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/budgets/expenses${query ? `?${query}` : ''}`);
    },
    createExpense: (data) => apiRequest('/budgets/expenses', { method: 'POST', body: data }),
    updateExpense: (id, data) => apiRequest(`/budgets/expenses/${id}`, { method: 'PUT', body: data }),
    deleteExpense: (id) => apiRequest(`/budgets/expenses/${id}`, { method: 'DELETE' }),
};

// Admin API
export const adminAPI = {
    getUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },
    getUser: (id) => apiRequest(`/admin/users/${id}`),
    createUser: (data) => apiRequest('/admin/users', { method: 'POST', body: data }),
    updateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: data }),
    deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
    getActivities: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/activities${query ? `?${query}` : ''}`);
    },
    getRoles: () => apiRequest('/admin/roles'),
    getStats: () => apiRequest('/admin/stats'),
};

// Space API - Milestones & Goals
export const spaceAPI = {
    // Milestones
    getMilestones: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/space/milestones${query ? `?${query}` : ''}`);
    },
    createMilestone: (data) => apiRequest('/space/milestones', { method: 'POST', body: data }),
    updateMilestone: (id, data) => apiRequest(`/space/milestones/${id}`, { method: 'PUT', body: data }),
    deleteMilestone: (id) => apiRequest(`/space/milestones/${id}`, { method: 'DELETE' }),
    // Goals
    getGoals: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/space/goals${query ? `?${query}` : ''}`);
    },
    createGoal: (data) => apiRequest('/space/goals', { method: 'POST', body: data }),
    updateGoal: (id, data) => apiRequest(`/space/goals/${id}`, { method: 'PUT', body: data }),
    updateGoalProgress: (id, current) => apiRequest(`/space/goals/${id}/progress`, { method: 'PUT', body: { current } }),
    deleteGoal: (id) => apiRequest(`/space/goals/${id}`, { method: 'DELETE' }),
    // Stats
    getStats: () => apiRequest('/space/stats'),
};

// Idea Projects API (Space module)
export const ideaProjectsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/idea-projects${query ? `?${query}` : ''}`);
    },
    getOne: (id) => apiRequest(`/idea-projects/${id}`),
    create: (data) => apiRequest('/idea-projects', { method: 'POST', body: data }),
    update: (id, data) => apiRequest(`/idea-projects/${id}`, { method: 'PUT', body: data }),
    updateProgress: (id, progress) => apiRequest(`/idea-projects/${id}/progress`, { method: 'PUT', body: { progress } }),
    updateStatus: (id, status) => apiRequest(`/idea-projects/${id}/status`, { method: 'PUT', body: { status } }),
    delete: (id) => apiRequest(`/idea-projects/${id}`, { method: 'DELETE' }),
};

// Legacy alias for backward compatibility
export const projectPlansAPI = ideaProjectsAPI;

// ============ SOCIAL STACK APIs ============

// Social Media API
export const socialAPI = {
    // Accounts
    getAccounts: () => apiRequest('/social/accounts'),
    getAccount: (id) => apiRequest(`/social/accounts/${id}`),
    disconnectAccount: (id) => apiRequest(`/social/accounts/${id}`, { method: 'DELETE' }),

    // Posts
    getPosts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/social/posts${query ? `?${query}` : ''}`);
    },
    getPost: (id) => apiRequest(`/social/posts/${id}`),
    createPost: (data) => apiRequest('/social/posts', { method: 'POST', body: data }),
    updatePost: (id, data) => apiRequest(`/social/posts/${id}`, { method: 'PUT', body: data }),
    deletePost: (id) => apiRequest(`/social/posts/${id}`, { method: 'DELETE' }),
    schedulePost: (id, scheduledAt) => apiRequest(`/social/posts/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
    publishPost: (id) => apiRequest(`/social/posts/${id}/publish`, { method: 'POST' }),
    getCalendarPosts: (year, month) => apiRequest(`/social/posts/calendar/${year}/${month}`),

    // Hashtags
    getHashtags: () => apiRequest('/social/hashtags'),
    createHashtag: (data) => apiRequest('/social/hashtags', { method: 'POST', body: data }),
    updateHashtag: (id, data) => apiRequest(`/social/hashtags/${id}`, { method: 'PUT', body: data }),
    deleteHashtag: (id) => apiRequest(`/social/hashtags/${id}`, { method: 'DELETE' }),
    useHashtag: (id) => apiRequest(`/social/hashtags/${id}/use`, { method: 'POST' }),

    // Analytics
    getDashboard: () => apiRequest('/social/analytics/dashboard'),
};

// Blog API
export const blogAPI = {
    // Connections
    getConnections: () => apiRequest('/blog/connections'),
    getConnection: (id) => apiRequest(`/blog/connections/${id}`),
    createConnection: (data) => apiRequest('/blog/connections', { method: 'POST', body: data }),
    updateConnection: (id, data) => apiRequest(`/blog/connections/${id}`, { method: 'PUT', body: data }),
    deleteConnection: (id) => apiRequest(`/blog/connections/${id}`, { method: 'DELETE' }),
    verifyConnection: (id) => apiRequest(`/blog/connections/${id}/verify`, { method: 'POST' }),

    // Posts
    getPosts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/blog/posts${query ? `?${query}` : ''}`);
    },
    getPost: (id) => apiRequest(`/blog/posts/${id}`),
    createPost: (data) => apiRequest('/blog/posts', { method: 'POST', body: data }),
    updatePost: (id, data) => apiRequest(`/blog/posts/${id}`, { method: 'PUT', body: data }),
    deletePost: (id) => apiRequest(`/blog/posts/${id}`, { method: 'DELETE' }),
    schedulePost: (id, scheduledAt) => apiRequest(`/blog/posts/${id}/schedule`, { method: 'POST', body: { scheduledAt } }),
    publishPost: (id) => apiRequest(`/blog/posts/${id}/publish`, { method: 'POST' }),
    getCalendarPosts: (year, month) => apiRequest(`/blog/posts/calendar/${year}/${month}`),

    // Analytics
    getDashboard: () => apiRequest('/blog/analytics/dashboard'),
};

// AI API
export const aiAPI = {
    // Templates
    getTemplates: (category) => apiRequest(`/ai/templates${category ? `?category=${category}` : ''}`),
    getTemplate: (id) => apiRequest(`/ai/templates/${id}`),
    createTemplate: (data) => apiRequest('/ai/templates', { method: 'POST', body: data }),
    updateTemplate: (id, data) => apiRequest(`/ai/templates/${id}`, { method: 'PUT', body: data }),
    deleteTemplate: (id) => apiRequest(`/ai/templates/${id}`, { method: 'DELETE' }),

    // Generation
    generate: (data) => apiRequest('/ai/generate', { method: 'POST', body: data }),
    generateCaption: (data) => apiRequest('/ai/generate/caption', { method: 'POST', body: data }),
    generateHashtags: (data) => apiRequest('/ai/generate/hashtags', { method: 'POST', body: data }),
    generateBlog: (data) => apiRequest('/ai/generate/blog', { method: 'POST', body: data }),
    improveContent: (data) => apiRequest('/ai/generate/improve', { method: 'POST', body: data }),
    generateSEO: (data) => apiRequest('/ai/generate/seo', { method: 'POST', body: data }),

    // Chat (AI Assistant)
    chat: (messages, provider = 'gemini') => apiRequest('/ai/chat', {
        method: 'POST',
        body: { messages, provider }
    }),

    // Analysis
    analyzeFinances: (provider = 'gemini') => apiRequest('/ai/analyze/finances', {
        method: 'POST',
        body: { provider }
    }),
    suggestPostingTime: (platform, contentType, provider = 'gemini') => apiRequest('/ai/analyze/posting-time', {
        method: 'POST',
        body: { platform, contentType, provider }
    }),
    categorize: (description, amount, provider = 'gemini') => apiRequest('/ai/categorize', {
        method: 'POST',
        body: { description, amount, provider }
    }),

    // Providers
    getProviders: () => apiRequest('/ai/providers'),
};

// System Settings API
export const systemSettingsAPI = {
    init: () => apiRequest('/system-settings/init', { method: 'POST' }),
    getAll: (category) => apiRequest(`/system-settings${category ? `?category=${category}` : ''}`),
    getGrouped: () => apiRequest('/system-settings/grouped'),
    get: (key) => apiRequest(`/system-settings/${key}`),
    update: (key, value) => apiRequest(`/system-settings/${key}`, { method: 'PUT', body: { value } }),
    bulkUpdate: (settings) => apiRequest('/system-settings', { method: 'PUT', body: { settings } }),
    delete: (key) => apiRequest(`/system-settings/${key}`, { method: 'DELETE' }),
    test: (key) => apiRequest(`/system-settings/test/${key}`, { method: 'POST' }),
};

// Finance API
export const financeAPI = {
    // Accounts
    getAccounts: () => apiRequest('/finance/accounts'),
    getTotalBalance: () => apiRequest('/finance/accounts/total'),
    createAccount: (data) => apiRequest('/finance/accounts', { method: 'POST', body: data }),
    updateAccount: (id, data) => apiRequest(`/finance/accounts/${id}`, { method: 'PUT', body: data }),
    deleteAccount: (id) => apiRequest(`/finance/accounts/${id}`, { method: 'DELETE' }),

    // Categories
    getCategories: (type) => apiRequest(`/finance/categories${type ? `?type=${type}` : ''}`),
    createCategory: (data) => apiRequest('/finance/categories', { method: 'POST', body: data }),
    updateCategory: (id, data) => apiRequest(`/finance/categories/${id}`, { method: 'PUT', body: data }),
    deleteCategory: (id) => apiRequest(`/finance/categories/${id}`, { method: 'DELETE' }),

    // Transactions
    getTransactions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/finance/transactions${query ? `?${query}` : ''}`);
    },
    createTransaction: (data) => apiRequest('/finance/transactions', { method: 'POST', body: data }),
    updateTransaction: (id, data) => apiRequest(`/finance/transactions/${id}`, { method: 'PUT', body: data }),
    deleteTransaction: (id) => apiRequest(`/finance/transactions/${id}`, { method: 'DELETE' }),

    // Bills
    getBills: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/finance/bills${query ? `?${query}` : ''}`);
    },
    getUpcomingBills: () => apiRequest('/finance/bills/upcoming'),
    getBillCategories: () => apiRequest('/finance/bills/categories'),
    createBill: (data) => apiRequest('/finance/bills', { method: 'POST', body: data }),
    updateBill: (id, data) => apiRequest(`/finance/bills/${id}`, { method: 'PUT', body: data }),
    payBill: (id, data) => apiRequest(`/finance/bills/${id}/pay`, { method: 'POST', body: data }),
    deleteBill: (id) => apiRequest(`/finance/bills/${id}`, { method: 'DELETE' }),

    // Notes
    getNotes: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/finance/notes${query ? `?${query}` : ''}`);
    },
    createNote: (data) => apiRequest('/finance/notes', { method: 'POST', body: data }),
    updateNote: (id, data) => apiRequest(`/finance/notes/${id}`, { method: 'PUT', body: data }),
    deleteNote: (id) => apiRequest(`/finance/notes/${id}`, { method: 'DELETE' }),

    // Dashboard & Reports
    getDashboard: () => apiRequest('/finance/dashboard'),
    getMonthlyReport: (year, month) => apiRequest(`/finance/reports/monthly?year=${year}&month=${month}`),
    getCashflowReport: (months = 6) => apiRequest(`/finance/reports/cashflow?months=${months}`),

    // Integration
    addWorkIncome: (data) => apiRequest('/finance/integration/work-income', { method: 'POST', body: data }),
};

// Assets API
export const assetsAPI = {
    // Dashboard
    getDashboard: () => apiRequest('/assets/dashboard'),

    // Accounts
    getAccounts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/assets/accounts${query ? `?${query}` : ''}`);
    },
    getAccountCategories: () => apiRequest('/assets/accounts/categories'),
    createAccount: (data) => apiRequest('/assets/accounts', { method: 'POST', body: data }),
    updateAccount: (id, data) => apiRequest(`/assets/accounts/${id}`, { method: 'PUT', body: data }),
    deleteAccount: (id) => apiRequest(`/assets/accounts/${id}`, { method: 'DELETE' }),
    toggleAccountFavorite: (id) => apiRequest(`/assets/accounts/${id}/favorite`, { method: 'PATCH' }),

    // Items
    getItems: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/assets/items${query ? `?${query}` : ''}`);
    },
    getItemCategories: () => apiRequest('/assets/items/categories'),
    createItem: (data) => apiRequest('/assets/items', { method: 'POST', body: data }),
    uploadItem: async (formData) => {
        const token = localStorage.getItem('workspace_token');
        const response = await fetch(`${API_URL}/assets/items/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    updateItem: (id, data) => apiRequest(`/assets/items/${id}`, { method: 'PUT', body: data }),
    deleteItem: (id) => apiRequest(`/assets/items/${id}`, { method: 'DELETE' }),

    // Notes
    getNotes: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/assets/notes${query ? `?${query}` : ''}`);
    },
    createNote: (data) => apiRequest('/assets/notes', { method: 'POST', body: data }),
    updateNote: (id, data) => apiRequest(`/assets/notes/${id}`, { method: 'PUT', body: data }),
    deleteNote: (id) => apiRequest(`/assets/notes/${id}`, { method: 'DELETE' }),

    // Bookmarks
    getBookmarks: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/assets/bookmarks${query ? `?${query}` : ''}`);
    },
    getBookmarkCategories: () => apiRequest('/assets/bookmarks/categories'),
    createBookmark: (data) => apiRequest('/assets/bookmarks', { method: 'POST', body: data }),
    updateBookmark: (id, data) => apiRequest(`/assets/bookmarks/${id}`, { method: 'PUT', body: data }),
    deleteBookmark: (id) => apiRequest(`/assets/bookmarks/${id}`, { method: 'DELETE' }),
    trackBookmarkClick: (id) => apiRequest(`/assets/bookmarks/${id}/click`, { method: 'POST' }),
    toggleBookmarkFavorite: (id) => apiRequest(`/assets/bookmarks/${id}/favorite`, { method: 'PATCH' }),
};

// System Settings API
export const systemAPI = {
    getSettings: (category) => apiRequest(`/system-settings${category ? `?category=${category}` : ''}`),
    updateSetting: (key, value) => apiRequest(`/system-settings/${key}`, { method: 'PUT', body: { value } }),
    updateSettings: (settings) => apiRequest('/system-settings', { method: 'PUT', body: settings }),
    initDefaults: () => apiRequest('/system-settings/init', { method: 'POST' }),
};

// Notifications API
export const notificationsAPI = {
    // Notifications
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/notifications${query ? `?${query}` : ''}`);
    },
    getUnreadCount: () => apiRequest('/notifications/unread-count'),
    markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
    delete: (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),

    // Push Subscriptions
    getVapidKey: () => apiRequest('/notifications/vapid-key'),
    subscribe: (subscription, deviceName) => apiRequest('/notifications/subscribe', {
        method: 'POST',
        body: { subscription, deviceName }
    }),
    unsubscribe: (endpoint) => apiRequest('/notifications/unsubscribe', {
        method: 'POST',
        body: { endpoint }
    }),
    getSubscriptions: () => apiRequest('/notifications/subscriptions'),
    deleteSubscription: (id) => apiRequest(`/notifications/subscriptions/${id}`, { method: 'DELETE' }),

    // Preferences
    getPreferences: () => apiRequest('/notifications/preferences'),
    updatePreferences: (prefs) => apiRequest('/notifications/preferences', {
        method: 'PUT',
        body: prefs
    }),

    // Testing
    sendTest: () => apiRequest('/notifications/test', { method: 'POST' }),
};

// Two-Factor Authentication API
export const twoFactorAPI = {
    // Get 2FA status
    getStatus: () => apiRequest('/2fa/status'),

    // Setup 2FA - get secret and QR code
    setup: () => apiRequest('/2fa/setup', { method: 'POST' }),

    // Verify and enable 2FA
    verifySetup: (code) => apiRequest('/2fa/verify-setup', { method: 'POST', body: { code } }),

    // Verify 2FA code during login
    verify: (userId, code, trustDevice, deviceInfo) => apiRequest('/2fa/verify', {
        method: 'POST',
        body: { userId, code, trustDevice, deviceInfo }
    }),

    // Check if device is trusted
    checkTrust: (userId, trustToken) => apiRequest('/2fa/check-trust', {
        method: 'POST',
        body: { userId, trustToken }
    }),

    // Get trusted devices
    getDevices: () => apiRequest('/2fa/devices'),

    // Revoke trusted device
    revokeDevice: (id) => apiRequest(`/2fa/devices/${id}`, { method: 'DELETE' }),

    // Regenerate backup codes
    regenerateBackupCodes: (password) => apiRequest('/2fa/backup-codes/regenerate', {
        method: 'POST',
        body: { password }
    }),

    // Disable 2FA
    disable: (password, code) => apiRequest('/2fa/disable', {
        method: 'POST',
        body: { password, code }
    }),

    // Send email OTP
    sendEmailOTP: (userId) => apiRequest('/2fa/email-otp', {
        method: 'POST',
        body: { userId }
    })
};

// Collaboration API
export const collaborationAPI = {
    // Get project collaborators
    getCollaborators: (projectId) => apiRequest(`/collaboration/project/${projectId}`),

    // Invite by email
    invite: (projectId, email) => apiRequest('/collaboration/invite', {
        method: 'POST',
        body: { projectId, email }
    }),

    // Generate invite link
    generateLink: (projectId) => apiRequest('/collaboration/invite-link', {
        method: 'POST',
        body: { projectId }
    }),

    // Accept invitation
    acceptInvite: (inviteToken) => apiRequest(`/collaboration/accept/${inviteToken}`, {
        method: 'POST'
    }),

    // Decline invitation
    declineInvite: (inviteToken) => apiRequest(`/collaboration/decline/${inviteToken}`, {
        method: 'POST'
    }),

    // Remove collaborator
    removeCollaborator: (projectId, userId) => apiRequest(`/collaboration/project/${projectId}/user/${userId}`, {
        method: 'DELETE'
    }),

    // Get my pending invitations
    getInvitations: () => apiRequest('/collaboration/invitations'),

    // Get shared projects
    getSharedProjects: () => apiRequest('/collaboration/shared'),

    // Get activity feed
    getActivity: (projectId, limit = 50) => apiRequest(`/collaboration/project/${projectId}/activity?limit=${limit}`),

    // Update access time
    updateAccess: (projectId) => apiRequest(`/collaboration/project/${projectId}/access`, {
        method: 'POST'
    })
};

// Google Sheets API
export const googleSheetsAPI = {
    // Get OAuth URL
    getAuthUrl: () => apiRequest('/google-sheets/auth-url'),

    // Get connection status
    getStatus: () => apiRequest('/google-sheets/status'),

    // Disconnect
    disconnect: () => apiRequest('/google-sheets/disconnect', { method: 'POST' }),

    // Export transactions
    exportTransactions: () => apiRequest('/google-sheets/export/transactions', { method: 'POST' }),

    // Export projects
    exportProjects: () => apiRequest('/google-sheets/export/projects', { method: 'POST' }),

    // Export social posts
    exportSocial: () => apiRequest('/google-sheets/export/social', { method: 'POST' }),

    // Import transactions
    importTransactions: (spreadsheetId, sheetName) => apiRequest('/google-sheets/import/transactions', {
        method: 'POST',
        body: { spreadsheetId, sheetName }
    }),

    // List spreadsheets
    getSpreadsheets: () => apiRequest('/google-sheets/spreadsheets')
};

// Feature Suggestions API
export const suggestionsAPI = {
    // Submit new suggestion
    create: (data) => apiRequest('/suggestions', { method: 'POST', body: data }),

    // Get suggestions (user's own or all for admin)
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/suggestions${params ? `?${params}` : ''}`);
    },

    // Get single suggestion
    getById: (id) => apiRequest(`/suggestions/${id}`),

    // Update status (admin)
    updateStatus: (id, status, adminNotes) => apiRequest(`/suggestions/${id}/status`, {
        method: 'PUT',
        body: { status, adminNotes }
    }),

    // Vote for suggestion
    vote: (id) => apiRequest(`/suggestions/${id}/vote`, { method: 'POST' }),

    // Delete suggestion
    delete: (id) => apiRequest(`/suggestions/${id}`, { method: 'DELETE' })
};

// Pages API (Static Pages - About, Privacy, Terms, Security)
export const pagesAPI = {
    // Public - Get published page
    getPublic: (slug) => apiRequest(`/pages/${slug}`),

    // Admin - Get all pages
    getAll: () => apiRequest('/pages/admin/all'),

    // Admin - Get page for editing
    getAdmin: (slug) => apiRequest(`/pages/admin/${slug}`),

    // Admin - Save/Update page
    save: (slug, data) => apiRequest(`/pages/admin/${slug}`, { method: 'PUT', body: data }),

    // Admin - Reset page to default
    reset: (slug) => apiRequest(`/pages/admin/${slug}/reset`, { method: 'POST' })
};

export default apiRequest;






