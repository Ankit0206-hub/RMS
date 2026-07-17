import React from'react';
import {useNavigate} from'react-router-dom';
import {ArrowLeft, CheckCircle2, UserPlus} from'lucide-react';

export default function WaiterNotifications() {
 const navigate = useNavigate();
 const notifications = [
 {id: 1, type:'Order Ready', message:"Table T02's order #129 is ready to serve", time:'2 mins ago', icon: CheckCircle2, iconColor:'text-teal-600', iconBg:'bg-teal-500/10 border-teal-200/50', unread: true},
 {id: 2, type:'New Assigned Table', message:'You have been assigned Table T05', time:'15 mins ago', icon: UserPlus, iconColor:'text-rose-600', iconBg:'bg-rose-500/10 border-rose-200/50', unread: false}
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
 <div className="flex items-center">
 <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
 <ArrowLeft className="h-5 w-5"strokeWidth={2.5} />
 </button>
 <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Notifications</h1>
 </div>
 </div>
 </div>

 <div className="px-4 md:px-8 mt-4 md:mt-8 flex-1 space-y-4 w-full pb-24 max-w-4xl mx-auto">
 {notifications.map(notif => (
 <div key={notif.id} className={`bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border flex items-start transition-colors ${notif.unread ?'border-white/60 bg-white/30':'border-white/40'}`}>
 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border backdrop-blur-md ${notif.iconBg}`}>
 <notif.icon className={`h-6 w-6 ${notif.iconColor}`} />
 </div>
 <div className="ml-4 flex-1">
 <h3 className="text-[15px] md:text-base font-black text-gray-800">{notif.type}</h3>
 <p className="text-sm md:text-[15px] text-gray-600 mt-1 font-bold leading-snug">{notif.message}</p>
 <p className="text-xs text-gray-500 mt-2 font-bold">{notif.time}</p>
 </div>
 {notif.unread && <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-2 ring-4 ring-rose-500/20 shadow-sm"></div>}
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
