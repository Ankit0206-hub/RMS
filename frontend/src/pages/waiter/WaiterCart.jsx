import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Edit3 } from 'lucide-react';

export default function WaiterCart() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Confirm Order (T01)</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-4 py-6 w-full space-y-4 pb-32">
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
                <div className="w-full flex items-center justify-between">
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
