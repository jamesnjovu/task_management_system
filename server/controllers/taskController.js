const Task = require('../models/Task');
const Team = require('../models/Team');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, teamId, assignedTo, dueDate } = req.body;

        // Check if team exists and user is a member
        const team = await Team.findById(teamId);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        const isMember = await Team.isMember(teamId, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Create task
        const task = await Task.create(
            {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                teamId,
                assignedTo,
                dueDate
            },
            req.user.id
        );

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all tasks for a team
 * @route   GET /api/tasks
 * @access  Private
 */
exports.getTasks = async (req, res, next) => {
    try {
        const { teamId, status, priority, assignedTo, search } = req.query;

        // Check if team exists and user is a member
        const team = await Team.findById(teamId);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        const isMember = await Team.isMember(teamId, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Get tasks with filters
        const tasks = await Task.findByTeamId(teamId, {
            status,
            priority,
            assignedTo,
            search
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
exports.getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to view this task', 403));
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res, next) => {
    console.log(req.body, 'update task')
    try {
        const { title, description, status, priority, assigned_to, due_date } = req.body;

        // Check if task exists
        let task = await Task.findById(req.params.id);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to update this task', 403));
        }

        // Update task
        task = await Task.update(task.id, {
            title,
            description,
            status,
            priority,
            assigned_to,  
            due_date      
        })

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
exports.deleteTask = async (req, res, next) => {
    try {
        // Check if task exists
        const task = await Task.findById(req.params.id);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const teamMember = await Team.isMember(task.team_id, req.user.id);
        if (!teamMember) {
            return next(new AppError('You are not authorized to delete this task', 403));
        }

        // Only creator or team admin can delete tasks
        if (task.created_by !== req.user.id && teamMember.role !== 'admin') {
            return next(new AppError('Only task creator or team admin can delete tasks', 403));
        }

        // Delete task
        await Task.delete(task.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update task status
 * @route   PUT /api/tasks/:id/status
 * @access  Private
 */
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Check if task exists
        let task = await Task.findById(req.params.id);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to update this task', 403));
        }

        // Update task status
        task = await Task.updateStatus(task.id, status);

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Assign task to user
 * @route   PUT /api/tasks/:id/assign
 * @access  Private
 */
exports.assignTask = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Check if task exists
        let task = await Task.findById(req.params.id);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(task.team_id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not authorized to update this task', 403));
        }

        // If assigning to someone, verify that person is a team member
        if (userId) {
            const assigneeIsMember = await Team.isMember(task.team_id, userId);
            if (!assigneeIsMember) {
                return next(new AppError('Assignee is not a member of this team', 400));
            }
        }

        // Assign task
        task = await Task.assignTo(task.id, userId || null);

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder tasks
 * @route   PUT /api/tasks/reorder
 * @access  Private
 */
exports.reorderTasks = async (req, res, next) => {
    try {
        const { teamId, status, taskIds } = req.body;

        // Check if team exists and user is a member
        const team = await Team.findById(teamId);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        const isMember = await Team.isMember(teamId, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Reorder tasks
        await Task.reorder(teamId, status, taskIds);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
