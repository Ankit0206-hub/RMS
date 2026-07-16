import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CalendarClock, Settings, Sliders, LogOut, ChevronRight, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function WaiterProfile() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const menuItems = [
        { icon: User, label: 'Personal Details', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: CalendarClock, label: 'Shift History', color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: Sliders, label: 'Performance Settings', color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Settings, label: 'App Settings', color: 'text-gray-500', bg: 'bg-gray-50' }
    ];

    return (
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
            </div>
            <div className="px-4 mt-6 flex-1 space-y-6 w-full pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-[#ff5722] border-4 border-white shadow-md">AK</div>
                        <button className="absolute bottom-0 right-0 h-8 w-8 bg-[#ff5722] text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white"><Camera className="h-4 w-4" /></button>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">Amit Kumar</h2>
                    <p className="text-[#ff5722] font-bold text-sm mt-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Senior Waiter</p>
                </div>
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                    {menuItems.map((item, index) => (
                        <button key={index} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="flex items-center space-x-4"><div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.bg}`}><item.icon className={`h-5 w-5 ${item.color}`} /></div><span className="font-bold text-gray-900">{item.label}</span></div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                    ))}
                </div>
                <div className="pt-4">
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center font-bold shadow-sm border border-red-100 hover:bg-red-100 transition-colors"><LogOut className="h-5 w-5 mr-2" />Logout</button>
                </div>
            </div>
        </div>
    );
}
