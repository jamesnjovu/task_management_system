import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon = null,
    iconPosition = 'left',
    onClick,
    ...props
}) => {
    // Base classes
    let baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Size classes
    let sizeClasses = '';
    switch (size) {
        case 'xs':
            sizeClasses = 'text-xs px-2 py-1 rounded';
            break;
        case 'sm':
            sizeClasses = 'text-sm px-3 py-1.5 rounded';
            break;
        case 'md':
            sizeClasses = 'text-sm px-4 py-2 rounded-md';
            break;
        case 'lg':
            sizeClasses = 'text-base px-5 py-2.5 rounded-md';
            break;
        case 'xl':
            sizeClasses = 'text-base px-6 py-3 rounded-md';
            break;
        default:
            sizeClasses = 'text-sm px-4 py-2 rounded-md';
    }

    // Variant classes
    let variantClasses = '';
    switch (variant) {
        case 'primary':
            variantClasses = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
            break;
        case 'secondary':
            variantClasses = 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500';
            break;
        case 'success':
            variantClasses = 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500';
            break;
        case 'danger':
            variantClasses = 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500';
            break;
        case 'warning':
            variantClasses = 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500';
            break;
        case 'outline':
            variantClasses = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500';
            break;
        case 'ghost':
            variantClasses = 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
            break;
        case 'link':
            variantClasses = 'text-primary-600 hover:text-primary-700 focus:ring-primary-500 shadow-none';
            break;
        default:
            variantClasses = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
    }

    // Disabled classes
    const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

    // Full width
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const buttonClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${widthClasses} ${className}`;

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            )}

            {icon && iconPosition === 'left' && !loading && (
                <span className="mr-2">{icon}</span>
            )}

            {children}

            {icon && iconPosition === 'right' && !loading && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
};

export default Button;
