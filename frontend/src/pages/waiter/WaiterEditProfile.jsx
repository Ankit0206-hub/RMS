import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import waiterApi from '../../services/waiterApi';

export default function WaiterEditProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await waiterApi.updateProfile(formData);
            updateUser(formData);
            navigate('/waiter/profile');
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                <button onClick={() => navigate('/waiter/profile')} className="mr-4 h-10 w-10 bg-white/40 rounded-full flex items-center justify-center border border-white/50 active:scale-95 transition-transform">
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Profile</h1>
            </div>

            <div className="px-4 md:px-8 mt-6 flex-1 w-full mx-auto">
                <div className=" p-6 md:p-8 shadow-sm ">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 font-bold text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSave} className="space-y-5">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-600 ml-1">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/40 border border-white/50 rounded-2xl py-3 pl-11 pr-4 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-600 ml-1">Last Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/40 border border-white/50 rounded-2xl py-3 pl-11 pr-4 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/40 border border-white/50 rounded-2xl py-3 pl-11 pr-4 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-600 ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/40 border border-white/50 rounded-2xl py-3 pl-11 pr-4 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full bg-rose-500 text-white rounded-2xl py-4 flex items-center justify-center font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
