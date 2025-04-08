const winston = require('winston');
const config = require('../config/config');

// Define log format
const logFormat = winston.format.printf(
    ({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
    }
);

// Configure logger
const logger = winston.createLogger({
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        logFormat
    ),
    defaultMeta: { service: 'task-management-api' },
    transports: [
        // Write logs with level 'error' and below to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, also log to the console
if (config.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

// Create a stream object for morgan
const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = { logger, stream };
