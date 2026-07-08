import React from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Filter, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AnalyticsSales = () => {
    const { data: salesData, isLoading } = useQuery({
        queryKey: ['analytics_sales'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/sales');
            return res.data.data;
        }
    });

    const formatYAxis = (tickItem) => `₹ ${tickItem / 1000}K`;

    if (isLoading || !salesData) {
        return <div className="p-10 text-center font-bold text-gray-500">Loading Sales Analytics...</div>;
    }

    const { kpis, weekly_trends: weeklyTrends, monthly_sales: monthlySales } = salesData;

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mr-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Revenue (MTD)</p>
                        <p className="text-xl font-black text-gray-900">₹ {kpis.total_revenue_mtd.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Avg Daily Sales</p>
                        <p className="text-xl font-black text-gray-900">₹ {kpis.avg_daily_sales.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-4">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Projected (EOM)</p>
                        <p className="text-xl font-black text-gray-900">₹ {(kpis.projected_eom / 100000).toFixed(1)}L</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mr-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Highest Sales Day</p>
                        <p className="text-sm font-black text-gray-900">{kpis.highest_sales_day || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-sm">Weekly Sales Trend</h3>
                        <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">Compare</button>
                    </div>
                    <div className="h-72 w-full text-xs font-semibold">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} tickFormatter={formatYAxis} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Type (Monthly) */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 text-sm">Revenue by Type (6 Months)</h3>
                        <div className="flex space-x-2">
                            <span className="flex items-center text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded bg-[#3b82f6] mr-1"></div> Dine In</span>
                            <span className="flex items-center text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded bg-[#10b981] mr-1"></div> Takeaway</span>
                            <span className="flex items-center text-[10px] font-bold text-gray-500"><div className="w-2 h-2 rounded bg-[#f59e0b] mr-1"></div> Delivery</span>
                        </div>
                    </div>
                    <div className="h-72 w-full text-xs font-semibold">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} tickFormatter={formatYAxis} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="dineIn" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="takeaway" stackId="a" fill="#10b981" />
                                <Bar dataKey="delivery" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions / Download */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm mb-1">Generate Sales Tax Report</h3>
                    <p className="text-[10px] text-indigo-700 font-medium max-w-md">Download detailed GST and tax reports for accounting purposes. Available in CSV and PDF formats.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button className="flex items-center text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </button>
                    <button className="flex items-center text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm">
                        Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSales;
