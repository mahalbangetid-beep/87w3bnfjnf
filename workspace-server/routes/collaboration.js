const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');

// Import models - will be set up after model registration
let Project, User, ProjectCollaborator, ProjectActivity, Notification;

// Lazy load models to avoid circular dependency
const getModels = () => {
    if (!Project) {
        const models = require('../models');
        Project = models.Project;
        User = models.User;
        ProjectCollaborator = models.ProjectCollaborator;
        ProjectActivity = models.ProjectActivity;
        Notification = models.Notification;
    }
};

// Helper: Log activity
const logActivity = async (projectId, userId, action, targetType = null, targetId = null, targetName = null, metadata = null) => {
    getModels();
    try {
        await ProjectActivity.create({
            projectId, userId, action, targetType, targetId, targetName, metadata
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

// Helper: Check project access
const checkProjectAccess = async (projectId, userId) => {
    getModels();
    const project = await Project.findByPk(projectId);
    if (!project) return { access: false, error: 'Project not found' };

    // Owner always has access
    if (project.userId === userId) return { access: true, role: 'owner', project };

    // Check collaborator
    const collab = await ProjectCollaborator.findOne({
        where: { projectId, userId, status: 'accepted' }
    });

    if (collab) return { access: true, role: collab.role, project };
    return { access: false, error: 'Access denied' };
};

// ==================== ROUTES ====================

// Get project collaborators
router.get('/project/:projectId', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId } = req.params;
        const { access, error } = await checkProjectAccess(projectId, req.user.id);
        if (!access) return res.status(403).json({ error });

        const collaborators = await ProjectCollaborator.findAll({
            where: { projectId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'], required: false }],
            order: [['createdAt', 'ASC']]
        });

        // Get project owner
        const project = await Project.findByPk(projectId, {
            include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }]
        });

        res.json({
            owner: project.User,
            collaborators: collaborators.map(c => ({
                id: c.id,
                user: c.user || { email: c.invitedEmail, name: c.invitedEmail?.split('@')[0], pending: true },
                invitedEmail: c.invitedEmail,
                status: c.status,
                role: c.role,
                invitedAt: c.invitedAt,
                acceptedAt: c.acceptedAt,
                lastAccessedAt: c.lastAccessedAt
            }))
        });
    } catch (error) {
        console.error('Get collaborators error:', error);
        res.status(500).json({ error: 'Failed to get collaborators' });
    }
});

// Invite collaborator by email
router.post('/invite', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId, email } = req.body;
        if (!projectId || !email) {
            return res.status(400).json({ error: 'Project ID and email required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const { access, role, project, error } = await checkProjectAccess(projectId, req.user.id);
        if (!access) return res.status(403).json({ error });

        // Can't invite yourself
        if (normalizedEmail === req.user.email?.toLowerCase()) {
            return res.status(400).json({ error: "You can't invite yourself" });
        }

        // Find user by email (may or may not exist)
        const invitee = await User.findOne({ where: { email: normalizedEmail } });

        // Check if already invited (by userId if exists, or by email if not)
        let existing;
        if (invitee) {
            existing = await ProjectCollaborator.findOne({
                where: { projectId, userId: invitee.id }
            });
        } else {
            existing = await ProjectCollaborator.findOne({
                where: { projectId, invitedEmail: normalizedEmail }
            });
        }

        if (existing) {
            if (existing.status === 'accepted') {
                return res.status(400).json({ error: 'User is already a collaborator' });
            }
            if (existing.status === 'pending') {
                return res.status(400).json({ error: 'Invitation already sent to this email' });
            }
            // Re-invite if declined/removed
            existing.status = 'pending';
            existing.invitedById = req.user.id;
            existing.invitedAt = new Date();
            existing.inviteToken = crypto.randomBytes(32).toString('hex');
            existing.inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            if (invitee) {
                existing.userId = invitee.id;
                existing.invitedEmail = null;
            }
            await existing.save();
        } else {
            // Create new invitation
            await ProjectCollaborator.create({
                projectId,
                userId: invitee ? invitee.id : null,
                invitedEmail: invitee ? null : normalizedEmail,
                invitedById: req.user.id,
                status: 'pending',
                inviteToken: crypto.randomBytes(32).toString('hex'),
                inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        }

        // Create notification only if user exists
        if (invitee) {
            await Notification.create({
                userId: invitee.id,
                type: 'collaboration',
                title: 'Project Invitation',
                message: `${req.user.name || 'Someone'} invited you to collaborate on "${project.name}"`,
                data: JSON.stringify({ projectId, invitedBy: req.user.id })
            });
        }

        // Log activity
        await logActivity(projectId, req.user.id, 'collaborator_invited', 'user', invitee?.id || null, invitee?.name || normalizedEmail);

        res.json({
            success: true,
            message: invitee
                ? `Invitation sent to ${invitee.email}`
                : `Invitation sent to ${normalizedEmail}. They will see it when they register.`,
            invitee: invitee
                ? { id: invitee.id, name: invitee.name, email: invitee.email }
                : { email: normalizedEmail, pending: true }
        });
    } catch (error) {
        console.error('Invite error:', error);
        res.status(500).json({ error: 'Failed to send invitation' });
    }
});

// Generate invite link
router.post('/invite-link', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId } = req.body;
        const { access, project, error } = await checkProjectAccess(projectId, req.user.id);
        if (!access) return res.status(403).json({ error });

        const inviteToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Store link invite (userId = null for link invites)
        await ProjectCollaborator.create({
            projectId,
            userId: 0, // Placeholder - will be updated when someone accepts
            invitedById: req.user.id,
            status: 'pending',
            inviteToken,
            inviteExpiresAt: expiresAt
        });

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${baseUrl}/invite/${inviteToken}`;

        res.json({
            success: true,
            inviteLink,
            expiresAt,
            token: inviteToken
        });
    } catch (error) {
        console.error('Generate invite link error:', error);
        res.status(500).json({ error: 'Failed to generate invite link' });
    }
});

// Accept invitation
router.post('/accept/:inviteToken', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { inviteToken } = req.params;

        const invite = await ProjectCollaborator.findOne({
            where: { inviteToken },
            include: [{ model: Project }]
        });

        if (!invite) {
            return res.status(404).json({ error: 'Invitation not found or expired' });
        }

        if (invite.inviteExpiresAt && new Date(invite.inviteExpiresAt) < new Date()) {
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        // For link invites (userId = 0), update with actual user
        if (invite.userId === 0) {
            invite.userId = req.user.id;
        } else if (invite.userId !== req.user.id) {
            return res.status(403).json({ error: 'This invitation is for another user' });
        }

        invite.status = 'accepted';
        invite.acceptedAt = new Date();
        invite.inviteToken = null; // Clear token after use
        await invite.save();

        await logActivity(invite.projectId, req.user.id, 'collaborator_accepted', 'user', req.user.id);

        res.json({
            success: true,
            message: 'You have joined the project!',
            project: invite.Project
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
});

// Decline invitation
router.post('/decline/:inviteToken', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { inviteToken } = req.params;

        const invite = await ProjectCollaborator.findOne({ where: { inviteToken } });
        if (!invite || invite.userId !== req.user.id) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        invite.status = 'declined';
        await invite.save();

        res.json({ success: true, message: 'Invitation declined' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline invitation' });
    }
});

// Remove collaborator
router.delete('/project/:projectId/user/:userId', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId, userId } = req.params;

        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Only owner can remove collaborators
        if (project.userId !== req.user.id && parseInt(userId) !== req.user.id) {
            return res.status(403).json({ error: 'Only project owner can remove collaborators' });
        }

        const collab = await ProjectCollaborator.findOne({
            where: { projectId, userId: parseInt(userId) }
        });

        if (!collab) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        collab.status = 'removed';
        await collab.save();

        await logActivity(projectId, req.user.id, 'collaborator_removed', 'user', parseInt(userId));

        res.json({ success: true, message: 'Collaborator removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove collaborator' });
    }
});

// Get pending invitations for current user
router.get('/invitations', authenticateToken, async (req, res) => {
    try {
        getModels();
        const invitations = await ProjectCollaborator.findAll({
            where: { userId: req.user.id, status: 'pending' },
            include: [
                { model: Project },
                { model: User, as: 'invitedBy', attributes: ['id', 'name', 'email', 'avatar'] }
            ],
            order: [['invitedAt', 'DESC']]
        });

        res.json(invitations.map(inv => ({
            id: inv.id,
            project: inv.Project,
            invitedBy: inv.invitedBy,
            invitedAt: inv.invitedAt,
            inviteToken: inv.inviteToken,
            expiresAt: inv.inviteExpiresAt
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to get invitations' });
    }
});

// Get shared projects (projects I'm collaborating on)
router.get('/shared', authenticateToken, async (req, res) => {
    try {
        getModels();
        const collaborations = await ProjectCollaborator.findAll({
            where: { userId: req.user.id, status: 'accepted' },
            include: [{
                model: Project,
                include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }]
            }],
            order: [['lastAccessedAt', 'DESC']]
        });

        res.json(collaborations.map(c => ({
            id: c.id,
            project: c.Project,
            role: c.role,
            joinedAt: c.acceptedAt,
            lastAccessedAt: c.lastAccessedAt
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to get shared projects' });
    }
});

// Get project activity feed
router.get('/project/:projectId/activity', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const { access, error } = await checkProjectAccess(projectId, req.user.id);
        if (!access) return res.status(403).json({ error });

        const activities = await ProjectActivity.findAll({
            where: { projectId },
            include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get activity feed' });
    }
});

// Update last accessed
router.post('/project/:projectId/access', authenticateToken, async (req, res) => {
    try {
        getModels();
        const { projectId } = req.params;

        await ProjectCollaborator.update(
            { lastAccessedAt: new Date() },
            { where: { projectId, userId: req.user.id, status: 'accepted' } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update access time' });
    }
});

module.exports = router;
