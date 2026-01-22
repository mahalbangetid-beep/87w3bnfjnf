const express = require('express');
const router = express.Router();
const { Note, Project } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   GET /api/notes
// @desc    Get all notes for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { archived } = req.query;
        const where = { userId: req.user.id };

        if (archived !== undefined) {
            where.archived = archived === 'true';
        }

        const notes = await Note.findAll({
            where,
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }],
            order: [
                ['pinned', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });
        res.json(notes);
    } catch (error) {
        logger.error('Get notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const note = await Note.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Project }]
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        logger.error('Get note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/notes
// @desc    Create note
// @access  Private
router.post('/', authenticate, logActivity('create', 'note'), async (req, res) => {
    try {
        const { title, content, color, labels, pinned, projectId } = req.body;

        // Validate labels is array of strings
        if (labels && (!Array.isArray(labels) || !labels.every(l => typeof l === 'string' && l.length <= 50))) {
            return res.status(400).json({ message: 'Labels must be an array of strings (max 50 chars each)' });
        }
        if (labels && labels.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 labels allowed' });
        }

        // Validate color format
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        const note = await Note.create({
            title,
            content,
            color: color || '#8b5cf6',
            labels: labels || [],
            pinned: pinned || false,
            projectId,
            userId: req.user.id
        });

        res.status(201).json(note);
    } catch (error) {
        logger.error('Create note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'note'), async (req, res) => {
    try {
        const note = await Note.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const { title, content, color, labels, pinned, archived, projectId } = req.body;

        // Validate labels if provided
        if (labels && (!Array.isArray(labels) || !labels.every(l => typeof l === 'string' && l.length <= 50))) {
            return res.status(400).json({ message: 'Labels must be an array of strings (max 50 chars each)' });
        }
        if (labels && labels.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 labels allowed' });
        }

        // Validate color format if provided
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        await note.update({
            title,
            content,
            color,
            labels,
            pinned,
            archived,
            projectId
        });

        // Reload with Project relation for consistent response
        const updatedNote = await Note.findOne({
            where: { id: note.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedNote);
    } catch (error) {
        logger.error('Update note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'note'), async (req, res) => {
    try {
        const note = await Note.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.destroy();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        logger.error('Delete note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id/pin
// @desc    Toggle pin
// @access  Private
router.put('/:id/pin', authenticate, async (req, res) => {
    try {
        const note = await Note.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.update({ pinned: !note.pinned });

        // Reload with relations to maintain consistency
        const updatedNote = await Note.findOne({
            where: { id: note.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedNote);
    } catch (error) {
        logger.error('Toggle pin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id/archive
// @desc    Toggle archive
// @access  Private
router.put('/:id/archive', authenticate, async (req, res) => {
    try {
        const note = await Note.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        await note.update({ archived: !note.archived });

        // Reload with relations to maintain consistency
        const updatedNote = await Note.findOne({
            where: { id: note.id },
            include: [{ model: Project, attributes: ['id', 'name', 'color'] }]
        });

        res.json(updatedNote);
    } catch (error) {
        logger.error('Toggle archive error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
