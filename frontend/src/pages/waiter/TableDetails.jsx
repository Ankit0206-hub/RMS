import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Plus, Utensils, Receipt } from 'lucide-react';

export default function TableDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Table {id || 'T01'}</h1>
                    <p className="text-xs text-gray-500 font-medium">Rahul Sharma • 4 Guests</p>
                </div>
            </div>

            <div className="px-4 py-6 w-full space-y-6 pb-24">
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
