const { db } = require('../config/db');

/**
 * Comment model for handling comment-related database operations
 */
class Comment {
    /**
     * Create a new comment
     * @param {string} taskId - Task ID
     * @param {string} userId - User ID
     * @param {string} content - Comment content
     * @returns {Object} Created comment
     */
    static async create(taskId, userId, content) {
        const [comment] = await db('comments').insert({
            task_id: taskId,
            user_id: userId,
            content
        }).returning('*');

        return comment;
    }

    /**
     * Find comments by task ID
     * @param {string} taskId - Task ID
     * @returns {Array} Array of comments
     */
    static async findByTaskId(taskId) {
        return await db('comments')
            .join('users', 'comments.user_id', '=', 'users.id')
            .where('comments.task_id', taskId)
            .select(
                'comments.id',
                'comments.content',
                'comments.created_at',
                'comments.updated_at',
                'users.id as user_id',
                'users.username',
                'users.avatar_url'
            )
            .orderBy('comments.created_at', 'asc');
    }

    /**
     * Find a comment by ID
     * @param {string} id - Comment ID
     * @returns {Object|null} Comment object or null if not found
     */
    static async findById(id) {
        return await db('comments')
            .where({ id })
            .first();
    }

    /**
     * Update a comment
     * @param {string} id - Comment ID
     * @param {string} content - New content
     * @returns {Object} Updated comment
     */
    static async update(id, content) {
        const [comment] = await db('comments')
            .where({ id })
            .update({
                content,
                updated_at: db.fn.now()
            })
            .returning('*');

        return comment;
    }

    /**
     * Delete a comment
     * @param {string} id - Comment ID
     * @returns {boolean} Success or failure
     */
    static async delete(id) {
        await db('comments')
            .where({ id })
            .delete();

        return true;
    }
}

module.exports = Comment;
