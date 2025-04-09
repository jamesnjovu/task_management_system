import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const { setAlert } = useAlert();

    // Configure axios defaults on initial load
    useEffect(() => {
        // Set the default base URL for axios
        axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Check if user is authenticated on mount

        checkAuth();
    }, []);

    // Set up axios interceptors
    useEffect(() => {
        // Add authentication token to all requests
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Handle 401 unauthorized errors globally
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                    setAlert('Session expired. Please log in again.', 'error');
                }
                return Promise.reject(error);
            }
        );

        // Clean up interceptors on unmount
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [setAlert]);

    // Check if the token is valid and get user data
    const checkAuth = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            // Check if token is expired
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp < currentTime) {
                logout();
                setLoading(false);
                return;
            }

            // Get user data from API
            const response = await axios.get('/api/auth/me');
            setCurrentUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Authentication error:', error);
            localStorage.removeItem('token');
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Register new user
    const register = async (userData) => {
        try {
            const res = await axios.post('/api/auth/register', userData);

            // Save token and set current user
            localStorage.setItem('token', res.data.token);
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);

            setAlert('Registration successful!', 'success');
            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Registration failed. Please try again.';

            setAlert(errorMessage, 'error');
            return false;
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            const res = await axios.post('/api/auth/login', credentials);

            // Save token and set current user
            localStorage.setItem('token', res.data.token);
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);

            // Force axios to use the new token immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

            setAlert('Login successful!', 'success');
            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Login failed. Please check your credentials.';

            setAlert(errorMessage, 'error');
            return false;
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const res = await axios.put('/api/users/profile', profileData);
            setCurrentUser(res.data.user);
            setAlert('Profile updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to update profile. Please try again.';

            setAlert(errorMessage, 'error');
            return false;
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            await axios.put('/api/auth/password', passwordData);
            setAlert('Password changed successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                'Failed to change password. Please try again.';

            setAlert(errorMessage, 'error');
            return false;
        }
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        checkAuth,
        updateProfile,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
