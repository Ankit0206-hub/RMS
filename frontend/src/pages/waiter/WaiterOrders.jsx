import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Clock } from 'lucide-react';
import waiterApi from '../../services/waiterApi';

export default function WaiterOrders() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Active');
    const [rawOrders, setRawOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await waiterApi.getOrders();
            if (res.success) {
                setRawOrders(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch waiter orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/waiter?token=${token}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => console.log("Waiter WebSocket connected");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "order.updated" || data.event === "order.created") {
                    fetchOrders();
                }
            } catch (err) {
                console.error("WS parse error", err);
            }
        };
        
        return () => ws.close();
    }, []);

    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Filter logic
    const filteredOrders = activeTab === 'Active' 
        ? rawOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled') 
        : rawOrders.filter(o => o.status === 'Completed');

    // Sort by latest first
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const toggleExpand = (id) => {
        setExpandedOrderId(prev => prev === id ? null : id);
    };

    if (loading) {
        return <div className="p-6 flex justify-center items-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 w-full shrink-0">
                    <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Orders</h1>
                        <button onClick={() => navigate('/waiter/notifications')} className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center relative transition-colors border border-white/40 shadow-sm">
                            <Bell className="h-5 w-5 text-gray-700"/>
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white/50"></span>
                        </button>
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 flex-1 w-full pb-24">
                    <div className="flex space-x-2 mb-6">
                        <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Active'?'bg-rose-500 text-white border-rose-500':'bg-white/50 text-gray-600 border-white/60'}`}>Active</button>
                        <button onClick={() => setActiveTab('Completed')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Completed'?'bg-rose-500 text-white border-rose-500':'bg-white/50 text-gray-600 border-white/60'}`}>Completed</button>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                        {sortedOrders.map(order => {
                            const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const isExpanded = expandedOrderId === order.id;
                            const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                            
                            return (
                                <div key={order.id} className="bg-white border border-gray-100 shadow-sm overflow-hidden transition-all">
                                    <div 
                                        onClick={() => toggleExpand(order.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 w-full">
                                            <div className="bg-slate-100 h-12 px-3 rounded-2xl flex flex-col items-center justify-center border border-slate-200 shrink-0 min-w-[70px]">
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase leading-none mb-0.5">Table</span>
                                                <span className="text-xs md:text-sm font-black text-slate-800 leading-tight">{order.table_number || "TA"}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                                    <h3 className="text-sm md:text-base font-black text-gray-800 whitespace-nowrap">Order #{order.id}</h3>
                                                    <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${
                                                        order.status === 'Pending' || order.status === 'Verification Pending' ? 'bg-purple-100 text-purple-700' : 
                                                        order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'Cooked' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-teal-100 text-teal-700'
                                                    }`}>{order.status}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center text-[11px] md:text-xs text-gray-500 font-medium gap-1.5 md:gap-3">
                                                    <span className="flex items-center whitespace-nowrap"><Clock className="h-3 w-3 mr-1"/> {orderTime}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="whitespace-nowrap">{itemCount} Items</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {(order.status === 'Pending' || order.status === 'Verification Pending') && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        waiterApi.updateOrderStatus(order.id, "Preparing").then(() => fetchOrders());
                                                    }} 
                                                    className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-600 transition-colors mr-2"
                                                >
                                                    Accept
                                                </button>
                                            )}
                                            {order.status === 'Cooked' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        waiterApi.updateOrderStatus(order.id, "Served").then(() => fetchOrders());
                                                    }} 
                                                    className="bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-teal-600 transition-colors mr-2"
                                                >
                                                    Serve
                                                </button>
                                            )}
                                            <div className={`p-1.5 rounded-full transition-transform duration-200 ${isExpanded ? 'bg-gray-100 rotate-90' : 'bg-transparent'}`}>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="bg-slate-50 p-4 border-t border-gray-100 animate-slideUp">
                                            <div className="space-y-2 mb-4">
                                                {order.items && order.items.map((item, i) => (
                                                    <div key={i} className="text-sm font-medium text-gray-700 flex justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                                                        <span>{item.menu_item_name}</span>
                                                        <span className="font-black text-gray-800">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end">
                                                <button onClick={() => navigate(`/waiter/orders/${order.id}`)} className="text-rose-500 text-sm font-bold flex items-center hover:text-rose-600 transition-colors">
                                                    View Full Details <ChevronRight className="h-4 w-4 ml-0.5"/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {sortedOrders.length === 0 && (
                            <div className="text-center py-20 text-gray-500 font-bold">
                                No {activeTab.toLowerCase()} orders found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
