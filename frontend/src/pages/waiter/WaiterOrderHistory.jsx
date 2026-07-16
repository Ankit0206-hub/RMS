import React from 'react';
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
            <div className="px-4 py-4 max-w-md mx-auto space-y-6 pb-32">
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
                <div className="max-w-md mx-auto space-y-3">
                    <button className="w-full bg-white text-[#ff5722] border-2 border-[#ff5722] rounded-2xl py-4 font-bold text-[15px] shadow-sm hover:bg-orange-50 transition-colors">Request Bill</button>
                </div>
            </div>
        </div>
    );
}
