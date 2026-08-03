import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChefHat, ConciergeBell, CheckCircle2, Clock, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { kitchenApi } from '../../services/kitchenApi';

const KitchenDashboard = () => {
    const navigate = useNavigate();

    const { data: stats = { totalOrders: 0, preparing: 0, ready: 0, completed: 0 }, isLoading } = useQuery({
        queryKey: ['kitchen_stats'],
        queryFn: kitchenApi.getStats,
        refetchInterval: 60000 // Fallback refetch every minute
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 flex flex-col gap-6">
            <div>
                <h2 className="text-gray-800 font-bold text-lg mb-4">Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center cursor-pointer shadow-sm active:scale-[0.98] transition-transform" onClick={() => navigate('/kitchen/new')}>
                        <span className="text-3xl font-bold text-[#0f5132] mb-1">{stats.totalOrders}</span>
                        <span className="text-sm font-semibold text-green-800">Total Orders</span>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-center justify-center cursor-pointer shadow-sm active:scale-[0.98] transition-transform" onClick={() => navigate('/kitchen/preparing')}>
                        <span className="text-3xl font-bold text-orange-600 mb-1">{stats.preparing}</span>
                        <span className="text-sm font-semibold text-orange-700">Preparing</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center cursor-pointer shadow-sm active:scale-[0.98] transition-transform" onClick={() => navigate('/kitchen/ready')}>
                        <span className="text-3xl font-bold text-blue-600 mb-1">{stats.ready}</span>
                        <span className="text-sm font-semibold text-blue-700">Ready</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center cursor-pointer shadow-sm active:scale-[0.98] transition-transform" onClick={() => navigate('/kitchen/history')}>
                        <span className="text-3xl font-bold text-gray-700 mb-1">{stats.completed}</span>
                        <span className="text-sm font-semibold text-gray-600">Completed</span>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-gray-800 font-bold text-lg mb-4">Today's Summary</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <ClipboardList className="w-5 h-5" />
                            <span className="font-semibold">Total Orders</span>
                        </div>
                        <span className="font-bold text-gray-900">{stats.totalOrders}</span>
                    </div>
                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Completed Orders</span>
                        </div>
                        <span className="font-bold text-gray-900">{stats.completed}</span>
                    </div>
                    <div className="p-4 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold">Average Prep Time</span>
                        </div>
                        <span className="font-bold text-gray-900">14 min</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-700">
                            <History className="w-5 h-5" />
                            <span className="font-semibold">Longest Running Order</span>
                        </div>
                        <span className="font-bold text-gray-900">T03 (28 min)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenDashboard;
