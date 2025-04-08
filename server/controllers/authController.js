const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return next(new AppError('User with this email already exists', 400));
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatarUrl: req.body.avatarUrl
        });

        // Generate token
        const token = User.generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
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

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findByEmail(email);
        if (!user) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Generate token
        const token = User.generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
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

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        // User is already available in req due to the protect middleware
        const user = req.user;

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
 * @desc    Change user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findByEmail(req.user.email);

        // Check current password
        const isMatch = await User.comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // Update password
        await User.updatePassword(user.id, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
