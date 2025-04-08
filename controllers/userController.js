const User = require('../models/User');
const Task = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email, firstName, lastName, avatarUrl } = req.body;

        // Update user
        const user = await User.update(req.user.id, {
            username,
            email,
            firstName,
            lastName,
            avatarUrl
        });

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's assigned tasks
 * @route   GET /api/users/tasks
 * @access  Private
 */
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.findByAssignedTo(req.user.id);

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        next(error);
    }
};
