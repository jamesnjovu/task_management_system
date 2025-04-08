const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { AppError } = require('./errorHandler');
const config = require('../config/config');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return next(new AppError('Not authorized to access this route', 401));
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.JWT_SECRET);

            // Check if user still exists
            const user = await db('users').where({ id: decoded.id }).first();

            if (!user) {
                return next(new AppError('The user belonging to this token no longer exists', 401));
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            return next(new AppError('Not authorized to access this route', 401));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to restrict access to certain roles
 */
exports.restrictTo = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('User not found in request', 500));
            }

            // For team-based resources, check team membership and role
            if (req.params.teamId) {
                const teamMember = await db('team_members')
                    .where({
                        team_id: req.params.teamId,
                        user_id: req.user.id
                    })
                    .first();

                if (!teamMember) {
                    return next(new AppError('You are not a member of this team', 403));
                }

                if (!roles.includes(teamMember.role)) {
                    return next(new AppError('You do not have permission to perform this action', 403));
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check if the user is the owner of a resource
 */
exports.isOwner = (resource) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[`${resource}Id`];
            const resourceTable = resource + 's'; // Convert to plural for table name

            const item = await db(resourceTable).where({ id: resourceId }).first();

            if (!item) {
                return next(new AppError(`${resource} not found`, 404));
            }

            // Check if user is the creator
            if (item.created_by !== req.user.id) {
                return next(new AppError('You are not authorized to perform this action', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
