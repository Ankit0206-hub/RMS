import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    ArrowLeft, Printer, MoreHorizontal, User, ClipboardList, CheckCircle2, 
    Clock, IndianRupee, MessageSquare, AlertCircle, RefreshCcw, XCircle, FileText
} from 'lucide-react';

const OperatorOrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Use query to fetch order details, using raw ID
    const { data: orderResponse, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await api.get(`/admin/ordering/orders/${id}`);
            return response.data;
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

    const mockTimeline = [
        { title: 'Order Placed', desc: 'New Order Received', time: '10:25 AM', completed: true },
        { title: 'Confirmed', desc: 'Order confirmed by Amit Verma', time: '10:26 AM', completed: true },
        { title: 'Preparing', desc: 'Sent to kitchen', time: '10:27 AM', completed: true },
        { title: 'Ready to Serve (Kitchen)', desc: 'Items are ready', time: '10:40 AM', completed: true },
        { title: 'Served', desc: 'Order served to customer', time: '10:43 AM', completed: true },
    ];

    const mockActivityLog = [
        { user: 'Amit Verma (Waiter)', action: 'Order confirmed', time: '10:26 AM', type: 'waiter' },
        { user: 'Kitchen', action: 'Order is being prepared', time: '10:27 AM', type: 'kitchen' },
        { user: 'Kitchen', action: 'Order ready to serve', time: '10:40 AM', type: 'kitchen' },
        { user: 'Amit Verma (Waiter)', action: 'Order served', time: '10:43 AM', type: 'waiter' },
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading order details...</div>;
    if (!orderData) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Order not found.</div>;

    const dateObj = new Date(orderData.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const subtotal = orderData.total_amount || 0;
    const serviceCharge = subtotal * 0.05;
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
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
                    className="flex items-center text-sm font-bold text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </button>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center bg-white dark:bg-slate-900 border border-[#5e5ce6] text-[#5e5ce6] px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                        <Printer className="w-3.5 h-3.5 mr-2" />
                        Print Bill
                    </button>
                    <button className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                        <MoreHorizontal className="w-3.5 h-3.5 mr-2" />
                        More Actions
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
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">Order ID</p>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white">ORD{orderData.id}</h2>
                            {orderData.status === 'New' && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[8px] rounded border border-green-100">New</span>}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mt-1">{orderData.order_type || 'QR Order'}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="min-w-[100px] border-l border-gray-100 dark:border-slate-800 pl-8">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">Table</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{orderData.table_number || 'T-07'}</p>
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">4 Seats</p>
                </div>

                {/* Customer */}
                <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[180px]">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">Customer</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{orderData.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-0.5">{orderData.customer_phone || '-'}</p>
                    </div>
                </div>

                {/* Waiter */}
                <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[140px]">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Waiter" className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">Waiter</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">Amit Verma</p>
                    </div>
                </div>

                {/* Order Time */}
                <div className="flex items-start space-x-3 border-l border-gray-100 dark:border-slate-800 pl-8 min-w-[140px]">
                    <div className="text-orange-500 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">Order Time</p>
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
                                        <tr key={item.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50 transition-colors">
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

                    {/* Internal Notes */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Order Notes (Internal)</p>
                            <button className="text-[#5e5ce6] hover:bg-indigo-50 p-1.5 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        </div>
                        <p className="text-[11px] font-medium text-gray-600 dark:text-slate-400">Customer requested to serve fast.</p>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Payment Information
                        </div>
                        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Bill Amount</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">₹ {grandTotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Paid Amount</p>
                                <p className="text-xs font-bold text-green-600">₹ {grandTotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Payment Method</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">UPI</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Payment Status</p>
                                <p className="text-xs font-bold text-green-600">Paid</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Paid At</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">10:45 AM</p>
                                <p className="text-[9px] text-gray-500 dark:text-slate-400">May 20, 2025</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Transaction ID</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">UPI/512312312312</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Activity Log */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-900 dark:text-white text-sm">
                            Order Activity Log
                        </div>
                        <div className="p-5 space-y-4">
                            {mockActivityLog.map((log, idx) => (
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
                                    <div className="w-1/3 text-[11px] font-bold text-gray-400 text-right">
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
                            <div className="absolute left-[33px] top-8 bottom-8 w-px bg-green-200 z-0"></div>
                            
                            <div className="space-y-6 relative z-10">
                                {mockTimeline.map((item, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-0.5">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        <div className="ml-4 flex-1 flex justify-between items-start">
                                            <div>
                                                <div className="text-[11px] font-bold text-gray-900 dark:text-white">{item.title}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">{item.desc}</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-900 dark:text-white">{item.time}</div>
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
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold">CGST (2.5%)</span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 dark:text-slate-400 font-semibold">SGST (2.5%)</span>
                                <span className="font-bold text-gray-900 dark:text-white">₹ {sgst.toFixed(2)}</span>
                            </div>
                            
                            <div className="border-t border-gray-100 dark:border-slate-800 border-dashed pt-4 flex justify-between items-center">
                                <span className="font-black text-gray-900 dark:text-white text-sm">Total Amount</span>
                                <span className="font-black text-[#5e5ce6] text-lg">₹ {grandTotal.toFixed(2)}</span>
                            </div>

                            <div className="pt-2 space-y-3">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500 dark:text-slate-400 font-semibold">Paid Amount</span>
                                    <span className="font-bold text-green-600">₹ {grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500 dark:text-slate-400 font-semibold">Due Amount</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹ 0.00</span>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold border border-green-100">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 py-3 rounded-xl text-xs font-bold text-[#5e5ce6] hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                            <div className="flex items-center mb-1">
                                <FileText className="w-4 h-4 mr-1.5" />
                            </div>
                            Send to Kitchen
                        </button>
                        <button className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 py-3 rounded-xl text-xs font-bold text-[#5e5ce6] hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                            <div className="flex items-center mb-1">
                                <Printer className="w-4 h-4 mr-1.5" />
                            </div>
                            Reprint Bill
                        </button>
                        <button className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 py-3 rounded-xl text-xs font-bold text-[#5e5ce6] hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors shadow-sm">
                            <div className="flex items-center mb-1">
                                <FileText className="w-4 h-4 mr-1.5" />
                            </div>
                            Generate Invoice
                        </button>
                        <button className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-red-200 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                            <div className="flex items-center mb-1">
                                <XCircle className="w-4 h-4 mr-1.5" />
                            </div>
                            Cancel Order
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OperatorOrderDetails;
