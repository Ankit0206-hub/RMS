import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Plus, Utensils, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TableDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { tableId } = useParams();
    const id = tableId || 'T01';

    const { customerName, guests, isNewSession } = location.state || {};
    const displayName = customerName || 'Rahul Sharma';
    const displayGuests = guests || 4;
    const seatedTime = isNewSession ? 'Just now' : '06:45 PM (45m)';

    return (
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Table {id}</h1>
                    <p className="text-xs text-gray-500 font-medium">{displayName} • {displayGuests} Guests</p>
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
                            <p className="text-[15px] font-bold text-gray-900">{seatedTime}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <Users className="h-5 w-5 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 font-medium">Guests</p>
                            <p className="text-[15px] font-bold text-gray-900">{displayGuests} People</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Active Orders</h2>
                        {!isNewSession && <button onClick={() => navigate('/waiter/tables/'+id+'/history')} className="text-xs font-bold text-orange-500 hover:underline">View History</button>}
                    </div>
                    
                    {isNewSession ? (
                        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                            <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-medium">No active orders yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Tap Add Items to take the first order.</p>
                        </div>
                    ) : (
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
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/waiter/take-order')} className="flex flex-col items-center justify-center bg-white border-2 border-orange-500 text-orange-500 rounded-2xl p-4 font-bold shadow-sm hover:bg-orange-50 transition-colors">
                        <Plus className="h-6 w-6 mb-2" />
                        Add Items
                    </button>
                    <button onClick={() => { toast.success('Bill Generated successfully!'); navigate('/waiter/tables'); }} className="flex flex-col items-center justify-center bg-orange-500 text-white rounded-2xl p-4 font-bold shadow-sm hover:bg-orange-600 transition-colors">
                        <Receipt className="h-6 w-6 mb-2" />
                        Generate Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
