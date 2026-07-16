import React, { useState } from 'react';
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
            <div className="px-4 mt-4 flex-1 space-y-6 max-w-md mx-auto w-full pb-24">
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
