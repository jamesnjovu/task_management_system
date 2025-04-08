import React from 'react';
import { useAlert } from '../../context/AlertContext';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const AlertContainer = () => {
    const { alerts, removeAlert } = useAlert();

    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-2">
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    alert={alert}
                    onClose={() => removeAlert(alert.id)}
                />
            ))}
        </div>
    );
};

const Alert = ({ alert, onClose }) => {
    const { id, message, type } = alert;

    // Define styles based on alert type
    let bgColor = 'bg-blue-50 text-blue-800 border-blue-300';
    let Icon = FiInfo;

    switch (type) {
        case 'success':
            bgColor = 'bg-success-50 text-success-800 border-success-300';
            Icon = FiCheckCircle;
            break;
        case 'error':
            bgColor = 'bg-danger-50 text-danger-800 border-danger-300';
            Icon = FiXCircle;
            break;
        case 'warning':
            bgColor = 'bg-warning-50 text-warning-800 border-warning-300';
            Icon = FiAlertCircle;
            break;
        default:
            break;
    }

    return (
        <div
            className={`p-4 rounded-md shadow-md border ${bgColor} flex items-start`}
            role="alert"
        >
            <div className="flex-shrink-0 mr-3">
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 mr-2">{message}</div>
            <button
                type="button"
                className="flex-shrink-0 inline-flex text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={onClose}
                aria-label="Close"
            >
                <FiX className="h-5 w-5" />
            </button>
        </div>
    );
};

export default AlertContainer;
