/**
 * Migration to create the users table
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // User details
        table.string('username', 30).notNullable().unique();
        table.string('email', 100).notNullable().unique();
        table.string('password', 100).notNullable();

        // Optional profile information
        table.string('first_name', 50);
        table.string('last_name', 50);
        table.string('avatar_url');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * Migration to drop the users table
 */
exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
