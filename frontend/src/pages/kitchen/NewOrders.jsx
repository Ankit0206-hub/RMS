import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import kitchenApi from '../../services/kitchenApi';
import toast from 'react-hot-toast';

const NewOrders = () => {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState('newest');
    const [viewMode, setViewMode] = useState('orders'); // 'orders' or 'items'
    const [rawOrders, setRawOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await kitchenApi.getOrders("Confirmed");
            if (res.success) {
                setRawOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch new orders:", error);
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

        ws.onopen = () => console.log("Kitchen WebSocket connected for New Orders");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "order.created" || data.event === "order.updated") {
                    if (data.payload.status === "Confirmed") {
                        fetchOrders(); // Refresh to get full details or manually append
                    } else if (data.payload.status !== "Confirmed") {
                        if (data.payload.status === "Cancelled") {
                            toast(`Order #${data.payload.id} was cancelled`, { icon: '❌' });
                        }
                        // Remove from list if status changed
                        setRawOrders(prev => prev.filter(o => o.id !== data.payload.id));
                    }
                }
            } catch (err) {
                console.error("WS message error", err);
            }
        };

        return () => ws.close();
    }, []);

    const handleStartPreparing = async (orderId) => {
        try {
            await kitchenApi.updateOrderStatus(orderId, "Preparing");
            toast.success("Order marked as Preparing");
            setRawOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to start preparing");
        }
    };

    const orders = [...rawOrders].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        if (sortOrder === 'newest') return timeB - timeA;
        if (sortOrder === 'oldest') return timeA - timeB;
        return 0;
    });

    const aggregatedItems = {};
    if (viewMode === 'items') {
        orders.forEach(order => {
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-gray-900 font-black text-2xl tracking-tight">
                    New Orders <span className="text-gray-400 font-medium ml-2">({orders.length})</span>
                </h2>
                <div className="flex items-center gap-4">
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
                    )}
                </div>
            </div>            {/* Content Area */}
            {viewMode === 'items' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {itemViewData.map((item, index) => (
                        <div key={index} className="bg-zinc-900 rounded-2xl border border-zinc-700 p-5 flex gap-5 items-center shadow-lg hover:border-emerald-500/50 transition-all">
                            <div className="relative">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-inner" />
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white font-black text-xl h-9 w-9 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-zinc-900">
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
                    {orders.map((order) => {
                        const itemCount = order.items ? order.items.reduce((acc, it) => acc + it.quantity, 0) : 0;
                        const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                        <div 
                            key={order.id} 
                            className="bg-zinc-900 flex flex-col rounded-xl overflow-hidden border border-zinc-700/80 shadow-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                        >
                            {/* Ticket Header */}
                            <div className="bg-emerald-600 p-3 flex justify-between items-start text-white">
                                <div>
                                    <h3 className="font-black text-3xl leading-none">
                                        {order.table_number || "TA"}
                                    </h3>
                                    <span className="text-emerald-100 font-bold text-xs uppercase tracking-wider mt-1 block">
                                        {order.order_type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-lg block">{orderTime}</span>
                                    <span className="font-bold text-emerald-200 text-xs">#{order.id}</span>
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
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {/* Dummy Items for UI demonstration, since `order.items` structure varies */}
                                    <li className="flex items-start gap-3 text-zinc-200">
                                        <span className="font-black text-emerald-400 text-lg w-6 shrink-0">{itemCount > 0 ? itemCount : '1'}</span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base leading-tight">Sample Item (Mock)</span>
                                            <span className="text-zinc-500 text-xs mt-0.5">Extra spicy</span>
                                        </div>
                                    </li>
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
                                    onClick={() => handleStartPreparing(order.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-lg transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] text-sm"
                                >
                                    Start Prep
                                </button>
                            </div>
                        </div>
                    )})}
                    
                    {orders.length === 0 && (
                        <div className="col-span-full text-center bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 py-20 font-bold text-xl flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                <Info className="text-zinc-600 w-8 h-8" />
                            </div>
                            No new orders in queue.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewOrders;
