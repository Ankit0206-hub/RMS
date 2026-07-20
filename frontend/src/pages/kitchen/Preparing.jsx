import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Clock } from 'lucide-react';
import kitchenApi from '../../services/kitchenApi';
import toast from 'react-hot-toast';

const Preparing = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [preparingOrders, setPreparingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState('orders'); // 'orders' or 'items'

    const fetchOrders = async () => {
        try {
            const res = await kitchenApi.getOrders("Preparing");
            if (res.success) {
                setPreparingOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch preparing orders:", error);
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

        ws.onopen = () => console.log("Kitchen WebSocket connected for Preparing Orders");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "order.updated") {
                    if (data.payload.status === "Preparing") {
                        fetchOrders();
                    } else if (data.payload.status !== "Preparing") {
                        if (data.payload.status === "Cancelled") {
                            toast(`Order #${data.payload.id} was cancelled`, { icon: '❌' });
                        }
                        setPreparingOrders(prev => prev.filter(o => o.id !== data.payload.id));
                    }
                }
            } catch (err) {
                console.error("WS message error", err);
            }
        };

        return () => ws.close();
    }, []);

    const handleMarkReady = async (orderId) => {
        try {
            await kitchenApi.updateOrderStatus(orderId, "Cooked");
            toast.success("Order marked as Ready");
            setPreparingOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to mark as ready");
        }
    };

    // Calculate elapsed time dynamically
    const ordersWithTime = preparingOrders.map(order => {
        // Find when it became "Preparing"
        // Wait, for MVP, just use created_at or updated_at difference
        const start = new Date(order.updated_at || order.created_at).getTime();
        const now = new Date().getTime();
        const elapsedMin = Math.floor((now - start) / 60000);
        return { ...order, elapsedMin };
    });

    const displayOrders = filter === 'All' ? ordersWithTime : ordersWithTime.filter(o => o.elapsedMin >= 20);

    const aggregatedItems = {};
    if (viewMode === 'items') {
        displayOrders.forEach(order => {
            order.items?.forEach(item => {
                const key = item.menu_item_name;
                if (!aggregatedItems[key]) {
                    aggregatedItems[key] = {
                        name: item.menu_item_name,
                        quantity: 0,
                        orders: [],
                        image: item.menu_item_image,
                    };
                }
                aggregatedItems[key].quantity += item.quantity;
                aggregatedItems[key].orders.push(`Order #${order.id} (x${item.quantity})`);
            });
        });
    }
    const itemViewData = Object.values(aggregatedItems);

    if (loading) {
        return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
    }

    return (
        <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-2 h-full w-full">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h2 className="text-gray-900 font-black text-2xl tracking-tight">
                    Preparing <span className="text-gray-400 font-medium ml-2">({displayOrders.length})</span>
                </h2>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('orders')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Order View
                        </button>
                        <button
                            onClick={() => setViewMode('items')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'items' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Item View
                        </button>
                    </div>

                    {viewMode === 'orders' && (
                        <div className="flex bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setFilter('All')}
                                className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${filter === 'All' ? 'bg-white text-gray-900 border border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                All Active
                            </button>
                            <button
                                onClick={() => setFilter('Long')}
                                className={`px-5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${filter === 'Long' ? 'bg-white text-[#f97316] border border-red-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${filter === 'Long' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                Long Running
                            </button>
                        </div>
                    )}
                </div>
            </div>            {/* Content Area */}
            {viewMode === 'items' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {itemViewData.map((item, index) => (
                        <div key={index} className="bg-zinc-900 rounded-2xl border border-zinc-700 p-5 flex gap-5 items-center shadow-lg hover:border-orange-500/50 transition-all">
                            <div className="relative">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-inner" />
                                <div className="absolute -top-3 -right-3 bg-orange-500 text-white font-black text-xl h-9 w-9 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] border-2 border-zinc-900">
                                    {item.quantity}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg leading-tight">{item.name}</h3>
                                <div className="mt-2 text-zinc-400 text-xs font-bold">
                                    Needed for: <span className="text-zinc-300">{item.orders.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {itemViewData.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-600 font-bold border-2 border-dashed border-zinc-800 rounded-2xl">
                            <span className="text-xl">No items pending prep.</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {displayOrders.map((order) => {
                        const itemCount = order.items ? order.items.reduce((acc, it) => acc + it.quantity, 0) : 0;
                        const isLongRunning = order.elapsedMin > 20;

                        return (
                        <div 
                            key={order.id} 
                            className={`bg-zinc-900 flex flex-col rounded-xl overflow-hidden border shadow-xl transition-all ${
                                isLongRunning ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-zinc-700/80 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                            }`}
                        >
                            {/* Ticket Header */}
                            <div className={`${isLongRunning ? 'bg-red-600' : 'bg-orange-600'} p-3 flex justify-between items-start text-white relative`}>
                                {isLongRunning && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay pointer-events-none"></div>
                                )}
                                <div className="relative z-10">
                                    <h3 className="font-black text-3xl leading-none">
                                        {order.table_number || "TA"}
                                    </h3>
                                    <span className={`${isLongRunning ? 'text-red-100' : 'text-orange-100'} font-bold text-xs uppercase tracking-wider mt-1 block`}>
                                        {order.order_type}
                                    </span>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="font-black text-xl flex items-center gap-1 justify-end">
                                        <Clock size={16} strokeWidth={3} className={isLongRunning ? 'animate-pulse' : ''} />
                                        {order.elapsedMin}m
                                    </span>
                                    <span className={`${isLongRunning ? 'text-red-200' : 'text-orange-200'} font-bold text-xs uppercase tracking-widest block mt-0.5`}>Elapsed</span>
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
                                    <span>Order #{order.id}</span>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {order.items?.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-zinc-200">
                                            <span className="font-black text-orange-400 text-lg w-6 shrink-0">{item.quantity}</span>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base leading-tight">{item.menu_item_name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Ticket Footer / Action */}
                            <div className="p-3 bg-zinc-950 border-t border-zinc-800 grid grid-cols-2 gap-2 mt-auto">
                                <button 
                                    onClick={() => navigate(`/kitchen/orders/${order.id}`)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-lg transition-colors text-sm"
                                >
                                    Details
                                </button>
                                <button 
                                    onClick={() => handleMarkReady(order.id)}
                                    className={`${isLongRunning ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'} text-white font-black py-2.5 rounded-lg transition-colors text-sm`}
                                >
                                    Mark Ready
                                </button>
                            </div>
                        </div>
                    )})}
                    
                    {displayOrders.length === 0 && (
                        <div className="col-span-full text-center bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 py-20 font-bold text-xl flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                <Info className="text-zinc-600 w-8 h-8" />
                            </div>
                            No orders are currently being prepared.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Preparing;
