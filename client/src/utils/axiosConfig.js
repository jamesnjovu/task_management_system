import axios from 'axios';

// Configure axios with default settings
const setupAxios = () => {
    // Set the API base URL
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Check if a token exists in localStorage and set the Authorization header
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Set up request interceptor
    axios.interceptors.request.use(
        (config) => {
            // Refresh token from localStorage for each request
            // This ensures we always have the latest token, even if it was updated in another tab
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Set up response interceptor to handle auth errors
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // Handle authentication errors
            if (error.response && error.response.status === 401) {
                // Clear token from localStorage
                localStorage.removeItem('token');

                // Clear auth header
                delete axios.defaults.headers.common['Authorization'];

                // You can dispatch an event here if needed
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxios;
