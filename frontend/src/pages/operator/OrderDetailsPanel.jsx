import React from 'react';
import { X, User, Users, ClipboardList, CheckCircle2, Copy } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderDetailsPanel = ({ order, isOpen, onClose }) => {
    const queryClient = useQueryClient();

    if (!isOpen || !order) return null;

    const { id, rawId, type, status, table, customerName, customerPhone, waiterName, date, time, amount, items } = order;

    // Use items passed from order if available, else mock data for now
    const orderItems = items || [
        { id: 1, name: 'Paneer Butter Masala', qty: 1, price: 280.00, amount: 280.00, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&h=100&fit=crop' },
        { id: 2, name: 'Veg Biryani', qty: 1, price: 240.00, amount: 240.00, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&h=100&fit=crop' },
        { id: 3, name: 'Garlic Naan', qty: 2, price: 60.00, amount: 120.00, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=100&fit=crop' },
        { id: 4, name: 'Masala Cold Drink', qty: 2, price: 40.00, amount: 80.00, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&h=100&fit=crop' },
        { id: 5, name: 'Gulab Jamun', qty: 1, price: 60.00, amount: 60.00, img: 'https://images.unsplash.com/photo-1596568212629-9e2c608f60dc?w=100&h=100&fit=crop' },
    ];

    const subtotal = amount;
    const serviceCharge = (subtotal * 0.05);
    const cgst = (subtotal * 0.025);
    const sgst = (subtotal * 0.025);
    const grandTotal = subtotal + serviceCharge + cgst + sgst;

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus) => {
            const res = await api.patch(`/admin/ordering/orders/${rawId}/status`, { status: newStatus });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            toast.success("Order status updated");
            onClose();
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Completed':
            case 'Served': return 'bg-green-50 text-green-600 border-green-100';
            case 'Preparing': return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'Confirmed':
            case 'Ready': return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'Cancelled': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-800';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />
            
            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out font-inter flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Details</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#fafafa] dark:bg-slate-900">
                    
                    {/* Order ID & Meta */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{id}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(status)}`}>{status}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-900 dark:text-white">{time}</div>
                                <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">{date}</div>
                            </div>
                        </div>
                        <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">{type}</div>
                    </div>

                    {/* Table, Waiter, Customer */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Table</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{table}</p>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400">4 Seats</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Waiter</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{waiterName || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Customer</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{customerName}</p>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 truncate">{customerPhone}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white mb-3">Order Items ({orderItems.length})</div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-slate-800/50">
                                        <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">Item</th>
                                        <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 text-center">Qty</th>
                                        <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 text-right">Price</th>
                                        <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={item.id} className={idx !== orderItems.length - 1 ? 'border-b border-gray-50 dark:border-slate-800/50' : ''}>
                                            <td className="py-2 px-3">
                                                <div className="flex items-center space-x-2.5">
                                                    <img src={item.img} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-gray-50 dark:bg-slate-800/50" />
                                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 text-center text-[11px] font-bold text-gray-900 dark:text-white">{item.qty}</td>
                                            <td className="py-2 px-3 text-right text-[11px] font-semibold text-gray-600 dark:text-slate-400">₹ {item.price.toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right text-[11px] font-bold text-gray-900 dark:text-white">₹ {item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 space-y-2.5">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 dark:text-slate-400 font-semibold">Subtotal</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 dark:text-slate-400 font-semibold">Service Charge (5%)</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹ {serviceCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 dark:text-slate-400 font-semibold">CGST (2.5%)</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹ {cgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 dark:text-slate-400 font-semibold">SGST (2.5%)</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹ {sgst.toFixed(2)}</span>
                        </div>
                        <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-slate-800 flex justify-between">
                            <span className="text-sm font-black text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-sm font-black text-[#5e5ce6]">₹ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white mb-3">Order Timeline</div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm relative">
                            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-slate-800"></div>
                            
                            <div className="space-y-4 relative">
                                <div className="flex items-start">
                                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm mt-0.5">
                                        <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full"></div>
                                    </div>
                                    <div className="ml-3 flex-1 flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-900 dark:text-white">Order Placed</div>
                                            <div className="text-[9px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-semibold mt-0.5">New Order Received</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-900 dark:text-white">{time}</div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm mt-0.5">
                                    </div>
                                    <div className="ml-3 flex-1 flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">Confirmed</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">-</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm mt-0.5">
                                    </div>
                                    <div className="ml-3 flex-1 flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">Preparing</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">-</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm mt-0.5">
                                    </div>
                                    <div className="ml-3 flex-1 flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">Ready to Serve</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">-</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm mt-0.5">
                                    </div>
                                    <div className="ml-3 flex-1 flex justify-between items-start">
                                        <div>
                                            <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">Served</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">-</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-3 gap-2 shrink-0">
                    <button 
                        onClick={() => updateStatusMutation.mutate('Cancelled')}
                        className="col-span-1 py-2.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
                    >
                        Cancel Order
                    </button>
                    <button 
                        onClick={() => updateStatusMutation.mutate('Confirmed')}
                        className="col-span-1 py-2.5 rounded-lg border border-blue-200 text-blue-500 text-xs font-bold hover:bg-blue-50 transition-colors"
                    >
                        Confirm Order
                    </button>
                    <button 
                        onClick={() => updateStatusMutation.mutate('Preparing')}
                        className="col-span-1 py-2.5 rounded-lg bg-[#5e5ce6] hover:bg-indigo-600 text-white text-[10px] sm:text-xs font-bold transition-colors shadow-sm"
                    >
                        Mark as Preparing
                    </button>
                </div>
            </div>
        </>
    );
};

export default OrderDetailsPanel;
