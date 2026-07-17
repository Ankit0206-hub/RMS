import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Clock } from 'lucide-react';

const Preparing = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All'); 

    // Dummy data
    const preparingOrders = [
        { id: '132', table: 'T05', items: 4, guests: 4, elapsedMin: 25, startedAt: '07:05 PM', instructions: null }, // Long running
        { id: '130', table: 'T01', items: 5, guests: 5, elapsedMin: 15, startedAt: '07:15 PM', instructions: 'No ice in drinks' },
        { id: '129', table: 'T03', items: 3, guests: 2, elapsedMin: 10, startedAt: '07:20 PM', instructions: null },
    ];

    const displayOrders = filter === 'All' ? preparingOrders : preparingOrders.filter(o => o.elapsedMin >= 20);

    return (
        <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-2 h-full w-full">
            {/* Header & Controls */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-900 font-black text-2xl tracking-tight">
                    Preparing <span className="text-gray-400 font-medium ml-2">({displayOrders.length})</span>
                </h2>
                <div className="flex bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setFilter('All')}
                        className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${
                            filter === 'All' ? 'bg-white text-gray-900 border border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        All Active
                    </button>
                    <button
                        onClick={() => setFilter('Long')}
                        className={`px-5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${
                            filter === 'Long' ? 'bg-white text-[#f97316] border border-red-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${filter === 'Long' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        Long Running
                    </button>
                </div>
            </div>

            {/* Flat Horizontal Cards List */}
            <div className="flex flex-col gap-4">
                {displayOrders.map((order) => {
                    const isLongRunning = order.elapsedMin >= 20;
                    
                    return (
                        <div 
                            key={order.id} 
                            className={`bg-white rounded-lg border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden ${
                                isLongRunning ? 'border-[#f97316]' : 'border-gray-200'
                            }`}
                        >
                            {/* Urgent Solid Bar for Long Running */}
                            {isLongRunning && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                            )}

                            {/* Left: Table & Order Info */}
                            <div className="flex items-center gap-5 md:w-1/4 shrink-0 pl-1">
                                <div className={`${
                                    isLongRunning ? 'bg-red-600' : 'bg-[#f97316]'
                                } text-white text-2xl font-black px-4 py-3 rounded-lg shrink-0`}>
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
                                    <div className="hidden md:block w-full max-w-sm"></div> // Spacer
                                )}
                            </div>
                            
                            {/* Right: Time & Actions */}
                            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 md:w-auto shrink-0 justify-end w-full">
                                <div className="text-center sm:text-right hidden sm:block md:hidden lg:block lg:mr-4">
                                    <span className={`font-black text-2xl block flex items-center gap-1.5 justify-end ${
                                        isLongRunning ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        <Clock size={20} strokeWidth={3} className={isLongRunning ? 'text-red-500' : 'text-amber-500'} />
                                        {order.elapsedMin}m
                                    </span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Elapsed Time</span>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={() => navigate(`/kitchen/orders/${order.id}`)}
                                        className="flex-1 sm:flex-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-lg transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        className={`flex-1 sm:flex-none text-white font-bold py-2.5 px-6 rounded-lg transition-colors ${
                                            isLongRunning 
                                                ? 'bg-red-600 hover:bg-red-700' 
                                                : 'bg-[#f97316] hover:bg-[#ea580c]'
                                        }`}
                                    >
                                        Mark Ready
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {displayOrders.length === 0 && (
                    <div className="text-center bg-white rounded-lg border border-gray-200 text-gray-500 py-20 font-bold text-lg">
                        No orders are currently being prepared.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Preparing;
