/**
 * Migration to create the attachments table
 */
exports.up = function (knex) {
    return knex.schema.createTable('attachments', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // Attachment metadata
        table.string('file_name').notNullable();
        table.string('file_path').notNullable();
        table.string('file_type');
        table.integer('file_size').notNullable();

        // Foreign keys
        table.uuid('task_id').notNullable();
        table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');

        table.uuid('uploaded_by').notNullable();
        table.foreign('uploaded_by').references('id').inTable('users').onDelete('CASCADE');

        // Timestamps
        table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    });
};

/**
 * Migration to drop the attachments table
 */
exports.down = function (knex) {
    return knex.schema.dropTable('attachments');
};
