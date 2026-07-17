import React from'react';
import {useNavigate, useParams, useLocation} from'react-router-dom';
import {ArrowLeft, Clock, Users, Plus, Utensils, Receipt} from'lucide-react';
import toast from'react-hot-toast';

export default function TableDetails() {
 const navigate = useNavigate();
 const location = useLocation();
 const {tableId} = useParams();
 const id = tableId ||'T01';

 const {customerName, guests, isNewSession} = location.state || {};
 const displayName = customerName ||'Rahul Sharma';
 const displayGuests = guests || 4;
 const seatedTime = isNewSession ?'Just now':'06:45 PM (45m)';

 return (
 <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
 {/* Decorative Glassmorphism Blobs Container */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 </div>

 <div className="relative z-10 flex flex-col min-h-screen">
 <div className="bg-white/10 backdrop-blur-xl px-4 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20">
 <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
 <ArrowLeft className="h-5 w-5"/>
 </button>
 <div>
 <h1 className="text-lg font-black text-gray-800">Table {id}</h1>
 <p className="text-xs text-gray-600 font-medium">{displayName} • {displayGuests} Guests</p>
 </div>
 </div>

 <div className="px-4 py-6 w-full space-y-6 pb-24">
 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-lg font-black text-gray-800">Session Info</h2>
 <span className="bg-amber-500/10 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200/50">Occupied</span>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
 <Clock className="h-5 w-5 text-gray-500 mb-2"/>
 <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Seated Time</p>
 <p className="text-[15px] font-bold text-gray-800">{seatedTime}</p>
 </div>
 <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
 <Users className="h-5 w-5 text-gray-500 mb-2"/>
 <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Guests</p>
 <p className="text-[15px] font-bold text-gray-800">{displayGuests} People</p>
 </div>
 </div>
 </div>

 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-black text-gray-800">Active Orders</h2>
 {!isNewSession ? <button onClick={() => navigate('/waiter/tables/'+id+'/history')} className="text-xs font-bold text-teal-600">View History</button> : null}
 </div>
 
 {isNewSession ? (
 <div className="p-6 text-center text-gray-500 bg-white/10 backdrop-blur-md rounded-2xl border border-white/40 border-dashed">
 <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-400 opacity-50"/>
 <p className="text-sm font-bold text-gray-600">No active orders yet.</p>
 <p className="text-xs text-gray-500 mt-1">Tap Add Items to take the first order.</p>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="p-4 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md transition-colors">
 <div className="flex justify-between items-center mb-2">
 <span className="font-bold text-gray-800 text-sm">Order #128</span>
 <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 border border-rose-200/50">Preparing</span>
 </div>
 <div className="text-xs text-gray-600 font-medium">
 2x Paneer Butter Masala, 2x Garlic Naan
 </div>
 </div>
 </div>
 )}
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button onClick={() => navigate('/waiter/take-order')} className="flex items-center justify-center bg-white/20 backdrop-blur-xl border border-rose-200/80 text-rose-600 rounded-2xl py-3 px-2 font-bold shadow-sm transition-all text-sm">
 <div className="bg-rose-100/50 p-1.5 rounded-full mr-2 transition-colors">
 <Plus className="h-4 w-4"/>
 </div>
 Add Items
 </button>
 <button onClick={() => {toast.success('Bill Generated successfully!'); navigate('/waiter/tables');}} className="flex items-center justify-center bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-2xl py-3 px-2 font-bold shadow-sm transition-all border border-rose-300/50 text-sm">
 <Receipt className="h-4 w-4 mr-2"/>
 Generate Bill
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
