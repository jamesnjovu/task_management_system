const Team = require('../models/Team');
const Task = require('../models/Task');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
exports.createTeam = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Create team
        const team = await Team.create({ name, description }, req.user.id);

        res.status(201).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all teams for current user
 * @route   GET /api/teams
 * @access  Private
 */
exports.getMyTeams = async (req, res, next) => {
    try {
        const teams = await Team.findByUserId(req.user.id);

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get team by ID
 * @route   GET /api/teams/:id
 * @access  Private
 */
exports.getTeamById = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(team.id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update team
 * @route   PUT /api/teams/:id
 * @access  Private (Team Admin)
 */
exports.updateTeam = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Check if team exists
        let team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is an admin of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember || teamMember.role !== 'admin') {
            return next(new AppError('Only team admins can update team details', 403));
        }

        // Update team
        team = await Team.update(team.id, { name, description });

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private (Team Admin)
 */
exports.deleteTeam = async (req, res, next) => {
    try {
        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is an admin of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember || teamMember.role !== 'admin') {
            return next(new AppError('Only team admins can delete the team', 403));
        }

        // Delete team
        await Team.delete(team.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get team members
 * @route   GET /api/teams/:id/members
 * @access  Private (Team Member)
 */
exports.getTeamMembers = async (req, res, next) => {
    try {
        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(team.id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Get team members
        const members = await Team.getMembers(team.id);

        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add member to team
 * @route   POST /api/teams/:id/members
 * @access  Private (Team Admin)
 */
exports.addTeamMember = async (req, res, next) => {
    try {
        const { email, userId, role } = req.body;
        let userToAdd;

        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is an admin of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember || teamMember.role !== 'admin') {
            return next(new AppError('Only team admins can add members', 403));
        }

        // Find user by email if email is provided, otherwise use userId
        if (email) {
            userToAdd = await User.findByEmail(email);
            if (!userToAdd) {
                return next(new AppError('User with this email not found', 404));
            }
        } else if (userId) {
            userToAdd = await User.findById(userId);
            if (!userToAdd) {
                return next(new AppError('User not found', 404));
            }
        } else {
            return next(new AppError('Email or userId is required', 400));
        }

        // Check if user is already a member
        const existingMember = await Team.isMember(team.id, userToAdd.id);
        if (existingMember) {
            return next(new AppError('User is already a member of this team', 400));
        }

        // Add member to team
        const newMember = await Team.addMember(team.id, userToAdd.id, role || 'member');

        res.status(201).json({
            success: true,
            data: newMember
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove member from team
 * @route   DELETE /api/teams/:id/members/:userId
 * @access  Private (Team Admin)
 */
exports.removeTeamMember = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is an admin of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember || teamMember.role !== 'admin') {
            return next(new AppError('Only team admins can remove members', 403));
        }

        // Prevent removing the last admin
        if (userId === req.user.id) {
            const adminCount = await db('team_members')
                .where({ team_id: team.id, role: 'admin' })
                .count('* as count')
                .first();

            if (parseInt(adminCount.count) <= 1) {
                return next(new AppError('Cannot remove the last admin from the team', 400));
            }
        }

        // Remove member from team
        await Team.removeMember(team.id, userId);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update member role
 * @route   PUT /api/teams/:id/members/:userId
 * @access  Private (Team Admin)
 */
exports.updateMemberRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is an admin of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember || teamMember.role !== 'admin') {
            return next(new AppError('Only team admins can update member roles', 403));
        }

        // Check if member exists
        const member = await Team.isMember(team.id, userId);
        if (!member) {
            return next(new AppError('User is not a member of this team', 404));
        }

        // Prevent downgrading the last admin
        if (userId === req.user.id && role !== 'admin') {
            const adminCount = await db('team_members')
                .where({ team_id: team.id, role: 'admin' })
                .count('* as count')
                .first();

            if (parseInt(adminCount.count) <= 1) {
                return next(new AppError('Cannot downgrade the last admin of the team', 400));
            }
        }

        // Update member role
        const updatedMember = await Team.updateMemberRole(team.id, userId, role);

        res.status(200).json({
            success: true,
            data: updatedMember
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get team statistics
 * @route   GET /api/teams/:id/stats
 * @access  Private (Team Member)
 */
exports.getTeamStats = async (req, res, next) => {
    try {
        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is a member of the team
        const isMember = await Team.isMember(team.id, req.user.id);
        if (!isMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Get team statistics
        const stats = await Task.getTeamStats(team.id);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user's role in a team
 * @route   GET /api/teams/:id/role
 * @access  Private
 */
exports.getCurrentUserRole = async (req, res, next) => {
    try {
        // Check if team exists
        const team = await Team.findById(req.params.id);
        if (!team) {
            return next(new AppError('Team not found', 404));
        }

        // Check if user is a member of the team
        const teamMember = await Team.isMember(team.id, req.user.id);
        if (!teamMember) {
            return next(new AppError('You are not a member of this team', 403));
        }

        // Return user's role
        res.status(200).json({
            success: true,
            data: {
                role: teamMember.role
            }
        });
    } catch (error) {
        next(error);
    }
};
