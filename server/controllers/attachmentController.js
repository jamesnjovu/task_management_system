const path = require('path');
const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const Team = require('../models/Team');
const { AppError } = require('../middleware/errorHandler');
const multer = require('multer');
const config = require('../config/config');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = Attachment.ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept all types of files
    cb(null, true);
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.MAX_FILE_SIZE // Max file size in bytes
    },
    fileFilter: fileFilter
}).single('file');

/**
 * @desc    Upload attachment to task
 * @route   POST /api/tasks/:taskId/attachments
 * @access  Private
 */
exports.uploadAttachment = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to upload to this task', 403));
        }

        // Handle file upload
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError(`File size exceeds the limit of ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`, 400));
                }
                return next(new AppError(err.message, 400));
            } else if (err) {
                return next(new AppError('Error uploading file', 500));
            }

            if (!req.file) {
                return next(new AppError('Please upload a file', 400));
            }

            // Create attachment record
            const attachment = await Attachment.create(taskId, req.user.id, req.file);

            res.status(201).json({
                success: true,
                data: attachment
            });
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all attachments for a task
 * @route   GET /api/tasks/:taskId/attachments
 * @access  Private
 */
exports.getTaskAttachments = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to view this task', 403));
        }

        // Get attachments
        const attachments = await Attachment.findByTaskId(taskId);

        res.status(200).json({
            success: true,
            count: attachments.length,
            data: attachments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download attachment
 * @route   GET /api/attachments/:id/download
 * @access  Private
 */
exports.downloadAttachment = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if attachment exists
        const attachment = await Attachment.findById(id);
        if (!attachment) {
            return next(new AppError('Attachment not found', 404));
        }

        // Check if user is a member of the team
        const task = await Task.findById(attachment.task_id);
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to download this attachment', 403));
        }

        // Send file
        res.download(attachment.file_path, attachment.file_name);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete attachment
 * @route   DELETE /api/attachments/:id
 * @access  Private
 */
exports.deleteAttachment = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if attachment exists
        const attachment = await Attachment.findById(id);
        if (!attachment) {
            return next(new AppError('Attachment not found', 404));
        }

        // Check if user is the uploader of the attachment
        if (attachment.uploaded_by !== req.user.id) {
            // If not the uploader, check if user is team admin
            const task = await Task.findById(attachment.task_id);
            const teamMember = await Team.isMember(task.team_id, req.user.id);

            if (!teamMember || teamMember.role !== 'admin') {
                return next(new AppError('You can only delete your own attachments', 403));
            }
        }

        // Delete attachment
        await Attachment.delete(id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
