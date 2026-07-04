import React from 'react';

const Input = React.forwardRef(({ className = '', error, label, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500">{error.message || error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export { Input };
