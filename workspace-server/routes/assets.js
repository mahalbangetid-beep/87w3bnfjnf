const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { AssetAccount, AssetItem, AssetNote, AssetBookmark } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ============================================
// SECURITY: Encryption for passwords
// ============================================
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'workspace_assets_encryption_key_32';
const IV_LENGTH = 16;

// Log warning if using fallback key
if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️ WARNING: ENCRYPTION_KEY not set! Using fallback. SET THIS IN PRODUCTION!');
}

/**
 * Encrypt sensitive data with AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string|null} - Encrypted string with format: salt:iv:encrypted
 */
function encrypt(text) {
    if (!text) return null;
    try {
        // Generate unique salt for each encryption (more secure)
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Format: salt:iv:encrypted
        return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        console.error('Encryption error:', e.message);
        return null;
    }
}

/**
 * Decrypt sensitive data
 * @param {string} text - Encrypted string with format: salt:iv:encrypted or iv:encrypted (legacy)
 * @returns {string|null} - Decrypted text or null if decryption fails
 */
function decrypt(text) {
    if (!text) return null;

    // If it doesn't look like encrypted data (no colons), return as-is
    if (!text.includes(':')) {
        return text;
    }

    try {
        const parts = text.split(':');

        // Support both new format (salt:iv:encrypted) and legacy format (iv:encrypted)
        if (parts.length === 3) {
            // New format with salt
            const salt = Buffer.from(parts[0], 'hex');
            const iv = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else if (parts.length === 2) {
            // Legacy format (iv:encrypted) with static salt
            const iv = Buffer.from(parts[0], 'hex');
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(parts[1], 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }

        return text; // Return original if format not recognized
    } catch (e) {
        // Decryption failed - likely encrypted with different key
        console.error('Decryption error:', e.message);
        // Return null to indicate decryption failure (don't expose corrupted data)
        return null;
    }
}

// File upload configuration
const uploadDir = path.join(__dirname, '../uploads/assets');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpg, png, gif, webp) and text files are allowed'));
        }
    }
});

// =====================
// ACCOUNT MANAGEMENT
// =====================

// Get all accounts
router.get('/accounts', authenticateToken, async (req, res) => {
    try {
        const { category, search, favorite } = req.query;
        const where = { userId: req.user.id };

        if (category) where.category = category;
        if (favorite === 'true') where.isFavorite = true;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } }
            ];
        }

        const accounts = await AssetAccount.findAll({
            where,
            order: [['isFavorite', 'DESC'], ['name', 'ASC']]
        });

        // Decrypt passwords before sending
        const decryptedAccounts = accounts.map(acc => ({
            ...acc.toJSON(),
            password: decrypt(acc.password)
        }));

        res.json(decryptedAccounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get account categories
router.get('/accounts/categories', authenticateToken, (req, res) => {
    res.json(AssetAccount.defaultCategories);
});

// Create account
router.post('/accounts', authenticateToken, async (req, res) => {
    try {
        const { name, category, link, email, username, password, phone, recoveryEmail, twoFactorEnabled, notes, icon, color } = req.body;

        const account = await AssetAccount.create({
            userId: req.user.id,
            name,
            category: category || 'Other',
            link,
            email,
            username,
            password: encrypt(password),
            phone,
            recoveryEmail,
            twoFactorEnabled: twoFactorEnabled || false,
            notes,
            icon,
            color
        });

        res.status(201).json({
            ...account.toJSON(),
            password: decrypt(account.password)
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update account
router.put('/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const account = await AssetAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // SECURITY: Whitelist allowed fields
        const allowedFields = ['name', 'category', 'link', 'email', 'username', 'password', 'phone', 'recoveryEmail', 'twoFactorEnabled', 'notes', 'icon', 'color', 'isFavorite'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        if (updateData.password) {
            updateData.password = encrypt(updateData.password);
        }

        await account.update(updateData);
        res.json({
            ...account.toJSON(),
            password: decrypt(account.password)
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete account
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
    try {
        const account = await AssetAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        await account.destroy();
        res.json({ message: 'Account deleted' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: error.message });
    }
});

// Toggle favorite
router.patch('/accounts/:id/favorite', authenticateToken, async (req, res) => {
    try {
        const account = await AssetAccount.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        await account.update({ isFavorite: !account.isFavorite });
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =====================
// ASSET ITEMS
// =====================

// Get all items
router.get('/items', authenticateToken, async (req, res) => {
    try {
        const { type, category, search, favorite, archived } = req.query;
        const where = { userId: req.user.id };

        if (type) where.type = type;
        if (category) where.category = category;
        if (favorite === 'true') where.isFavorite = true;
        if (archived === 'true') {
            where.isArchived = true;
        } else {
            where.isArchived = false;
        }
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        const items = await AssetItem.findAll({
            where,
            order: [['isFavorite', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get item categories
router.get('/items/categories', authenticateToken, (req, res) => {
    res.json(AssetItem.defaultCategories);
});

// Create item
router.post('/items', authenticateToken, async (req, res) => {
    try {
        const { name, type, category, content, link, tags, icon, color } = req.body;

        const item = await AssetItem.create({
            userId: req.user.id,
            name,
            type: type || 'text',
            category: category || 'General',
            content,
            link,
            tags: tags || [],
            icon,
            color
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload file item
router.post('/items/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { name, category, tags } = req.body;

        const item = await AssetItem.create({
            userId: req.user.id,
            name: name || req.file.originalname,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
            category: category || 'General',
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            tags: tags ? JSON.parse(tags) : []
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update item
router.put('/items/:id', authenticateToken, async (req, res) => {
    try {
        const item = await AssetItem.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // SECURITY: Whitelist allowed fields
        const { name, category, content, link, tags, icon, color, isFavorite, isArchived } = req.body;
        await item.update({ name, category, content, link, tags, icon, color, isFavorite, isArchived });
        res.json(item);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete item
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const item = await AssetItem.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete file if exists
        if (item.filePath && fs.existsSync(item.filePath)) {
            fs.unlinkSync(item.filePath);
        }

        await item.destroy();
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// ASSET NOTES
// =====================

// Get all notes
router.get('/notes', authenticateToken, async (req, res) => {
    try {
        const { pinned, archived, accountId, type } = req.query;
        const where = { userId: req.user.id };

        if (pinned === 'true') where.isPinned = true;
        if (archived === 'true') {
            where.isArchived = true;
        } else if (archived !== 'all') {
            where.isArchived = false;
        }
        if (accountId) where.accountId = accountId;
        if (type) where.type = type;

        const notes = await AssetNote.findAll({
            where,
            include: [
                { model: AssetAccount, attributes: ['id', 'name', 'icon'] }
            ],
            order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create note
router.post('/notes', authenticateToken, async (req, res) => {
    try {
        const { title, content, type, accountId, assetItemId, tags, color, isPinned } = req.body;

        const note = await AssetNote.create({
            userId: req.user.id,
            title,
            content,
            type: type || 'update',
            accountId,
            assetItemId,
            tags: tags || [],
            color,
            isPinned: isPinned || false
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update note
router.put('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await AssetNote.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // SECURITY: Whitelist allowed fields
        const { title, content, type, accountId, assetItemId, tags, color, isPinned, isArchived } = req.body;
        await note.update({ title, content, type, accountId, assetItemId, tags, color, isPinned, isArchived });
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete note
router.delete('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await AssetNote.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.destroy();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// BOOKMARKS
// =====================

// Get all bookmarks
router.get('/bookmarks', authenticateToken, async (req, res) => {
    try {
        const { category, search, favorite } = req.query;
        const where = { userId: req.user.id };

        if (category) where.category = category;
        if (favorite === 'true') where.isFavorite = true;
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { url: { [Op.like]: `%${search}%` } }
            ];
        }

        const bookmarks = await AssetBookmark.findAll({
            where,
            order: [['isFavorite', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(bookmarks);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get bookmark categories
router.get('/bookmarks/categories', authenticateToken, (req, res) => {
    res.json(AssetBookmark.defaultCategories);
});

// Create bookmark
router.post('/bookmarks', authenticateToken, async (req, res) => {
    try {
        const { title, url, description, category, icon, color, tags, favicon } = req.body;

        const bookmark = await AssetBookmark.create({
            userId: req.user.id,
            title,
            url,
            description,
            category: category || 'Other',
            icon,
            color,
            tags: tags || [],
            favicon
        });

        res.status(201).json(bookmark);
    } catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update bookmark
router.put('/bookmarks/:id', authenticateToken, async (req, res) => {
    try {
        const bookmark = await AssetBookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        // SECURITY: Whitelist allowed fields
        const { title, url, description, category, icon, color, tags, favicon, isFavorite } = req.body;
        await bookmark.update({ title, url, description, category, icon, color, tags, favicon, isFavorite });
        res.json(bookmark);
    } catch (error) {
        console.error('Error updating bookmark:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete bookmark
router.delete('/bookmarks/:id', authenticateToken, async (req, res) => {
    try {
        const bookmark = await AssetBookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.destroy();
        res.json({ message: 'Bookmark deleted' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ message: error.message });
    }
});

// Track bookmark click
router.post('/bookmarks/:id/click', authenticateToken, async (req, res) => {
    try {
        const bookmark = await AssetBookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.update({
            clickCount: bookmark.clickCount + 1,
            lastVisited: new Date()
        });

        res.json(bookmark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle bookmark favorite
router.patch('/bookmarks/:id/favorite', authenticateToken, async (req, res) => {
    try {
        const bookmark = await AssetBookmark.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        await bookmark.update({ isFavorite: !bookmark.isFavorite });
        res.json(bookmark);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =====================
// DASHBOARD
// =====================

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [accountsCount, itemsCount, notesCount, bookmarksCount, recentAccounts, recentBookmarks, recentNotes] = await Promise.all([
            AssetAccount.count({ where: { userId } }),
            AssetItem.count({ where: { userId, isArchived: false } }),
            AssetNote.count({ where: { userId, isArchived: false } }),
            AssetBookmark.count({ where: { userId } }),
            AssetAccount.findAll({
                where: { userId },
                order: [['updatedAt', 'DESC']],
                limit: 5
            }),
            AssetBookmark.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
                limit: 5
            }),
            AssetNote.findAll({
                where: { userId, isArchived: false },
                order: [['createdAt', 'DESC']],
                limit: 5,
                include: [{ model: AssetAccount, attributes: ['id', 'name', 'icon'] }]
            })
        ]);

        res.json({
            stats: {
                accounts: accountsCount,
                items: itemsCount,
                notes: notesCount,
                bookmarks: bookmarksCount
            },
            recentAccounts: recentAccounts.map(acc => ({
                ...acc.toJSON(),
                password: '••••••••' // Don't expose password in dashboard
            })),
            recentBookmarks,
            recentNotes
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
