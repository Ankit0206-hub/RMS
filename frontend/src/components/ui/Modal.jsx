import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative z-50 w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export { Modal };
