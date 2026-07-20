import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Dummy data based on the mockup
    const order = {
        id: id || '128',
        table: 'T07',
        time: '07:15 PM',
        date: 'May 16, 2025',
        guests: 4,
        status: 'NEW', // NEW, PREPARING
        items: [
            { id: 1, qty: 2, name: 'Paneer Butter Masala' },
            { id: 2, qty: 4, name: 'Garlic Naan' },
            { id: 3, qty: 1, name: 'Jeera Rice' },
            { id: 4, qty: 2, name: 'Cold Drink' },
        ],
        specialInstructions: 'Less spicy, No onion, Extra butter on Naan',
        timeline: [
            { event: 'Order Placed', time: '07:15 PM' }
        ]
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header section with table and order info */}
            <div className="bg-white p-5 py-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider ${order.status === 'NEW' ? 'bg-green-100 text-green-800' :
                                order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status}
                        </span>
                        <div className="flex items-center gap-4 mt-3">
                            <h2 className="text-4xl font-black text-gray-900">Table {order.table}</h2>
                        </div>
                        <div className="mt-2 text-gray-600 font-semibold text-lg flex items-center gap-3">
                            <span>Order #{order.id}</span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span>{order.guests} Guests</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-900 font-black text-2xl">{order.time}</span>
                        <p className="text-gray-500 font-medium">{order.date}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 pb-24">

                {/* Item List */}
                <div className="mb-8">
                    <h4 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Items ({order.items.length})</h4>
                    <div className="flex flex-col gap-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-gray-100 text-[#f97316] font-black text-xl w-12 h-12 flex items-center justify-center rounded-lg shrink-0">
                                    {item.qty}
                                </div>
                                <div className="pt-2">
                                    <span className="text-gray-900 font-bold text-xl">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                    <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                        <h4 className="text-amber-800 font-bold uppercase tracking-wider text-sm mb-2">Special Instructions</h4>
                        <p className="text-amber-900 font-semibold text-lg leading-snug">{order.specialInstructions}</p>
                    </div>
                )}

                {/* Timeline */}
                <div className="mb-8">
                    <h4 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Timeline</h4>
                    <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        {order.timeline.map((event, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#f97316] bg-white text-slate-500 shrink-0 z-10 shadow"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between ml-4 md:ml-0 md:mr-4">
                                    <span className="font-bold text-gray-800">{event.event}</span>
                                    <span className="font-semibold text-gray-500">{event.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="absolute bottom-16 left-0 right-0 p-4 border-t border-gray-200 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                {order.status === 'NEW' && (
                    <button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xl py-4 rounded-xl shadow-md transition-colors active:scale-[0.98]">
                        Start Preparing
                    </button>
                )}
                {order.status === 'PREPARING' && (
                    <button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xl py-4 rounded-xl shadow-md transition-colors active:scale-[0.98]">
                        Mark as Ready
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
