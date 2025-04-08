const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware to validate request data based on express-validator schemas
 */
exports.validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Format error messages
            const errorMessages = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));

            return next(new AppError('Validation failed', 400, errorMessages));
        }

        next();
    };
};
