import React from 'react';
import { Utensils, TrendingUp, TrendingDown, Coffee, Filter, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AnalyticsFood = () => {
    const { data: foodData, isLoading } = useQuery({
        queryKey: ['analytics_food'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/food');
            return res.data.data;
        }
    });

    if (isLoading || !foodData) {
        return <div className="p-10 text-center font-bold text-gray-500">Loading Food Analytics...</div>;
    }

    const { kpis, categories, top_items: topItems, slow_items: slowItems } = foodData;

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mr-4">
                        <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Menu Items</p>
                        <p className="text-xl font-black text-gray-900">{kpis.total_menu_items}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mr-4">
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Categories</p>
                        <p className="text-xl font-black text-gray-900">{kpis.total_categories}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Top Category</p>
                        <p className="text-sm font-black text-gray-900">{kpis.top_category}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mr-4">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Least Selling</p>
                        <p className="text-sm font-black text-gray-900">{kpis.least_selling}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 w-full text-left">Sales by Category</h3>
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categories} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-y-2 mt-4 px-2">
                        {categories.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center text-gray-600">
                                    <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: item.color}}></div>
                                    {item.name}
                                </div>
                                <div className="text-gray-900">{item.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Items Table */}
                <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="p-5 flex justify-between items-center border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-sm">Top Selling Items</h3>
                        <div className="flex space-x-2">
                            <button className="flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-white transition-colors">
                                <Filter className="w-3 h-3 mr-1" /> Filter
                            </button>
                            <button className="flex items-center text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded hover:bg-white transition-colors">
                                <Download className="w-3 h-3 mr-1" /> Export
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                    <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty Sold</th>
                                    <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Revenue (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-5 text-xs font-bold text-gray-900">{item.name}</td>
                                        <td className="py-3 px-5 text-xs font-semibold text-gray-600">
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[9px]">{item.category}</span>
                                        </td>
                                        <td className="py-3 px-5 text-center text-xs font-bold text-gray-800">{item.sold}</td>
                                        <td className="py-3 px-5 text-right text-xs font-bold text-gray-900">{item.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Slow Moving Items */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Slow Moving / Underperforming Items</h3>
                    <button className="text-[10px] font-bold text-indigo-600 hover:underline">Suggest Actions</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty Sold</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Revenue (₹)</th>
                                <th className="py-3 px-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Action Idea</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slowItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3 px-5 text-xs font-bold text-gray-900">{item.name}</td>
                                    <td className="py-3 px-5 text-xs font-semibold text-gray-600">{item.category}</td>
                                    <td className="py-3 px-5 text-center text-xs font-bold text-gray-800">{item.sold}</td>
                                    <td className="py-3 px-5 text-right text-xs font-bold text-red-600">{item.revenue.toLocaleString()}</td>
                                    <td className="py-3 px-5 text-center">
                                        <button className="bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded text-[9px] font-bold hover:bg-orange-100">Add to Combo</button>
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

export default AnalyticsFood;
