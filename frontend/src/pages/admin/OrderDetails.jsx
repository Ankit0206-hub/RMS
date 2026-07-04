import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Printer, Download, ChevronDown, ClipboardList, Calendar, 
    Utensils, Users, User, Plus, Edit2, Copy, RefreshCcw, XCircle,
    CheckCircle2, Clock
} from 'lucide-react';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock data matching the mockup exactly
    const orderItems = [
        { id: 1, name: 'Paneer Tikka', category: 'Starter', qty: 1, price: 220.00, amount: 220.00, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&h=100&fit=crop' },
        { id: 2, name: 'Veg Biryani', category: 'Main Course', qty: 1, price: 180.00, amount: 180.00, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&h=100&fit=crop' },
        { id: 3, name: 'Butter Naan', category: 'Main Course', qty: 2, price: 45.00, amount: 90.00, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=100&fit=crop' },
        { id: 4, name: 'Coca Cola', category: 'Beverage', qty: 2, price: 30.00, amount: 60.00, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&h=100&fit=crop' },
        { id: 5, name: 'Gulab Jamun', category: 'Dessert', qty: 1, price: 80.00, amount: 80.00, img: 'https://images.unsplash.com/photo-1596568212629-9e2c608f60dc?w=100&h=100&fit=crop' },
        { id: 6, name: 'Masala Papad', category: 'Starter', qty: 1, price: 25.00, amount: 25.00, img: 'https://images.unsplash.com/photo-1605333555234-bc2cc5a37dc6?w=100&h=100&fit=crop' },
    ];

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* Header Actions */}
            <div className="flex justify-end items-center space-x-3 mb-6">
                <button className="flex items-center bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <Printer className="w-3.5 h-3.5 mr-2" />
                    Print Invoice
                </button>
                <button className="flex items-center bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download PDF
                </button>
                <button className="flex items-center bg-[#5e5ce6] hover:bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                    Update Status
                    <ChevronDown className="w-3.5 h-3.5 ml-2" />
                </button>
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
                            <h2 className="text-xl font-black text-gray-900">#ORD1263</h2>
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold">Completed</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" /> 20 May 2025, 12:45 PM</span>
                            <span className="flex items-center"><Utensils className="w-3.5 h-3.5 mr-1 text-gray-400" /> Dine In</span>
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
                            <p className="text-xs font-bold text-gray-900 mt-0.5">Dine In</p>
                            <div className="flex items-center mt-2">
                                <div className="p-1.5 bg-green-50 text-green-500 rounded-md mr-2">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400">Table</p>
                                    <p className="text-xs font-bold text-gray-900 mt-0.5">T2 - Table 2</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <img src="https://ui-avatars.com/api/?name=Suresh+Yadav&background=e0e7ff&color=4f46e5" alt="Customer" className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Customer</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">Suresh Yadav</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Waiter" className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Waiter</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">Suresh Yadav</p>
                            <p className="text-[10px] font-semibold text-gray-500">+91 98765 43210</p>
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
                                    {orderItems.map((item, idx) => (
                                        <tr key={item.id} className={idx !== orderItems.length - 1 ? 'border-b border-gray-50' : ''}>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center space-x-3">
                                                    <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900">{item.name}</div>
                                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{item.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-center text-xs font-bold text-gray-900">{item.qty}</td>
                                            <td className="py-3 px-5 text-right text-xs font-semibold text-gray-600">{item.price.toFixed(2)}</td>
                                            <td className="py-3 px-5 text-right text-xs font-bold text-gray-900">{item.amount.toFixed(2)}</td>
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
                                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">Walk-in Customer</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Name</span>
                                    <span className="font-bold text-gray-900">Suresh Yadav</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Phone</span>
                                    <span className="font-bold text-gray-900">+91 98765 43210</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Email</span>
                                    <span className="font-bold text-gray-900">suresh.yadav@email.com</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Special Instructions</span>
                                    <span className="font-bold text-gray-900">No onions in food</span>
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
                                                <div className="text-[10px] text-gray-500 font-semibold">by Suresh Yadav</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">20 May 2025, 12:40 PM</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex relative">
                                        <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 z-10 border border-white">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Confirmed</div>
                                                <div className="text-[10px] text-gray-500 font-semibold">by Kitchen</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">20 May 2025, 12:41 PM</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex relative">
                                        <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 z-10 border border-white">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Preparing</div>
                                                <div className="text-[10px] text-gray-500 font-semibold">by Kitchen</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">20 May 2025, 12:43 PM</div>
                                        </div>
                                    </div>

                                    <div className="flex relative">
                                        <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 z-10 border border-white">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div className="text-xs font-bold text-gray-900">Order Completed</div>
                                                <div className="text-[10px] text-gray-500 font-semibold">by Suresh Yadav</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">20 May 2025, 12:45 PM</div>
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
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-semibold">Sub Total</span>
                                <span className="font-bold text-gray-900">₹ 655.00</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-semibold">Discount</span>
                                <span className="font-bold text-gray-900">- ₹ 10.00</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-semibold">Tax (5%)</span>
                                <span className="font-bold text-gray-900">₹ 32.75</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-semibold">Service Charge (2%)</span>
                                <span className="font-bold text-gray-900">₹ 13.20</span>
                            </div>
                            
                            <div className="border-t border-gray-100 border-dashed pt-4 flex justify-between items-center">
                                <span className="font-black text-gray-900 text-sm">Grand Total</span>
                                <span className="font-black text-gray-900 text-lg">₹ 690.95</span>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 mt-2 flex justify-between items-center">
                                <span className="font-bold text-green-700 text-xs">Amount Paid</span>
                                <span className="font-black text-green-700 text-sm">₹ 690.95</span>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Payment Method</span>
                                    <span className="font-bold text-gray-900">UPI</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Payment Status</span>
                                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">● Paid</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-semibold">Paid On</span>
                                    <span className="font-bold text-gray-900 text-right leading-tight">20 May 2025, 12:45 PM</span>
                                </div>
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
                                    <div className="absolute -left-[19px] top-5 bottom-[-24px] w-0.5 bg-green-500 z-0"></div>
                                    <div className="text-xs font-bold text-gray-900">Order Placed</div>
                                    <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">20 May 2025,<br/>12:40 PM</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm z-10">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="absolute -left-[19px] top-5 bottom-[-24px] w-0.5 bg-green-500 z-0"></div>
                                    <div className="text-xs font-bold text-gray-900">Order Confirmed</div>
                                    <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">20 May 2025,<br/>12:41 PM</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-orange-500 border-4 border-orange-100 flex items-center justify-center shadow-sm z-10"></div>
                                    <div className="absolute -left-[19px] top-5 bottom-[-24px] w-0.5 bg-green-500 z-0"></div>
                                    <div className="text-xs font-bold text-gray-900">Order Preparing</div>
                                    <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">20 May 2025,<br/>12:43 PM</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm z-10">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900">Order Completed</div>
                                    <div className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">20 May 2025,<br/>12:45 PM</div>
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
                                <span className="font-bold text-gray-900">In Restaurant</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Floor</span>
                                <span className="font-bold text-gray-900">Ground Floor</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">No. of Guests</span>
                                <span className="font-bold text-gray-900">2</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Bill No.</span>
                                <span className="font-bold text-gray-900">BILL654</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Created By</span>
                                <span className="font-bold text-gray-900">Suresh Yadav</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-500 font-semibold text-blue-500 cursor-pointer hover:underline">Last Updated</span>
                                <span className="font-bold text-gray-900 text-right leading-tight">20 May 2025,<br/>12:50 PM</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
