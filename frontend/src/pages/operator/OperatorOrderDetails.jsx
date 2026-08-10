import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
    ArrowLeft, Printer, MoreHorizontal, User, ClipboardList, CheckCircle2, 
    Clock, IndianRupee, MessageSquare, AlertCircle, RefreshCcw, XCircle, FileText
} from 'lucide-react';
import ThermalReceipt from '../../components/ThermalReceipt';

const OperatorOrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    // Use query to fetch order details, using raw ID
    const { data: orderResponse, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await api.get(`/admin/ordering/orders/${id}`);
            return response.data;
        }
    });

    const { data: settingsResponse } = useQuery({
        queryKey: ['operator-settings'],
        queryFn: async () => {
            const res = await api.get('/operator/settings');
            return res.data;
        }
    });
    const settings = settingsResponse?.data || {};
    const cgstPercentage = settings.cgst_percentage !== undefined ? settings.cgst_percentage : 2.5;
    const sgstPercentage = settings.sgst_percentage !== undefined ? settings.sgst_percentage : 2.5;
    const serviceChargePercentage = settings.service_charge_percentage !== undefined ? settings.service_charge_percentage : 5;

    const queryClient = useQueryClient();
    const statusMutation = useMutation({
        mutationFn: async (newStatus) => {
            const response = await api.patch(`/admin/ordering/orders/${id}/status`, { status: newStatus });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Order status updated!");
            queryClient.invalidateQueries(['order', id]);
            queryClient.invalidateQueries(['orders']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    });

    const orderData = orderResponse?.data;

    const orderItems = orderData?.items?.map((item, idx) => ({
        id: item.id,
        name: item.menu_item_name || 'Unknown Item',
        category: item.menu_item_category || 'Uncategorized',
        qty: item.quantity,
        price: item.price_at_order,
        amount: item.price_at_order * item.quantity,
        status: orderData.status, // or individual status if backend supports it
        img: item.menu_item_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
    })) || [];

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading order details...</div>;
    if (!orderData) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Order not found.</div>;

    const dateObj = new Date(orderData.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const timeline = (() => {
        const status = orderData.status;
        const steps = [
            { id: 'Pending', title: 'Order Placed', desc: 'New Order Received' },
            { id: 'Confirmed', title: 'Preparing', desc: 'Sent to kitchen' },
            { id: 'Cooked', title: 'Ready to Serve', desc: 'Items are ready' },
            { id: 'Served', title: 'Served / Completed', desc: 'Order served to customer' },
        ];

        let currentIdx = ['Pending', 'Confirmed', 'Cooked', 'Served'].indexOf(status);
        if (status === 'Completed') currentIdx = 3;
        
        if (status === 'Cancelled') {
            return [
                { title: 'Order Placed', desc: 'New Order Received', time: timeStr, completed: true },
                { title: 'Cancelled', desc: 'Order was cancelled', time: '--:--', completed: true, isError: true }
            ];
        }

        return steps.map((step, idx) => ({
            ...step,
            completed: currentIdx >= idx,
            isActive: currentIdx === idx,
            time: idx === 0 ? timeStr : '--:--',
        }));
    })();

    const activityLog = (() => {
        const status = orderData.status;
        let logs = [
            { user: 'Customer/Waiter', action: 'Order placed', time: timeStr, type: 'waiter' }
        ];
        
        let currentIdx = ['Pending', 'Confirmed', 'Cooked', 'Served'].indexOf(status);
        if (status === 'Completed') currentIdx = 3;

        if (status === 'Cancelled') {
            logs.push({ user: 'System', action: 'Order cancelled', time: '--:--', type: 'kitchen' });
            return logs.reverse();
        }
        
        if (currentIdx >= 1) logs.push({ user: 'Kitchen', action: 'Order is being prepared', time: '--:--', type: 'kitchen' });
        if (currentIdx >= 2) logs.push({ user: 'Kitchen', action: 'Order ready to serve', time: '--:--', type: 'kitchen' });
        if (currentIdx >= 3) logs.push({ user: 'Waiter', action: 'Order served', time: '--:--', type: 'waiter' });
        
        return logs.reverse();
    })();

    const subtotal = orderData.total_amount || 0;
    const serviceCharge = subtotal * (serviceChargePercentage / 100);
    const cgst = subtotal * (cgstPercentage / 100);
    const sgst = subtotal * (sgstPercentage / 100);
    const grandTotal = subtotal + serviceCharge + cgst + sgst;

    return (
        <div className="space-y-4 pb-10 font-inter max-w-[1400px] mx-auto">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
                    <span className="hover:text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate('/operator/dashboard')}>Dashboard</span>
                    <span>›</span>
                    <span className="hover:text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate('/operator/orders')}>Orders</span>
                    <span>›</span>
                    <span className="hover:text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate('/operator/orders')}>All Orders</span>
                    <span>›</span>
                    <span className="text-[#5e5ce6] font-bold">Order Details</span>
                </div>
            </div>

            {/* Back Button & Top Actions */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/operator/orders')}
                    className="flex items-center text-sm font-bold text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </button>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setIsReceiptOpen(true)}
                        className="flex items-center bg-white dark:bg-slate-900 border border-[#5e5ce6] text-[#5e5ce6] px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5 mr-2" />
                        Print Bill
                    </button>
                </div>
            </div>

            {/* Main Order Meta Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-wrap gap-8 items-center justify-between">
                
                {/* Order ID */}
                <div className="flex items-start space-x-4 min-w-[140px]">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0 border border-green-100">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">Order ID</p>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white">ORD{orderData.id}</h2>
                            {orderData.status === 'Pending' && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[8px] rounded border border-green-100">New</span>}
                            {orderData.status === 'Confirmed' && <span className="px-1.5 py-0.5 bg-indigo-50 text-[#5e5ce6] font-bold text-[8px] rounded border border-indigo-100">Preparing</span>}
                            {orderData.status === 'Cooked' && <span className="px-1.5 py-0.5 bg-indigo-50 text-[#5e5ce6] font-bold text-[8px] rounded border border-indigo-100">Ready</span>}
                            {orderData.status === 'Served' && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[8px] rounded border border-green-100">Served</span>}
                            {orderData.status === 'Cancelled' && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 font-bold text-[8px] rounded border border-red-100">Cancelled</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mt-1">{orderData.order_type || 'QR Order'}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="min-w-[100px] border-l border-gray-100 dark:border-slate-800 pl-8">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Table</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{orderData.table_number || 'T-07'}</p>
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">4 Seats</p>
                </div>

                {/* Customer */}
                <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[180px]">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Customer</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{orderData.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">{orderData.customer_phone || '-'}</p>
                    </div>
                </div>

                {/* Waiter (Conditional) */}
                {orderData.waiter_id && (
                    <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[140px]">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1">Waiter</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">ID: {orderData.waiter_id}</p>
                        </div>
                    </div>
                )}

                {/* Order Time */}
                <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[140px]">
                    <div className="text-orange-500 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-1">Order Time</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{timeStr}</p>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">{dateStr}</p>
                    </div>
                </div>

                {/* Dine In Icon */}
                <div className="border-l border-gray-100 dark:border-slate-800 pl-8 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">Dine In</span>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Order Items Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Order Items ({orderItems.length})
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/50">
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400 w-8">#</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400">Item Name</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400">Category</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400 text-center">Qty</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400 text-right">Unit Price</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400 text-right">Total Price</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 dark:text-slate-400 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50 transition-colors">
                                            <td className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-slate-400">{idx + 1}</td>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center space-x-3">
                                                    <img src={item.img} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-[11px] font-semibold text-gray-500 dark:text-slate-400">{item.category}</td>
                                            <td className="py-3 px-5 text-center text-xs font-bold text-gray-900 dark:text-white">{item.qty}</td>
                                            <td className="py-3 px-5 text-right text-[11px] font-semibold text-gray-700 dark:text-slate-300">₹ {item.price.toFixed(2)}</td>
                                            <td className="py-3 px-5 text-right text-[11px] font-bold text-gray-900 dark:text-white">₹ {item.amount.toFixed(2)}</td>
                                            <td className="py-3 px-5 text-center">
                                                <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[9px] font-bold">{item.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Special Notes */}
                    {orderData.special_instructions && (
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-amber-900 mb-1">Special Note:</p>
                                <p className="text-[11px] font-medium text-amber-800">{orderData.special_instructions}</p>
                            </div>
                        </div>
                    )}



                    {/* Payment Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Payment Information
                        </div>
                        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1">Bill Amount</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">₹ {grandTotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1">Payment Status</p>
                                <p className={`text-xs font-bold ${orderData.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
                                    {orderData.status === 'Completed' ? 'Paid' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Activity Log */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Order Activity Log
                        </div>
                        <div className="p-5 space-y-4">
                            {activityLog.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 w-1/3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.type === 'waiter' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{log.user}</span>
                                    </div>
                                    <div className="w-1/3 text-[11px] font-medium text-gray-600 dark:text-slate-400">
                                        {log.action}
                                    </div>
                                    <div className="w-1/3 text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 text-right">
                                        {log.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    
                    {/* Order Timeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Order Timeline
                        </div>
                        <div className="p-6 relative">
                            <div className="absolute left-[33px] top-8 bottom-8 w-px bg-gray-200 dark:bg-slate-700 z-0"></div>
                            
                            <div className="space-y-6 relative z-10">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-0.5 ${item.isError ? 'bg-red-500 text-white' : item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-transparent'}`}>
                                            {item.completed && !item.isError && <CheckCircle2 className="w-3 h-3" />}
                                            {item.isError && <XCircle className="w-3 h-3" />}
                                        </div>
                                        <div className="ml-4 flex-1 flex justify-between items-start">
                                            <div>
                                                <div className={`text-[11px] font-bold ${item.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500 dark:text-slate-400'}`}>{item.title}</div>
                                                <div className={`text-[10px] font-medium mt-0.5 ${item.completed ? 'text-gray-500 dark:text-slate-400' : 'text-gray-300 dark:text-slate-600 dark:text-slate-400'}`}>{item.desc}</div>
                                            </div>
                                            {item.time && <div className={`text-[10px] font-bold ${item.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500 dark:text-slate-400'}`}>{item.time}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Bill Summary
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold">Subtotal ({orderItems.length} items)</span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold flex items-center">
                                    Service Charge (5%) <AlertCircle className="w-3 h-3 ml-1 text-gray-300" />
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold">CGST ({cgstPercentage}%)</span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-4">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold">SGST ({sgstPercentage}%)</span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {sgst.toFixed(2)}</span>
                            </div>
                            
                            <div className="border-t border-gray-100 dark:border-slate-800 border-dashed pt-4 flex justify-between items-center">
                                <span className="font-black text-gray-900 dark:text-white text-sm">Total Amount</span>
                                <span className="font-black text-[#5e5ce6] text-lg">₹ {grandTotal.toFixed(2)}</span>
                            </div>

                            <div className="pt-2 space-y-3">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500 dark:text-slate-400 font-semibold">Paid Amount</span>
                                    <span className={`font-bold ${orderData.status === 'Completed' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                        ₹ {orderData.status === 'Completed' ? grandTotal.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500 dark:text-slate-400 font-semibold">Due Amount</span>
                                    <span className="font-bold text-orange-500">
                                        ₹ {orderData.status === 'Completed' ? '0.00' : grandTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                {orderData.status === 'Completed' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold border border-green-100">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-500 text-[10px] font-bold border border-orange-100">
                                        <AlertCircle className="w-3 h-3 mr-1" /> Pending Payment
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {orderData.status === 'Pending' && (
                            <button onClick={() => statusMutation.mutate('Confirmed')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-[#5e5ce6] text-[#5e5ce6] py-3 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                                <div className="flex items-center mb-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /></div>
                                Accept & Send to Kitchen
                            </button>
                        )}
                        {orderData.status === 'Confirmed' && (
                            <button onClick={() => statusMutation.mutate('Cooked')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-green-500 text-green-600 py-3 rounded-xl text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">
                                <div className="flex items-center mb-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /></div>
                                Mark as Cooked (Ready)
                            </button>
                        )}
                        {orderData.status === 'Cooked' && (
                            <button onClick={() => statusMutation.mutate('Served')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-green-500 text-green-600 py-3 rounded-xl text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">
                                <div className="flex items-center mb-1"><CheckCircle2 className="w-4 h-4 mr-1.5" /></div>
                                Mark as Served
                            </button>
                        )}
                        {orderData.status !== 'Completed' && orderData.status !== 'Cancelled' && orderData.status !== 'Served' && (
                            <button onClick={() => statusMutation.mutate('Cancelled')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-red-200 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                                <div className="flex items-center mb-1"><XCircle className="w-4 h-4 mr-1.5" /></div>
                                Cancel Order
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Thermal Receipt Modal */}
            <ThermalReceipt 
                isOpen={isReceiptOpen} 
                onClose={() => setIsReceiptOpen(false)} 
                data={{
                    bill_number: `ORD${orderData.id}`,
                    table: orderData.table_number,
                    subtotal: subtotal,
                    service_charge: serviceCharge,
                    cgst: cgst,
                    sgst: sgst,
                    grand_total: grandTotal
                }}
                items={orderItems}
            />
        </div>
    );
};

export default OperatorOrderDetails;
