const bcrypt = require('bcryptjs');

/**
 * Seed file to populate the database with initial test data
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('attachments').del();
    await knex('comments').del();
    await knex('tasks').del();
    await knex('team_members').del();
    await knex('teams').del();
    await knex('users').del();

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await knex('users').insert([
        {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            first_name: 'Admin',
            last_name: 'User'
        },
        {
            username: 'john',
            email: 'john@example.com',
            password: hashedPassword,
            first_name: 'John',
            last_name: 'Doe'
        },
        {
            username: 'jane',
            email: 'jane@example.com',
            password: hashedPassword,
            first_name: 'Jane',
            last_name: 'Smith'
        }
    ]).returning('*');

    // Create test teams
    const teams = await knex('teams').insert([
        {
            name: 'Development Team',
            description: 'Main development team for the project',
            created_by: users[0].id
        },
        {
            name: 'Design Team',
            description: 'UI/UX design team',
            created_by: users[0].id
        }
    ]).returning('*');

    // Add team members
    await knex('team_members').insert([
        {
            team_id: teams[0].id,
            user_id: users[0].id,
            role: 'admin'
        },
        {
            team_id: teams[0].id,
            user_id: users[1].id,
            role: 'member'
        },
        {
            team_id: teams[0].id,
            user_id: users[2].id,
            role: 'member'
        },
        {
            team_id: teams[1].id,
            user_id: users[0].id,
            role: 'admin'
        },
        {
            team_id: teams[1].id,
            user_id: users[2].id,
            role: 'member'
        }
    ]);

    // Create test tasks
    const tasks = await knex('tasks').insert([
        {
            title: 'Set up project structure',
            description: 'Initialize the repository and create basic project structure',
            status: 'done',
            priority: 'high',
            team_id: teams[0].id,
            created_by: users[0].id,
            assigned_to: users[1].id,
            position: 0
        },
        {
            title: 'Implement user authentication',
            description: 'Create API endpoints for user registration and login',
            status: 'in_progress',
            priority: 'high',
            team_id: teams[0].id,
            created_by: users[0].id,
            assigned_to: users[1].id,
            position: 0
        },
        {
            title: 'Design UI mockups',
            description: 'Create UI mockups for the main pages',
            status: 'todo',
            priority: 'medium',
            team_id: teams[1].id,
            created_by: users[0].id,
            assigned_to: users[2].id,
            position: 0
        },
        {
            title: 'Implement team management',
            description: 'Create API endpoints for team management',
            status: 'todo',
            priority: 'medium',
            team_id: teams[0].id,
            created_by: users[0].id,
            assigned_to: null,
            position: 1
        }
    ]).returning('*');

    // Create test comments
    await knex('comments').insert([
        {
            task_id: tasks[0].id,
            user_id: users[0].id,
            content: 'Project structure looks good!'
        },
        {
            task_id: tasks[0].id,
            user_id: users[1].id,
            content: 'Thanks, I followed the recommended best practices'
        },
        {
            task_id: tasks[1].id,
            user_id: users[1].id,
            content: 'I\'m working on this now, should be done by tomorrow'
        }
    ]);
};
