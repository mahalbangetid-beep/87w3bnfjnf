const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { authenticateToken } = require('../middleware/auth');
const { SystemSetting, FinanceTransaction, FinanceCategory, Project, Task, SocialPost, User } = require('../models');

// OAuth2 Client
let oauth2Client = null;

const getOAuth2Client = async () => {
    if (oauth2Client) return oauth2Client;

    const clientId = await SystemSetting.findOne({ where: { key: 'GOOGLE_CLIENT_ID' } });
    const clientSecret = await SystemSetting.findOne({ where: { key: 'GOOGLE_CLIENT_SECRET' } });
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google-sheets/callback';

    if (!clientId?.value || !clientSecret?.value) {
        throw new Error('Google OAuth credentials not configured');
    }

    oauth2Client = new google.auth.OAuth2(
        clientId.value,
        clientSecret.value,
        redirectUri
    );

    return oauth2Client;
};

// Store for user tokens (in production, store in database)
const userTokens = new Map();

// ==================== OAUTH ROUTES ====================

// Get OAuth URL for user to authorize
router.get('/auth-url', authenticateToken, async (req, res) => {
    try {
        const client = await getOAuth2Client();

        const scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/userinfo.email'
        ];

        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: req.user.id.toString(), // Pass user ID in state
            prompt: 'consent'
        });

        res.json({ authUrl });
    } catch (error) {
        console.error('Auth URL error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate auth URL' });
    }
});

// OAuth callback
router.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        const userId = parseInt(state);

        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/system/integrations?error=no_code`);
        }

        const client = await getOAuth2Client();
        const { tokens } = await client.getToken(code);

        // Store tokens for user
        userTokens.set(userId, tokens);

        // Also get user email
        client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const userInfo = await oauth2.userinfo.get();

        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/system/integrations?success=google_connected&email=${encodeURIComponent(userInfo.data.email)}`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/system/integrations?error=auth_failed`);
    }
});

// Check connection status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const tokens = userTokens.get(req.user.id);

        if (!tokens) {
            return res.json({ connected: false });
        }

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        // Verify token is still valid
        try {
            const oauth2 = google.oauth2({ version: 'v2', auth: client });
            const userInfo = await oauth2.userinfo.get();

            res.json({
                connected: true,
                email: userInfo.data.email,
                picture: userInfo.data.picture
            });
        } catch {
            userTokens.delete(req.user.id);
            res.json({ connected: false });
        }
    } catch (error) {
        res.json({ connected: false });
    }
});

// Disconnect Google account
router.post('/disconnect', authenticateToken, async (req, res) => {
    try {
        userTokens.delete(req.user.id);
        res.json({ success: true, message: 'Google account disconnected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect' });
    }
});

// ==================== EXPORT ROUTES ====================

// Export finance transactions
router.post('/export/transactions', authenticateToken, async (req, res) => {
    try {
        const tokens = userTokens.get(req.user.id);
        if (!tokens) return res.status(401).json({ error: 'Google not connected' });

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        const sheets = google.sheets({ version: 'v4', auth: client });
        const drive = google.drive({ version: 'v3', auth: client });

        // Get transactions
        const transactions = await FinanceTransaction.findAll({
            where: { userId: req.user.id },
            include: [{ model: FinanceCategory, as: 'Category' }],
            order: [['date', 'DESC']]
        });

        // Create spreadsheet
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title: `Workspace Transactions - ${new Date().toLocaleDateString()}` },
                sheets: [{ properties: { title: 'Transactions' } }]
            }
        });

        // Prepare data
        const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
        const rows = transactions.map(t => [
            t.id,
            t.date,
            t.type,
            t.Category?.name || '',
            t.description || '',
            t.amount,
            t.notes || ''
        ]);

        // Update spreadsheet with data
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheet.data.spreadsheetId,
            range: 'Transactions!A1',
            valueInputOption: 'RAW',
            requestBody: { values: [headers, ...rows] }
        });

        // Format header row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet.data.spreadsheetId,
            requestBody: {
                requests: [{
                    repeatCell: {
                        range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.2, green: 0.2, blue: 0.3 },
                                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat)'
                    }
                }]
            }
        });

        res.json({
            success: true,
            spreadsheetId: spreadsheet.data.spreadsheetId,
            spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
            rowCount: transactions.length
        });
    } catch (error) {
        console.error('Export transactions error:', error);
        res.status(500).json({ error: error.message || 'Failed to export transactions' });
    }
});

// Export projects and tasks
router.post('/export/projects', authenticateToken, async (req, res) => {
    try {
        const tokens = userTokens.get(req.user.id);
        if (!tokens) return res.status(401).json({ error: 'Google not connected' });

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        const sheets = google.sheets({ version: 'v4', auth: client });

        // Get projects and tasks
        const projects = await Project.findAll({
            where: { userId: req.user.id },
            include: [{ model: Task }]
        });

        // Create spreadsheet with multiple sheets
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title: `Workspace Projects - ${new Date().toLocaleDateString()}` },
                sheets: [
                    { properties: { title: 'Projects', sheetId: 0 } },
                    { properties: { title: 'Tasks', sheetId: 1 } }
                ]
            }
        });

        // Projects data
        const projectHeaders = ['ID', 'Name', 'Description', 'Client', 'Status', 'Progress', 'Start Date', 'End Date', 'Value'];
        const projectRows = projects.map(p => [
            p.id, p.name, p.description || '', p.client || '', p.status, p.progress || 0, p.startDate || '', p.endDate || '', p.value || 0
        ]);

        // Tasks data
        const taskHeaders = ['ID', 'Project', 'Title', 'Description', 'Status', 'Priority', 'Due Date'];
        const taskRows = [];
        projects.forEach(p => {
            (p.Tasks || []).forEach(t => {
                taskRows.push([t.id, p.name, t.title, t.description || '', t.status, t.priority || 'medium', t.dueDate || '']);
            });
        });

        // Update sheets
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: spreadsheet.data.spreadsheetId,
            requestBody: {
                valueInputOption: 'RAW',
                data: [
                    { range: 'Projects!A1', values: [projectHeaders, ...projectRows] },
                    { range: 'Tasks!A1', values: [taskHeaders, ...taskRows] }
                ]
            }
        });

        res.json({
            success: true,
            spreadsheetId: spreadsheet.data.spreadsheetId,
            spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
            projectCount: projects.length,
            taskCount: taskRows.length
        });
    } catch (error) {
        console.error('Export projects error:', error);
        res.status(500).json({ error: error.message || 'Failed to export projects' });
    }
});

// Export social posts
router.post('/export/social', authenticateToken, async (req, res) => {
    try {
        const tokens = userTokens.get(req.user.id);
        if (!tokens) return res.status(401).json({ error: 'Google not connected' });

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        const sheets = google.sheets({ version: 'v4', auth: client });

        // Get social posts
        const posts = await SocialPost.findAll({
            where: { userId: req.user.id },
            order: [['scheduledAt', 'DESC']]
        });

        // Create spreadsheet
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title: `Workspace Social Posts - ${new Date().toLocaleDateString()}` },
                sheets: [{ properties: { title: 'Posts' } }]
            }
        });

        // Prepare data
        const headers = ['ID', 'Platform', 'Content', 'Hashtags', 'Scheduled At', 'Status', 'Published At'];
        const rows = posts.map(p => [
            p.id, p.platform, p.content, p.hashtags || '', p.scheduledAt || '', p.status, p.publishedAt || ''
        ]);

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheet.data.spreadsheetId,
            range: 'Posts!A1',
            valueInputOption: 'RAW',
            requestBody: { values: [headers, ...rows] }
        });

        res.json({
            success: true,
            spreadsheetId: spreadsheet.data.spreadsheetId,
            spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
            postCount: posts.length
        });
    } catch (error) {
        console.error('Export social error:', error);
        res.status(500).json({ error: error.message || 'Failed to export social posts' });
    }
});

// ==================== IMPORT ROUTES ====================

// Import transactions from Google Sheet
router.post('/import/transactions', authenticateToken, async (req, res) => {
    try {
        const { spreadsheetId, sheetName = 'Transactions' } = req.body;
        if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID required' });

        const tokens = userTokens.get(req.user.id);
        if (!tokens) return res.status(401).json({ error: 'Google not connected' });

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        const sheets = google.sheets({ version: 'v4', auth: client });

        // Read spreadsheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:G`
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.json({ success: true, imported: 0, message: 'No data to import' });
        }

        // Skip header, import each row
        const headers = rows[0].map(h => h.toLowerCase());
        const dataRows = rows.slice(1);

        let imported = 0;
        let updated = 0;

        for (const row of dataRows) {
            const data = {};
            headers.forEach((h, i) => { data[h] = row[i]; });

            if (!data.date || !data.amount) continue;

            // Find or create category
            let categoryId = null;
            if (data.category) {
                const [cat] = await FinanceCategory.findOrCreate({
                    where: { name: data.category, userId: req.user.id },
                    defaults: { type: data.type || 'expense', userId: req.user.id }
                });
                categoryId = cat.id;
            }

            // Check if exists (by ID) or create
            if (data.id) {
                const existing = await FinanceTransaction.findOne({
                    where: { id: data.id, userId: req.user.id }
                });
                if (existing) {
                    await existing.update({
                        date: data.date,
                        type: data.type,
                        categoryId,
                        description: data.description,
                        amount: parseFloat(data.amount),
                        notes: data.notes
                    });
                    updated++;
                    continue;
                }
            }

            await FinanceTransaction.create({
                userId: req.user.id,
                date: data.date,
                type: data.type || 'expense',
                categoryId,
                description: data.description || '',
                amount: parseFloat(data.amount),
                notes: data.notes || ''
            });
            imported++;
        }

        res.json({ success: true, imported, updated, total: dataRows.length });
    } catch (error) {
        console.error('Import transactions error:', error);
        res.status(500).json({ error: error.message || 'Failed to import transactions' });
    }
});

// List user's spreadsheets
router.get('/spreadsheets', authenticateToken, async (req, res) => {
    try {
        const tokens = userTokens.get(req.user.id);
        if (!tokens) return res.status(401).json({ error: 'Google not connected' });

        const client = await getOAuth2Client();
        client.setCredentials(tokens);

        const drive = google.drive({ version: 'v3', auth: client });

        const response = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name, modifiedTime, webViewLink)',
            orderBy: 'modifiedTime desc',
            pageSize: 20
        });

        res.json(response.data.files || []);
    } catch (error) {
        console.error('List spreadsheets error:', error);
        res.status(500).json({ error: 'Failed to list spreadsheets' });
    }
});

module.exports = router;
