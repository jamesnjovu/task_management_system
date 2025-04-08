import React, { forwardRef } from 'react';

const FormInput = forwardRef(({
    label,
    name,
    type = 'text',
    placeholder = '',
    error = null,
    className = '',
    required = false,
    disabled = false,
    ...props
}, ref) => {
    const inputClasses = `block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${error ? 'border-danger-300' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`;

    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <input
                ref={ref}
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                className={inputClasses}
                disabled={disabled}
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
