// Load environment variables
require('dotenv').config();

/**
 * Knex configuration file
 * This file is used by the Knex CLI for running migrations and seeds
 */
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'task_management',
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: './db/seeds',
        },
    },
    test: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: `${process.env.DB_NAME || 'task_management'}_test`,
        },
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: './db/seeds',
        },
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL || {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }, // For Heroku PostgreSQL
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
        },
    },
};
