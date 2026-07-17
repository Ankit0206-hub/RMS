import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, KeyRound, Award, ChefHat, Clock } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();

    // Dummy statistics
    const stats = {
        ordersHandled: 42,
        ordersReady: 38,
        avgPrepTime: '14 min'
    };

    return (
        <div className="p-4 flex flex-col gap-6 h-full bg-gray-50 pb-24">
            {/* Header / Identity */}
            <div className="bg-[#0f5132] rounded-2xl p-6 text-white shadow-md relative overflow-hidden mt-2">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <ChefHat size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shrink-0">
                        <User size={40} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">{user?.first_name || 'Kitchen'} {user?.last_name || 'Staff'}</h2>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mt-2 inline-block">
                            {user?.role || 'Kitchen'}
                        </span>
                        <p className="text-green-100 font-medium text-sm mt-2">ID: EMP-{user?.id || '007'}</p>
                        <p className="text-green-100 font-medium text-sm">Joined: Jan 15, 2025</p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div>
                <h3 className="text-gray-800 font-bold text-lg mb-3">Today's Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <ChefHat size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Handled</span>
                        </div>
                        <span className="text-3xl font-black text-gray-900">{stats.ordersHandled}</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Award size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Ready</span>
                        </div>
                        <span className="text-3xl font-black text-green-700">{stats.ordersReady}</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 col-span-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Avg Prep Time</span>
                        </div>
                        <span className="text-3xl font-black text-gray-900">{stats.avgPrepTime}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div>
                <h3 className="text-gray-800 font-bold text-lg mb-3">Account Actions</h3>
                <div className="flex flex-col gap-3">
                    <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 px-4 rounded-xl shadow-sm flex items-center justify-between transition-colors active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                            <KeyRound size={20} className="text-gray-500" />
                            <span>Change Password</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => logout()}
                        className="w-full bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 font-bold py-4 px-4 rounded-xl shadow-sm flex items-center justify-between transition-colors active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={20} className="text-red-600" />
                            <span>Logout</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
