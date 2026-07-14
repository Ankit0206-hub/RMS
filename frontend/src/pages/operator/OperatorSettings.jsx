import React from 'react';
import { 
    Camera,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const OperatorSettings = () => {
    const { user } = useAuth();
    
    return (
        <div className="font-inter">
            <div className="max-w-4xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1">Profile Settings</h1>
                    <p className="text-[14px] font-medium text-gray-500 dark:text-slate-400">Manage your personal information and account details</p>
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
                    
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">First name</label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.first_name || ''}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>
                            
                            {/* Last Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Last name</label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.last_name || ''}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Email address</label>
                                <input 
                                    type="email" 
                                    defaultValue={user?.email || ''}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Phone number</label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.phone || ''}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Job Title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Job title / Role</label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.role || 'Operator'}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm capitalize"
                                />
                            </div>

                            {/* Company Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900 dark:text-white">Company name</label>
                                <input 
                                    type="text" 
                                    defaultValue="DineOps Restaurant"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 flex justify-end pb-8">
                    <button className="px-6 py-3.5 bg-[#111111] hover:bg-black text-white text-[14px] font-bold rounded-xl shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5">
                        Save changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OperatorSettings;
