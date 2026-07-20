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
            </div>

            {/* Content Area */}
            {viewMode === 'items' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itemViewData.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 items-center shadow-sm">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                <p className="text-gray-500 text-xs mt-1">Needed for: {item.orders.join(', ')}</p>
                            </div>
                            <div className="bg-orange-100 text-orange-600 font-black text-2xl h-12 w-12 rounded-xl flex items-center justify-center">
                                {item.quantity}
                            </div>
                        </div>
                    ))}
                    {itemViewData.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 font-medium">No items to prepare.</div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                    const itemCount = order.items ? order.items.reduce((acc, it) => acc + it.quantity, 0) : 0;
                    const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                    <div 
                        key={order.id} 
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                        {/* Left: Table & Order Info */}
                        <div className="flex items-center gap-5 md:w-1/4 shrink-0">
                            <div className="bg-[#f97316] text-white text-2xl font-black px-4 py-3 rounded-lg shrink-0">
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
                                <div className="hidden md:block w-full max-w-sm"></div> // Spacer to keep layout balanced
                            )}
                        </div>
                        
                        {/* Right: Time & Actions */}
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 md:w-auto shrink-0 justify-end w-full">
                            <div className="text-center sm:text-right hidden sm:block md:hidden lg:block lg:mr-4">
                                <span className="text-gray-900 font-black text-xl block">{orderTime}</span>
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
                                    onClick={() => handleStartPreparing(order.id)}
                                    className="flex-1 sm:flex-none bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                                >
                                    Start Preparing
                                </button>
                            </div>
                        </div>
                    </div>
                )})}
                
                {orders.length === 0 && (
                    <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 py-20 font-bold text-lg">
                        No new orders at the moment.
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default NewOrders;
