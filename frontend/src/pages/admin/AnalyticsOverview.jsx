import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Filter, Download, FileText, CheckSquare, Clock, AlertCircle, RotateCcw,
    Users, UserCheck, Utensils, Receipt, TrendingUp, BarChart2, Star
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import AnalyticsPerformance from './AnalyticsPerformance';
import AnalyticsFood from './AnalyticsFood';
import AnalyticsSales from './AnalyticsSales';
import AnalyticsCustomer from './AnalyticsCustomer';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AnalyticsOverview = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Waiter / Operator Performance', 'Menu / Food Analytics', 'Sales Analytics', 'Customer Analytics'];

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['analytics_dashboard', 'today'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/dashboard?timeframe=today');
            return res.data.data;
        }
    });

    const formatYAxis = (tickItem) => {
        if (tickItem === 0) return '₹ 0';
        if (tickItem >= 1000) return `₹ ${tickItem / 1000}K`;
        return `₹ ${tickItem}`;
    };

    if (isLoading || !dashboardData) {
        return <div className="p-10 text-center font-bold text-gray-500">Loading Analytics...</div>;
    }

    const {
        kpis,
        revenue_chart: salesOverviewData,
        sales_by_order_type: orderTypeData,
        sales_by_payment_method: paymentMethodData,
        top_waiters: waiters,
        top_categories: categories,
        top_selling_items: foodItems,
        hourly_sales: hourlySalesData,
        sales_summary: salesSummary
    } = dashboardData;

    let peakHour = { name: 'N/A', sales: 0 };
    if (hourlySalesData && hourlySalesData.length > 0) {
        peakHour = hourlySalesData.reduce((max, current) => (current.sales > max.sales) ? current : max, hourlySalesData[0]);
    }

    return (
        <div className="space-y-6 pb-10 font-inter">
            
            {/* Top Navigation & Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                    {tabs.map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[#5e5ce6]' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#5e5ce6] rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'Overview' && (
                <>
                    {/* KPI Cards Row (6 cols) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[
                            { label: 'Total Sales', value: `₹ ${kpis.total_revenue.toLocaleString()}`, trend: 'Active', icon: <FileText className="w-5 h-5"/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Total Orders', value: kpis.total_orders, trend: 'Active', icon: <CheckSquare className="w-5 h-5"/>, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Average Order Value', value: `₹ ${kpis.average_bill_value.toFixed(2)}`, trend: 'Active', icon: <Receipt className="w-5 h-5"/>, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { label: 'Total Customers', value: kpis.total_customers, trend: 'Active', icon: <Users className="w-5 h-5"/>, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Completed Bills', value: kpis.completed_bills, trend: 'Active', icon: <Utensils className="w-5 h-5"/>, color: 'text-orange-400', bg: 'bg-orange-50' },
                            { label: 'Available Tables', value: `${kpis.available_tables} / ${kpis.total_tables}`, trend: 'Active', icon: <TrendingUp className="w-5 h-5"/>, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                        ].map((kpi, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shrink-0`}>
                                        {kpi.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 mb-0.5 leading-tight">{kpi.label}</p>
                                        <p className="text-lg font-black text-gray-900 leading-none">{kpi.value}</p>
                                    </div>
                                </div>
                                <div className="text-[9px] font-bold text-green-500 mt-1 pl-1 tracking-tight">
                                    {kpi.trend} 
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Sales Overview Area Chart */}
                        <div className="lg:col-span-7 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 text-sm">Sales Overview</h3>
                                <select className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg px-2 py-1 outline-none">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                </select>
                            </div>
                            <div className="h-64 w-full text-xs font-semibold">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} tickFormatter={formatYAxis} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>



                        {/* Sales by Payment Method Bar Chart */}
                        <div className="lg:col-span-5 bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col">
                            <h3 className="font-bold text-gray-900 text-sm mb-4">Sales by Payment Method</h3>
                            <div className="flex-1 flex flex-col justify-center space-y-5">
                                {paymentMethodData.map((item, idx) => {
                                    const max = paymentMethodData.length > 0 ? paymentMethodData[0].amount : 1;
                                    const width = ((item.amount || 0) / max) * 100;
                                    return (
                                        <div key={idx} className="relative">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1.5">
                                                <span>{item.name}</span>
                                                <span className="text-gray-900">₹ {(item.amount || 0).toLocaleString()} ({item.percent || '0%'})</span>
                                            </div>
                                            <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${width}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-4 pt-2 border-t border-gray-50">
                                <span>0</span>
                                <span>20K</span>
                                <span>40K</span>
                                <span>60K</span>
                                <span>80K</span>
                            </div>
                        </div>
                    </div>

                    {/* Tables Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Top Performing Waiters */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                            <div className="p-5 font-bold text-gray-900 text-sm">Top Performing Waiters / Operators</div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-y border-gray-100">
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase">Waiter / Operator</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-center">Orders</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Sales (₹)</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Avg. Order Value (₹)</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waiters.map((w, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <img src={w.avatar} alt={w.name} className="w-6 h-6 rounded-full" />
                                                        <span className="text-[10px] font-bold text-gray-900">{w.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 text-center text-[10px] font-bold text-gray-600">{w.orders || 0}</td>
                                                <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{(w.sales || 0).toLocaleString()}</td>
                                                <td className="py-2 px-4 text-right text-[10px] font-semibold text-gray-600">{((w.sales || 0)/(w.orders || 1)).toFixed(2)}</td>
                                                <td className="py-2 px-4 text-right">
                                                    <div className="flex items-center justify-end text-[10px] font-bold text-gray-900">
                                                        <Star className="w-3 h-3 text-orange-400 fill-current mr-1" />
                                                        {w.rating || '4.5'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-center">
                                <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded hover:bg-indigo-50">View All Operators</button>
                            </div>
                        </div>

                        {/* Top Categories */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                            <div className="p-5 font-bold text-gray-900 text-sm">Top Categories (By Sales)</div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-y border-gray-100">
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase">Category</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Sales (₹)</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-center">Items Sold</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">% of Sales</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((c, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-xs">{c.img || '🍽️'}</div>
                                                        <span className="text-[10px] font-bold text-gray-900">{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{(c.value || 0).toLocaleString()}</td>
                                                <td className="py-2 px-4 text-center text-[10px] font-semibold text-gray-600">{c.items || 0}</td>
                                                <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-600">{c.percent || '0%'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-center">
                                <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded hover:bg-indigo-50">View All Categories</button>
                            </div>
                        </div>

                        {/* Top Food Items */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                            <div className="p-5 font-bold text-gray-900 text-sm">Top Food Items (By Sales)</div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-y border-gray-100">
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase">Item</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase">Category</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-center">Quantity Sold</th>
                                            <th className="py-2.5 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Sales (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foodItems.map((f, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <img src={f.img || `https://ui-avatars.com/api/?name=${f.item_name || 'Item'}&background=random`} alt={f.item_name} className="w-6 h-6 rounded object-cover" />
                                                        <span className="text-[10px] font-bold text-gray-900 truncate w-24 block" title={f.item_name}>{f.item_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 text-[10px] font-semibold text-gray-600">{f.category || 'Unknown'}</td>
                                                <td className="py-2 px-4 text-center text-[10px] font-bold text-gray-600">{f.total_quantity || 0}</td>
                                                <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{(f.total_revenue || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-center">
                                <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-4 py-1.5 rounded hover:bg-indigo-50">View All Items</button>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Sales by Hour */}
                        <div className="lg:col-span-8 bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-sm">Sales by Hour</h3>
                                <select className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg px-2 py-1 outline-none">
                                    <option>By Sales</option>
                                    <option>By Orders</option>
                                </select>
                            </div>
                            <div className="flex-1 h-32 w-full text-[9px] font-semibold">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlySalesData} margin={{ top: 0, right: 0, left: -25, bottom: -10 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 9}} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 9}} tickFormatter={formatYAxis} />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                                        <Bar dataKey="sales" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Peak Hours */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex-1">
                                <h3 className="font-bold text-gray-900 text-sm mb-4">Peak Hours</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 mb-0.5 leading-tight">Busiest Time of the Day</p>
                                        <p className="text-[15px] font-black text-gray-900 leading-none">{peakHour.name}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-50">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales</p>
                                    <p className="text-sm font-black text-gray-900">₹ {peakHour.sales.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        


                    </div>
                </>
            )}

            {activeTab === 'Waiter / Operator Performance' && <AnalyticsPerformance />}
            {activeTab === 'Menu / Food Analytics' && <AnalyticsFood />}
            {activeTab === 'Sales Analytics' && <AnalyticsSales />}
            {activeTab === 'Customer Analytics' && <AnalyticsCustomer />}
        </div>
    );
};

export default AnalyticsOverview;
