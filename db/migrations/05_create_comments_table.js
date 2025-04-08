/**
 * Migration to create the comments table
 */
exports.up = function(knex) {
    return knex.schema.createTable('comments', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      
      // Comment content
      table.text('content').notNullable();
      
      // Foreign keys
      table.uuid('task_id').notNullable();
      table.foreign('task_id').references('id').inTable('tasks').onDelete('CASCADE');
      
      table.uuid('user_id').notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Timestamps
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  };
  
  /**
   * Migration to drop the comments table
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('comments');
  };