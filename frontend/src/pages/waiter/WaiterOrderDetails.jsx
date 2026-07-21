import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

export default function WaiterOrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        try {
            const res = await waiterApi.getOrder(orderId);
            if (res.success) {
                setOrder(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch order details", error);
            toast.error("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/waiter?token=${token}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "order.updated" && String(data.payload.id) === String(orderId)) {
                    fetchOrderDetails();
                }
            } catch (err) { }
        };
        
        return () => ws.close();
    }, [orderId]);

    const handleMarkServed = async () => {
        try {
            await waiterApi.updateOrderStatus(orderId, "Served");
            toast.success("Order marked as served");
            fetchOrderDetails();
        } catch (error) {
            console.error("Failed to mark as served", error);
            toast.error("Failed to mark as served");
        }
    };

    if (loading || !order) {
        return <div className="p-6 flex justify-center items-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;
    }

    const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate dynamic state for timeline
    const isPlaced = true;
    const isPreparing = ["Preparing", "Cooked", "Served", "Completed"].includes(order.status);
    const isReady = ["Cooked", "Served", "Completed"].includes(order.status);
    const isServed = ["Served", "Completed"].includes(order.status);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative pb-24">


            <div className="relative z-10 flex flex-col flex-1">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
                                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Order Details</h1>
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 md:mt-8 flex-1 space-y-6 w-full max-w-4xl mx-auto">
                    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800">Order #{order.id}</h2>
                                <div className="flex items-center mt-2">
                                    <span className="bg-teal-500/10 text-teal-700 font-bold px-2.5 py-1 rounded-lg text-xs mr-2 border border-teal-200/50 backdrop-blur-md">Table {order.table_number || "TA"}</span>
                                    <span className="text-xs font-bold text-gray-500 flex items-center bg-white/30 px-2 py-1 rounded-lg border border-white/40"><Clock className="h-3.5 w-3.5 mr-1"/> {orderTime}</span>
                                </div>
                            </div>
                            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                                order.status === 'Pending' ? 'bg-purple-500/10 text-purple-700 border-purple-200/50' : 
                                order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-700 border-amber-200/50' :
                                order.status === 'Cooked' ? 'bg-orange-500/10 text-orange-700 border-orange-200/50' :
                                'bg-teal-500/10 text-teal-700 border-teal-200/50'
                            }`}>{order.status}</span>
                        </div>
                        
                        <div className="mt-8 border-t border-white/30 pt-6">
                            <div className="relative pl-6 space-y-6 border-l-2 border-white/40 ml-3">
                                <div className="relative">
                                    <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm">
                                        <CheckCircle2 className="h-5 w-5"/>
                                    </span>
                                    <p className="text-sm md:text-base font-black text-gray-800">Order Placed</p>
                                </div>
                                <div className="relative">
                                    {isPreparing ? (
                                        <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm"><CheckCircle2 className="h-5 w-5"/></span>
                                    ) : (
                                        <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-white/60 h-4 w-4 rounded-full shadow-sm"></span>
                                    )}
                                    <p className={`text-sm md:text-base font-black ${isPreparing ? 'text-gray-800' : 'text-gray-400'}`}>Preparing</p>
                                </div>
                                <div className="relative">
                                    {isReady ? (
                                        <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm"><CheckCircle2 className="h-5 w-5"/></span>
                                    ) : (
                                        <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-white/60 h-4 w-4 rounded-full shadow-sm"></span>
                                    )}
                                    <p className={`text-sm md:text-base font-black ${isReady ? 'text-gray-800' : 'text-gray-400'}`}>Cooked (Ready to Serve)</p>
                                </div>
                                <div className="relative">
                                    {isServed ? (
                                        <span className="absolute -left-[35px] top-0 bg-teal-500 text-white rounded-full p-0.5 shadow-sm"><CheckCircle2 className="h-5 w-5"/></span>
                                    ) : (
                                        <span className="absolute -left-[33px] top-0.5 bg-white border-4 border-white/60 h-4 w-4 rounded-full shadow-sm"></span>
                                    )}
                                    <p className={`text-sm md:text-base font-black ${isServed ? 'text-gray-800' : 'text-gray-400'}`}>Served</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40">
                        <div className="flex items-center mb-5">
                            <div className="bg-white/30 text-gray-700 p-2 rounded-xl mr-3 border border-white/40 backdrop-blur-md">
                                <ShoppingBag className="h-5 w-5 text-rose-500"/>
                            </div>
                            <h3 className="font-black text-gray-800 text-lg">Items Ordered</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {order.items && order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-white/30 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm md:text-[15px] font-bold text-gray-800">{item.menu_item_name}</p>
                                        {item.notes && <p className="text-xs text-amber-600 mt-1">{item.notes}</p>}
                                        <p className="text-xs text-gray-500 mt-1.5 font-bold">₹{item.price_at_order} <span className="text-rose-400 mx-1">x</span> {item.quantity}</p>
                                    </div>
                                    <p className="text-sm md:text-base font-black text-gray-800 bg-white/30 px-3 py-1.5 rounded-xl border border-white/40 shadow-sm">₹{parseFloat(item.price_at_order) * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-5 pt-5 border-t border-white/30 flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/20">
                            <span className="text-sm md:text-base font-bold text-gray-600 uppercase tracking-wider">Total</span>
                            <span className="text-xl md:text-2xl font-black text-gray-900">₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {order.status === "Cooked" && (
                <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 md:p-6 bg-white/10 backdrop-blur-xl z-40 border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex justify-center">
                    <div className="w-full max-w-4xl space-y-3">
                        <button onClick={handleMarkServed} className="w-full bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-[18px] py-4 font-bold text-[15px] md:text-lg shadow-sm active:scale-95 transition-all flex items-center justify-center border border-rose-300/50">
                            Mark as Served
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
