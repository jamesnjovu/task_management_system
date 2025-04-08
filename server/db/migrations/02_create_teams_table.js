/**
 * Migration to create the teams table
 */
exports.up = function (knex) {
    return knex.schema.createTable('teams', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // Team details
        table.string('name', 50).notNullable();
        table.text('description');

        // Created by (reference to users table)
        table.uuid('created_by').notNullable();
        table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * Migration to drop the teams table
 */
exports.down = function (knex) {
    return knex.schema.dropTable('teams');
};
