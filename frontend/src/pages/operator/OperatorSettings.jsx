import React from 'react';
import { 
    Camera,
    ChevronDown
} from 'lucide-react';

const OperatorSettings = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] md:-m-8 bg-white font-inter p-4 md:p-12">
            <div className="max-w-4xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[22px] font-bold text-gray-900 mb-1">Profile Settings</h1>
                    <p className="text-[14px] font-medium text-gray-500">Manage your personal information and account details</p>
                </div>

                {/* Top Card: Photo & Basic Info */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-5">
                        <img 
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                        />
                        <div>
                            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Riazul Islam</h2>
                            <p className="text-[14px] font-medium text-gray-500 mt-0.5">Project Manager</p>
                        </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm shrink-0">
                        <Camera size={16} className="text-gray-500" />
                        Change Photo
                    </button>
                </div>

                {/* Form Card: Personal Information */}
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-[18px] font-bold text-gray-900 mb-6">Personal Information</h3>
                    
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">First name</label>
                                <input 
                                    type="text" 
                                    defaultValue="Riazul"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>
                            
                            {/* Last Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">Last name</label>
                                <input 
                                    type="text" 
                                    defaultValue="Islam"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">Email address</label>
                                <input 
                                    type="email" 
                                    defaultValue="uiriazul24@gmail.com"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">Phone number</label>
                                <div className="flex bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-400 transition-all overflow-hidden">
                                    <div className="flex items-center gap-1.5 px-4 py-3 border-r border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="text-base leading-none">🇺🇸</span>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        defaultValue="+1"
                                        className="w-full px-4 py-3 bg-transparent border-none text-[14px] font-medium text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Job Title */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">Job title / Role</label>
                                <input 
                                    type="text" 
                                    defaultValue="Project Manager"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>

                            {/* Company Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-bold text-gray-900">Company name</label>
                                <input 
                                    type="text" 
                                    defaultValue="Flowza Inc."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="flex flex-col gap-2 pt-2">
                            <label className="text-[13px] font-bold text-gray-900">Bio</label>
                            <textarea 
                                rows="3"
                                defaultValue="Experienced project manager with a passion for building high-performing teams and delivering results on time"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all shadow-sm resize-none"
                            />
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
