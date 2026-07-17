import React from'react';
import {useNavigate} from'react-router-dom';
import {User, CalendarClock, Settings, Sliders, LogOut, ChevronRight, Camera} from'lucide-react';
import {useAuth} from'../../contexts/AuthContext';

export default function WaiterProfile() {
 const navigate = useNavigate();
 const {logout} = useAuth();
 
 const menuItems = [
 {icon: User, label:'Personal Details', color:'text-sky-500', bg:'bg-sky-500/10 border border-sky-200/50'},
 {icon: CalendarClock, label:'Shift History', color:'text-purple-500', bg:'bg-purple-500/10 border border-purple-200/50'},
 {icon: Sliders, label:'Performance Settings', color:'text-teal-500', bg:'bg-teal-500/10 border border-teal-200/50'},
 {icon: Settings, label:'App Settings', color:'text-gray-600', bg:'bg-white/40 border border-white/50'}
 ];

 return (
 <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
 {/* Decorative Glassmorphism Blobs */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 </div>

 <div className="relative z-10 flex flex-col min-h-screen">
 <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
 <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
 <h1 className="text-2xl font-black text-gray-800 tracking-tight">Profile</h1>
 </div>
 </div>

 <div className="px-4 md:px-8 mt-6 flex-1 space-y-6 w-full pb-24 max-w-4xl mx-auto">
 <div className="bg-white/20 backdrop-blur-xl rounded-[32px] p-8 shadow-sm border border-white/40 flex flex-col items-center">
 <div className="relative">
 <div className="h-28 w-28 rounded-full bg-rose-100/50 flex items-center justify-center text-4xl font-black text-rose-500 border-4 border-white/60 shadow-lg backdrop-blur-md">
 AK
 </div>
 <button className="absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white/80 transition-transform">
 <Camera className="h-5 w-5"/>
 </button>
 </div>
 <h2 className="text-2xl font-black text-gray-800 mt-5">Amit Kumar</h2>
 <p className="text-teal-700 font-bold text-sm mt-2 bg-teal-500/10 px-4 py-1.5 rounded-full border border-teal-200/50 backdrop-blur-md tracking-wide">
 Senior Waiter
 </p>
 </div>

 <div className="bg-white/20 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white/40">
 {menuItems.map((item, index) => (
 <button key={index} className="w-full flex items-center justify-between p-4 rounded-3xl transition-all active:scale-[0.98]">
 <div className="flex items-center space-x-4">
 <div className={`h-12 w-12 rounded-[18px] flex items-center justify-center backdrop-blur-md shadow-sm ${item.bg}`}>
 <item.icon className={`h-6 w-6 ${item.color}`} />
 </div>
 <span className="font-black text-gray-800 text-[15px] md:text-base">{item.label}</span>
 </div>
 <div className="h-8 w-8 rounded-full bg-white/40 flex items-center justify-center border border-white/50">
 <ChevronRight className="h-5 w-5 text-gray-500"strokeWidth={3} />
 </div>
 </button>
 ))}
 </div>

 <div className="pt-2 pb-8">
 <button onClick={() => {logout(); navigate('/login');}} className="w-full bg-red-500/10 text-red-600 rounded-[20px] p-4 flex items-center justify-center font-black shadow-sm border border-red-200/50 active:scale-[0.98] transition-all text-[15px] md:text-lg backdrop-blur-md">
 <LogOut className="h-5 w-5 md:h-6 md:w-6 mr-2"strokeWidth={2.5} />
 Logout
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
