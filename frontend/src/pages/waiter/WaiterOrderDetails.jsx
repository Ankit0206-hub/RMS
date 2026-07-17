import React from'react';
import {useNavigate, useParams} from'react-router-dom';
import {ArrowLeft, Clock, CheckCircle2, ShoppingBag} from'lucide-react';
import toast from'react-hot-toast';

export default function WaiterOrderDetails() {
 const navigate = useNavigate();
 const {orderId} = useParams();
    const order = {
        id: `#${orderId || '128'}`, table: 'T01', time: '07:18 PM', status: 'Preparing', total: 300,
        items: [
            { name: 'Paneer Butter Masala', qty: 2, price: 120, prepType: 'Full Plate', spiceLevel: 'Extra Spicy' }, 
            { name: 'Garlic Naan', qty: 2, price: 30 }
        ]
    };

 return (
 <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
 {/* Decorative Glassmorphism Blobs */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
 <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
 </div>

 <div className="relative z-10 flex flex-col min-h-screen">
 <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
 <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
 <div className="flex items-center">
 <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
 <ArrowLeft className="h-5 w-5"strokeWidth={2.5} />
 </button>
 <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Order Details</h1>
 </div>
 <button onClick={() => toast('Support contact initiated')} className="text-sm md:text-[15px] font-bold text-rose-500 px-3 py-1.5 bg-white/30 rounded-xl border border-white/40 backdrop-blur-md transition-colors">Help</button>
 </div>
 </div>

 <div className="px-4 md:px-8 mt-4 md:mt-8 flex-1 space-y-6 w-full pb-24 max-w-4xl mx-auto">
 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex justify-between items-start mb-4">
 <div>
 <h2 className="text-2xl font-black text-gray-800">Order {order.id}</h2>
 <div className="flex items-center mt-2">
 <span className="bg-teal-500/10 text-teal-700 font-bold px-2.5 py-1 rounded-lg text-xs mr-2 border border-teal-200/50 backdrop-blur-md">Table {order.table}</span>
 <span className="text-xs font-bold text-gray-500 flex items-center bg-white/30 px-2 py-1 rounded-lg border border-white/40"><Clock className="h-3.5 w-3.5 mr-1"/> {order.time}</span>
 </div>
 </div>
 </div>
 
 <div className="mt-8 border-t border-white/30 pt-6">
 <div className="relative pl-6 space-y-6 border-l-2 border-white/40 ml-3">
 <div className="relative">
 <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm">
 <CheckCircle2 className="h-5 w-5"/>
 </span>
 <p className="text-sm md:text-base font-black text-gray-800">Order Placed</p>
 <p className="text-xs md:text-sm text-gray-500 font-bold">07:18 PM</p>
 </div>
 <div className="relative">
 <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-amber-400 h-4 w-4 rounded-full shadow-sm"></span>
 <p className="text-sm md:text-base font-black text-amber-500">Preparing</p>
 <p className="text-xs md:text-sm text-amber-400/80 font-bold">07:22 PM</p>
 </div>
 <div className="relative">
 <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-white/60 h-4 w-4 rounded-full shadow-sm"></span>
 <p className="text-sm md:text-base font-black text-gray-400">Ready</p>
 <p className="text-xs md:text-sm text-gray-400 font-bold">Pending</p>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex items-center mb-5">
 <div className="bg-white/30 text-gray-700 p-2 rounded-xl mr-3 border border-white/40 backdrop-blur-md">
 <ShoppingBag className="h-5 w-5 text-rose-500"/>
 </div>
 <h3 className="font-black text-gray-800 text-lg">Items Ordered</h3>
 </div>
 
 <div className="space-y-2">
 {order.items.map((item, i) => (
 <div key={i} className="flex justify-between items-center py-3 border-b border-white/30 last:border-0 last:pb-0">
 <div>
 <p className="text-sm md:text-[15px] font-bold text-gray-800">{item.name}</p>
 {(item.prepType || item.spiceLevel) && (
 <div className="flex items-center gap-1.5 mt-1 flex-wrap">
 {item.prepType && <span className="text-[10px] font-bold text-gray-600 bg-white/40 px-2 py-0.5 rounded-md border border-white/50 shadow-sm">{item.prepType}</span>}
 {item.spiceLevel && <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200/50 shadow-sm">{item.spiceLevel}</span>}
 </div>
 )}
 <p className="text-xs text-gray-500 mt-1.5 font-bold">₹{item.price} <span className="text-rose-400 mx-1">x</span> {item.qty}</p>
 </div>
 <p className="text-sm md:text-base font-black text-gray-800 bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 shadow-sm">₹{item.price * item.qty}</p>
 </div>
 ))}
 </div>
 
 <div className="mt-5 pt-5 border-t border-white/30 flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/20">
 <span className="text-sm md:text-base font-bold text-gray-600 uppercase tracking-wider">Total</span>
 <span className="text-xl md:text-2xl font-black text-gray-900">₹{order.total}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
