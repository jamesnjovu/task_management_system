import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
    // Determine size classes
    let sizeClasses = '';
    switch (size) {
        case 'small':
            sizeClasses = 'h-4 w-4';
            break;
        case 'medium':
            sizeClasses = 'h-8 w-8';
            break;
        case 'large':
            sizeClasses = 'h-12 w-12';
            break;
        case 'xl':
            sizeClasses = 'h-16 w-16';
            break;
        default:
            sizeClasses = 'h-8 w-8';
    }
    
    // Determine color classes
    let colorClasses = '';
    switch (color) {
        case 'primary':
            colorClasses = 'text-primary-600';
            break;
        case 'secondary':
            colorClasses = 'text-secondary-600';
            break;
        case 'white':
            colorClasses = 'text-white';
            break;
        case 'gray':
            colorClasses = 'text-gray-600';
            break;
        default:
            colorClasses = 'text-primary-600';
    }
    
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg
                className={`animate-spin ${sizeClasses} ${colorClasses}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            
            {/* Optional loading text with animation */}
            {size === 'large' && (
                <p className="mt-4 text-gray-600 animate-pulse">Loading...</p>
            )}
        </div>
    );
};

export default LoadingSpinner;