import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Clock } from 'lucide-react';

export default function WaiterOrders() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Active');
    const orders = [
        { id: '#128', table: 'T01', time: '07:18 PM', status: 'Preparing', items: [{ name: 'Paneer Butter Masala', qty: 2 }, { name: 'Garlic Naan', qty: 2 }] },
        { id: '#127', table: 'T03', time: '07:10 PM', status: 'Preparing', items: [{ name: 'Mix Veg', qty: 1 }, { name: 'Tandoori Roti', qty: 4 }] },
        { id: '#126', table: 'T02', time: '06:50 PM', status: 'Completed', items: [{ name: 'Tomato Soup', qty: 2 }] }
    ];
    const filteredOrders = activeTab === 'Active' ? orders.filter(o => o.status !== 'Completed') : orders.filter(o => o.status === 'Completed');

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
                <button className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-md mx-auto w-full pb-24">
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Active' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Active (4)</button>
                    <button onClick={() => setActiveTab('Completed')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Completed' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Completed (12)</button>
                </div>
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">Order {order.id}</h3>
                                        <span className="bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-md text-xs">Table {order.table}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {order.time}
                                    </div>
                                </div>
                                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${order.status === 'Preparing' ? 'bg-orange-50 text-[#ff5722]' : 'bg-green-50 text-green-600'}`}>{order.status}</span>
                            </div>
                            <div className="space-y-1.5 mt-4 mb-5 border-t border-gray-50 pt-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="text-sm font-medium text-gray-600 flex justify-between">
                                        <span>{item.name}</span><span className="font-bold text-gray-900 ml-1">x{item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-50 pt-4 flex justify-end">
                                <button onClick={() => navigate(`/waiter/orders/${order.id.replace('#', '')}`)} className="flex items-center text-[#ff5722] text-sm font-bold hover:underline">
                                    View Details <ChevronRight className="h-4 w-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
