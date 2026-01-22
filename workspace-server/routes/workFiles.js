const express = require('express');
const router = express.Router();
const { WorkFile, Project } = require('../models');
const { authenticate, logActivity } = require('../middleware/auth');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// @route   GET /api/work-files
// @desc    Get all files/folders for user (root level or by parentId)
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const { parentId, projectId, starred, type, search } = req.query;
        const where = { userId: req.user.id };

        // Filter by parent folder (null = root)
        if (parentId) {
            where.parentId = parentId;
        } else if (parentId === '' || parentId === 'null') {
            where.parentId = null;
        }

        // Filter by project
        if (projectId) {
            where.projectId = projectId;
        }

        // Filter starred only
        if (starred === 'true') {
            where.starred = true;
        }

        // Filter by type
        if (type) {
            where.type = type;
        }

        // Search by name
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const files = await WorkFile.findAll({
            where,
            include: [{ model: Project, attributes: ['id', 'name', 'color'], required: false }],
            order: [
                ['type', 'ASC'], // folders first
                ['starred', 'DESC'],
                ['name', 'ASC']
            ]
        });
        res.json(files);
    } catch (error) {
        logger.error('Get work files error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/work-files/tree
// @desc    Get full file tree structure
// @access  Private
router.get('/tree', authenticate, async (req, res) => {
    try {
        const files = await WorkFile.findAll({
            where: { userId: req.user.id },
            order: [
                ['type', 'ASC'],
                ['name', 'ASC']
            ]
        });

        // Build tree structure
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item.toJSON(),
                    children: item.type === 'folder' ? buildTree(items, item.id) : undefined
                }));
        };

        const tree = buildTree(files);
        res.json(tree);
    } catch (error) {
        logger.error('Get file tree error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/work-files/recent
// @desc    Get recent files
// @access  Private
router.get('/recent', authenticate, async (req, res) => {
    try {
        const files = await WorkFile.findAll({
            where: {
                userId: req.user.id,
                type: { [Op.ne]: 'folder' }
            },
            order: [['updatedAt', 'DESC']],
            limit: 10
        });
        res.json(files);
    } catch (error) {
        logger.error('Get recent files error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/work-files/stats/summary
// @desc    Get file statistics
// @access  Private
router.get('/stats/summary', authenticate, async (req, res) => {
    try {
        const [folders, files, links] = await Promise.all([
            WorkFile.count({ where: { userId: req.user.id, type: 'folder' } }),
            WorkFile.count({ where: { userId: req.user.id, type: 'file' } }),
            WorkFile.count({ where: { userId: req.user.id, type: 'link' } })
        ]);

        const totalSize = await WorkFile.sum('size', {
            where: { userId: req.user.id, type: 'file' }
        }) || 0;

        res.json({
            folders,
            files,
            links,
            total: folders + files + links,
            totalSize
        });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/work-files/:id
// @desc    Get single file/folder
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
    try {
        const file = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Project, required: false }]
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json(file);
    } catch (error) {
        logger.error('Get file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/work-files/:id/contents
// @desc    Get folder contents
// @access  Private
router.get('/:id/contents', authenticate, async (req, res) => {
    try {
        // First verify the folder exists and belongs to user
        const folder = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id, type: 'folder' }
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        const contents = await WorkFile.findAll({
            where: { parentId: folder.id, userId: req.user.id },
            order: [
                ['type', 'ASC'],
                ['starred', 'DESC'],
                ['name', 'ASC']
            ]
        });

        res.json(contents);
    } catch (error) {
        logger.error('Get folder contents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/work-files
// @desc    Create file or folder
// @access  Private
router.post('/', authenticate, logActivity('create', 'work-file'), async (req, res) => {
    try {
        const { name, type = 'file', fileType, url, size, parentId, projectId, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // If parentId provided, verify it exists and is a folder
        if (parentId) {
            const parent = await WorkFile.findOne({
                where: { id: parentId, userId: req.user.id, type: 'folder' }
            });
            if (!parent) {
                return res.status(400).json({ message: 'Parent folder not found' });
            }
        }

        // Build path array
        let path = [];
        if (parentId) {
            const parent = await WorkFile.findOne({ where: { id: parentId } });
            if (parent && parent.path) {
                try {
                    path = JSON.parse(parent.path);
                } catch (e) {
                    path = [];
                }
            }
            path.push(parentId);
        }

        const file = await WorkFile.create({
            name: name.trim(),
            type,
            fileType: type === 'folder' ? null : (fileType || 'document'),
            url,
            size,
            parentId: parentId || null,
            path: JSON.stringify(path),
            projectId,
            color: color || '#8b5cf6',
            userId: req.user.id
        });

        res.status(201).json(file);
    } catch (error) {
        logger.error('Create file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/work-files/:id
// @desc    Update file/folder
// @access  Private
router.put('/:id', authenticate, logActivity('update', 'work-file'), async (req, res) => {
    try {
        const file = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { name, fileType, url, size, projectId, color, starred } = req.body;

        await file.update({
            name: name !== undefined ? name.trim() : file.name,
            fileType: fileType !== undefined ? fileType : file.fileType,
            url: url !== undefined ? url : file.url,
            size: size !== undefined ? size : file.size,
            projectId: projectId !== undefined ? projectId : file.projectId,
            color: color !== undefined ? color : file.color,
            starred: starred !== undefined ? starred : file.starred
        });

        res.json(file);
    } catch (error) {
        logger.error('Update file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/work-files/:id/move
// @desc    Move file/folder to another folder
// @access  Private
router.put('/:id/move', authenticate, async (req, res) => {
    try {
        const file = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { parentId } = req.body;

        // Validate new parent
        if (parentId) {
            const parent = await WorkFile.findOne({
                where: { id: parentId, userId: req.user.id, type: 'folder' }
            });
            if (!parent) {
                return res.status(400).json({ message: 'Parent folder not found' });
            }

            // Prevent moving folder into itself or its children
            if (file.type === 'folder' && file.id === parentId) {
                return res.status(400).json({ message: 'Cannot move folder into itself' });
            }
        }

        // Update path
        let path = [];
        if (parentId) {
            const parent = await WorkFile.findOne({ where: { id: parentId } });
            if (parent && parent.path) {
                try {
                    path = JSON.parse(parent.path);
                } catch (e) {
                    path = [];
                }
            }
            path.push(parentId);
        }

        await file.update({
            parentId: parentId || null,
            path: JSON.stringify(path)
        });

        res.json(file);
    } catch (error) {
        logger.error('Move file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/work-files/:id/star
// @desc    Toggle star
// @access  Private
router.put('/:id/star', authenticate, async (req, res) => {
    try {
        const file = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        await file.update({ starred: !file.starred });
        res.json(file);
    } catch (error) {
        logger.error('Toggle star error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/work-files/:id
// @desc    Delete file/folder (and all children if folder)
// @access  Private
router.delete('/:id', authenticate, logActivity('delete', 'work-file'), async (req, res) => {
    try {
        const file = await WorkFile.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // If folder, delete all children recursively
        if (file.type === 'folder') {
            const deleteChildren = async (parentId) => {
                const children = await WorkFile.findAll({
                    where: { parentId, userId: req.user.id }
                });
                for (const child of children) {
                    if (child.type === 'folder') {
                        await deleteChildren(child.id);
                    }
                    await child.destroy();
                }
            };
            await deleteChildren(file.id);
        }

        await file.destroy();
        res.json({ message: 'File deleted' });
    } catch (error) {
        logger.error('Delete file error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
