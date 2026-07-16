import os

files = {
'MyTables.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Users, ArrowRight } from 'lucide-react';

export default function MyTables() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    
    const tables = [
        { id: 'T01', status: 'Occupied', time: '45m', guests: 4, order: '#128', currentBill: 1240 },
        { id: 'T02', status: 'Ready to Serve', time: '12m', guests: 2, order: '#129', currentBill: 850 },
        { id: 'T03', status: 'Payment Pending', time: '1h 15m', guests: 3, order: '#125', currentBill: 2100 },
        { id: 'T04', status: 'Empty', time: '', guests: 0, order: '', currentBill: 0 },
        { id: 'T05', status: 'Occupied', time: '5m', guests: 6, order: 'Ordering', currentBill: 0 },
    ];
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'Occupied': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Ready to Serve': return 'bg-green-50 text-green-600 border-green-100';
            case 'Payment Pending': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tables</h1>
            </div>
            
            <div className="px-4 mt-4 space-y-4 max-w-4xl mx-auto w-full pb-24">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Search tables..." className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-medium text-[15px] focus:outline-none focus:border-orange-500 shadow-sm" />
                </div>
                
                <div className="flex space-x-2 overflow-x-auto hide-scrollbar py-1">
                    {['All', 'Occupied', 'Ready', 'Empty'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {tables.map(table => (
                        <div key={table.id} onClick={() => navigate('/waiter/tables/'+table.id)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xl font-bold text-gray-900">{table.id}</span>
                                {table.guests > 0 && (
                                    <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                        <Users className="h-3 w-3 mr-1" /> {table.guests}
                                    </div>
                                )}
                            </div>
                            
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md inline-block mb-3 border ${getStatusColor(table.status)}`}>
                                {table.status}
                            </div>
                            
                            {table.status !== 'Empty' ? (
                                <div className="space-y-1.5">
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {table.time}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                        <span className="text-xs font-bold text-gray-900">{table.order}</span>
                                        <span className="text-xs font-bold text-orange-500">₹{table.currentBill}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 font-medium h-[42px] flex items-center">
                                    Available for seating
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
''',

'TableDetails.jsx': '''import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Plus, Utensils, Receipt } from 'lucide-react';

export default function TableDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Table {id || 'T01'}</h1>
                    <p className="text-xs text-gray-500 font-medium">Rahul Sharma • 4 Guests</p>
                </div>
            </div>

            <div className="px-4 py-6 max-w-4xl mx-auto w-full space-y-6 pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Session Info</h2>
                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">Occupied</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <Clock className="h-5 w-5 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 font-medium">Seated Time</p>
                            <p className="text-[15px] font-bold text-gray-900">06:45 PM (45m)</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <Users className="h-5 w-5 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 font-medium">Guests</p>
                            <p className="text-[15px] font-bold text-gray-900">4 People</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Active Orders</h2>
                        <button onClick={() => navigate('/waiter/tables/'+(id||'T01')+'/history')} className="text-xs font-bold text-orange-500 hover:underline">View History</button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-900 text-sm">Order #128</span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-orange-100 text-orange-600">Preparing</span>
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                                2x Paneer Butter Masala, 2x Garlic Naan
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/waiter/menu')} className="flex flex-col items-center justify-center bg-white border-2 border-orange-500 text-orange-500 rounded-2xl p-4 font-bold shadow-sm hover:bg-orange-50 transition-colors">
                        <Plus className="h-6 w-6 mb-2" />
                        Add Items
                    </button>
                    <button className="flex flex-col items-center justify-center bg-orange-500 text-white rounded-2xl p-4 font-bold shadow-sm hover:bg-orange-600 transition-colors">
                        <Receipt className="h-6 w-6 mb-2" />
                        Generate Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterMenu.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus } from 'lucide-react';

export default function WaiterMenu() {
    const navigate = useNavigate();
    const [activeCat, setActiveCat] = useState('Main Course');
    const categories = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
    
    const [cartCount, setCartCount] = useState(2);

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Menu (Table T01)</h1>
                </div>
                <button className="p-2 text-gray-900 rounded-full hover:bg-gray-100">
                    <Search className="h-5 w-5" />
                </button>
            </div>

            <div className="px-4 mt-4">
                <div className="flex space-x-2 overflow-x-auto hide-scrollbar py-1">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCat(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeCat === cat ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 py-6 max-w-4xl mx-auto w-full space-y-4 pb-32">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <img src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80" alt="Food" className="h-16 w-16 rounded-xl object-cover" />
                            <div>
                                <h3 className="font-bold text-gray-900">Paneer Butter Masala</h3>
                                <p className="text-sm text-gray-500 font-medium">₹ 240</p>
                            </div>
                        </div>
                        {i === 1 ? (
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button className="p-1.5 bg-white rounded-md shadow-sm"><Minus className="h-4 w-4" /></button>
                                <span className="w-8 text-center font-bold text-sm">2</span>
                                <button className="p-1.5 bg-white rounded-md shadow-sm"><Plus className="h-4 w-4" /></button>
                            </div>
                        ) : (
                            <button className="bg-orange-50 text-orange-500 p-2 rounded-xl font-bold border border-orange-100">
                                <Plus className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-[4rem] left-0 right-0 p-4 bg-transparent z-40 pointer-events-none">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate('/waiter/cart')} className="w-full pointer-events-auto bg-[#ff5722] text-white rounded-2xl py-4 px-6 flex items-center justify-between font-bold shadow-lg shadow-orange-500/30">
                        <div className="flex items-center">
                            <div className="bg-white/20 px-3 py-1 rounded-lg mr-3">{cartCount} Items</div>
                            <span>View Cart</span>
                        </div>
                        <span>₹ 540 <ArrowLeft className="h-5 w-5 inline ml-2 rotate-180" /></span>
                    </button>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterCart.jsx': '''import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Edit3 } from 'lucide-react';

export default function WaiterCart() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Confirm Order (T01)</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-4 py-6 max-w-4xl mx-auto w-full space-y-4 pb-32">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 text-lg">Items</h2>
                    {[1,2].map(i => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Paneer Butter Masala</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">₹ 240</p>
                            </div>
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button className="p-1.5 bg-white rounded-md shadow-sm"><Minus className="h-3 w-3" /></button>
                                <span className="w-8 text-center font-bold text-sm">2</span>
                                <button className="p-1.5 bg-white rounded-md shadow-sm"><Plus className="h-3 w-3" /></button>
                            </div>
                        </div>
                    ))}
                    
                    <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-orange-500 font-bold text-sm flex items-center justify-center hover:bg-gray-50">
                        <Plus className="h-4 w-4 mr-2" /> Add More Items
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Edit3 className="h-4 w-4 mr-2" />
                        <span className="text-sm font-bold">Special Instructions</span>
                    </div>
                    <textarea placeholder="E.g. Make it spicy, less oil..." className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium border border-gray-100 focus:outline-none focus:border-orange-300 min-h-[80px]"></textarea>
                </div>
            </div>

            <div className="absolute bottom-[4rem] left-0 right-0 p-4 bg-white z-40 border-t border-gray-100">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">₹ 540</p>
                    </div>
                    <button onClick={() => navigate('/waiter/tables')} className="bg-[#ff5722] text-white rounded-2xl py-3.5 px-8 font-bold text-[15px] shadow-sm">
                        Send to Kitchen
                    </button>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterOrders.jsx': '''import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Clock } from 'lucide-react';

export default function WaiterOrders() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Active');
    const orders = [
        { id: '#128', table: 'T01', time: '07:18 PM', status: 'Preparing', items: [{ name: 'Paneer Butter Masala', qty: 2 }, { name: 'Garlic Naan', qty: 2 }] },
        { id: '#127', table: 'T03', time: '07:10 PM', status: 'Preparing', items: [{ name: 'Mix Veg', qty: 1 }, { name: 'Tandoori Roti', qty: 4 }] },
        { id: '#126', table: 'T02', time: '06:50 PM', status: 'Completed', items: [{ name: 'Tomato Soup', qty: 2 }] }
    ];
    const filteredOrders = activeTab === 'Active' ? orders.filter(o => o.status !== 'Completed') : orders.filter(o => o.status === 'Completed');

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
                <button className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-4xl mx-auto w-full pb-24">
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Active' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Active (4)</button>
                    <button onClick={() => setActiveTab('Completed')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Completed' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Completed (12)</button>
                </div>
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">Order {order.id}</h3>
                                        <span className="bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-md text-xs">Table {order.table}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {order.time}
                                    </div>
                                </div>
                                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${order.status === 'Preparing' ? 'bg-orange-50 text-[#ff5722]' : 'bg-green-50 text-green-600'}`}>{order.status}</span>
                            </div>
                            <div className="space-y-1.5 mt-4 mb-5 border-t border-gray-50 pt-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="text-sm font-medium text-gray-600 flex justify-between">
                                        <span>{item.name}</span><span className="font-bold text-gray-900 ml-1">x{item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-50 pt-4 flex justify-end">
                                <button onClick={() => navigate(`/waiter/orders/${order.id.replace('#', '')}`)} className="flex items-center text-[#ff5722] text-sm font-bold hover:underline">
                                    View Details <ChevronRight className="h-4 w-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
''',

'WaiterOrderDetails.jsx': '''import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export default function WaiterOrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const order = {
        id: `#${orderId || '128'}`, table: 'T01', time: '07:18 PM', status: 'Preparing', total: 300,
        items: [{ name: 'Paneer Butter Masala', qty: 2, price: 120 }, { name: 'Garlic Naan', qty: 2, price: 30 }]
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
                <button className="text-sm font-bold text-[#ff5722] hover:underline">Help</button>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-3xl mx-auto w-full pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order {order.id}</h2>
                            <div className="flex items-center mt-1">
                                <span className="bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded-md text-xs mr-2">Table {order.table}</span>
                                <span className="text-xs font-medium text-gray-500 flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {order.time}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="relative pl-6 space-y-6 border-l-2 border-gray-100 ml-3">
                            <div className="relative"><span className="absolute -left-[35px] top-0 bg-green-500 text-white rounded-full p-0.5"><CheckCircle2 className="h-5 w-5" /></span><p className="text-sm font-bold text-gray-900">Order Placed</p><p className="text-xs text-gray-500 font-medium">07:18 PM</p></div>
                            <div className="relative"><span className="absolute -left-[33px] top-0.5 bg-white border-4 border-orange-500 h-4 w-4 rounded-full"></span><p className="text-sm font-bold text-[#ff5722]">Preparing</p><p className="text-xs text-orange-400 font-medium">07:22 PM</p></div>
                            <div className="relative"><span className="absolute -left-[33px] top-0.5 bg-white border-4 border-gray-200 h-4 w-4 rounded-full"></span><p className="text-sm font-bold text-gray-400">Ready</p><p className="text-xs text-gray-400 font-medium">Pending</p></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div><p className="text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500 mt-0.5 font-medium">₹{item.price} x {item.qty}</p></div>
                                <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">Total</span><span className="text-lg font-bold text-gray-900">₹{order.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterOrderHistory.jsx': '''import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';

export default function WaiterOrderHistory() {
    const navigate = useNavigate();
    const { tableId } = useParams();
    const orders = [
        { id: '#128', time: '07:18 PM', status: 'Preparing', total: 300, items: [{ name: 'Paneer Butter Masala', qty: 2 }, { name: 'Garlic Naan', qty: 2 }] },
        { id: '#126', time: '06:50 PM', status: 'Completed', total: 650, items: [{ name: 'Tomato Soup', qty: 2 }, { name: 'Veg Biryani', qty: 1 }] }
    ];
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Order History</h1>
                <button className="text-sm font-bold text-[#ff5722] hover:underline">Help</button>
            </div>
            <div className="px-4 py-4 max-w-4xl mx-auto space-y-6 pb-32">
                <div className="bg-orange-50 text-orange-600 rounded-xl p-3 text-center font-bold text-[15px] border border-orange-100">Table {tableId || 'T01'} - Rahul Sharma</div>
                <div className="space-y-4">
                    {orders.map((order, index) => (
                        <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1"><h3 className="text-lg font-bold text-gray-900">Order {order.id}</h3><span className="text-gray-400 font-normal text-sm">- ₹ {order.total}</span></div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium"><Clock className="h-3.5 w-3.5 mr-1" /> {order.time}</div>
                                </div>
                                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${order.status === 'Preparing' ? 'bg-orange-50 text-[#ff5722]' : 'bg-green-50 text-green-600'}`}>{order.status}</span>
                            </div>
                            <div className="space-y-1.5 mt-4 mb-5 border-t border-gray-50 pt-4">
                                <div className="text-sm font-medium text-gray-600">
                                    {order.items.map((item, i) => (<span key={i}>{item.qty}x {item.name}{i !== order.items.length - 1 ? ', ' : ''}</span>))}
                                </div>
                            </div>
                            <div className="border-t border-gray-50 pt-4 flex justify-end">
                                <button onClick={() => navigate(`/waiter/orders/${order.id.replace('#', '')}`)} className="flex items-center text-[#ff5722] text-sm font-bold hover:underline">Details <ChevronRight className="h-4 w-4 ml-0.5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
                    <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-gray-500">Total Orders</span><span className="text-lg font-bold text-gray-900">{orders.length}</span></div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-4"><span className="text-sm font-bold text-gray-500">Total Amount</span><span className="text-xl font-bold text-[#ff5722]">₹{totalAmount}</span></div>
                </div>
            </div>
            <div className="absolute bottom-[4rem] left-0 right-0 p-4 bg-white z-40 border-t border-gray-100">
                <div className="max-w-4xl mx-auto space-y-3">
                    <button className="w-full bg-white text-[#ff5722] border-2 border-[#ff5722] rounded-2xl py-4 font-bold text-[15px] shadow-sm hover:bg-orange-50 transition-colors">Request Bill</button>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterReadyToServe.jsx': '''import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

export default function WaiterReadyToServe() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const order = { id: `#${orderId || '129'}`, table: 'T02', time: '07:42 PM', status: 'Ready', total: 120, items: [{ name: 'Cold Drink', qty: 3, price: 40 }] };

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Orders</h1>
                <div className="w-10"></div>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-3xl mx-auto w-full pb-32">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order {order.id}</h2>
                            <div className="flex items-center mt-1"><span className="bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded-md text-xs mr-2">Table {order.table}</span><span className="text-xs font-medium text-gray-500 flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {order.time}</span></div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="relative pl-6 space-y-6 border-l-2 border-green-500 ml-3">
                            <div className="relative"><span className="absolute -left-[35px] top-0 bg-green-500 text-white rounded-full p-0.5"><CheckCircle2 className="h-5 w-5" /></span><p className="text-sm font-bold text-gray-900">Order Placed</p></div>
                            <div className="relative"><span className="absolute -left-[35px] top-0 bg-green-500 text-white rounded-full p-0.5"><CheckCircle2 className="h-5 w-5" /></span><p className="text-sm font-bold text-gray-900">Preparing</p></div>
                            <div className="relative"><span className="absolute -left-[33px] top-0.5 bg-white border-4 border-green-500 h-4 w-4 rounded-full"></span><p className="text-sm font-bold text-green-600">Ready to Serve</p><p className="text-xs text-green-500 font-medium mt-0.5">Kitchen marked as ready</p></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Items to Serve</h3>
                    <div className="space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div><p className="text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500 mt-0.5 font-medium">₹{item.price} x {item.qty}</p></div>
                                <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-[4rem] left-0 right-0 p-4 bg-white z-40 border-t border-gray-100">
                <div className="max-w-4xl mx-auto space-y-3">
                    <button onClick={() => navigate(-1)} className="w-full bg-[#ff5722] text-white rounded-2xl py-4 font-bold text-[15px] shadow-sm hover:bg-orange-600 transition-colors">Mark as Served</button>
                </div>
            </div>
        </div>
    );
}
''',

'WaiterRequests.jsx': '''import React, { useState } from 'react';
import { Bell, Clock, Info } from 'lucide-react';

export default function WaiterRequests() {
    const [activeTab, setActiveTab] = useState('Active');
    const requests = [
        { id: 1, type: 'Water Refill', table: 'T01', time: 'Just Now', message: 'Please bring 2 extra glasses', status: 'Active' },
        { id: 2, type: 'Bill Request', table: 'T04', time: '2 mins ago', message: '', status: 'Active' },
        { id: 3, type: 'Call Waiter', table: 'T02', time: '5 mins ago', message: 'Need help with menu', status: 'Active' },
        { id: 4, type: 'Cutlery', table: 'T03', time: '1 hour ago', message: 'Extra spoons', status: 'Resolved' }
    ];
    const filteredRequests = activeTab === 'Active' ? requests.filter(r => r.status === 'Active') : requests.filter(r => r.status === 'Resolved');

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Requests</h1>
                <button className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-4xl mx-auto w-full pb-24">
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('Active')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Active' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Active ({requests.filter(r => r.status === 'Active').length})</button>
                    <button onClick={() => setActiveTab('Resolved')} className={`flex-1 py-3 rounded-2xl text-[15px] font-bold transition-colors shadow-sm ${activeTab === 'Resolved' ? 'bg-[#ff5722] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Resolved ({requests.filter(r => r.status === 'Resolved').length})</button>
                </div>
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <div key={request.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{request.type}</h3>
                                        <span className="bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-md text-xs">Table {request.table}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium"><Clock className="h-3.5 w-3.5 mr-1" /> {request.time}</div>
                                </div>
                            </div>
                            {request.message && (
                                <div className="bg-orange-50 rounded-xl p-3 mb-4 flex items-start border border-orange-100">
                                    <Info className="h-4 w-4 text-[#ff5722] mr-2 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-orange-900">{request.message}</p>
                                </div>
                            )}
                            {request.status === 'Active' && (
                                <div className="border-t border-gray-50 pt-4">
                                    {request.type === 'Bill Request' ? (
                                        <button className="w-full bg-[#ff5722] text-white rounded-xl py-3 font-bold text-sm shadow-sm hover:bg-orange-600 transition-colors">Generate Bill</button>
                                    ) : (
                                        <button className="w-full bg-white text-[#ff5722] border-2 border-orange-100 rounded-xl py-3 font-bold text-sm shadow-sm hover:bg-orange-50 transition-colors">Mark Resolved</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredRequests.length === 0 && <div className="text-center py-12 text-gray-500">No {activeTab.toLowerCase()} requests.</div>}
                </div>
            </div>
        </div>
    );
}
''',

'WaiterNotifications.jsx': '''import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';

export default function WaiterNotifications() {
    const navigate = useNavigate();
    const notifications = [
        { id: 1, type: 'Order Ready', message: "Table T02's order #129 is ready to serve", time: '2 mins ago', icon: CheckCircle2, iconColor: 'text-green-500', iconBg: 'bg-green-100', unread: true },
        { id: 2, type: 'New Assigned Table', message: 'You have been assigned Table T05', time: '15 mins ago', icon: UserPlus, iconColor: 'text-orange-500', iconBg: 'bg-orange-100', unread: false }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            </div>
            <div className="px-4 mt-4 flex-1 space-y-4 max-w-3xl mx-auto w-full pb-24">
                {notifications.map(notif => (
                    <div key={notif.id} className={`bg-white rounded-2xl p-4 shadow-sm border flex items-start ${notif.unread ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${notif.iconBg}`}><notif.icon className={`h-6 w-6 ${notif.iconColor}`} /></div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-[15px] font-bold text-gray-900">{notif.type}</h3>
                            <p className="text-sm text-gray-600 mt-0.5 font-medium leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">{notif.time}</p>
                        </div>
                        {notif.unread && <div className="h-2.5 w-2.5 rounded-full bg-[#ff5722] mt-2"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
''',

'WaiterProfile.jsx': '''import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CalendarClock, Settings, Sliders, LogOut, ChevronRight, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function WaiterProfile() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const menuItems = [
        { icon: User, label: 'Personal Details', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: CalendarClock, label: 'Shift History', color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: Sliders, label: 'Performance Settings', color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Settings, label: 'App Settings', color: 'text-gray-500', bg: 'bg-gray-50' }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
            </div>
            <div className="px-4 mt-6 flex-1 space-y-6 max-w-2xl mx-auto w-full pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-[#ff5722] border-4 border-white shadow-md">AK</div>
                        <button className="absolute bottom-0 right-0 h-8 w-8 bg-[#ff5722] text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white"><Camera className="h-4 w-4" /></button>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">Amit Kumar</h2>
                    <p className="text-[#ff5722] font-bold text-sm mt-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Senior Waiter</p>
                </div>
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                    {menuItems.map((item, index) => (
                        <button key={index} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                            <div className="flex items-center space-x-4"><div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.bg}`}><item.icon className={`h-5 w-5 ${item.color}`} /></div><span className="font-bold text-gray-900">{item.label}</span></div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                    ))}
                </div>
                <div className="pt-4">
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center font-bold shadow-sm border border-red-100 hover:bg-red-100 transition-colors"><LogOut className="h-5 w-5 mr-2" />Logout</button>
                </div>
            </div>
        </div>
    );
}
'''
}

base_path = 'd:/RMS/frontend/src/pages/waiter/'
for f, content in files.items():
    print('Writing', f)
    with open(os.path.join(base_path, f), 'w', encoding='utf-8') as out_f:
        out_f.write(content)
