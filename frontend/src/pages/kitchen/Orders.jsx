import React, { useState, useEffect } from 'react';
import { kitchenApi } from '../../services/kitchenApi';
import { Clock, Check, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await kitchenApi.getOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch kitchen orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await kitchenApi.updateOrderItemsStatus(orderId, newStatus);
            toast.success(`Order items marked as ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
                <Check size={48} className="mb-4" />
                <h2 className="text-xl font-medium">No active orders</h2>
                <p>All caught up!</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Orders</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map(order => {
                    // Determine the aggregate status to show in the dropdown based on items
                    const statuses = order.items.map(i => i.status);
                    const aggregateStatus = statuses.every(s => s === 'prepared') ? 'prepared' 
                        : statuses.includes('preparing') ? 'preparing' 
                        : 'received';

                    return (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mt-1">
                                        <Clock size={14} className="mr-1" />
                                        <span>{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className="mx-2">•</span>
                                        <span>{order.order_type}</span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <select 
                                        value={aggregateStatus} 
                                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                        className={`text-sm font-semibold rounded-lg px-3 py-2 border outline-none cursor-pointer appearance-none shadow-sm ${
                                            aggregateStatus === 'received' 
                                            ? 'bg-red-50 text-red-700 border-red-200' 
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}
                                    >
                                        <option value="received">Received</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="prepared">Prepared</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1">
                                {order.special_instructions && (
                                    <div className="mb-4 p-3 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-100">
                                        <strong>Note:</strong> {order.special_instructions}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-baseline">
                                                    <span className="font-bold text-gray-800 text-lg w-8">{item.quantity}x</span>
                                                    <span className="font-medium text-gray-800 text-base">{item.menu_item_name}</span>
                                                </div>
                                                {item.notes && (
                                                    <div className="text-sm text-gray-500 ml-8 mt-1 italic">
                                                        "{item.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;
