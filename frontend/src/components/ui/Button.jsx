import React from 'react';

const Button = React.forwardRef(({ className = '', variant = 'primary', size = 'default', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:pointer-events-none transition-all";
    
    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md transform hover:-translate-y-0.5",
        secondary: "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
        ghost: "hover:bg-cyan-50 text-gray-600 hover:text-cyan-700"
    };
    
    const sizes = {
        default: "h-10 py-2 px-4 text-sm",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-11 px-8 rounded-md text-base",
        icon: "h-10 w-10"
    };
    
    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
