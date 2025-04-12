import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const AnimatedModal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true,
    closeOnOutsideClick = true
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = ''; // Re-enable scrolling
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    if (!isVisible) return null;
    
    // Determine modal width based on size prop
    let modalWidth = 'max-w-lg';
    switch (size) {
        case 'sm':
            modalWidth = 'max-w-sm';
            break;
        case 'md':
            modalWidth = 'max-w-lg';
            break;
        case 'lg':
            modalWidth = 'max-w-2xl';
            break;
        case 'xl':
            modalWidth = 'max-w-4xl';
            break;
        case 'full':
            modalWidth = 'max-w-full mx-4';
            break;
        default:
            modalWidth = 'max-w-lg';
    }
    
    const handleOutsideClick = (e) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
            onClose();
        }
    };
    
    return createPortal(
        <div 
            className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center transition-opacity duration-300 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleOutsideClick}
        >
            {/* Background overlay */}
            <div 
                className="fixed inset-0 bg-black transition-opacity duration-300" 
                style={{ opacity: isAnimating ? 0.5 : 0 }}
            ></div>
            
            {/* Modal panel */}
            <div 
                className={`bg-white rounded-lg shadow-xl overflow-hidden relative w-full ${modalWidth} transition-all duration-300 transform ${
                    isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                {/* Modal header */}
                {title && (
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <FiX className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                )}
                
                {/* Modal content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AnimatedModal;