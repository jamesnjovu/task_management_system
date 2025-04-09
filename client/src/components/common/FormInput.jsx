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
    // Base classes including proper padding, height and border
    const baseClasses = "block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 h-10";
    const errorClasses = error ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500" : "";
    const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
    
    // Combine all classes and trim any extra spaces
    const inputClasses = [baseClasses, errorClasses, disabledClasses, className]
        .filter(Boolean)
        .join(' ')
        .trim();

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
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${name}-error` : undefined}
                {...props}
            />

            {error && (
                <p 
                    className="mt-1 text-sm text-danger-600" 
                    id={`${name}-error`}
                >
                    {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;