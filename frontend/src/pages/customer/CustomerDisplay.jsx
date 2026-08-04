import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Utensils, CheckCircle2, Clock } from 'lucide-react';

const CustomerDisplay = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: ordersData, isLoading, error } = useQuery({
        queryKey: ['customer-display-orders'],
        queryFn: async () => {
            const res = await api.get('/admin/ordering/orders?page_size=100');
            return res.data.data;
        },
        refetchInterval: 3000 // Poll every 3 seconds
    });

    const activeOrders = ordersData?.filter(order => !['Served', 'Completed', 'Cancelled'].includes(order.status)) || [];

    const preparingOrders = [];
    const readyOrders = [];

    activeOrders.forEach(order => {
        // Calculate aggregate status from items
        const itemStatuses = order.items?.map(i => i.status) || [];
        const isReady = order.status === 'Cooked' || (itemStatuses.length > 0 && itemStatuses.every(s => s === 'prepared'));

        if (isReady) {
            readyOrders.push(order);
        } else {
            // Assume preparing if not ready
            preparingOrders.push(order);
        }
    });

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-inter overflow-hidden">
            {/* Header */}
            <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 shrink-0 shadow-sm relative z-10">
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                        <Utensils className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">DineOps <span className="text-indigo-600">Display</span></h1>
                        <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Order Status</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black tabular-nums tracking-tight text-gray-900">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-base font-bold text-gray-500 uppercase tracking-wider mt-1">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Preparing Column */}
                <div className="w-1/2 flex flex-col border-r-2 border-gray-200 bg-white relative">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-500"></div>
                    <div className="px-10 py-8 shrink-0 flex items-center justify-between border-b border-gray-100">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-4">
                            Preparing
                            <div className="flex space-x-1.5 ml-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </h2>
                        <span className="bg-amber-100 text-amber-600 text-2xl font-black px-5 py-1.5 rounded-xl">{preparingOrders.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-10 pt-8 pb-10 scrollbar-hide bg-gray-50/50">
                        <div className="grid grid-cols-3 gap-6">
                            {preparingOrders.map(order => (
                                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400"></div>
                                    <span className="block text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Order Number</span>
                                    <span className="text-6xl font-black text-gray-900 tabular-nums tracking-tighter">
                                        {order.id.toString().padStart(3, '0')}
                                    </span>
                                </div>
                            ))}
                            {preparingOrders.length === 0 && !isLoading && (
                                <div className="col-span-2 py-32 flex flex-col items-center justify-center text-gray-400">
                                    <Clock className="w-16 h-16 mb-4 opacity-50" />
                                    <span className="font-bold text-2xl">No orders preparing</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ready Column */}
                <div className="w-1/2 flex flex-col bg-white relative">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
                    <div className="px-10 py-8 shrink-0 flex items-center justify-between border-b border-gray-100">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-emerald-600 uppercase flex items-center gap-4">
                            Ready
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </h2>
                        <span className="bg-emerald-100 text-emerald-700 text-2xl font-black px-5 py-1.5 rounded-xl">{readyOrders.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 pt-8 pb-10 scrollbar-hide bg-emerald-50/30">
                        <div className="grid grid-cols-2 gap-6">
                            {readyOrders.map(order => (
                                <div key={order.id} className="bg-emerald-600 rounded-3xl p-6 shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex justify-between items-center transform transition-all animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="px-6 py-6 h-24 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner shrink-0 min-w-[120px]">
                                            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest leading-none mb-1">Order</span>
                                            <span className="text-emerald-600 font-black text-4xl leading-none">{order.id.toString().padStart(3, '0')}</span>
                                        </div>
                                        <div>
                                            <span className="text-5xl font-black text-white tracking-tight leading-none block">
                                                Ready to Serve
                                            </span>
                                            <span className="block text-emerald-100 font-bold uppercase tracking-widest text-sm mt-2">Waiter is on the way</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {readyOrders.length === 0 && !isLoading && (
                                <div className="py-32 flex flex-col items-center justify-center text-emerald-200">
                                    <CheckCircle2 className="w-16 h-16 mb-4 opacity-50" />
                                    <span className="font-bold text-2xl text-emerald-600/50">No orders ready for collection</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* CSS specific to display */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default CustomerDisplay;
