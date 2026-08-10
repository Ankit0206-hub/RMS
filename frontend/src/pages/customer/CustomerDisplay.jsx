import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { getWsUrl } from '../../services/api';
import { Utensils, CheckCircle2, Clock } from 'lucide-react';
import { playNotificationSound } from '../../utils/audio';

const CustomerDisplay = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: ordersData, isLoading, error, refetch } = useQuery({
        queryKey: ['customer-display-orders', sessionId],
        queryFn: async () => {
            const res = await api.get('/customer/display/active-orders');
            return res.data.data;
        },
        refetchInterval: false // Disabled polling, using WebSockets now
    });

    // Setup WebSocket and Audio
    useEffect(() => {
        const wsUrl = `${getWsUrl()}/ws/display`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log("Display WebSocket connected");
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // When an order is created or updated, fetch fresh data
                if (data.event === "order.created" || data.event === "order.updated" || data.event === "ORDER_ITEM_UPDATED" || data.event === "ORDER_UPDATED") {
                    playNotificationSound();
                    refetch();
                }
            } catch (error) {
                console.error("Error parsing websocket message", error);
            }
        };

        return () => ws.close();
    }, [refetch]);

    // Audio announcement when new orders become ready
    const [previousReadyCount, setPreviousReadyCount] = useState(0);

    const activeOrders = ordersData || [];

    const preparingOrders = [];
    const readyOrders = [];

    activeOrders.forEach(order => {
        if (order.status === "Ready") {
            readyOrders.push(order);
        } else {
            preparingOrders.push(order);
        }
    });

    // Play chime/announcement on new ready orders
    useEffect(() => {
        if (readyOrders.length > previousReadyCount) {
            // Find newly ready orders
            const newlyReady = readyOrders[readyOrders.length - 1]; // simplifying for now
            if (newlyReady && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Order number ${newlyReady.token_number} is ready for collection.`);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            }
        }
        setPreviousReadyCount(readyOrders.length);
    }, [readyOrders.length, readyOrders]);

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-inter overflow-hidden">
            {/* Header */}
            <header className="h-20 md:h-24 bg-white border-b border-gray-200 flex items-center justify-between px-8 md:px-10 shrink-0 shadow-sm relative z-10">
                <div className="flex items-center space-x-4 md:space-x-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md">
                        <Utensils className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 leading-none">DineOps <span className="text-indigo-600">Display</span></h1>
                        <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Order Status</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl md:text-4xl font-black tabular-nums tracking-tight text-gray-900 leading-none">
                        {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mt-1 md:mt-2">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Preparing Column */}
                <div className="w-1/2 flex flex-col border-r-2 border-gray-200 bg-white relative">
                    <div className="absolute top-0 inset-x-0 h-1 md:h-2 bg-amber-500"></div>
                    <div className="px-6 md:px-10 py-6 md:py-8 shrink-0 flex items-center justify-between border-b border-gray-100">
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-3 md:gap-4">
                            Preparing
                            
                            {/* Highly Realistic Animated Serving Cloche with Steam */}
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="ml-2 w-12 h-12 md:w-16 md:h-16 shrink-0 overflow-visible">
                                <defs>
                                    <linearGradient id="domeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fef08a" />
                                        <stop offset="40%" stopColor="#eab308" />
                                        <stop offset="100%" stopColor="#a16207" />
                                    </linearGradient>
                                    <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#854d0e" />
                                        <stop offset="20%" stopColor="#eab308" />
                                        <stop offset="50%" stopColor="#fef08a" />
                                        <stop offset="80%" stopColor="#eab308" />
                                        <stop offset="100%" stopColor="#854d0e" />
                                    </linearGradient>
                                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
                                    </filter>
                                </defs>
                                
                                {/* Steam Particles (Animated) */}
                                <g className="animate-steam" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0">
                                    <path d="M 40 55 Q 33 40 40 25 T 40 10" />
                                    <path d="M 50 60 Q 55 45 50 30 T 50 10" strokeWidth="3.5" />
                                    <path d="M 60 55 Q 67 40 60 25 T 60 10" />
                                </g>

                                {/* Static Base Plate */}
                                <ellipse cx="50" cy="80" rx="42" ry="12" fill="url(#baseGrad)" filter="url(#dropShadow)" />
                                <ellipse cx="50" cy="77" rx="36" ry="8" fill="#fef08a" opacity="0.6" />

                                {/* Animated Dome */}
                                <g className="animate-cloche-reveal" style={{ transformOrigin: 'center' }}>
                                    {/* Main Dome */}
                                    <path d="M 14 77 C 14 30, 86 30, 86 77 Z" fill="url(#domeGrad)" filter="url(#dropShadow)" />
                                    {/* Dome Light Reflection for Realism */}
                                    <path d="M 23 75 C 23 45, 42 40, 48 40 C 35 40, 20 52, 20 75 Z" fill="#ffffff" opacity="0.4" />
                                    {/* Handle Base */}
                                    <path d="M 42 33 Q 50 25 58 33 Z" fill="#ca8a04" />
                                    {/* Handle Knob */}
                                    <circle cx="50" cy="27" r="5" fill="#fde047" />
                                    <circle cx="48" cy="25" r="2" fill="#ffffff" opacity="0.6" />
                                </g>
                            </svg>
                        </h2>
                        <span className="bg-amber-100 text-amber-600 text-xl md:text-2xl font-black px-4 md:px-5 py-1.5 rounded-xl">{preparingOrders.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-8 pb-10 scrollbar-hide bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
                            {preparingOrders.map(order => (
                                <div key={order.id} className="bg-white border-2 border-gray-100 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[120px] md:min-h-[140px]">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400"></div>
                                    <span className="block text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-2">Order Number</span>
                                    <span className="text-4xl md:text-5xl font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                                        {order.token_number}
                                    </span>
                                </div>
                            ))}
                            {preparingOrders.length === 0 && !isLoading && (
                                <div className="col-span-full py-24 md:py-32 flex flex-col items-center justify-center text-gray-400">
                                    <Clock className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
                                    <span className="font-bold text-xl md:text-2xl">No orders preparing</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ready Column */}
                <div className="w-1/2 flex flex-col bg-white relative">
                    <div className="absolute top-0 inset-x-0 h-1 md:h-2 bg-emerald-500"></div>
                    <div className="px-6 md:px-10 py-6 md:py-8 shrink-0 flex items-center justify-between border-b border-gray-100">
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-emerald-600 uppercase flex items-center gap-3 md:gap-4">
                            Ready
                            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 shrink-0" />
                        </h2>
                        <span className="bg-emerald-100 text-emerald-700 text-xl md:text-2xl font-black px-4 md:px-5 py-1.5 rounded-xl">{readyOrders.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-8 pb-10 scrollbar-hide bg-emerald-50/30">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 auto-rows-max">
                            {readyOrders.map(order => (
                                <div key={order.id} className="bg-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex justify-between items-center transform transition-all animate-in fade-in slide-in-from-right-8 duration-500 min-h-[100px] md:min-h-[110px]">
                                    <div className="flex items-center gap-3 md:gap-4 w-full">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white flex flex-col items-center justify-center shadow-inner shrink-0">
                                            <span className="text-gray-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest leading-none mb-1">Order</span>
                                            <span className="text-emerald-600 font-black text-xl md:text-2xl leading-none">{order.token_number}</span>
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <span className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none block truncate">
                                                Ready to Serve
                                            </span>
                                            <span className="block text-emerald-100 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1.5 md:mt-2 truncate">Waiter is on the way</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {readyOrders.length === 0 && !isLoading && (
                                <div className="col-span-full py-24 md:py-32 flex flex-col items-center justify-center text-emerald-200">
                                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
                                    <span className="font-bold text-xl md:text-2xl text-emerald-600/50">No orders ready for collection</span>
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
                
                @keyframes cloche-reveal {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    10% { transform: translateY(-3px) rotate(3deg); }
                    25%, 50% { transform: translateY(-25px) rotate(-5deg); }
                    65% { transform: translateY(-3px) rotate(2deg); }
                }

                @keyframes steam-rise {
                    0%, 15%, 100% { opacity: 0; transform: translateY(15px) scale(0.8); }
                    30% { opacity: 0.6; transform: translateY(0px) scale(1); }
                    60% { opacity: 0; transform: translateY(-20px) scale(1.1); }
                }

                .animate-cloche-reveal {
                    animation: cloche-reveal 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                
                .animate-steam {
                    animation: steam-rise 1.8s ease-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CustomerDisplay;
