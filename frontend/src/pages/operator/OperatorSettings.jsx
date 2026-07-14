import React, { useState } from 'react';
import { Camera, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const OperatorSettings = () => {
    const { user, updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [status, setStatus] = useState({ loading: false, error: null, success: false });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status.error || status.success) {
            setStatus({ ...status, error: null, success: false });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            const response = await api.put('/operator/me', formData);
            // Assuming the backend returns the updated user object directly or in data.
            updateUser(formData); // Update local context
            setStatus({ loading: false, error: null, success: true });
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setStatus(prev => ({ ...prev, success: false }));
            }, 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setStatus({ 
                loading: false, 
                error: err.response?.data?.detail || 'Failed to update profile', 
                success: false 
            });
        }
    };

    return (
        <div className="font-inter">
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1">Profile Settings</h1>
                        <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400">Manage your personal information and account details</p>
                    </div>
                </div>

                {/* Top Card: Photo & Basic Info */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-5">
                        <img 
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-slate-800 shadow-sm"
                        />
                        <div>
                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400 mt-0.5 capitalize">{user?.role || 'Operator'}</p>
                        </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors bg-white dark:bg-slate-900 shadow-sm shrink-0">
                        <Camera size={16} className="text-gray-500 dark:text-slate-400" />
                        Change Photo
                    </button>
                </div>

                {/* Form Card: Personal Information */}
                <div className="bg-[#FAFAFA] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>
                    
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">First name</label>
                                <input 
                                    type="text" 
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                    required
                                />
                            </div>
                            
                            {/* Last Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Last name</label>
                                <input 
                                    type="text" 
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Email address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Phone number</label>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Job Title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Job title / Role</label>
                                <input 
                                    type="text" 
                                    value={user?.role || 'Operator'}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-500 dark:text-slate-400 cursor-not-allowed shadow-sm capitalize"
                                />
                            </div>

                            {/* Company Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Company name</label>
                                <input 
                                    type="text" 
                                    value="DineOps Restaurant"
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-500 dark:text-slate-400 cursor-not-allowed shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Status Messages */}
                        {status.error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-[13px] font-medium">
                                {status.error}
                            </div>
                        )}
                        {status.success && (
                            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-xl text-[13px] font-medium">
                                Profile updated successfully!
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end pb-2">
                            <button 
                                type="submit" 
                                disabled={status.loading}
                                className={`px-6 py-3.5 bg-[#111111] hover:bg-black text-white text-[14px] font-bold rounded-xl shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5 ${status.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {status.loading ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OperatorSettings;
