import React from'react';
import {useNavigate, useParams} from'react-router-dom';
import {ArrowLeft, Clock, CheckCircle2, ShoppingBag} from'lucide-react';

export default function WaiterReadyToServe() {
 const navigate = useNavigate();
 const {orderId} = useParams();
 const order = {id:`#${orderId ||'129'}`, table:'T02', time:'07:42 PM', status:'Ready', total: 120, items: [{name:'Cold Drink', qty: 3, price: 40}]};

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
 <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Order Ready</h1>
 </div>
 <div className="w-10"></div>
 </div>
 </div>

 <div className="px-4 md:px-8 py-4 md:py-8 w-full flex-1 space-y-6 pb-32 max-w-4xl mx-auto">
 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40 transition-colors">
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
 <div className="relative pl-6 space-y-6 border-l-2 border-teal-400 ml-3">
 <div className="relative">
 <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm">
 <CheckCircle2 className="h-5 w-5"/>
 </span>
 <p className="text-sm md:text-base font-black text-gray-800">Order Placed</p>
 </div>
 <div className="relative">
 <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm">
 <CheckCircle2 className="h-5 w-5"/>
 </span>
 <p className="text-sm md:text-base font-black text-gray-800">Preparing</p>
 </div>
 <div className="relative">
 <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-teal-500 h-4 w-4 rounded-full shadow-sm"></span>
 <p className="text-sm md:text-base font-black text-teal-600">Ready to Serve</p>
 <p className="text-xs md:text-sm text-teal-500/80 font-bold mt-0.5">Kitchen marked as ready</p>
 </div>
 </div>
 </div>
 </div>
 
 <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
 <div className="flex items-center mb-5">
 <div className="bg-white/30 text-gray-700 p-2 rounded-xl mr-3 border border-white/40 backdrop-blur-md">
 <ShoppingBag className="h-5 w-5 text-rose-500"/>
 </div>
 <h3 className="font-black text-gray-800 text-lg">Items to Serve</h3>
 </div>
 
 <div className="space-y-2">
 {order.items.map((item, i) => (
 <div key={i} className="flex justify-between items-center py-3 border-b border-white/30 last:border-0 last:pb-0">
 <div>
 <p className="text-sm md:text-[15px] font-bold text-gray-800">{item.name}</p>
 <p className="text-xs text-gray-500 mt-1 font-bold">₹{item.price} <span className="text-rose-400 mx-1">x</span> {item.qty}</p>
 </div>
 <p className="text-sm md:text-base font-black text-gray-800 bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 shadow-sm">₹{item.price * item.qty}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 md:p-6 bg-white/10 backdrop-blur-xl z-40 border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex justify-center">
 <div className="w-full max-w-4xl space-y-3">
 <button onClick={() => navigate(-1)} className="w-full bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-[18px] py-4 font-bold text-[15px] md:text-lg shadow-sm active:scale-95 transition-all flex items-center justify-center border border-rose-300/50">
 Mark as Served
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
