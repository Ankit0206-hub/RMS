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

    // Filter logic
    const filteredOrders = activeTab === 'Active' 
        ? rawOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled') 
        : rawOrders.filter(o => o.status === 'Completed');

    // Sort by latest first
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (loading) {
        return <div className="p-6 flex justify-center items-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            {/* Decorative Glassmorphism Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

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

                <div className="px-4 md:px-8 mt-4 flex-1 space-y-6 w-full pb-24 max-w-7xl mx-auto">
                    <div className="flex space-x-2 md:max-w-md">
                        <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Active'?'bg-rose-400/90 backdrop-blur-md text-white border-rose-400':'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Active</button>
                        <button onClick={() => setActiveTab('Completed')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm border ${activeTab ==='Completed'?'bg-rose-400/90 backdrop-blur-md text-white border-rose-400':'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'}`}>Completed</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sortedOrders.map(order => {
                            const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={order.id} className="bg-white/20 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/40 flex flex-col transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-black text-gray-800">Order #{order.id}</h3>
                                                <span className="bg-teal-500/10 text-teal-700 font-bold px-2 py-0.5 rounded-md text-xs border border-teal-200/50 backdrop-blur-md">{order.table_number || "TA"}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 font-medium">
                                                <Clock className="h-3.5 w-3.5 mr-1"/> {orderTime}
                                            </div>
                                        </div>
                                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                                            order.status === 'Pending' ? 'bg-purple-500/10 text-purple-700 border-purple-200/50' : 
                                            order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-700 border-amber-200/50' :
                                            order.status === 'Cooked' ? 'bg-orange-500/10 text-orange-700 border-orange-200/50' :
                                            'bg-teal-500/10 text-teal-700 border-teal-200/50'
                                        }`}>{order.status}</span>
                                    </div>
                                    
                                    <div className="space-y-1.5 mt-4 mb-5 border-t border-white/30 pt-4 flex-1">
                                        {order.items && order.items.map((item, i) => (
                                            <div key={i} className="text-sm font-medium text-gray-700 flex justify-between bg-white/30 px-3 py-2 rounded-xl border border-white/40">
                                                <span>{item.menu_item_name}</span><span className="font-black text-gray-800 ml-1">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-white/30 pt-4 flex justify-between">
                                        {order.status === 'Cooked' ? (
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        await waiterApi.updateOrderStatus(order.id, "Served");
                                                        fetchOrders();
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }} 
                                                className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-600 transition-colors"
                                            >
                                                Mark Served
                                            </button>
                                        ) : <div></div>}
                                        <button onClick={() => navigate(`/waiter/orders/${order.id}`)} className="flex items-center bg-white/30 px-4 py-2 rounded-xl text-rose-500 text-sm font-bold border border-white/40 transition-colors">
                                            View Details <ChevronRight className="h-4 w-4 ml-1"/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {sortedOrders.length === 0 && (
                            <div className="col-span-full text-center py-20 text-gray-500 font-bold">
                                No {activeTab.toLowerCase()} orders found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
