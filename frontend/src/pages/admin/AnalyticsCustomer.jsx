import React from 'react';
import { Users, UserPlus, Heart, MapPin, Filter, Download } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AnalyticsCustomer = () => {
    const { data: customerData, isLoading } = useQuery({
        queryKey: ['analytics_customers'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/customers');
            return res.data.data;
        }
    });

    if (isLoading || !customerData) {
        return <div className="p-10 text-center font-bold text-gray-500">Loading Customer Analytics...</div>;
    }

    const { kpis, customer_growth: customerGrowth, top_customers: topCustomers } = customerData;

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mr-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Customers</p>
                        <p className="text-xl font-black text-gray-900">{kpis.total_customers.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mr-4">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">New (This Month)</p>
                        <p className="text-xl font-black text-gray-900">{kpis.new_this_month}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 mr-4">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Retention Rate</p>
                        <p className="text-xl font-black text-gray-900">{kpis.retention_rate}%</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mr-4">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Top Location</p>
                        <p className="text-sm font-black text-gray-900">{kpis.top_location}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Acquisition Chart */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-sm">Customer Growth (New vs Returning)</h3>
                        <div className="flex space-x-2">
                            <span className="flex items-center text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded bg-indigo-500 mr-1"></div> Returning</span>
                            <span className="flex items-center text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded bg-pink-400 mr-1"></div> New</span>
                        </div>
                    </div>
                    <div className="h-72 w-full text-xs font-semibold">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={customerGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="returning" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReturning)" />
                                <Area type="monotone" dataKey="new" stroke="#f472b6" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Customers Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Top VIP Customers</h3>
                    <div className="flex space-x-2">
                        <button className="flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-white transition-colors">
                            <Filter className="w-3 h-3 mr-1" /> Filter
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Total Visits</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total Spent (₹)</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Loyalty Tier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.map((c, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {c.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-xs font-semibold text-gray-600">{c.phone}</td>
                                    <td className="py-3 px-5 text-center text-xs font-bold text-gray-800">{c.visits}</td>
                                    <td className="py-3 px-5 text-right text-xs font-bold text-gray-900">{c.spent.toLocaleString()}</td>
                                    <td className="py-3 px-5 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                            c.loyalty === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                                            c.loyalty === 'Silver' ? 'bg-gray-200 text-gray-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {c.loyalty}
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

export default AnalyticsCustomer;
