import axios from 'axios';

const API_URL = '/api/teams';

/**
 * Create a new team
 * @param {Object} teamData - Team data
 * @returns {Promise} - Promise with the API response
 */
export const createTeam = async (teamData) => {
    const response = await axios.post(API_URL, teamData);
    return response.data;
};

/**
 * Get all teams for the current user
 * @returns {Promise} - Promise with the API response
 */
export const getMyTeams = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

/**
 * Get a team by ID
 * @param {string} teamId - Team ID
 * @returns {Promise} - Promise with the API response
 */
export const getTeamById = async (teamId) => {
    const response = await axios.get(`${API_URL}/${teamId}`);
    return response.data;
};

/**
 * Update a team
 * @param {string} teamId - Team ID
 * @param {Object} teamData - Updated team data
 * @returns {Promise} - Promise with the API response
 */
export const updateTeam = async (teamId, teamData) => {
    const response = await axios.put(`${API_URL}/${teamId}`, teamData);
    return response.data;
};

/**
 * Delete a team
 * @param {string} teamId - Team ID
 * @returns {Promise} - Promise with the API response
 */
export const deleteTeam = async (teamId) => {
    const response = await axios.delete(`${API_URL}/${teamId}`);
    return response.data;
};

/**
 * Get team members
 * @param {string} teamId - Team ID
 * @returns {Promise} - Promise with the API response
 */
export const getTeamMembers = async (teamId) => {
    const response = await axios.get(`${API_URL}/${teamId}/members`);
    return response.data;
};

/**
 * Add a member to the team
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @param {string} role - Member role ('admin' or 'member')
 * @returns {Promise} - Promise with the API response
 */
export const addTeamMember = async (teamId, userId, role = 'member') => {
    const response = await axios.post(`${API_URL}/${teamId}/members`, { userId, role });
    return response.data;
};

/**
 * Remove a member from the team
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @returns {Promise} - Promise with the API response
 */
export const removeTeamMember = async (teamId, userId) => {
    const response = await axios.delete(`${API_URL}/${teamId}/members/${userId}`);
    return response.data;
};

/**
 * Update a member's role
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @param {string} role - New role ('admin' or 'member')
 * @returns {Promise} - Promise with the API response
 */
export const updateMemberRole = async (teamId, userId, role) => {
    const response = await axios.put(`${API_URL}/${teamId}/members/${userId}`, { role });
    return response.data;
};

/**
 * Get team statistics
 * @param {string} teamId - Team ID
 * @returns {Promise} - Promise with the API response
 */
export const getTeamStats = async (teamId) => {
    const response = await axios.get(`${API_URL}/${teamId}/stats`);
    return response.data;
};
