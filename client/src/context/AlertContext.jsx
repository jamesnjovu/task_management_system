import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    // Generate a unique ID for each alert
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Add a new alert
    const setAlert = (message, type = 'info', timeout = 5000) => {
        const id = generateId();

        // Add the new alert to the alerts array
        setAlerts(prev => [...prev, { id, message, type }]);

        // Remove the alert after the timeout
        if (timeout) {
            setTimeout(() => removeAlert(id), timeout);
        }

        return id;
    };

    // Remove an alert by ID
    const removeAlert = (id) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const value = {
        alerts,
        setAlert,
        removeAlert
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};
