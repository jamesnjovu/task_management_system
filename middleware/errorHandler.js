const { logger } = require('../utils/logger');
const config = require('../config/config');

/**
 * Custom error class for API errors
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Handle specific error types
    let error = { ...err };
    error.message = err.message;

    // Handle Postgres unique constraint error
    if (err.code === '23505') {
        const field = err.detail.match(/\((.*?)\)=/)[1];
        error = new AppError(`Duplicate field value: ${field}. Please use another value.`, 400);
    }

    // Handle Postgres foreign key constraint error
    if (err.code === '23503') {
        error = new AppError('Related resource not found.', 404);
    }

    // Send response based on environment
    if (config.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else if (config.NODE_ENV === 'production') {
        // Operational, trusted errors: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // Programming or unknown errors: don't leak error details
        logger.error('ERROR 💥', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

module.exports = {
    AppError,
    errorHandler
};
