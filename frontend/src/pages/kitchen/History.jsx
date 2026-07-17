import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Today'); // 'Today', 'Yesterday', 'This Week'

    // Dummy data
    const historyOrders = [
        { id: '126', table: 'T02', items: 4, guests: 4, readyAt: '07:45 PM', prepDuration: '22 min', date: 'Today' },
        { id: '125', table: 'T05', items: 2, guests: 2, readyAt: '06:30 PM', prepDuration: '12 min', date: 'Today' },
        { id: '110', table: 'T10', items: 6, guests: 6, readyAt: '08:15 PM', prepDuration: '30 min', date: 'Yesterday' },
    ];

    const displayOrders = historyOrders.filter(o => {
        if (filter === 'Today') return o.date === 'Today';
        if (filter === 'Yesterday') return o.date === 'Yesterday';
        return true; // This Week
    });

    return (
        <div className="p-4 flex flex-col gap-4 h-full bg-gray-50">
            {/* Header & Controls */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-800 font-bold text-lg">History ({displayOrders.length})</h2>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0f5132]"
                >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="This Week">This Week</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="flex flex-col gap-4">
                {displayOrders.map((order) => (
                    <div 
                        key={order.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Card Header */}
                        <div className="bg-gray-100 p-3 px-4 flex justify-between items-center border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-500 text-white text-lg font-bold px-3 py-1 rounded-lg">
                                    {order.table}
                                </span>
                                <span className="text-gray-800 font-bold text-lg">Order #{order.id}</span>
                            </div>
                            <span className="text-gray-500 font-black uppercase text-xs tracking-wider bg-gray-200 px-2 py-1 rounded-md">
                                Completed
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-semibold">{order.items} Items • {order.guests} Guests</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-900 font-black text-lg">
                                        {order.readyAt}
                                    </span>
                                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                        Ready Time
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Prep Duration</span>
                                <span className="text-gray-800 font-black">{order.prepDuration}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {displayOrders.length === 0 && (
                    <div className="text-center text-gray-500 py-10 font-medium">
                        No history found for {filter.toLowerCase()}.
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
