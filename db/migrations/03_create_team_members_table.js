/**
 * Migration to create the team_members table
 */
exports.up = function (knex) {
    return knex.schema.createTable('team_members', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // Foreign keys
        table.uuid('team_id').notNullable();
        table.foreign('team_id').references('id').inTable('teams').onDelete('CASCADE');

        table.uuid('user_id').notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

        // Member role
        table.enum('role', ['admin', 'member']).notNullable().defaultTo('member');

        // Timestamps
        table.timestamp('joined_at').defaultTo(knex.fn.now());

        // Unique constraint to prevent duplicate memberships
        table.unique(['team_id', 'user_id']);
    });
};

/**
 * Migration to drop the team_members table
 */
exports.down = function (knex) {
    return knex.schema.dropTable('team_members');
};
