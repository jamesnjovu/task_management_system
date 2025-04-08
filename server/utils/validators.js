const { body, param, query } = require('express-validator');

/**
 * Validation schemas for various routes
 */
const validators = {
    // User validation schemas
    user: {
        register: [
            body('username')
                .trim()
                .notEmpty().withMessage('Username is required')
                .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
            body('email')
                .trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Please provide a valid email address'),
            body('password')
                .trim()
                .notEmpty().withMessage('Password is required')
                .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
                .matches(/\d/).withMessage('Password must contain at least one number')
                .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
        ],
        login: [
            body('email')
                .trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Please provide a valid email address'),
            body('password')
                .trim()
                .notEmpty().withMessage('Password is required')
        ],
        update: [
            body('username')
                .optional()
                .trim()
                .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
            body('email')
                .optional()
                .trim()
                .isEmail().withMessage('Please provide a valid email address')
        ],
        changePassword: [
            body('currentPassword')
                .trim()
                .notEmpty().withMessage('Current password is required'),
            body('newPassword')
                .trim()
                .notEmpty().withMessage('New password is required')
                .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
                .matches(/\d/).withMessage('New password must contain at least one number')
                .matches(/[a-zA-Z]/).withMessage('New password must contain at least one letter')
        ]
    },

    // Team validation schemas
    team: {
        create: [
            body('name')
                .trim()
                .notEmpty().withMessage('Team name is required')
                .isLength({ min: 3, max: 50 }).withMessage('Team name must be between 3 and 50 characters'),
            body('description')
                .optional()
                .trim()
                .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
        ],
        update: [
            body('name')
                .optional()
                .trim()
                .isLength({ min: 3, max: 50 }).withMessage('Team name must be between 3 and 50 characters'),
            body('description')
                .optional()
                .trim()
                .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
        ],
        addMember: [
            body('userId')
                .trim()
                .notEmpty().withMessage('User ID is required'),
            body('role')
                .trim()
                .notEmpty().withMessage('Role is required')
                .isIn(['admin', 'member']).withMessage('Role must be either admin or member')
        ]
    },

    // Task validation schemas
    task: {
        create: [
            body('title')
                .trim()
                .notEmpty().withMessage('Task title is required')
                .isLength({ min: 3, max: 100 }).withMessage('Task title must be between 3 and 100 characters'),
            body('description')
                .optional()
                .trim()
                .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
            body('status')
                .trim()
                .notEmpty().withMessage('Status is required')
                .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
            body('priority')
                .trim()
                .notEmpty().withMessage('Priority is required')
                .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
            body('teamId')
                .trim()
                .notEmpty().withMessage('Team ID is required'),
            body('assignedTo')
                .optional()
                .trim()
        ],
        update: [
            body('title')
                .optional()
                .trim()
                .isLength({ min: 3, max: 100 }).withMessage('Task title must be between 3 and 100 characters'),
            body('description')
                .optional()
                .trim()
                .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
            body('status')
                .optional()
                .trim()
                .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),
            body('priority')
                .optional()
                .trim()
                .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
            body('assignedTo')
                .optional()
                .trim()
        ],
        updateStatus: [
            body('status')
                .trim()
                .notEmpty().withMessage('Status is required')
                .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done')
        ],
        assignTask: [
            body('userId')
                .trim()
                .notEmpty().withMessage('User ID is required')
        ]
    },

    // Comment validation schemas
    comment: {
        create: [
            body('content')
                .trim()
                .notEmpty().withMessage('Comment content is required')
                .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
        ]
    },

    // Common validation for IDs
    id: [
        param('id')
            .trim()
            .notEmpty().withMessage('ID is required')
            .isUUID(4).withMessage('Invalid ID format')
    ]
};

module.exports = validators;
