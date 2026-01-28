const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const {
    Client,
    ClientContact,
    ClientPipelineStage,
    ClientActivity,
    ClientReminder,
    ClientCustomField,
    ClientTag,
    ClientDocument
} = require('../models');

// Document upload configuration
const uploadDir = path.join(__dirname, '../uploads/crm-documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        // Allowed extensions
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv'];

        // Allowed MIME types mapping
        const allowedMimeTypes = {
            '.pdf': ['application/pdf'],
            '.doc': ['application/msword'],
            '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            '.xls': ['application/vnd.ms-excel'],
            '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            '.jpg': ['image/jpeg'],
            '.jpeg': ['image/jpeg'],
            '.png': ['image/png'],
            '.gif': ['image/gif'],
            '.txt': ['text/plain'],
            '.csv': ['text/csv', 'application/csv', 'text/plain']
        };

        const ext = path.extname(file.originalname).toLowerCase();

        // Check extension
        if (!allowedExtensions.includes(ext)) {
            return cb(new Error(`File extension ${ext} is not allowed`));
        }

        // Check MIME type matches extension
        const validMimes = allowedMimeTypes[ext] || [];
        if (!validMimes.includes(file.mimetype)) {
            console.warn(`CRM Upload: Suspicious file - extension ${ext} but MIME type ${file.mimetype}`);
            return cb(new Error('File type mismatch. The file content does not match its extension.'));
        }

        cb(null, true);
    }
});

// =====================
// ENCRYPTION HELPERS
// =====================

// SECURITY: Encryption key is REQUIRED - no fallback allowed
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY) {
    console.error('❌ FATAL: ENCRYPTION_KEY environment variable is required for CRM module');
    console.error('   Generate a secure key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('   Then set it in your .env file: ENCRYPTION_KEY=your_generated_key');
    process.exit(1);
}

if (ENCRYPTION_KEY.length < 32) {
    console.error('❌ FATAL: ENCRYPTION_KEY must be at least 32 characters for security');
    process.exit(1);
}

function encrypt(text) {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
}

function decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return text;
    }
}

// Decrypt client sensitive fields
function decryptClient(client) {
    if (!client) return null;
    const data = client.toJSON ? client.toJSON() : client;
    return {
        ...data,
        name: decrypt(data.name),
        notes: decrypt(data.notes)
    };
}

// Decrypt contact sensitive fields
function decryptContact(contact) {
    if (!contact) return null;
    const data = contact.toJSON ? contact.toJSON() : contact;
    return {
        ...data,
        name: decrypt(data.name),
        email: decrypt(data.email),
        phone: decrypt(data.phone),
        whatsapp: decrypt(data.whatsapp)
    };
}

// =====================
// PIPELINE STAGES
// =====================

// Get all pipeline stages for user
router.get('/pipeline/stages', authenticateToken, async (req, res) => {
    try {
        let stages = await ClientPipelineStage.findAll({
            where: { userId: req.user.id },
            order: [['orderIndex', 'ASC']]
        });

        // Create default stages if none exist
        if (stages.length === 0) {
            stages = await ClientPipelineStage.createDefaultStages(req.user.id);
        }

        res.json(stages);
    } catch (error) {
        console.error('Error fetching pipeline stages:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create pipeline stage
router.post('/pipeline/stages', authenticateToken, async (req, res) => {
    try {
        const { name, color, icon, stageType } = req.body;

        // Get max order index
        const maxOrder = await ClientPipelineStage.max('orderIndex', {
            where: { userId: req.user.id }
        });

        const stage = await ClientPipelineStage.create({
            userId: req.user.id,
            name,
            color: color || '#6b7280',
            icon: icon || '📋',
            orderIndex: (maxOrder || 0) + 1,
            stageType: stageType || 'active'
        });

        res.status(201).json(stage);
    } catch (error) {
        console.error('Error creating pipeline stage:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update pipeline stage
router.put('/pipeline/stages/:id', authenticateToken, async (req, res) => {
    try {
        const stage = await ClientPipelineStage.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!stage) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        const { name, color, icon, stageType, isFinal, isDefault } = req.body;
        await stage.update({ name, color, icon, stageType, isFinal, isDefault });

        res.json(stage);
    } catch (error) {
        console.error('Error updating pipeline stage:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reorder pipeline stages
router.patch('/pipeline/stages/reorder', authenticateToken, async (req, res) => {
    try {
        const { stageIds } = req.body; // Array of stage IDs in new order

        for (let i = 0; i < stageIds.length; i++) {
            await ClientPipelineStage.update(
                { orderIndex: i },
                { where: { id: stageIds[i], userId: req.user.id } }
            );
        }

        const stages = await ClientPipelineStage.findAll({
            where: { userId: req.user.id },
            order: [['orderIndex', 'ASC']]
        });

        res.json(stages);
    } catch (error) {
        console.error('Error reordering stages:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete pipeline stage
router.delete('/pipeline/stages/:id', authenticateToken, async (req, res) => {
    try {
        const stage = await ClientPipelineStage.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!stage) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        // Check if there are clients in this stage
        const clientCount = await Client.count({
            where: { stageId: req.params.id, userId: req.user.id }
        });

        if (clientCount > 0) {
            return res.status(400).json({
                message: `Cannot delete stage with ${clientCount} clients. Move clients first.`
            });
        }

        await stage.destroy();
        res.json({ message: 'Stage deleted' });
    } catch (error) {
        console.error('Error deleting stage:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// CLIENTS
// =====================

// Get all clients
router.get('/clients', authenticateToken, async (req, res) => {
    try {
        const {
            stage, priority, search, tags, source,
            isDeleted, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'DESC'
        } = req.query;

        const where = { userId: req.user.id };

        // Filter by deleted status
        where.isDeleted = isDeleted === 'true';

        if (stage) where.stageId = stage;
        if (priority) where.priority = priority;
        if (source) where.source = source;

        // Search - Note: name is encrypted, so we search by companyName only
        // For name search, we fetch all and filter in memory (not ideal for large datasets)
        if (search) {
            where.companyName = { [Op.like]: `%${search}%` };
        }

        // Tags filter - use LIKE on JSON string for compatibility
        if (tags) {
            const tagArray = tags.split(',');
            // Use LIKE on JSON string (works for both MySQL and SQLite)
            where[Op.or] = tagArray.map(t => ({
                tags: { [Op.like]: `%"${t}"%` }
            }));
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Map sortBy to actual column name
        const sortColumn = sortBy === 'createdAt' ? 'created_at' :
            sortBy === 'updatedAt' ? 'updated_at' : sortBy;

        const { count, rows } = await Client.findAndCountAll({
            where,
            include: [
                { model: ClientPipelineStage, as: 'stage', attributes: ['id', 'name', 'color', 'icon'] },
                { model: ClientContact, as: 'contacts', where: { isPrimary: true }, required: false }
            ],
            order: [[sortColumn, sortOrder]],
            limit: parseInt(limit),
            offset
        });

        // Decrypt client data
        const clients = rows.map(client => {
            const decrypted = decryptClient(client);
            if (client.contacts && client.contacts.length > 0) {
                decrypted.contacts = client.contacts.map(c => decryptContact(c));
            }
            return decrypted;
        });

        res.json({
            clients,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single client with full details
router.get('/clients/:id', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                { model: ClientPipelineStage, as: 'stage' },
                { model: ClientContact, as: 'contacts' },
                {
                    model: ClientActivity,
                    as: 'activities',
                    order: [['createdAt', 'DESC']],
                    limit: 50
                },
                {
                    model: ClientReminder,
                    as: 'reminders',
                    where: { isCompleted: false },
                    required: false
                }
            ]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Decrypt data
        const decrypted = decryptClient(client);
        decrypted.contacts = client.contacts?.map(c => decryptContact(c)) || [];
        decrypted.activities = client.activities?.map(a => ({
            ...a.toJSON(),
            title: decrypt(a.title),
            content: decrypt(a.content)
        })) || [];
        decrypted.reminders = client.reminders?.map(r => r.toJSON()) || [];

        res.json(decrypted);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create client
router.post('/clients', authenticateToken, async (req, res) => {
    try {
        const {
            name, companyName, logo, industry, companySize, website, budgetRange,
            addressStreet, addressCity, addressState, addressPostal, addressCountry,
            socialLinkedin, socialInstagram, socialTwitter, socialFacebook, socialTiktok, socialOther,
            stageId, priority, clientType, source, tags, customFields, notes,
            contacts // Array of contacts to create
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Client name is required' });
        }

        // Get default stage if not provided
        let finalStageId = stageId;
        if (!finalStageId) {
            const defaultStage = await ClientPipelineStage.findOne({
                where: { userId: req.user.id, isDefault: true }
            });
            if (!defaultStage) {
                // Create default stages
                const stages = await ClientPipelineStage.createDefaultStages(req.user.id);
                finalStageId = stages[0].id;
            } else {
                finalStageId = defaultStage.id;
            }
        }

        const client = await Client.create({
            userId: req.user.id,
            name: encrypt(name),
            companyName,
            logo,
            industry,
            companySize,
            website,
            budgetRange,
            addressStreet,
            addressCity,
            addressState,
            addressPostal,
            addressCountry: addressCountry || 'Indonesia',
            socialLinkedin,
            socialInstagram,
            socialTwitter,
            socialFacebook,
            socialTiktok,
            socialOther,
            stageId: finalStageId,
            priority: priority || 'medium',
            clientType,
            source,
            tags: tags || [],
            customFields: customFields || {},
            notes: notes ? encrypt(notes) : null
        });

        // Create contacts if provided
        if (contacts && contacts.length > 0) {
            for (const contact of contacts) {
                await ClientContact.create({
                    clientId: client.id,
                    userId: req.user.id,
                    name: encrypt(contact.name),
                    role: contact.role,
                    email: contact.email ? encrypt(contact.email) : null,
                    phone: contact.phone ? encrypt(contact.phone) : null,
                    whatsapp: contact.whatsapp ? encrypt(contact.whatsapp) : null,
                    isPrimary: contact.isPrimary || false,
                    preferredContact: contact.preferredContact || 'any'
                });
            }
        }

        // Log activity
        await ClientActivity.create({
            clientId: client.id,
            userId: req.user.id,
            type: 'note',
            title: encrypt('Client created'),
            content: encrypt('New client added to CRM')
        });

        res.status(201).json(decryptClient(client));
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update client
router.put('/clients/:id', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const updates = { ...req.body };

        // Encrypt sensitive fields
        if (updates.name) updates.name = encrypt(updates.name);
        if (updates.notes !== undefined) updates.notes = updates.notes ? encrypt(updates.notes) : null;

        await client.update(updates);

        // Log activity
        await ClientActivity.create({
            clientId: client.id,
            userId: req.user.id,
            type: 'updated',
            title: encrypt('Client updated')
        });

        res.json(decryptClient(client));
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: error.message });
    }
});

// Change client stage (with activity log)
router.patch('/clients/:id/stage', authenticateToken, async (req, res) => {
    try {
        const { stageId } = req.body;

        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: ClientPipelineStage, as: 'stage' }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const newStage = await ClientPipelineStage.findByPk(stageId);
        if (!newStage) {
            return res.status(404).json({ message: 'Stage not found' });
        }

        const oldStageName = client.stage?.name || 'None';

        await client.update({ stageId });

        // Log stage change
        await ClientActivity.create({
            clientId: client.id,
            userId: req.user.id,
            type: 'stage_change',
            title: encrypt(`Moved to ${newStage.name}`),
            metadata: {
                oldStage: oldStageName,
                newStage: newStage.name
            }
        });

        res.json(decryptClient(client));
    } catch (error) {
        console.error('Error changing stage:', error);
        res.status(500).json({ message: error.message });
    }
});

// Soft delete client
router.delete('/clients/:id', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.update({
            isDeleted: true,
            deletedAt: new Date()
        });

        res.json({ message: 'Client moved to trash' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: error.message });
    }
});

// Restore client from trash
router.post('/clients/:id/restore', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id, isDeleted: true }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found in trash' });
        }

        await client.update({
            isDeleted: false,
            deletedAt: null
        });

        res.json(decryptClient(client));
    } catch (error) {
        console.error('Error restoring client:', error);
        res.status(500).json({ message: error.message });
    }
});

// Permanent delete
router.delete('/clients/:id/permanent', authenticateToken, async (req, res) => {
    try {
        const client = await Client.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Delete all related data
        await ClientContact.destroy({ where: { clientId: client.id } });
        await ClientActivity.destroy({ where: { clientId: client.id } });
        await ClientReminder.destroy({ where: { clientId: client.id } });
        await client.destroy();

        res.json({ message: 'Client permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting client:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// CONTACTS
// =====================

// Get contacts for a client
router.get('/contacts/client/:clientId', authenticateToken, async (req, res) => {
    try {
        const contacts = await ClientContact.findAll({
            where: { clientId: req.params.clientId, userId: req.user.id },
            order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']]
        });

        res.json(contacts.map(c => decryptContact(c)));
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add contact
router.post('/contacts', authenticateToken, async (req, res) => {
    try {
        const { clientId, name, role, email, phone, whatsapp, isPrimary, preferredContact, notes } = req.body;

        // Verify client ownership
        const client = await Client.findOne({
            where: { id: clientId, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // If setting as primary, unset other primaries
        if (isPrimary) {
            await ClientContact.update(
                { isPrimary: false },
                { where: { clientId, userId: req.user.id } }
            );
        }

        const contact = await ClientContact.create({
            clientId,
            userId: req.user.id,
            name: encrypt(name),
            role,
            email: email ? encrypt(email) : null,
            phone: phone ? encrypt(phone) : null,
            whatsapp: whatsapp ? encrypt(whatsapp) : null,
            isPrimary: isPrimary || false,
            preferredContact: preferredContact || 'any',
            notes
        });

        res.status(201).json(decryptContact(contact));
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update contact
router.put('/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const contact = await ClientContact.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const updates = { ...req.body };

        // Encrypt sensitive fields
        if (updates.name) updates.name = encrypt(updates.name);
        if (updates.email) updates.email = encrypt(updates.email);
        if (updates.phone) updates.phone = encrypt(updates.phone);
        if (updates.whatsapp) updates.whatsapp = encrypt(updates.whatsapp);

        // Handle primary contact logic
        if (updates.isPrimary) {
            await ClientContact.update(
                { isPrimary: false },
                { where: { clientId: contact.clientId, userId: req.user.id } }
            );
        }

        await contact.update(updates);

        res.json(decryptContact(contact));
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete contact
router.delete('/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const contact = await ClientContact.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await contact.destroy();
        res.json({ message: 'Contact deleted' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// ACTIVITIES
// =====================

// Add activity
router.post('/activities', authenticateToken, async (req, res) => {
    try {
        const { clientId, type, title, content, metadata } = req.body;

        // Verify client ownership
        const client = await Client.findOne({
            where: { id: clientId, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const activity = await ClientActivity.create({
            clientId,
            userId: req.user.id,
            type: type || 'note',
            title: encrypt(title),
            content: content ? encrypt(content) : null,
            metadata
        });

        // Update last contacted
        await client.update({ lastContactedAt: new Date() });

        res.status(201).json({
            ...activity.toJSON(),
            title: decrypt(activity.title),
            content: decrypt(activity.content)
        });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get activities for client
router.get('/clients/:id/activities', authenticateToken, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const activities = await ClientActivity.findAll({
            where: { clientId: req.params.id, userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json(activities.map(a => ({
            ...a.toJSON(),
            title: decrypt(a.title),
            content: decrypt(a.content)
        })));
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete activity
router.delete('/activities/:id', authenticateToken, async (req, res) => {
    try {
        const activity = await ClientActivity.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        await activity.destroy();
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// REMINDERS
// =====================

// Get all reminders
router.get('/reminders', authenticateToken, async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        const where = { userId: req.user.id };

        if (status === 'pending') {
            where.isCompleted = false;
        } else if (status === 'completed') {
            where.isCompleted = true;
        }

        const reminders = await ClientReminder.findAll({
            where,
            include: [{
                model: Client,
                attributes: ['id', 'name', 'companyName'],
                where: { isDeleted: false }
            }],
            order: [['remindAt', 'ASC']]
        });

        // Decrypt client names
        const result = reminders.map(r => ({
            ...r.toJSON(),
            Client: r.Client ? {
                ...r.Client.toJSON(),
                name: decrypt(r.Client.name)
            } : null
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create reminder
router.post('/reminders', authenticateToken, async (req, res) => {
    try {
        const { clientId, title, description, remindAt, repeatType, notifyVia } = req.body;

        // Verify client ownership
        const client = await Client.findOne({
            where: { id: clientId, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const reminder = await ClientReminder.create({
            clientId,
            userId: req.user.id,
            title,
            description,
            remindAt: new Date(remindAt),
            repeatType: repeatType || 'none',
            notifyVia: notifyVia || ['app']
        });

        // Update next followup on client
        await client.update({ nextFollowupAt: new Date(remindAt) });

        res.status(201).json(reminder);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update reminder
router.put('/reminders/:id', authenticateToken, async (req, res) => {
    try {
        const reminder = await ClientReminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        await reminder.update(req.body);
        res.json(reminder);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark reminder complete
router.patch('/reminders/:id/complete', authenticateToken, async (req, res) => {
    try {
        const reminder = await ClientReminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        await reminder.update({
            isCompleted: true,
            completedAt: new Date()
        });

        // Log activity
        await ClientActivity.create({
            clientId: reminder.clientId,
            userId: req.user.id,
            type: 'reminder',
            title: `Completed: ${reminder.title}`
        });

        res.json(reminder);
    } catch (error) {
        console.error('Error completing reminder:', error);
        res.status(500).json({ message: error.message });
    }
});

// Snooze reminder
router.patch('/reminders/:id/snooze', authenticateToken, async (req, res) => {
    try {
        const { snoozedUntil } = req.body;

        const reminder = await ClientReminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        await reminder.update({
            isSnoozed: true,
            snoozedUntil: new Date(snoozedUntil),
            remindAt: new Date(snoozedUntil)
        });

        res.json(reminder);
    } catch (error) {
        console.error('Error snoozing reminder:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete reminder
router.delete('/reminders/:id', authenticateToken, async (req, res) => {
    try {
        const reminder = await ClientReminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        await reminder.destroy();
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// TAGS
// =====================

// Get all tags
router.get('/tags', authenticateToken, async (req, res) => {
    try {
        const tags = await ClientTag.findAll({
            where: { userId: req.user.id },
            order: [['name', 'ASC']]
        });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create tag
router.post('/tags', authenticateToken, async (req, res) => {
    try {
        const { name, color } = req.body;

        const tag = await ClientTag.create({
            userId: req.user.id,
            name,
            color: color || '#6b7280'
        });

        res.status(201).json(tag);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Tag already exists' });
        }
        console.error('Error creating tag:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update tag
router.put('/tags/:id', authenticateToken, async (req, res) => {
    try {
        const tag = await ClientTag.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        await tag.update(req.body);
        res.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete tag
router.delete('/tags/:id', authenticateToken, async (req, res) => {
    try {
        const tag = await ClientTag.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        await tag.destroy();
        res.json({ message: 'Tag deleted' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// CUSTOM FIELDS
// =====================

// Get custom fields
router.get('/custom-fields', authenticateToken, async (req, res) => {
    try {
        const fields = await ClientCustomField.findAll({
            where: { userId: req.user.id },
            order: [['orderIndex', 'ASC']]
        });
        res.json(fields);
    } catch (error) {
        console.error('Error fetching custom fields:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create custom field
router.post('/custom-fields', authenticateToken, async (req, res) => {
    try {
        const { name, type, isRequired, placeholder, options, defaultValue } = req.body;

        // Generate field key from name
        const fieldKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        // Get max order
        const maxOrder = await ClientCustomField.max('orderIndex', {
            where: { userId: req.user.id }
        });

        const field = await ClientCustomField.create({
            userId: req.user.id,
            name,
            fieldKey,
            type,
            isRequired: isRequired || false,
            placeholder,
            options,
            defaultValue,
            orderIndex: (maxOrder || 0) + 1
        });

        res.status(201).json(field);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Field with this name already exists' });
        }
        console.error('Error creating custom field:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update custom field
router.put('/custom-fields/:id', authenticateToken, async (req, res) => {
    try {
        const field = await ClientCustomField.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }

        await field.update(req.body);
        res.json(field);
    } catch (error) {
        console.error('Error updating custom field:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete custom field
router.delete('/custom-fields/:id', authenticateToken, async (req, res) => {
    try {
        const field = await ClientCustomField.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }

        await field.destroy();
        res.json({ message: 'Custom field deleted' });
    } catch (error) {
        console.error('Error deleting custom field:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// ANALYTICS
// =====================

// Get CRM analytics overview
router.get('/analytics/overview', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get counts by stage
        const stages = await ClientPipelineStage.findAll({
            where: { userId },
            include: [{
                model: Client,
                as: 'clients',
                where: { isDeleted: false },
                required: false
            }]
        });

        const stageStats = stages.map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            icon: s.icon,
            count: s.clients?.length || 0
        }));

        // Total clients
        const totalClients = await Client.count({
            where: { userId, isDeleted: false }
        });

        // New this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newThisMonth = await Client.count({
            where: {
                userId,
                isDeleted: false,
                [Op.and]: sequelize.literal(`Client.created_at >= '${startOfMonth.toISOString()}'`)
            }
        });

        // Won this month - count clients in won stage updated this month
        const wonStage = await ClientPipelineStage.findOne({
            where: { userId, stageType: 'won' }
        });

        let wonThisMonth = 0;
        if (wonStage) {
            // Count clients in "won" stage that were updated this month
            wonThisMonth = await Client.count({
                where: {
                    userId,
                    stageId: wonStage.id,
                    isDeleted: false,
                    [Op.and]: sequelize.literal(`Client.updated_at >= '${startOfMonth.toISOString()}'`)
                }
            });
        }

        // Upcoming reminders
        const upcomingReminders = await ClientReminder.count({
            where: {
                userId,
                isCompleted: false,
                remindAt: { [Op.gte]: new Date() }
            }
        });

        // Overdue reminders
        const overdueReminders = await ClientReminder.count({
            where: {
                userId,
                isCompleted: false,
                remindAt: { [Op.lt]: new Date() }
            }
        });

        // Priority breakdown
        const priorityStats = await Client.findAll({
            where: { userId, isDeleted: false },
            attributes: [
                'priority',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['priority']
        });

        // Source breakdown
        const sourceStats = await Client.findAll({
            where: { userId, isDeleted: false, source: { [Op.ne]: null } },
            attributes: [
                'source',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['source'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 5
        });

        res.json({
            totalClients,
            newThisMonth,
            wonThisMonth,
            stageStats,
            priorityStats,
            sourceStats,
            reminders: {
                upcoming: upcomingReminders,
                overdue: overdueReminders
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get funnel data
router.get('/analytics/funnel', authenticateToken, async (req, res) => {
    try {
        const stages = await ClientPipelineStage.findAll({
            where: { userId: req.user.id },
            order: [['orderIndex', 'ASC']],
            include: [{
                model: Client,
                as: 'clients',
                where: { isDeleted: false },
                required: false
            }]
        });

        const funnel = stages
            .filter(s => s.stageType === 'active' || s.stageType === 'won')
            .map(s => ({
                name: s.name,
                count: s.clients?.length || 0,
                color: s.color
            }));

        res.json(funnel);
    } catch (error) {
        console.error('Error fetching funnel:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get conversion rates per stage
router.get('/analytics/conversion', authenticateToken, async (req, res) => {
    try {
        const stages = await ClientPipelineStage.findAll({
            where: { userId: req.user.id },
            order: [['orderIndex', 'ASC']],
            include: [{
                model: Client,
                as: 'clients',
                where: { isDeleted: false },
                required: false
            }]
        });

        const activeStages = stages.filter(s => s.stageType === 'active');
        const wonStage = stages.find(s => s.stageType === 'won');
        const lostStage = stages.find(s => s.stageType === 'lost');

        const totalClients = stages.reduce((sum, s) => sum + (s.clients?.length || 0), 0);
        const wonClients = wonStage?.clients?.length || 0;
        const lostClients = lostStage?.clients?.length || 0;

        const conversionData = activeStages.map((stage, idx) => {
            const stageCount = stage.clients?.length || 0;
            const nextStages = activeStages.slice(idx + 1);
            const nextCount = nextStages.reduce((sum, s) => sum + (s.clients?.length || 0), 0) + wonClients;
            const conversionRate = stageCount > 0 ? Math.round((nextCount / stageCount) * 100) : 0;

            return {
                id: stage.id,
                name: stage.name,
                color: stage.color,
                count: stageCount,
                conversionRate: Math.min(conversionRate, 100)
            };
        });

        res.json({
            stages: conversionData,
            overall: {
                total: totalClients,
                won: wonClients,
                lost: lostClients,
                winRate: totalClients > 0 ? Math.round((wonClients / totalClients) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching conversion:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get client trend data (new clients over time)
router.get('/analytics/trends', authenticateToken, async (req, res) => {
    try {
        const { period = 'week' } = req.query;
        const now = new Date();
        let startDate;
        let groupBy;

        if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupBy = 'day';
        } else if (period === 'month') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            groupBy = 'day';
        } else {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            groupBy = 'month';
        }

        const clients = await Client.findAll({
            where: {
                userId: req.user.id,
                isDeleted: false,
                createdAt: { [Op.gte]: startDate }
            },
            attributes: ['id', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        // Group by date
        const grouped = {};
        clients.forEach(client => {
            const date = new Date(client.createdAt);
            let key;
            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            grouped[key] = (grouped[key] || 0) + 1;
        });

        // Fill missing dates
        const result = [];
        const current = new Date(startDate);
        while (current <= now) {
            let key;
            if (groupBy === 'day') {
                key = current.toISOString().split('T')[0];
            } else {
                key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            }
            result.push({
                date: key,
                count: grouped[key] || 0
            });
            if (groupBy === 'day') {
                current.setDate(current.getDate() + 1);
            } else {
                current.setMonth(current.getMonth() + 1);
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get activity stats
router.get('/analytics/activity-stats', authenticateToken, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const activities = await ClientActivity.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.gte]: startDate }
            },
            attributes: ['type', 'createdAt']
        });

        // Group by type
        const byType = {};
        activities.forEach(a => {
            byType[a.type] = (byType[a.type] || 0) + 1;
        });

        // Group by day
        const byDay = {};
        activities.forEach(a => {
            const day = new Date(a.createdAt).toISOString().split('T')[0];
            byDay[day] = (byDay[day] || 0) + 1;
        });

        res.json({
            total: activities.length,
            byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
            byDay: Object.entries(byDay).map(([date, count]) => ({ date, count }))
        });
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// DUPLICATE DETECTION
// =====================

// Find potential duplicate clients
router.get('/duplicates', authenticateToken, async (req, res) => {
    try {
        const clients = await Client.findAll({
            where: { userId: req.user.id, isDeleted: false },
            include: [{
                model: ClientContact,
                as: 'contacts',
                required: false
            }],
            attributes: ['id', 'name', 'companyName', 'createdAt']
        });

        // Decrypt names
        const decryptedClients = clients.map(c => ({
            id: c.id,
            name: decrypt(c.name) || '',
            companyName: decrypt(c.companyName) || '',
            createdAt: c.createdAt,
            emails: c.contacts?.map(ct => decrypt(ct.email)).filter(Boolean) || [],
            phones: c.contacts?.map(ct => decrypt(ct.phone)).filter(Boolean) || []
        }));

        // Find duplicates
        const duplicateGroups = [];
        const processed = new Set();

        for (let i = 0; i < decryptedClients.length; i++) {
            if (processed.has(i)) continue;

            const client = decryptedClients[i];
            const group = [client];
            processed.add(i);

            for (let j = i + 1; j < decryptedClients.length; j++) {
                if (processed.has(j)) continue;

                const other = decryptedClients[j];
                let isDuplicate = false;

                // Check name similarity (case-insensitive)
                const name1 = client.name.toLowerCase().trim();
                const name2 = other.name.toLowerCase().trim();

                if (name1 && name2) {
                    // Exact match
                    if (name1 === name2) isDuplicate = true;
                    // Partial match (one contains the other)
                    else if (name1.includes(name2) || name2.includes(name1)) isDuplicate = true;
                    // Levenshtein similarity > 80%
                    else {
                        const similarity = 1 - (levenshteinDistance(name1, name2) / Math.max(name1.length, name2.length));
                        if (similarity > 0.8) isDuplicate = true;
                    }
                }

                // Check email match
                if (!isDuplicate && client.emails.length && other.emails.length) {
                    for (const email1 of client.emails) {
                        for (const email2 of other.emails) {
                            if (email1.toLowerCase() === email2.toLowerCase()) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (isDuplicate) break;
                    }
                }

                // Check phone match
                if (!isDuplicate && client.phones.length && other.phones.length) {
                    for (const phone1 of client.phones) {
                        for (const phone2 of other.phones) {
                            const p1 = phone1.replace(/\D/g, '');
                            const p2 = phone2.replace(/\D/g, '');
                            if (p1 && p2 && (p1.includes(p2) || p2.includes(p1))) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (isDuplicate) break;
                    }
                }

                // Check company match
                if (!isDuplicate && client.companyName && other.companyName) {
                    const comp1 = client.companyName.toLowerCase().trim();
                    const comp2 = other.companyName.toLowerCase().trim();
                    if (comp1 === comp2 && comp1.length > 2) isDuplicate = true;
                }

                if (isDuplicate) {
                    group.push(other);
                    processed.add(j);
                }
            }

            if (group.length > 1) {
                duplicateGroups.push({
                    matchReason: getMatchReason(group),
                    clients: group
                });
            }
        }

        res.json(duplicateGroups);
    } catch (error) {
        console.error('Error finding duplicates:', error);
        res.status(500).json({ message: error.message });
    }
});

// Helper function: Levenshtein distance
function levenshteinDistance(s1, s2) {
    const m = s1.length, n = s2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = s1[i - 1] === s2[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// Helper: Get match reason
function getMatchReason(group) {
    const names = group.map(c => c.name.toLowerCase().trim());
    const emails = group.flatMap(c => c.emails.map(e => e.toLowerCase()));
    const phones = group.flatMap(c => c.phones.map(p => p.replace(/\D/g, '')));
    const companies = group.map(c => c.companyName?.toLowerCase().trim()).filter(Boolean);

    // Check what matched
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length < group.length) return 'Similar name';

    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length < emails.length) return 'Same email';

    if (phones.length > 1) {
        for (let i = 0; i < phones.length; i++) {
            for (let j = i + 1; j < phones.length; j++) {
                if (phones[i] && phones[j] && (phones[i].includes(phones[j]) || phones[j].includes(phones[i]))) {
                    return 'Same phone';
                }
            }
        }
    }

    const uniqueCompanies = [...new Set(companies)];
    if (companies.length > 1 && uniqueCompanies.length < companies.length) return 'Same company';

    return 'Similar data';
}

// =====================
// CLIENT MERGE
// =====================

// Merge two clients
router.post('/clients/merge', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { keepId, mergeId } = req.body;

        if (!keepId || !mergeId) {
            return res.status(400).json({ message: 'Both keepId and mergeId are required' });
        }

        if (keepId === mergeId) {
            return res.status(400).json({ message: 'Cannot merge client with itself' });
        }

        // Get both clients
        const keepClient = await Client.findOne({
            where: { id: keepId, userId: req.user.id, isDeleted: false },
            transaction
        });

        const mergeClient = await Client.findOne({
            where: { id: mergeId, userId: req.user.id, isDeleted: false },
            transaction
        });

        if (!keepClient || !mergeClient) {
            await transaction.rollback();
            return res.status(404).json({ message: 'One or both clients not found' });
        }

        // Transfer contacts from merge client to keep client
        await ClientContact.update(
            { clientId: keepId },
            { where: { clientId: mergeId }, transaction }
        );

        // Transfer activities from merge client to keep client
        await ClientActivity.update(
            { clientId: keepId },
            { where: { clientId: mergeId }, transaction }
        );

        // Transfer reminders from merge client to keep client
        await ClientReminder.update(
            { clientId: keepId },
            { where: { clientId: mergeId }, transaction }
        );

        // Transfer documents from merge client to keep client
        await ClientDocument.update(
            { clientId: keepId },
            { where: { clientId: mergeId }, transaction }
        );

        // Merge notes (append merge client notes to keep client)
        const mergeNotes = decrypt(mergeClient.notes) || '';
        const keepNotes = decrypt(keepClient.notes) || '';
        if (mergeNotes) {
            const combinedNotes = keepNotes
                ? `${keepNotes}\n\n--- Merged from ${decrypt(mergeClient.name)} ---\n${mergeNotes}`
                : `--- Merged from ${decrypt(mergeClient.name)} ---\n${mergeNotes}`;
            await keepClient.update(
                { notes: encrypt(combinedNotes) },
                { transaction }
            );
        }

        // Merge tags (combine unique tags)
        const keepTags = keepClient.tags || [];
        const mergeTags = mergeClient.tags || [];
        const combinedTags = [...new Set([...keepTags, ...mergeTags])];
        if (combinedTags.length > keepTags.length) {
            await keepClient.update(
                { tags: combinedTags },
                { transaction }
            );
        }

        // Update company if keep client doesn't have one
        if (!decrypt(keepClient.companyName) && decrypt(mergeClient.companyName)) {
            await keepClient.update(
                { companyName: mergeClient.companyName },
                { transaction }
            );
        }

        // Log merge activity
        await ClientActivity.create({
            userId: req.user.id,
            clientId: keepId,
            type: 'note',
            title: encrypt('Client merged'),
            content: encrypt(`Merged with client: ${decrypt(mergeClient.name)}`)
        }, { transaction });

        // Mark merge client as deleted
        await mergeClient.update(
            { isDeleted: true, deletedAt: new Date() },
            { transaction }
        );

        await transaction.commit();

        res.json({
            message: 'Clients merged successfully',
            keepId,
            mergedId: mergeId
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error merging clients:', error);
        res.status(500).json({ message: error.message });
    }
});

// =====================
// DOCUMENT ROUTES
// =====================

// Get documents for a client
router.get('/clients/:clientId/documents', authenticateToken, async (req, res) => {
    try {
        const documents = await ClientDocument.findAll({
            where: {
                clientId: req.params.clientId,
                userId: req.user.id
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload document
router.post('/clients/:clientId/documents', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        // Verify client ownership
        const client = await Client.findOne({
            where: { id: req.params.clientId, userId: req.user.id }
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const document = await ClientDocument.create({
            clientId: req.params.clientId,
            userId: req.user.id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: path.extname(req.file.originalname).toLowerCase(),
            fileSize: req.file.size,
            filePath: req.file.path,
            description: req.body.description || ''
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: error.message });
    }
});

// Download document
router.get('/documents/:id/download', authenticateToken, async (req, res) => {
    try {
        const document = await ClientDocument.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on disk' });
        }

        res.download(document.filePath, document.originalName);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete document
router.delete('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const document = await ClientDocument.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from disk
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await document.destroy();
        res.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
