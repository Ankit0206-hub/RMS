import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ChefHat, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const KitchenOverview = () => {
    const [days, setDays] = useState(7);

    // Fetch Kitchen Dashboard Metrics
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
        queryKey: ['adminKitchenDashboard'],
        queryFn: async () => {
            const res = await api.get('/admin/kitchen/dashboard');
            return res.data.data;
        },
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    // Fetch Active Orders for Live KDS Monitor
    const { data: activeOrdersResponse, isLoading: ordersLoading } = useQuery({
        queryKey: ['adminKitchenActiveOrders'],
        queryFn: async () => {
            const res = await api.get('/admin/ordering/orders?status=Confirmed');
            return res.data.data;
        },
        refetchInterval: 10000
    });

    // Fetch Performance Data
    const { data: performanceData, isLoading: performanceLoading } = useQuery({
        queryKey: ['adminKitchenPerformance', days],
        queryFn: async () => {
            const res = await api.get(`/admin/kitchen/performance?days=${days}`);
            return res.data.data;
        }
    });

    const metrics = dashboardData || {
        activeOrders: 0,
        delayedOrders: 0,
        averagePrepTimeMins: 0,
        completedToday: 0
    };

    const activeOrders = activeOrdersResponse || [];
    const trend = performanceData?.trend || [];

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTooltip = (label) => {
        const date = new Date(label);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (dashboardLoading && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-6 w-full">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Kitchen Management</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Real-time monitoring and historical analytics</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Active Orders</p>
                        <h3 className="text-3xl font-black text-gray-900">{metrics.activeOrders}</h3>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                        <ChefHat className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Avg Prep Time</p>
                        <h3 className="text-3xl font-black text-gray-900">{metrics.averagePrepTimeMins}<span className="text-base text-gray-500 ml-1">min</span></h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Delayed Orders</p>
                        <h3 className={`text-3xl font-black ${metrics.delayedOrders > 0 ? 'text-red-600' : 'text-gray-900'}`}>{metrics.delayedOrders}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${metrics.delayedOrders > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <AlertTriangle className={`w-8 h-8 ${metrics.delayedOrders > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Completed Today</p>
                        <h3 className="text-3xl font-black text-gray-900">{metrics.completedToday}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-auto">
                {/* Live KDS Monitor */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-96 xl:h-[600px]">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            Live KDS Monitor
                        </h2>
                        <span className="text-xs font-semibold text-gray-500">Auto-updating every 10s</span>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1">
                        {ordersLoading && !activeOrdersResponse ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-pulse flex gap-2">
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        ) : activeOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <ChefHat className="w-16 h-16 text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-500">No Active Orders</h3>
                                <p className="text-sm text-gray-400 mt-1">The kitchen is currently idle.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {activeOrders.map(order => {
                                    const timeInKitchen = Math.floor((new Date() - new Date(order.created_at)) / 60000);
                                    const isDelayed = timeInKitchen >= 20;
                                    
                                    return (
                                        <div key={order.id} className={`rounded-xl border ${isDelayed ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'} overflow-hidden shadow-sm shrink-0`}>
                                            <div className={`px-4 py-3 border-b ${isDelayed ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'} flex justify-between items-center`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-black text-white text-xs font-black px-2 py-1 rounded">#{order.id}</span>
                                                    <span className="font-bold text-gray-700 text-sm">{order.order_type}</span>
                                                </div>
                                                <div className={`text-xs font-bold flex items-center gap-1 ${isDelayed ? 'text-red-600' : 'text-gray-500'}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {timeInKitchen} min ago
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <ul className="space-y-3">
                                                    {order.items?.map(item => (
                                                        <li key={item.id} className="flex justify-between items-start">
                                                            <div className="flex items-start gap-2">
                                                                <span className="font-black text-gray-900">{item.quantity}x</span>
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 text-sm">{item.menu_item?.name || 'Unknown Item'}</p>
                                                                    {item.notes && <p className="text-xs text-orange-600 font-medium mt-0.5">Note: {item.notes}</p>}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {order.special_instructions && (
                                                    <div className="mt-4 p-2 bg-amber-50 rounded border border-amber-100 text-xs font-medium text-amber-800">
                                                        <span className="font-bold uppercase block mb-1">Instructions:</span>
                                                        {order.special_instructions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Analytics */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-96 xl:h-[600px] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                        <h2 className="text-lg font-bold text-gray-900">Performance Analytics</h2>
                        <select 
                            value={days} 
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={14}>Last 14 Days</option>
                            <option value={30}>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                        {performanceLoading && !performanceData ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-pulse flex gap-2">
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                    <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Average Prep Time Trend */}
                                <div className="flex-1 min-h-[220px]">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Average Prep Time (Mins)</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                                                labelFormatter={formatTooltip}
                                            />
                                            <Line type="monotone" name="Avg Prep Time" dataKey="averagePrepTime" stroke="#6366f1" strokeWidth={3} dot={{r: 3, strokeWidth: 2}} activeDot={{r: 5}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Order Volume Trend */}
                                <div className="flex-1 min-h-[220px]">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Completed Orders Volume</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                                                labelFormatter={formatTooltip}
                                                cursor={{fill: '#f3f4f6'}}
                                            />
                                            <Bar name="Completed Orders" dataKey="completedOrders" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenOverview;
