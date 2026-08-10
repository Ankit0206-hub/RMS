import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import ThermalReceipt from '../../components/ThermalReceipt';
import { 
    Printer, Download, ChevronDown, ClipboardList, Calendar, 
    Utensils, Users, User, Plus, Edit2, Copy, RefreshCcw, XCircle,
    CheckCircle2, Clock, Loader2, ArrowLeft
} from 'lucide-react';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    const { data: orderResponse, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await api.get(`/admin/ordering/orders/${id}`);
            return response.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus) => {
            await api.patch(`/admin/ordering/orders/${id}/status`, { status: newStatus });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', id]);
            setIsStatusMenuOpen(false);
        }
    });

    const order = orderResponse?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-gray-400 font-medium">Order not found</div>
                <button onClick={() => navigate(-1)} className="text-indigo-500 font-semibold hover:underline">Go Back</button>
            </div>
        );
    }

    const orderDate = new Date(order.created_at);
    const dateFormatted = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </button>
                </div>
                <div className="flex items-center space-x-3 relative">
                <button 
                    onClick={() => setIsReceiptOpen(true)}
                    className="flex items-center bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Printer className="w-3.5 h-3.5 mr-2" />
                    Print Invoice
                </button>
                <div className="relative">
                    <button 
                        onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center bg-[#5e5ce6] hover:bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-75"
                    >
                        {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                        <ChevronDown className="w-3.5 h-3.5 ml-2" />
                    </button>
                    {isStatusMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                            {['Pending', 'Preparing', 'Completed', 'Served', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateStatusMutation.mutate(status)}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors ${order.status === status ? 'text-[#5e5ce6] bg-indigo-50' : 'text-gray-700'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </div>

            {/* Top Order Meta Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-8 items-center justify-between">
                <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <span className="text-xs text-gray-500 font-semibold">Order ID</span>
                            <h2 className="text-xl font-black text-gray-900">#ORD{order.id}</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                order.status === 'Preparing' ? 'bg-orange-50 text-orange-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>{order.status}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" /> {dateFormatted}, {timeFormatted}</span>
                            <span className="flex items-center"><Utensils className="w-3.5 h-3.5 mr-1 text-gray-400" /> {order.order_type || 'Take Away'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-12">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                            <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Order Type</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">{order.order_type || 'Take Away'}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Table</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">{order.table_number ? `Table ${order.table_number}` : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <img src={`https://ui-avatars.com/api/?name=${order.customer_name ? encodeURIComponent(order.customer_name) : 'Walk+in'}&background=e0e7ff&color=4f46e5`} alt="Customer" className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Customer</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">{order.customer_name || 'Walk-in Customer'}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">{order.waiter_name ? order.waiter_name.charAt(0).toUpperCase() : 'W'}</div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Waiter</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">{order.waiter_name || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Order Items Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                            Order Items
                        </div>
                        <div className="w-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Price (₹)</th>
                                        <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, idx) => (
                                        <tr key={item.id} className={idx !== order.items.length - 1 ? 'border-b border-gray-50' : ''}>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <Utensils className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900">{item.menu_item_name}</div>
                                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{item.menu_item_category}</div>
                                                        {item.notes && <div className="text-[9px] text-gray-500 italic mt-0.5">Note: {item.notes}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-center text-xs font-bold text-gray-900">{item.quantity}</td>
                                            <td className="py-3 px-5 text-right text-xs font-semibold text-gray-600">{(item.price_at_order).toFixed(2)}</td>
                                            <td className="py-3 px-5 text-right text-xs font-bold text-gray-900">{(item.price_at_order * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <button className="flex items-center text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors">
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Item
                            </button>
                        </div>
                    </div>

                    {/* Customer Info & Order Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Customer Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                                Customer Information
                            </div>
                            <div className="p-5 space-y-4 flex-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Customer Type</span>
                                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">{order.customer_name ? 'Registered' : 'Walk-in Customer'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Name</span>
                                    <span className="font-bold text-gray-900">{order.customer_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Phone</span>
                                    <span className="font-bold text-gray-900">{order.customer_phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Email</span>
                                    <span className="font-bold text-gray-900">N/A</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Special Instructions</span>
                                    <span className="font-bold text-gray-900">{order.special_instructions || 'None'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline (Activities) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                                Order Timeline
                            </div>
                            <div className="p-5 relative">
                                <div className="absolute left-[21px] top-7 bottom-7 w-px bg-gray-200"></div>
                                
                                <div className="space-y-6">
                                    <div className="flex relative">
                                        <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 z-10 border border-white">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Placed</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{dateFormatted}, {timeFormatted}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex relative">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border border-white ${order.status !== 'Pending' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Confirmed</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex relative">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border border-white ${['Preparing', 'Completed', 'Served'].includes(order.status) ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
                                            <div className={`w-2 h-2 rounded-full ${['Preparing', 'Completed', 'Served'].includes(order.status) ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Preparing</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex relative">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border border-white ${['Completed', 'Served'].includes(order.status) ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Completed</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900 mb-4">
                            Actions
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className="flex items-center justify-center bg-gray-50 border border-gray-200 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                                <Edit2 className="w-3.5 h-3.5 mr-2 text-gray-500" /> Edit Order
                            </button>
                            <button className="flex items-center justify-center bg-gray-50 border border-gray-200 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                                <Copy className="w-3.5 h-3.5 mr-2 text-gray-500" /> Duplicate Order
                            </button>
                            <button className="flex items-center justify-center bg-red-50 border border-red-100 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
                                <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Refund Order
                            </button>
                            <button className="flex items-center justify-center bg-white border border-red-200 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
                                <XCircle className="w-3.5 h-3.5 mr-2" /> Cancel Order
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column (Span 1) */}
                <div className="space-y-6">
                    
                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                            Order Summary
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="border-t border-gray-100 border-dashed pt-2 flex justify-between items-center">
                                <span className="font-black text-gray-900 text-sm">Grand Total</span>
                                <span className="font-black text-gray-900 text-lg">₹ {order.total_amount?.toFixed(2) || '0.00'}</span>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 mt-2 flex justify-between items-center">
                                <span className="font-bold text-green-700 text-xs">Total Amount</span>
                                <span className="font-black text-green-700 text-sm">₹ {order.total_amount?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Vertical Tracker */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                            Order Status
                        </div>
                        <div className="p-5">
                            <div className="relative pl-6 space-y-6">
                                <div className="absolute left-[9px] top-2 bottom-6 w-0.5 bg-gray-200"></div>
                                
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm z-10">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <div className={`absolute -left-[19px] top-5 bottom-[-24px] w-0.5 z-0 ${order.status !== 'Pending' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <div className="text-xs font-bold text-gray-900">Order Placed</div>
                                    <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{dateFormatted},<br/>{timeFormatted}</div>
                                </div>

                                <div className="relative">
                                    <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${order.status !== 'Pending' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <div className={`absolute -left-[19px] top-5 bottom-[-24px] w-0.5 z-0 ${['Preparing', 'Completed', 'Served'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <div className="text-xs font-bold text-gray-900">Order Confirmed</div>
                                </div>

                                <div className="relative">
                                    <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full border-4 flex items-center justify-center shadow-sm z-10 ${['Preparing', 'Completed', 'Served'].includes(order.status) ? 'bg-orange-500 border-orange-100' : 'bg-gray-100 border-gray-100'}`}></div>
                                    <div className={`absolute -left-[19px] top-5 bottom-[-24px] w-0.5 z-0 ${['Completed', 'Served'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    <div className="text-xs font-bold text-gray-900">Order Preparing</div>
                                </div>

                                <div className="relative">
                                    <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${['Completed', 'Served'].includes(order.status) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900">Order Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 font-bold text-gray-900 text-sm">
                            Additional Information
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Order Source</span>
                                <span className="font-bold text-gray-900">{order.order_type || 'In Restaurant'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Session ID</span>
                                <span className="font-bold text-gray-900">{order.session_id}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Last Updated</span>
                                <span className="font-bold text-gray-900 text-right leading-tight">
                                    {new Date(order.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},<br/>
                                    {new Date(order.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <ThermalReceipt 
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                data={{
                    bill_number: `ORD-${order.id}`,
                    session_id: order.session_id,
                    table: order.table_number ? `T-${order.table_number}` : null,
                    subtotal: order.total_amount,
                    service_charge: 0,
                    cgst: 0,
                    sgst: 0,
                    grand_total: order.total_amount,
                }}
                items={order.items || []}
            />
        </div>
    );
};

export default OrderDetails;
