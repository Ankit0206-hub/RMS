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
        <div className="p-4 sm:p-6 flex flex-col gap-4 min-h-screen bg-[#0f172a] text-zinc-100 font-sans w-full">
            {/* Header & Controls */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Order History
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full text-xl">{displayOrders.length}</span>
                </h2>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none shadow-inner cursor-pointer"
                >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="This Week">This Week</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayOrders.map((order) => (
                    <div 
                        key={order.id}
                        className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl shadow-lg border border-zinc-700/50 overflow-hidden hover:border-zinc-500 transition-colors group"
                    >
                        {/* Card Header */}
                        <div className="bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <span className="bg-zinc-800 text-zinc-300 text-lg font-black px-3 py-1.5 rounded-xl border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
                                    {order.table}
                                </span>
                                <span className="text-white font-black text-xl">#{order.id}</span>
                            </div>
                            <span className="text-emerald-400 font-black uppercase text-[10px] tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                Completed
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex flex-col gap-5">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400 font-bold">{order.items} Items • {order.guests} Guests</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-white font-black text-xl">
                                        {order.readyAt}
                                    </span>
                                    <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest mt-0.5">
                                        Completed At
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 shadow-inner">
                                <span className="text-zinc-500 font-black text-xs uppercase tracking-widest">Prep Time</span>
                                <span className="text-emerald-400 font-black text-lg">{order.prepDuration}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {displayOrders.length === 0 && (
                    <div className="col-span-full text-center bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 py-20 font-bold text-xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                            <span className="text-3xl opacity-50">📅</span>
                        </div>
                        No history found for {filter.toLowerCase()}.
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
