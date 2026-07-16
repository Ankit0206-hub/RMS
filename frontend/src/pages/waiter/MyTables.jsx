import React, { useState } from 'react';
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
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tables</h1>
            </div>
            
            <div className="px-4 mt-4 space-y-4 w-full pb-24">
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
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
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
