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

            {/* Content Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {ordersWithTime.map((order) => {
                    const itemCount = order.items ? order.items.reduce((acc, it) => acc + it.quantity, 0) : 0;
                    const readyTime = new Date(order.updated_at || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                    <div 
                        key={order.id} 
                        className="bg-zinc-900 flex flex-col rounded-xl overflow-hidden border border-zinc-700/80 shadow-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all"
                    >
                        {/* Ticket Header */}
                        <div className="bg-blue-600 p-3 flex justify-between items-start text-white">
                            <div>
                                <h3 className="font-black text-3xl leading-none">
                                    {order.table_number || "TA"}
                                </h3>
                                <span className="text-blue-100 font-bold text-xs uppercase tracking-wider mt-1 block">
                                    {order.order_type}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-lg block">{readyTime}</span>
                                <span className="font-bold text-blue-200 text-xs">#{order.id}</span>
                            </div>
                        </div>

                        {/* Special Instructions (Optional Header Banner) */}
                        {order.special_instructions && (
                            <div className="bg-amber-500/20 text-amber-400 p-2 text-xs font-bold border-b border-amber-500/20 flex items-center gap-1.5 leading-tight">
                                <Info size={14} className="shrink-0" />
                                {order.special_instructions}
                            </div>
                        )}

                        {/* Ticket Body (Items List) */}
                        <div className="p-3 flex-1 overflow-y-auto bg-zinc-900 min-h-[150px] max-h-[250px] custom-scrollbar">
                            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-2 flex justify-between">
                                <span>{itemCount} Items</span>
                                <span>Waiting: {order.waitTimeMin}m</span>
                            </div>
                            <ul className="flex flex-col gap-3">
                                {order.items?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-zinc-200">
                                        <span className="font-black text-blue-400 text-lg w-6 shrink-0">{item.quantity}</span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base leading-tight">{item.menu_item_name}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Ticket Footer / Action */}
                        <div className="p-3 bg-zinc-950 border-t border-zinc-800 grid grid-cols-1 gap-2 mt-auto">
                            <button 
                                onClick={() => navigate(`/kitchen/orders/${order.id}`)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-lg transition-colors text-sm w-full"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                )})}

                {ordersWithTime.length === 0 && (
                    <div className="col-span-full text-center bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 py-20 font-bold text-xl flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                            <Info className="text-zinc-600 w-8 h-8" />
                        </div>
                        No orders are currently waiting for pickup.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ready;
