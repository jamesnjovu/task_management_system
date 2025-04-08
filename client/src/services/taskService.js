import axios from 'axios';

const API_URL = '/api/tasks';

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise} - Promise with the API response
 */
export const createTask = async (taskData) => {
    const response = await axios.post(API_URL, taskData);
    return response.data;
};

/**
 * Get all tasks for a team
 * @param {string} teamId - Team ID
 * @param {Object} filters - Optional filters
 * @returns {Promise} - Promise with the API response
 */
export const getTasks = async (teamId, filters = {}) => {
    const queryParams = new URLSearchParams({ teamId, ...filters }).toString();
    const response = await axios.get(`${API_URL}?${queryParams}`);
    return response.data;
};

/**
 * Get a task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise} - Promise with the API response
 */
export const getTaskById = async (taskId) => {
    const response = await axios.get(`${API_URL}/${taskId}`);
    return response.data;
};

/**
 * Update a task
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise} - Promise with the API response
 */
export const updateTask = async (taskId, taskData) => {
    const response = await axios.put(`${API_URL}/${taskId}`, taskData);
    return response.data;
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise} - Promise with the API response
 */
export const deleteTask = async (taskId) => {
    const response = await axios.delete(`${API_URL}/${taskId}`);
    return response.data;
};

/**
 * Update task status
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 * @returns {Promise} - Promise with the API response
 */
export const updateTaskStatus = async (taskId, status) => {
    const response = await axios.put(`${API_URL}/${taskId}/status`, { status });
    return response.data;
};

/**
 * Assign task to user
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID (or null to unassign)
 * @returns {Promise} - Promise with the API response
 */
export const assignTask = async (taskId, userId) => {
    const response = await axios.put(`${API_URL}/${taskId}/assign`, { userId });
    return response.data;
};

/**
 * Reorder tasks
 * @param {string} teamId - Team ID
 * @param {string} status - Status column
 * @param {Array} taskIds - Array of task IDs in new order
 * @returns {Promise} - Promise with the API response
 */
export const reorderTasks = async (teamId, status, taskIds) => {
    const response = await axios.put(`${API_URL}/reorder`, { teamId, status, taskIds });
    return response.data;
};

/**
 * Add comment to task
 * @param {string} taskId - Task ID
 * @param {string} content - Comment content
 * @returns {Promise} - Promise with the API response
 */
export const addComment = async (taskId, content) => {
    const response = await axios.post(`${API_URL}/${taskId}/comments`, { content });
    return response.data;
};

/**
 * Get task comments
 * @param {string} taskId - Task ID
 * @returns {Promise} - Promise with the API response
 */
export const getTaskComments = async (taskId) => {
    const response = await axios.get(`${API_URL}/${taskId}/comments`);
    return response.data;
};

/**
 * Upload attachment to task
 * @param {string} taskId - Task ID
 * @param {File} file - File to upload
 * @returns {Promise} - Promise with the API response
 */
export const uploadAttachment = async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/${taskId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

/**
 * Get task attachments
 * @param {string} taskId - Task ID
 * @returns {Promise} - Promise with the API response
 */
export const getTaskAttachments = async (taskId) => {
    const response = await axios.get(`${API_URL}/${taskId}/attachments`);
    return response.data;
};
