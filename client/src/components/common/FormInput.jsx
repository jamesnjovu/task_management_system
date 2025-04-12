import React, { forwardRef, useState } from 'react';

const FormInput = forwardRef(({
    label,
    name,
    type = 'text',
    placeholder = '',
    error = null,
    className = '',
    required = false,
    disabled = false,
    animated = true,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(props.value || props.defaultValue);
    
    // Base classes for input
    const baseClasses = "block w-full rounded-md border shadow-sm sm:text-sm px-3 py-2 h-10";
    
    // Determine border color based on state
    let borderClasses = "";
    if (error) {
        borderClasses = "border-danger-300 focus:border-danger-500 focus:ring-danger-500";
    } else if (isFocused) {
        borderClasses = "border-primary-500 ring-2 ring-primary-100 focus:border-primary-500 focus:ring-primary-500";
    } else {
        borderClasses = "border-gray-300 focus:border-primary-500 focus:ring-primary-500";
    }
    
    // Animation classes
    const animationClasses = animated 
        ? "transition-all duration-300 ease-in-out " + (isFocused ? "transform -translate-y-0.5" : "")
        : "";
    
    // Disabled classes
    const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
    
    // Label animation classes
    const labelClasses = `block text-sm font-medium mb-1 transition-all duration-300 ${
        isFocused ? 'text-primary-600' : 'text-gray-700'
    }`;
    
    // Combine all classes and trim any extra spaces
    const inputClasses = [baseClasses, borderClasses, animationClasses, disabledClasses, className]
        .filter(Boolean)
        .join(' ')
        .trim();
    
    const handleFocus = (e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };
    
    const handleBlur = (e) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
    };
    
    const handleChange = (e) => {
        setHasValue(e.target.value);
        if (props.onChange) props.onChange(e);
    };

    return (
        <div className={`mb-4 ${animated ? 'transition-all duration-300' : ''}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={labelClasses}
                >
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
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
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    {...props}
                />
                
                {/* Animated focus indicator */}
                {animated && isFocused && !error && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-primary-500 animate-expandWidth"></div>
                )}
                
                {/* Animated error indicator */}
                {animated && error && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-danger-500 animate-expandWidth"></div>
                )}
            </div>

            {/* Error message with animation */}
            {error && (
                <p 
                    className={`mt-1 text-sm text-danger-600 ${animated ? 'animate-fadeIn' : ''}`}
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