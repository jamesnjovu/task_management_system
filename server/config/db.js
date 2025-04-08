const knex = require('knex');
const config = require('./config');
const { logger } = require('../utils/logger');

// Set up knex with connection based on environment
const knexConfig = {
    development: {
        client: 'pg',
        connection: {
            host: config.DB_HOST,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: '../db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: '../db/seeds',
        },
        debug: true,
    },
    test: {
        client: 'pg',
        connection: {
            host: config.DB_HOST,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: `${config.DB_NAME}_test`,
        },
        migrations: {
            directory: '../db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: '../db/seeds',
        },
    },
    production: {
        client: 'pg',
        connection: {
            host: config.DB_HOST,
            port: config.DB_PORT,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
            ssl: { rejectUnauthorized: false }, // For Heroku PostgreSQL
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: '../db/migrations',
            tableName: 'knex_migrations',
        },
    },
};

// Initialize knex with proper configuration
const environment = config.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

// Test connection
const testConnection = async () => {
    try {
        await db.raw('SELECT 1');
        logger.info('Database connection established');
        return true;
    } catch (error) {
        logger.error('Database connection failed:', error);
        return false;
    }
};

module.exports = {
    db,
    testConnection,
    knexConfig,
};
