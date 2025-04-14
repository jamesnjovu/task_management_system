const { db } = require('../config/db');

/**
 * Task model for handling task-related database operations
 */
class Task {
    /**
     * Create a new task
     * @param {Object} taskData - Task data
     * @param {string} userId - User ID of task creator
     * @returns {Object} Created task
     */
    static async create(taskData, userId) {
        // Get highest position for the new task's status in the team
        const maxPosition = await db('tasks')
            .where({
                team_id: taskData.teamId,
                status: taskData.status
            })
            .max('position as maxPosition')
            .first();

        const position = maxPosition && maxPosition.maxPosition !== null
            ? maxPosition.maxPosition + 1
            : 0;

        // Insert task into database
        const [task] = await db('tasks').insert({
            title: taskData.title,
            description: taskData.description || null,
            status: taskData.status,
            priority: taskData.priority,
            team_id: taskData.teamId,
            created_by: userId,
            assigned_to: taskData.assignedTo || null,
            due_date: taskData.dueDate || null,
            position
        }).returning('*');

        return task;
    }

    /**
     * Find a task by ID
     * @param {string} id - Task ID
     * @returns {Object|null} Task object or null if not found
     */
    static async findById(id) {
        return await db('tasks')
            .where({ id })
            .first();
    }

    /**
     * Get all tasks for a team
     * @param {string} teamId - Team ID
     * @param {Object} filters - Optional filters
     * @returns {Array} Array of tasks
     */
    static async findByTeamId(teamId, filters = {}) {
        const query = db('tasks')
            .where('team_id', teamId)
            .orderBy('position', 'asc');

        // Apply filters
        if (filters.status) {
            query.where('status', filters.status);
        }

        if (filters.priority) {
            query.where('priority', filters.priority);
        }

        if (filters.assignedTo) {
            query.where('assigned_to', filters.assignedTo);
        }

        if (filters.search) {
            query.where(function () {
                this.where('title', 'ilike', `%${filters.search}%`)
                    .orWhere('description', 'ilike', `%${filters.search}%`);
            });
        }

        return await query;
    }

    /**
     * Get tasks assigned to a user
     * @param {string} userId - User ID
     * @returns {Array} Array of tasks
     */
    static async findByAssignedTo(userId) {
        return await db('tasks')
            .where('assigned_to', userId)
            .orderBy('due_date', 'asc');
    }

    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {Object} taskData - Task data to update
     * @returns {Object} Updated task
     */
    static async update(id, taskData) {
        console.log(taskData, 'taskData')
        const updateData = {};

        if (taskData.title) updateData.title = taskData.title;
        if (taskData.description !== undefined) updateData.description = taskData.description;
        if (taskData.status) updateData.status = taskData.status;
        if (taskData.priority) updateData.priority = taskData.priority;
        if (taskData.assigned_to) updateData.assigned_to = taskData.assigned_to;
        if (taskData.due_date) updateData.due_date = taskData.due_date;

        updateData.updated_at = db.fn.now();

        const [task] = await db('tasks')
            .where({ id })
            .update(updateData)
            .returning('*');

        return task;
    }

    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {boolean} Success or failure
     */
    static async delete(id) {
        await db('tasks')
            .where({ id })
            .delete();

        return true;
    }

    /**
     * Update task status
     * @param {string} id - Task ID
     * @param {string} status - New status
     * @returns {Object} Updated task
     */
    static async updateStatus(id, status) {
        // Get current task to determine if status is changing
        const currentTask = await db('tasks')
            .where({ id })
            .first();

        if (currentTask.status === status) {
            // Status not changing, just return the task
            return currentTask;
        }

        // Get highest position for the new status in the team
        const maxPosition = await db('tasks')
            .where({
                team_id: currentTask.team_id,
                status
            })
            .max('position as maxPosition')
            .first();

        const position = maxPosition && maxPosition.maxPosition !== null
            ? maxPosition.maxPosition + 1
            : 0;

        // Update task status and position
        const [task] = await db('tasks')
            .where({ id })
            .update({
                status,
                position,
                updated_at: db.fn.now()
            })
            .returning('*');

        return task;
    }

    /**
     * Assign a task to a user
     * @param {string} id - Task ID
     * @param {string|null} userId - User ID or null to unassign
     * @returns {Object} Updated task
     */
    static async assignTo(id, userId) {
        const [task] = await db('tasks')
            .where({ id })
            .update({
                assigned_to: userId,
                updated_at: db.fn.now()
            })
            .returning('*');

        return task;
    }

    /**
     * Reorder tasks within a status column
     * @param {string} teamId - Team ID
     * @param {string} status - Status column
     * @param {Array} taskIds - Array of task IDs in new order
     * @returns {boolean} Success or failure
     */
    static async reorder(teamId, status, taskIds) {
        // Begin transaction
        const trx = await db.transaction();

        try {
            // Update positions for each task
            await Promise.all(taskIds.map(async (taskId, index) => {
                await trx('tasks')
                    .where({
                        id: taskId,
                        team_id: teamId,
                        status
                    })
                    .update({
                        position: index,
                        updated_at: trx.fn.now()
                    });
            }));

            // Commit transaction
            await trx.commit();

            return true;
        } catch (error) {
            // Rollback transaction
            await trx.rollback();
            throw error;
        }
    }

    /**
     * Get task statistics for a team
     * @param {string} teamId - Team ID
     * @returns {Object} Task statistics
     */
    static async getTeamStats(teamId) {
        // Get counts by status
        const statusCounts = await db('tasks')
            .where('team_id', teamId)
            .select('status')
            .count('* as count')
            .groupBy('status');

        // Get counts by priority
        const priorityCounts = await db('tasks')
            .where('team_id', teamId)
            .select('priority')
            .count('* as count')
            .groupBy('priority');

        // Get counts by assigned user
        const assignedCounts = await db('tasks')
            .leftJoin('users', 'tasks.assigned_to', '=', 'users.id')
            .where('tasks.team_id', teamId)
            .select(
                'tasks.assigned_to',
                'users.username'
            )
            .count('tasks.id as count')
            .groupBy('tasks.assigned_to', 'users.username');

        // Format results
        const stats = {
            total: statusCounts.reduce((sum, item) => sum + Number(item.count), 0),
            byStatus: statusCounts.reduce((obj, item) => ({
                ...obj,
                [item.status]: Number(item.count)
            }), {}),
            byPriority: priorityCounts.reduce((obj, item) => ({
                ...obj,
                [item.priority]: Number(item.count)
            }), {}),
            byAssignee: assignedCounts.reduce((obj, item) => ({
                ...obj,
                [item.assigned_to || 'unassigned']: {
                    count: Number(item.count),
                    username: item.username || 'Unassigned'
                }
            }), {})
        };

        return stats;
    }
}

module.exports = Task;
