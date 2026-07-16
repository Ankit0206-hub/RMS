import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export default function WaiterOrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const order = {
        id: `#${orderId || '128'}`, table: 'T01', time: '07:18 PM', status: 'Preparing', total: 300,
        items: [{ name: 'Paneer Butter Masala', qty: 2, price: 120 }, { name: 'Garlic Naan', qty: 2, price: 30 }]
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
                <button className="text-sm font-bold text-[#ff5722] hover:underline">Help</button>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-3xl mx-auto w-full pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order {order.id}</h2>
                            <div className="flex items-center mt-1">
                                <span className="bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded-md text-xs mr-2">Table {order.table}</span>
                                <span className="text-xs font-medium text-gray-500 flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {order.time}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="relative pl-6 space-y-6 border-l-2 border-gray-100 ml-3">
                            <div className="relative"><span className="absolute -left-[35px] top-0 bg-green-500 text-white rounded-full p-0.5"><CheckCircle2 className="h-5 w-5" /></span><p className="text-sm font-bold text-gray-900">Order Placed</p><p className="text-xs text-gray-500 font-medium">07:18 PM</p></div>
                            <div className="relative"><span className="absolute -left-[33px] top-0.5 bg-white border-4 border-orange-500 h-4 w-4 rounded-full"></span><p className="text-sm font-bold text-[#ff5722]">Preparing</p><p className="text-xs text-orange-400 font-medium">07:22 PM</p></div>
                            <div className="relative"><span className="absolute -left-[33px] top-0.5 bg-white border-4 border-gray-200 h-4 w-4 rounded-full"></span><p className="text-sm font-bold text-gray-400">Ready</p><p className="text-xs text-gray-400 font-medium">Pending</p></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div><p className="text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500 mt-0.5 font-medium">₹{item.price} x {item.qty}</p></div>
                                <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">Total</span><span className="text-lg font-bold text-gray-900">₹{order.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
