const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Team = require('../models/Team');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Add comment to task
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
exports.addComment = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { content } = req.body;

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to comment on this task', 403));
        }

        // Create comment
        const comment = await Comment.create(taskId, req.user.id, content);

        // Get comment with user details
        const commentWithUser = await Comment.findById(comment.id);

        res.status(201).json({
            success: true,
            data: commentWithUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all comments for a task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
exports.getTaskComments = async (req, res, next) => {
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

        // Get comments
        const comments = await Comment.findByTaskId(taskId);

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
exports.updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Check if comment exists
        let comment = await Comment.findById(id);
        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }

        // Check if user is the author of the comment
        if (comment.user_id !== req.user.id) {
            return next(new AppError('You can only update your own comments', 403));
        }

        // Update comment
        comment = await Comment.update(id, content);

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
exports.deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if comment exists
        const comment = await Comment.findById(id);
        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }

        // Check if user is the author of the comment
        if (comment.user_id !== req.user.id) {
            // If not the author, check if user is team admin
            const task = await Task.findById(comment.task_id);
            const teamMember = await Team.isMember(task.team_id, req.user.id);

            if (!teamMember || teamMember.role !== 'admin') {
                return next(new AppError('You can only delete your own comments', 403));
            }
        }

        // Delete comment
        await Comment.delete(id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
