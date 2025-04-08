/**
 * Migration to create the tasks table
 */
exports.up = function (knex) {
    return knex.schema.createTable('tasks', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // Task details
        table.string('title', 100).notNullable();
        table.text('description');
        table.enum('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo');
        table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');

        // Foreign keys
        table.uuid('team_id').notNullable();
        table.foreign('team_id').references('id').inTable('teams').onDelete('CASCADE');

        table.uuid('created_by').notNullable();
        table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');

        table.uuid('assigned_to');
        table.foreign('assigned_to').references('id').inTable('users').onDelete('SET NULL');

        // Additional metadata
        table.timestamp('due_date');
        table.integer('position').notNullable().defaultTo(0);

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * Migration to drop the tasks table
 */
exports.down = function (knex) {
    return knex.schema.dropTable('tasks');
};
