import React, {useState} from'react';
import {useNavigate} from'react-router-dom';
import {Bell, ChevronRight, Clock} from'lucide-react';

export default function WaiterOrders() {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('Active');
 const orders = [
 {id:'#128', table:'T01', time:'07:18 PM', status:'Preparing', items: [{name:'Paneer Butter Masala', qty: 2}, {name:'Garlic Naan', qty: 2}]},
 {id:'#127', table:'T03', time:'07:10 PM', status:'Preparing', items: [{name:'Mix Veg', qty: 1}, {name:'Tandoori Roti', qty: 4}]},
 {id:'#126', table:'T02', time:'06:50 PM', status:'Completed', items: [{name:'Tomato Soup', qty: 2}]}
 ];
 const filteredOrders = activeTab ==='Active'? orders.filter(o => o.status !=='Completed') : orders.filter(o => o.status ==='Completed');

 return (
 <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
 {/* Decorative Glassmorphism Blobs */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 </div>

 <div className="relative z-10 flex flex-col min-h-screen">
 <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 w-full shrink-0">
 <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
 <h1 className="text-2xl font-black text-gray-800 tracking-tight">Orders</h1>
 <button onClick={() => navigate('/waiter/notifications')} className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center relative transition-colors border border-white/40 shadow-sm">
 <Bell className="h-5 w-5 text-gray-700"/>
 <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white/50"></span>
 </button>
 </div>
 </div>

 <div className="px-4 md:px-8 mt-4 flex-1 space-y-6 w-full pb-24 max-w-7xl mx-auto">
 <div className="flex space-x-2 md:max-w-md">
 <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Active'?'bg-rose-400/90 backdrop-blur-md text-white border-rose-400':'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Active (4)</button>
 <button onClick={() => setActiveTab('Completed')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Completed'?'bg-rose-400/90 backdrop-blur-md text-white border-rose-400':'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Completed (12)</button>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredOrders.map(order => (
 <div key={order.id} className="bg-white/20 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/40 flex flex-col transition-colors">
 <div className="flex justify-between items-start mb-3">
 <div>
 <div className="flex items-center space-x-2 mb-1">
 <h3 className="text-lg font-black text-gray-800">Order {order.id}</h3>
 <span className="bg-teal-500/10 text-teal-700 font-bold px-2 py-0.5 rounded-md text-xs border border-teal-200/50 backdrop-blur-md">Table {order.table}</span>
 </div>
 <div className="flex items-center text-xs text-gray-500 font-medium">
 <Clock className="h-3.5 w-3.5 mr-1"/> {order.time}
 </div>
 </div>
 <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md ${order.status ==='Preparing'?'bg-amber-500/10 text-amber-700 border-amber-200/50':'bg-teal-500/10 text-teal-700 border-teal-200/50'}`}>{order.status}</span>
 </div>
 
 <div className="space-y-1.5 mt-4 mb-5 border-t border-white/30 pt-4 flex-1">
 {order.items.map((item, i) => (
 <div key={i} className="text-sm font-medium text-gray-700 flex justify-between bg-white/30 px-3 py-2 rounded-xl border border-white/40">
 <span>{item.name}</span><span className="font-black text-gray-800 ml-1">x{item.qty}</span>
 </div>
 ))}
 </div>
 
 <div className="border-t border-white/30 pt-4 flex justify-end">
 <button onClick={() => navigate(`/waiter/orders/${order.id.replace('#','')}`)} className="flex items-center bg-white/30 px-4 py-2 rounded-xl text-rose-500 text-sm font-bold border border-white/40 transition-colors">
 View Details <ChevronRight className="h-4 w-4 ml-1"/>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
