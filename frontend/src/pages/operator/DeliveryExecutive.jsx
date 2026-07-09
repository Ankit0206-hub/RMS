import React, { useState } from 'react';
import { 
    Package, 
    ChevronRight, 
    SlidersHorizontal, 
    Crown, 
    Play, 
    MapPin, 
    Clock, 
    User,
    CheckCircle
} from 'lucide-react';

const DeliveryExecutive = () => {
    // Initial Mock Data matching the mockup card details
    const [orders, setOrders] = useState([
        // Picked Up (Orange)
        { id: '1', location: 'Berlin, DE', orderNo: '#324561324', status: 'Picked up', assignedTo: 'Edgar Humbert', expAt: '12 Apr', flag: '🇩🇪' },
        { id: '2', location: 'Oslo, NO', orderNo: '#324561324', status: 'Picked up', assignedTo: 'Lars Eriksen', expAt: '18 Apr', flag: '🇳🇴' },
        { id: '3', location: 'Berlin, DE', orderNo: '901234857', status: 'Picked up', assignedTo: 'Clara Meissner', expAt: '23 Apr', flag: '🇩🇪' },
        { id: '4', location: 'Tokyo, JP', orderNo: '#448201937', status: 'Picked up', assignedTo: 'Naomi Sato', expAt: '27 Apr', flag: '🇯🇵' },
        
        // In Transit (Blue)
        { id: '5', location: 'Rome, IT', orderNo: '#842391056', status: 'In transit', assignedTo: 'Julian Thorne', expAt: '14 Apr', flag: '🇮🇹' },
        { id: '6', location: 'Zurich, CH', orderNo: '#772394810', status: 'In transit', assignedTo: 'Silvia Rossi', expAt: '19 Apr', flag: '🇨🇭' },
        { id: '7', location: 'Tokyo, JP', orderNo: '#448201937', status: 'In transit', assignedTo: 'Naomi Sato', expAt: '27 Apr', flag: '🇯🇵' },
        { id: '8', location: 'London, UK', orderNo: '#229384756', status: 'In transit', assignedTo: 'Adrian Vance', expAt: '29 Apr', flag: '🇬🇧' },
        
        // Delivered (Green)
        { id: '9', location: 'Milan, IT', orderNo: '#194827364', status: 'Delivered', assignedTo: 'Elena Moretti', expAt: '15 Apr', flag: '🇮🇹' },
        { id: '10', location: 'Paris, FR', orderNo: '#324561324', status: 'Delivered', assignedTo: 'Victor Dubois', expAt: '26 Apr', flag: '🇫🇷' },
    ]);

    const [activeFilter, setActiveFilter] = useState('Assigned');

    // Counts for filter pills
    const getCounts = () => {
        return {
            pending: 4,
            responded: 12,
            assigned: orders.length,
            completed: orders.filter(o => o.status === 'Delivered').length
        };
    };

    const counts = getCounts();

    // Move orders between columns on click (Interactivity / Proper Working)
    const handleStatusTransition = (orderId, currentStatus) => {
        setOrders(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    let nextStatus = currentStatus;
                    if (currentStatus === 'Picked up') nextStatus = 'In transit';
                    else if (currentStatus === 'In transit') nextStatus = 'Delivered';
                    else if (currentStatus === 'Delivered') nextStatus = 'Picked up'; // Loop for demo
                    return { ...order, status: nextStatus };
                }
                return order;
            })
        );
    };

    return (
        <div className="space-y-6 animate-fade-in font-inter">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={() => setActiveFilter('Pending')}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            activeFilter === 'Pending' 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>Pending</span>
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            activeFilter === 'Pending' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-800'
                        }`}>{counts.pending}</span>
                    </button>

                    <button 
                        onClick={() => setActiveFilter('Responded')}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            activeFilter === 'Responded' 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>Responded</span>
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            activeFilter === 'Responded' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-800'
                        }`}>{counts.responded}</span>
                    </button>

                    <button 
                        onClick={() => setActiveFilter('Assigned')}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            activeFilter === 'Assigned' 
                            ? 'bg-[#ff9f43] text-gray-900 border-[#ff9f43] shadow-sm font-bold' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>Assigned</span>
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            activeFilter === 'Assigned' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                        }`}>{counts.assigned}</span>
                    </button>

                    <button 
                        onClick={() => setActiveFilter('Completed')}
                        className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            activeFilter === 'Completed' 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>Completed</span>
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            activeFilter === 'Completed' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-800'
                        }`}>{counts.completed}</span>
                    </button>

                    {/* Sliders Icon */}
                    <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Main Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Picked up */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 px-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f43]"></span>
                        <h3 className="font-bold text-gray-900 text-sm">Picked up</h3>
                        <span className="text-xs font-semibold text-gray-400">({orders.filter(o => o.status === 'Picked up').length})</span>
                    </div>

                    <div className="space-y-3.5">
                        {orders.filter(o => o.status === 'Picked up').map(order => (
                            <div 
                                key={order.id}
                                onClick={() => handleStatusTransition(order.id, order.status)}
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
                                title="Click to move to 'In transit'"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                                            <Package className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xs">{order.location}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{order.orderNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 bg-orange-50 text-[#ff9f43] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f43]"></span>
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-[11px] font-semibold text-gray-500 mb-2">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Assigned to</p>
                                        <p className="text-gray-800 font-bold truncate">{order.assignedTo}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Exp at</p>
                                        <p className="text-gray-800 font-bold">{order.expAt}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                                    <span className="text-[10px] font-bold text-cyan-600 group-hover:underline">Move to Transit →</span>
                                    <span className="text-base">{order.flag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: In transit */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 px-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#388af6]"></span>
                        <h3 className="font-bold text-gray-900 text-sm">In transit</h3>
                        <span className="text-xs font-semibold text-gray-400">({orders.filter(o => o.status === 'In transit').length})</span>
                    </div>

                    <div className="space-y-3.5">
                        {orders.filter(o => o.status === 'In transit').map(order => (
                            <div 
                                key={order.id}
                                onClick={() => handleStatusTransition(order.id, order.status)}
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                                title="Click to move to 'Delivered'"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                                            <Package className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xs">{order.location}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{order.orderNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 bg-blue-50 text-[#388af6] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#388af6]"></span>
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-[11px] font-semibold text-gray-500 mb-2">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Assigned to</p>
                                        <p className="text-gray-800 font-bold truncate">{order.assignedTo}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Exp at</p>
                                        <p className="text-gray-800 font-bold">{order.expAt}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                                    <span className="text-[10px] font-bold text-cyan-600 group-hover:underline">Move to Served →</span>
                                    <span className="text-base">{order.flag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: Delivered */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 px-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#23c162]"></span>
                        <h3 className="font-bold text-gray-900 text-sm">Delivered</h3>
                        <span className="text-xs font-semibold text-gray-400">({orders.filter(o => o.status === 'Delivered').length})</span>
                    </div>

                    <div className="space-y-3.5">
                        {orders.filter(o => o.status === 'Delivered').map(order => (
                            <div 
                                key={order.id}
                                onClick={() => handleStatusTransition(order.id, order.status)}
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
                                title="Click to restart status loop"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                                            <Package className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xs">{order.location}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{order.orderNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 bg-green-50 text-[#23c162] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#23c162]"></span>
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-[11px] font-semibold text-gray-500 mb-2">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Assigned to</p>
                                        <p className="text-gray-800 font-bold truncate">{order.assignedTo}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Exp at</p>
                                        <p className="text-gray-800 font-bold">{order.expAt}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                                    <span className="text-[10px] font-bold text-cyan-600 group-hover:underline">Restart Cycle ↺</span>
                                    <span className="text-base">{order.flag}</span>
                                </div>
                            </div>
                        ))}

                        {/* Waiter Premium Promotion Card */}
                        <div className="bg-[#ff9f43] rounded-3xl p-5 text-gray-900 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[300px]">
                            <div className="space-y-4">
                                <h4 className="text-lg font-black leading-tight max-w-[200px] text-gray-950 font-poppins">
                                    Unlock powerful advanced route analytics
                                </h4>
                                <button className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center space-x-2 transition-colors">
                                    <Crown className="w-3.5 h-3.5 text-[#ff9f43]" />
                                    <span>Get Premium</span>
                                </button>
                            </div>
                            
                            {/* Generated Waiter Illustration replacing the truck */}
                            <div className="absolute right-[-10px] bottom-[-10px] w-[150px] h-[180px] pointer-events-none">
                                <img 
                                    src="/waiter_holding_dish.png" 
                                    alt="Waiter with dish" 
                                    className="w-full h-full object-contain" 
                                />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default DeliveryExecutive;
