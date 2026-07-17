import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

const NewOrders = () => {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState('newest');

    // Dummy data
    const rawOrders = [
        { id: '131', table: 'T09', items: 2, guests: 3, time: '07:08 PM', instructions: 'Extra ketchup please' },
        { id: '130', table: 'T01', items: 5, guests: 5, time: '07:10 PM', instructions: null },
        { id: '129', table: 'T03', items: 3, guests: 2, time: '07:12 PM', instructions: null },
        { id: '128', table: 'T07', items: 5, guests: 4, time: '07:15 PM', instructions: 'Less spicy, No onion' },
    ];

    const orders = [...rawOrders].sort((a, b) => {
        if (sortOrder === 'newest') return -1; 
        if (sortOrder === 'oldest') return 1;
        return 0;
    });

    return (
        <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-2 h-full w-full">
            {/* Header & Controls */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-900 font-black text-2xl tracking-tight">
                    New Orders <span className="text-gray-400 font-medium ml-2">({orders.length})</span>
                </h2>
                <div className="relative">
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-4 focus:ring-green-500/20 focus:border-[#ea580c] shadow-sm cursor-pointer transition-all"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Premium Horizontal Cards List */}
            <div className="flex flex-col gap-4">
                {orders.map((order) => (
                    <div 
                        key={order.id} 
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                        {/* Left: Table & Order Info */}
                        <div className="flex items-center gap-5 md:w-1/4 shrink-0">
                            <div className="bg-[#f97316] text-white text-2xl font-black px-4 py-3 rounded-lg shrink-0">
                                {order.table}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-black text-xl tracking-wide mb-1">Order #{order.id}</span>
                                <span className="text-gray-500 font-semibold text-sm">
                                    {order.items} Items • {order.guests} Guests
                                </span>
                            </div>
                        </div>

                        {/* Middle: Special Instructions (If any) */}
                        <div className="md:w-1/3 flex justify-start md:justify-center">
                            {order.instructions ? (
                                <div className="bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg border border-amber-200 flex items-start gap-2 w-full max-w-sm">
                                    <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-wider text-amber-600/80 mb-0.5">Special Instructions</span>
                                        <span className="font-bold text-sm leading-snug">{order.instructions}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:block w-full max-w-sm"></div> // Spacer to keep layout balanced
                            )}
                        </div>
                        
                        {/* Right: Time & Actions */}
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 md:w-auto shrink-0 justify-end w-full">
                            <div className="text-center sm:text-right hidden sm:block md:hidden lg:block lg:mr-4">
                                <span className="text-gray-900 font-black text-xl block">{order.time}</span>
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Received</span>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => navigate(`/kitchen/orders/${order.id}`)}
                                    className="flex-1 sm:flex-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-lg transition-colors"
                                >
                                    View Details
                                </button>
                                <button 
                                    className="flex-1 sm:flex-none bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                                >
                                    Start Preparing
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {orders.length === 0 && (
                    <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 py-20 font-bold text-lg">
                        No new orders at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewOrders;
