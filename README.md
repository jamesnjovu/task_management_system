# Task Management System (Agile-Style)

A web-based task management system that allows teams to create, assign, and track tasks in an agile-style workflow. The system includes features for task creation, prioritization, progress tracking, and collaboration.

## Features

- **User Management:**
  - User registration and login
  - User profiles with personal information
  - Secure authentication using JWT

- **Team Management:**
  - Create and manage teams
  - Add/remove team members
  - Assign roles to team members (admin, member)

- **Task Management:**
  - Create, update, and delete tasks
  - Assign tasks to team members
  - Set task priorities (high, medium, low)
  - Move tasks across columns (todo, in progress, done)
  - Drag-and-drop task reordering

- **Collaboration:**
  - Comment on tasks to provide updates or feedback
  - Upload and download attachments
  - View task history and progress

- **Dashboard:**
  - View team statistics and task distribution
  - See assigned tasks and recent activity

## Technologies Used

- **Backend:**
  - Node.js with Express.js
  - PostgreSQL database with Knex.js ORM
  - JWT authentication
  - Multer for file uploads

- **Frontend:**
  - React.js (to be implemented)
  - Axios for API requests
  - React DnD for drag-and-drop functionality
  - React Router for navigation

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jamesnjovu/task_management_system.git
   cd task-management-system
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file with your database credentials and other settings
   ```

4. Create the database:
   ```bash
   createdb task_management
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Seed the database with initial data (optional):
   ```bash
   npm run seed
   ```

7. Start the server:
   ```bash
   npm run dev
   ```

### API Documentation

The API is organized around RESTful principles. 
For detailed API documentation, refer to the [API Documentation](docs/api-documentation.md) file.

## Project Structure

```
server/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── db/               # Database migrations and seeds
├── middleware/       # Express middleware
├── models/           # Database models
├── routes/           # API routes
├── utils/            # Utility functions
├── app.js            # Express app setup
├── server.js         # Server entry point
└── knexfile.js       # Knex configuration
```

## Database Schema

The system uses a relational database with the following main tables:

- `users`: Stores user information
- `teams`: Stores team information
- `team_members`: Manages the many-to-many relationship between users and teams
- `tasks`: Stores task information
- `comments`: Stores comments on tasks
- `attachments`: Stores information about uploaded files

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

For production deployment, follow these steps:

1. Set up your production environment variables
2. Build the frontend (if applicable)
3. Run production migrations
4. Start the server in production mode

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was created as part of a course assignment
- Special thanks to the professors and teaching assistants for their guidance