import React from 'react';
import { Users, Star, TrendingUp, Award, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AnalyticsPerformance = () => {
    const { data: performanceDataResponse, isLoading } = useQuery({
        queryKey: ['analytics_performance'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/performance');
            return res.data.data;
        }
    });

    const formatYAxis = (tickItem) => `₹ ${tickItem / 1000}K`;

    if (isLoading || !performanceDataResponse) {
        return <div className="p-10 text-center font-bold text-gray-500">Loading Performance Analytics...</div>;
    }

    const { kpis, staff_data: waiters, role_distribution: roleDistribution } = performanceDataResponse;
    const performanceData = waiters.map(w => ({ name: w.name, sales: w.sales })).slice(0, 5);

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mr-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Staff</p>
                        <p className="text-xl font-black text-gray-900">{kpis.total_staff_active} Active</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mr-4">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Avg Rating</p>
                        <p className="text-xl font-black text-gray-900">{kpis.avg_rating.toFixed(1)} / 5.0</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Avg Orders/Staff</p>
                        <p className="text-xl font-black text-gray-900">{kpis.avg_orders_per_staff}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mr-4">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Top Performer</p>
                        <p className="text-sm font-black text-gray-900">{kpis.top_performer}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-sm">Top 5 by Sales Revenue</h3>
                        <select className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg px-2 py-1 outline-none">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-72 w-full text-xs font-semibold">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} tickFormatter={formatYAxis} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operator Breakdown */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Role Distribution</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                    <span>Waiters</span>
                                    <span>{roleDistribution.waiters_active} Active</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${roleDistribution.waiters_pct}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                    <span>Operators</span>
                                    <span>{roleDistribution.operators_active} Active</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${roleDistribution.operators_pct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-900 mb-1">Performance Tip</h4>
                        <p className="text-[10px] text-indigo-700 font-medium">Suresh has increased his average order value by 12% this week by suggesting add-ons.</p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Detailed Performance Log</h3>
                    <div className="flex space-x-2">
                        <button className="flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-white transition-colors">
                            <Filter className="w-3 h-3 mr-1" /> Filter
                        </button>
                        <button className="flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-white transition-colors">
                            <Download className="w-3 h-3 mr-1" /> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Staff Name</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Orders Handled</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total Revenue (₹)</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Avg Order Value (₹)</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Rating</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waiters.map((w, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {w.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">{w.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-xs font-semibold text-gray-600">{w.role}</td>
                                    <td className="py-3 px-5 text-center text-xs font-bold text-gray-800">{w.orders}</td>
                                    <td className="py-3 px-5 text-right text-xs font-bold text-gray-900">{w.sales.toLocaleString()}</td>
                                    <td className="py-3 px-5 text-right text-xs font-semibold text-gray-600">{w.avg.toFixed(2)}</td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center justify-center text-xs font-bold text-gray-900">
                                            <Star className="w-3.5 h-3.5 text-orange-400 fill-current mr-1" />
                                            {w.rating}
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                            w.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {w.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPerformance;
