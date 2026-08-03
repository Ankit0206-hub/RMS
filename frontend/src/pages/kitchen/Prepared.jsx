import React from 'react';
import { kitchenApi } from '../../services/kitchenApi';
import { Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Prepared = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['prepared_items'],
        queryFn: async () => {
            const res = await kitchenApi.getPreparedItems();
            return res.data || [];
        }
    });

    const handleRevertStatus = async (itemId) => {
        try {
            await kitchenApi.updateItemStatus(itemId, 'preparing');
            toast.success('Item moved back to Preparing');
            queryClient.invalidateQueries({ queryKey: ['prepared_items'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['kitchen_stats'] });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading prepared items...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
                <Check size={48} className="mb-4" />
                <h2 className="text-xl font-medium">No prepared items</h2>
                <p>Items marked as prepared will appear here</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Prepared Items</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                        <div className="bg-green-50 border-b border-green-200 p-4 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-green-800">Order #{order.id}</h3>
                                <div className="flex items-center text-green-600 text-sm mt-1">
                                    <Clock size={14} className="mr-1" />
                                    <span>{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 flex-1">
                            <div className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-baseline line-through text-gray-500">
                                                <span className="font-bold text-lg w-8">{item.quantity}x</span>
                                                <span className="font-medium text-base">{item.menu_item_name}</span>
                                            </div>
                                            {item.notes && (
                                                <div className="text-sm text-gray-400 ml-8 mt-1 italic">
                                                    "{item.notes}"
                                                </div>
                                            )}
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end">
                                            <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded mb-2">
                                                PREPARED
                                            </span>
                                            <button 
                                                onClick={() => handleRevertStatus(item.id)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Prepared;
