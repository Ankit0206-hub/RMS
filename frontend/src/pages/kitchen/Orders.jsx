import React, { useState, useEffect } from 'react';
import { kitchenApi } from '../../services/kitchenApi';
import { Clock, Check, ChevronRight, Play, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Orders = () => {
    const queryClient = useQueryClient();
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await kitchenApi.getOrders();
            return res.data || [];
        }
    });

    // If selected order disappears (e.g. prepared), clear selection
    useEffect(() => {
        if (selectedOrderId && !orders.find(o => o.id === selectedOrderId)) {
            setSelectedOrderId(null);
        }
    }, [orders, selectedOrderId]);

    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await kitchenApi.updateOrderItemsStatus(orderId, newStatus);
            toast.success(`Order items marked as ${newStatus}`);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['kitchen_stats'] });
            queryClient.invalidateQueries({ queryKey: ['prepared_items'] });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (isLoading) {
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

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    return (
        <div className="flex w-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ minHeight: 'calc(100vh - 8rem)', maxHeight: 'calc(100vh - 8rem)' }}>
            {/* Left Column: Order List */}
            <div className={`w-full md:w-1/3 xl:w-1/4 border-r border-gray-200 bg-white flex flex-col ${selectedOrder ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">Active Orders ({orders.length})</h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    {orders.map(order => {
                        const statuses = order.items.map(i => i.status);
                        const aggregateStatus = statuses.every(s => s === 'prepared') ? 'prepared'
                            : statuses.includes('preparing') ? 'preparing'
                                : 'received';

                        return (
                            <div 
                                key={order.id} 
                                onClick={() => setSelectedOrderId(order.id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 flex justify-between items-center ${selectedOrderId === order.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Order #{order.id}</div>
                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                        <Clock size={12} className="mr-1" />
                                        <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="mx-1">•</span>
                                        <span>{order.order_type}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            aggregateStatus === 'received' ? 'bg-red-100 text-red-800' :
                                            aggregateStatus === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {aggregateStatus}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 ${selectedOrderId === order.id ? 'text-indigo-600' : 'text-gray-300'}`} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Order Details */}
            <div className={`w-full md:w-2/3 xl:w-3/4 flex flex-col bg-white h-full ${!selectedOrder ? 'hidden md:flex' : 'flex'}`}>
                {selectedOrder ? (
                    <>
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shrink-0 shadow-sm z-10 gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-lg"
                                        onClick={() => setSelectedOrderId(null)}
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                    </button>
                                    <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm mt-1 ml-0 md:ml-0 sm:ml-0">
                                    <Clock size={14} className="mr-1" />
                                    <span>Placed at {new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="mx-2">•</span>
                                    <span className="font-medium">{selectedOrder.order_type}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                                {(() => {
                                    const statuses = selectedOrder.items.map(i => i.status);
                                    const aggregateStatus = statuses.every(s => s === 'prepared') ? 'prepared'
                                        : statuses.includes('preparing') ? 'preparing'
                                            : 'received';

                                    if (aggregateStatus === 'received') {
                                        return (
                                            <button 
                                                onClick={() => handleOrderStatusChange(selectedOrder.id, 'preparing')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                                            >
                                                <Play size={18} /> Start Preparing
                                            </button>
                                        );
                                    } else if (aggregateStatus === 'preparing') {
                                        return (
                                            <button 
                                                onClick={() => handleOrderStatusChange(selectedOrder.id, 'prepared')}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                                            >
                                                <CheckCircle size={18} /> Mark as Prepared
                                            </button>
                                        );
                                    } else {
                                        return (
                                            <div className="bg-green-100 text-green-800 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 w-full sm:w-auto">
                                                <CheckCircle size={18} /> Prepared
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
                            {selectedOrder.special_instructions && (
                                <div className="mb-6 p-4 bg-orange-50 text-orange-900 rounded-xl border border-orange-200 flex items-start gap-3 shadow-sm">
                                    <div className="font-bold uppercase tracking-wider text-orange-800 text-xs mt-0.5 bg-white px-2 py-1 rounded">Note</div>
                                    <div className="font-medium">{selectedOrder.special_instructions}</div>
                                </div>
                            )}

                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 font-bold text-gray-700 text-sm uppercase tracking-wider">
                                    Order Items
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex">
                                            <div className="w-12 shrink-0 font-black text-xl text-indigo-600">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 text-lg">{item.menu_item_name}</div>
                                                {item.notes && (
                                                    <div className="mt-2 text-sm font-medium text-red-600 bg-red-50 p-2 rounded inline-block border border-red-100 shadow-sm">
                                                        Note: {item.notes}
                                                    </div>
                                                )}
                                                <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                                                    <span className="text-gray-400">Status:</span> 
                                                    <span className={`px-2 py-1 rounded ${
                                                        item.status === 'received' ? 'bg-red-50 text-red-600' :
                                                        item.status === 'preparing' ? 'bg-yellow-50 text-yellow-600' :
                                                        'bg-green-50 text-green-600'
                                                    }`}>{item.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <CheckCircle size={64} className="mb-4 text-gray-300" strokeWidth={1} />
                        <h2 className="text-xl font-medium text-gray-500">Select an order to view details</h2>
                        <p className="mt-2 text-sm max-w-xs">Choose an order from the list on the left to see items and start preparing it.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
