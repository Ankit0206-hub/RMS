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
        <div className="p-4 sm:p-6 flex flex-col gap-6 min-h-screen bg-[#0f172a] text-zinc-100 font-sans w-full max-w-3xl mx-auto">
            {/* Header / Identity */}
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden mt-2 border border-zinc-700/50">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <ChefHat size={160} />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="w-24 h-24 bg-zinc-700/50 rounded-full flex items-center justify-center border-4 border-zinc-600 shadow-inner shrink-0">
                        <User size={48} className="text-zinc-300" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-wide">{user?.first_name || 'Kitchen'} {user?.last_name || 'Staff'}</h2>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mt-3 inline-block shadow-inner">
                            {user?.role || 'Kitchen'}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4">
                            <p className="text-zinc-400 font-bold text-sm bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">ID: <span className="text-zinc-200">EMP-{user?.id || '007'}</span></p>
                            <p className="text-zinc-400 font-bold text-sm bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">Joined: <span className="text-zinc-200">Jan 15, 2025</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div>
                <h3 className="text-zinc-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award size={16} /> Today's Performance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-inner flex flex-col gap-2 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <ChefHat size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Handled</span>
                        </div>
                        <span className="text-4xl font-black text-white">{stats.ordersHandled}</span>
                    </div>
                    
                    <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-inner flex flex-col gap-2 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-500/70">
                            <Award size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
                        </div>
                        <span className="text-4xl font-black text-emerald-400">{stats.ordersReady}</span>
                    </div>

                    <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-inner flex flex-col gap-2 col-span-2 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-blue-500/70">
                            <Clock size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Avg Prep Time</span>
                        </div>
                        <span className="text-4xl font-black text-blue-400">{stats.avgPrepTime}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4">
                <h3 className="text-zinc-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <KeyRound size={16} /> Account Actions
                </h3>
                <div className="flex flex-col gap-4">
                    <button className="w-full bg-zinc-800/80 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 font-bold py-5 px-6 rounded-2xl shadow-sm flex items-center justify-between transition-colors active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <KeyRound size={24} className="text-zinc-400" />
                            <span className="text-lg">Change Password</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => logout()}
                        className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold py-5 px-6 rounded-2xl shadow-inner flex items-center justify-between transition-colors active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <LogOut size={24} className="text-red-500" />
                            <span className="text-lg">Logout</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
