const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Attachment model for handling attachment-related database operations
 */
class Attachment {
    /**
     * Create a new attachment
     * @param {string} taskId - Task ID
     * @param {string} userId - User ID
     * @param {Object} fileData - File data
     * @returns {Object} Created attachment
     */
    static async create(taskId, userId, fileData) {
        const [attachment] = await db('attachments').insert({
            task_id: taskId,
            uploaded_by: userId,
            file_name: fileData.originalname,
            file_path: fileData.path,
            file_type: fileData.mimetype,
            file_size: fileData.size
        }).returning('*');

        return attachment;
    }

    /**
     * Find attachments by task ID
     * @param {string} taskId - Task ID
     * @returns {Array} Array of attachments
     */
    static async findByTaskId(taskId) {
        return await db('attachments')
            .join('users', 'attachments.uploaded_by', '=', 'users.id')
            .where('attachments.task_id', taskId)
            .select(
                'attachments.id',
                'attachments.file_name',
                'attachments.file_path',
                'attachments.file_type',
                'attachments.file_size',
                'attachments.uploaded_at',
                'users.id as user_id',
                'users.username'
            )
            .orderBy('attachments.uploaded_at', 'desc');
    }

    /**
     * Find an attachment by ID
     * @param {string} id - Attachment ID
     * @returns {Object|null} Attachment object or null if not found
     */
    static async findById(id) {
        return await db('attachments')
            .where({ id })
            .first();
    }

    /**
     * Delete an attachment
     * @param {string} id - Attachment ID
     * @returns {boolean} Success or failure
     */
    static async delete(id) {
        // Get attachment details
        const attachment = await this.findById(id);

        if (!attachment) {
            return false;
        }

        // Delete file from filesystem
        try {
            fs.unlinkSync(attachment.file_path);
        } catch (error) {
            console.error('Error deleting file:', error);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await db('attachments')
            .where({ id })
            .delete();

        return true;
    }

    /**
     * Create upload directory if it doesn't exist
     * @returns {string} Upload directory path
     */
    static ensureUploadDir() {
        const uploadDir = path.resolve(config.UPLOAD_PATH);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        return uploadDir;
    }
}

module.exports = Attachment;
