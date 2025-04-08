// Configuration settings for the application
module.exports = {
    // Node environment
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Server port
    PORT: process.env.PORT || 5000,

    // JWT settings
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

    // Database settings
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_NAME: process.env.DB_NAME || 'task_management',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'Qwerty12',

    // File upload settings
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',

    // API rate limiting
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window
};
