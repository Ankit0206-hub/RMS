import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

export default function WaiterOrderHistory() {
    const navigate = useNavigate();
    const { tableId } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await waiterApi.getActiveSession(tableId);
                if (data && data.orders) {
                    setSessionData(data);
                    setOrders(data.orders);
                }
            } catch (err) {
                console.error("Failed to load session", err);
                toast.error("Failed to load order history");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [tableId]);

    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

    if (loading) {
        return <div className="p-6 flex justify-center items-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/waiter/tables')} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
                                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Order History</h1>
                        </div>
                        <button onClick={() => toast('Support contact initiated')} className="text-sm md:text-[15px] font-bold text-rose-500 px-3 py-1.5 bg-white/30 rounded-xl border border-white/40 backdrop-blur-md transition-colors">Help</button>
                    </div>
                </div>

                <div className="px-4 md:px-8 py-4 md:py-8 w-full flex-1 space-y-6 pb-32 max-w-4xl mx-auto">
                    <div className="bg-amber-500/10 text-amber-700 rounded-xl p-3 md:p-4 text-center font-bold text-[15px] md:text-base border border-amber-200/50 backdrop-blur-md">
                        Table {tableId || 'T01'}
                    </div>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-medium">No orders found for this session.</div>
                        ) : (
                            orders.map((order, index) => {
                                const orderTime = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={index} className="bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border border-white/40 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-black text-gray-800">Order #{order.id}</h3>
                                                    <span className="text-gray-500 font-bold text-sm bg-white/40 px-2 py-0.5 rounded-lg border border-white/40">₹ {order.total}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 font-bold">
                                                    <Clock className="h-3.5 w-3.5 mr-1" /> {orderTime}
                                                </div>
                                            </div>
                                            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md ${order.status === 'Preparing' || order.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-200/50' : 'bg-teal-500/10 text-teal-700 border-teal-200/50'}`}>{order.status}</span>
                                        </div>
                                        <div className="space-y-1.5 mt-4 mb-5 border-t border-white/30 pt-4">
                                            <div className="text-sm font-medium text-gray-700">
                                                {order.items.map((item, i) => (
                                                    <span key={i} className="bg-white/30 px-2.5 py-1 rounded-lg border border-white/40 inline-block mr-2 mb-2 shadow-sm font-bold">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border-t border-white/30 pt-4 flex justify-end">
                                            <button onClick={() => navigate(`/waiter/orders/${order.id}`)} className="flex items-center bg-white/30 px-4 py-2 rounded-xl text-rose-500 text-sm font-bold border border-white/40 transition-colors">
                                                Details <ChevronRight className="h-4 w-4 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {orders.length > 0 && (
                        <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-6 shadow-sm border border-white/40 mt-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm md:text-base font-bold text-gray-600 uppercase tracking-wide">Total Orders</span>
                                <span className="text-lg md:text-xl font-black text-gray-800 bg-white/40 px-3 py-1 rounded-xl border border-white/40">{orders.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/30 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-sm md:text-base font-bold text-gray-600 uppercase tracking-wide">Sub Total</span>
                                    <span className="text-[10px] md:text-xs font-semibold text-gray-400 mt-0.5">Exclusive of charges & taxes</span>
                                </div>
                                <span className="text-2xl font-black text-rose-500">₹{totalAmount}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 md:p-6 bg-white/10 backdrop-blur-xl z-40 border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex justify-center">
                    <div className="w-full max-w-4xl space-y-3">
                        <button
                            onClick={async () => {
                                if (!sessionData?.session_id) return;
                                try {
                                    await waiterApi.requestBill(sessionData.session_id);
                                    toast.success('Bill request sent to kitchen/operator!');
                                } catch (e) {
                                    toast.error('Failed to request bill');
                                }
                            }}
                            className="w-full bg-white/30 backdrop-blur-md text-rose-600 border-2 border-rose-300 rounded-[18px] py-4 font-bold text-[15px] md:text-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center">
                            <FileText className="h-5 w-5 mr-2" /> Request Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
