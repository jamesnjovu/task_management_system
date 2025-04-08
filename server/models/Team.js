const { db } = require('../config/db');

/**
 * Team model for handling team-related database operations
 */
class Team {
    /**
     * Create a new team
     * @param {Object} teamData - Team data
     * @param {string} userId - User ID of team creator
     * @returns {Object} Created team
     */
    static async create(teamData, userId) {
        // Begin transaction
        const trx = await db.transaction();

        try {
            // Insert team into database
            const [team] = await trx('teams').insert({
                name: teamData.name,
                description: teamData.description || null,
                created_by: userId
            }).returning('*');

            // Add creator as team admin
            await trx('team_members').insert({
                team_id: team.id,
                user_id: userId,
                role: 'admin'
            });

            // Commit transaction
            await trx.commit();

            return team;
        } catch (error) {
            // Rollback transaction
            await trx.rollback();
            throw error;
        }
    }

    /**
     * Find a team by ID
     * @param {string} id - Team ID
     * @returns {Object|null} Team object or null if not found
     */
    static async findById(id) {
        return await db('teams')
            .where({ id })
            .first();
    }

    /**
     * Get all teams for a user
     * @param {string} userId - User ID
     * @returns {Array} Array of teams
     */
    static async findByUserId(userId) {
        return await db('teams')
            .join('team_members', 'teams.id', '=', 'team_members.team_id')
            .where('team_members.user_id', userId)
            .select(
                'teams.id',
                'teams.name',
                'teams.description',
                'teams.created_by',
                'teams.created_at',
                'teams.updated_at',
                'team_members.role'
            );
    }

    /**
     * Update a team
     * @param {string} id - Team ID
     * @param {Object} teamData - Team data to update
     * @returns {Object} Updated team
     */
    static async update(id, teamData) {
        const updateData = {};

        if (teamData.name) updateData.name = teamData.name;
        if (teamData.description !== undefined) updateData.description = teamData.description;

        updateData.updated_at = db.fn.now();

        const [team] = await db('teams')
            .where({ id })
            .update(updateData)
            .returning('*');

        return team;
    }

    /**
     * Delete a team
     * @param {string} id - Team ID
     * @returns {boolean} Success or failure
     */
    static async delete(id) {
        await db('teams')
            .where({ id })
            .delete();

        return true;
    }

    /**
     * Add a member to a team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID
     * @param {string} role - Member role ('admin' or 'member')
     * @returns {Object} Team member
     */
    static async addMember(teamId, userId, role = 'member') {
        const [teamMember] = await db('team_members')
            .insert({
                team_id: teamId,
                user_id: userId,
                role
            })
            .returning('*');

        return teamMember;
    }

    /**
     * Remove a member from a team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID
     * @returns {boolean} Success or failure
     */
    static async removeMember(teamId, userId) {
        await db('team_members')
            .where({
                team_id: teamId,
                user_id: userId
            })
            .delete();

        return true;
    }

    /**
     * Update a team member's role
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID
     * @param {string} role - New role ('admin' or 'member')
     * @returns {Object} Updated team member
     */
    static async updateMemberRole(teamId, userId, role) {
        const [teamMember] = await db('team_members')
            .where({
                team_id: teamId,
                user_id: userId
            })
            .update({
                role
            })
            .returning('*');

        return teamMember;
    }

    /**
     * Get all members of a team
     * @param {string} teamId - Team ID
     * @returns {Array} Array of team members with user details
     */
    static async getMembers(teamId) {
        return await db('team_members')
            .join('users', 'team_members.user_id', '=', 'users.id')
            .where('team_members.team_id', teamId)
            .select(
                'users.id',
                'users.username',
                'users.email',
                'users.first_name',
                'users.last_name',
                'users.avatar_url',
                'team_members.role',
                'team_members.joined_at'
            );
    }

    /**
     * Check if a user is a member of a team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID
     * @returns {Object|null} Team member or null if not a member
     */
    static async isMember(teamId, userId) {
        return await db('team_members')
            .where({
                team_id: teamId,
                user_id: userId
            })
            .first();
    }
}

module.exports = Team;
