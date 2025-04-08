import axios from 'axios';

const API_URL = '/api/users';

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - Promise with the API response
 */
export const updateProfile = async (profileData) => {
    const response = await axios.put(`${API_URL}/profile`, profileData);
    return response.data;
};

/**
 * Get tasks assigned to the current user
 * @returns {Promise} - Promise with the API response
 */
export const getMyTasks = async () => {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise} - Promise with the API response
 */
export const getUserById = async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
};
