import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Clock } from 'lucide-react';
import kitchenApi from '../../services/kitchenApi';

const Ready = () => {
    const navigate = useNavigate();
    const [readyOrders, setReadyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await kitchenApi.getOrders("Cooked");
            if (res.success) {
                setReadyOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch ready orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        
        // Setup WebSocket for real-time updates
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/kitchen?token=${token}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => console.log("Kitchen WebSocket connected for Ready Orders");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "order.updated") {
                    if (data.payload.status === "Cooked") {
                        fetchOrders(); 
                    } else if (data.payload.status !== "Cooked") {
                        setReadyOrders(prev => prev.filter(o => o.id !== data.payload.id));
                    }
                }
            } catch (err) {
                console.error("WS message error", err);
            }
        };
        
        return () => ws.close();
    }, []);

    // Calculate dynamic wait time
    const ordersWithTime = readyOrders.map(order => {
        const start = new Date(order.updated_at || order.created_at).getTime();
        const now = new Date().getTime();
        const waitTimeMin = Math.floor((now - start) / 60000);
        return { ...order, waitTimeMin };
    });

    if (loading) {
        return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
    }

    return (
        <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-2 h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-gray-900 font-black text-2xl tracking-tight">
                    Ready To Serve <span className="text-gray-400 font-medium ml-2">({ordersWithTime.length})</span>
                </h2>
            </div>

            {/* Flat Horizontal Cards List */}
            <div className="flex flex-col gap-4">
                {ordersWithTime.map((order) => {
                    const itemCount = order.items ? order.items.reduce((acc, it) => acc + it.quantity, 0) : 0;
                    const readyTime = new Date(order.updated_at || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                    <div 
                        key={order.id}
                        onClick={() => navigate(`/kitchen/orders/${order.id}`)}
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer relative overflow-hidden transition-shadow hover:shadow-md"
                    >
                        {/* Green accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f97316]"></div>

                        {/* Left: Table & Order Info */}
                        <div className="flex items-center gap-5 md:w-1/4 shrink-0 pl-1">
                            <div className="bg-[#f97316] hover:bg-[#ea580c] text-white text-2xl font-black px-4 py-3 rounded-lg shrink-0">
                                {order.table_number || "TA"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-black text-xl tracking-wide mb-1">Order #{order.id}</span>
                                <span className="text-gray-500 font-semibold text-sm">
                                    {itemCount} Items • {order.order_type}
                                </span>
                            </div>
                        </div>

                        {/* Middle: Special Instructions (If any) */}
                        <div className="md:w-1/3 flex justify-start md:justify-center">
                            {order.special_instructions ? (
                                <div className="bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg border border-amber-200 flex items-start gap-2 w-full max-w-sm">
                                    <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-wider text-amber-600/80 mb-0.5">Special Instructions</span>
                                        <span className="font-bold text-sm leading-snug">{order.special_instructions}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:block w-full max-w-sm"></div> // Spacer
                            )}
                        </div>

                        {/* Right: Time & Status */}
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 md:w-auto shrink-0 justify-end w-full">
                            <div className="text-center sm:text-right hidden sm:block md:hidden lg:block lg:mr-4">
                                <span className="text-gray-900 font-black text-xl block">{readyTime}</span>
                                <span className="text-[#f97316] font-black text-[10px] uppercase tracking-widest bg-emerald-50 border border-[#f97316] px-2 py-0.5 rounded-full inline-block mt-1">Ready</span>
                            </div>
                            
                            <div className="w-full sm:w-auto">
                                <div className="bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-lg flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                        <Clock size={18} />
                                        Waiting for Waiter
                                    </div>
                                    <span className="text-gray-900 font-black text-lg">{order.waitTimeMin}m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}

                {ordersWithTime.length === 0 && (
                    <div className="text-center bg-white rounded-lg border border-gray-200 text-gray-500 py-20 font-bold text-lg">
                        No orders are currently waiting for pickup.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ready;
