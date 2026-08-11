import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { IndianRupee, ClipboardList, Users, LayoutDashboard, Receipt, TrendingUp, TrendingDown, Eye, UserPlus, PlusSquare, Utensils, FileText, LayoutGrid, Star, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [timeframe, setTimeframe] = useState('weekly');

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboardData', timeframe],
        queryFn: async () => {
            const res = await api.get(`/admin/analytics/dashboard?timeframe=${timeframe}`);
            return res.data.data;
        }
    });

    const { 
        kpis = {
            total_revenue: 0,
            total_orders: 0,
            active_sessions: 0,
            available_tables: 0,
            total_tables: 0,
            average_bill_value: 0,
            total_customers: 0
        }, 
        revenue_chart = [], 
        top_selling_items = [],
        top_categories = [],
        top_waiters = [],
        today_summary = {
            today_revenue: 0,
            today_orders: 0,
            today_bills: 0,
            today_discounts: 0,
            today_payments: 0
        },
        recent_reviews = [],
        recent_orders = []
    } = dashboardData || {};

    if (isLoading) {
        return <div className="text-gray-900 text-center py-20 font-bold">Loading ERP Dashboard...</div>;
    }

    const SectionHeader = ({ title, action, linkTo }) => (
        <div className="flex justify-between items-center mb-4 space-x-2">
            <h3 className="font-bold text-gray-900 text-[13px] xl:text-[14px] truncate">{title}</h3>
            {action && (
                <button 
                    onClick={(e) => { e.preventDefault(); if (linkTo) navigate(linkTo); }} 
                    className="text-[10px] xl:text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer shadow-sm border border-indigo-100 hover:border-indigo-600"
                >
                    {action}
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-4 pb-12 font-inter">
            {/* ROW 1: TOP 6 KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 xl:gap-4">
                {/* 1. Total Revenue */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#f3e8ff] rounded-xl text-[#9333ea]">
                            <IndianRupee className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-1 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" /> All Time
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Total Revenue</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">₹ {kpis.total_revenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* 2. Total Orders */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#e0f2fe] rounded-xl text-[#0ea5e9]">
                            <ClipboardList className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-1 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" /> All Time
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Total Orders</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">{kpis.total_orders}</p>
                    </div>
                </div>

                {/* 3. Active Sessions */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#dcfce7] rounded-xl text-[#16a34a]">
                            <Users className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-1 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" /> Live Now
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Active Sessions</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">{kpis.active_sessions}</p>
                    </div>
                </div>

                {/* 4. Available Tables */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#ffedd5] rounded-xl text-[#ea580c]">
                            <LayoutDashboard className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-1 rounded-md">
                            {kpis.total_tables ? Math.round((kpis.available_tables / kpis.total_tables) * 100) : 0}% Avail
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Available Tables</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">{kpis.available_tables} <span className="text-sm text-gray-500 font-medium">/ {kpis.total_tables}</span></p>
                    </div>
                </div>

                {/* 5. Average Bill Value */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#fee2e2] rounded-xl text-[#dc2626]">
                            <Receipt className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-1 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" /> All Time
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Avg Bill Value</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">₹ {kpis.average_bill_value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                    </div>
                </div>

                {/* 6. Total Customers */}
                <div className="bg-white p-3 xl:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 xl:p-2.5 bg-[#ccfbf1] rounded-xl text-[#0d9488]">
                            <Users className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <div className="flex items-center text-[9px] xl:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-1 rounded-md">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" /> All Time cust
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 truncate">Total Customers</p>
                        <p className="text-lg xl:text-xl font-extrabold text-gray-900 truncate">{kpis.total_customers}</p>
                    </div>
                </div>
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[320px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none transition-all duration-700 group-hover:bg-indigo-100 group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-6 z-10">
                        <div>
                            <h3 className="font-extrabold text-gray-900 text-[16px] tracking-tight">Revenue Overview</h3>
                            <p className="text-[12px] text-gray-500 font-medium mt-0.5 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                                {timeframe === 'monthly' ? 'Last 30 Days Performance' : 'Last 7 Days Performance'}
                            </p>
                        </div>
                        <div className="flex items-center p-1 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
                            <button 
                                onClick={() => setTimeframe('weekly')}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-300 ${timeframe === 'weekly' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >Weekly</button>
                            <button 
                                onClick={() => setTimeframe('monthly')}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-300 ${timeframe === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >Monthly</button>
                        </div>
                    </div>
                    <div className="flex-1 -ml-4 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue_chart} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                                    dy={12} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                                    tickFormatter={(val) => `₹${val/1000}K`} 
                                    dx={-12} 
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(226, 232, 240, 0.8)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        padding: '12px 16px'
                                    }}
                                    labelStyle={{ fontWeight: '800', color: '#334155', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: '800', fontSize: '15px' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#4f46e5" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    activeDot={{ r: 7, strokeWidth: 3, fill: '#ffffff', stroke: '#4f46e5', style: { filter: 'url(#glow)' } }} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#4f46e5', strokeOpacity: 0.5 }}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
                    <SectionHeader title="Top Selling Items" action="View All" linkTo="/admin/menu" />
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {top_selling_items && top_selling_items.length > 0 ? top_selling_items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center">
                                    <span className="text-[10px] font-bold text-gray-400 w-3 mr-1">{idx+1}</span>
                                    <span className="text-[11px] font-semibold text-gray-800">{item.item_name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-bold text-gray-500">{item.total_quantity}x</span>
                                    <span className="text-[11px] font-bold text-gray-900 w-16 text-right">₹ {item.total_revenue.toLocaleString()}</span>
                                </div>
                            </div>
                        )) : <div className="text-xs text-gray-500 py-4 text-center">No top selling items yet.</div>}
                    </div>
                </div>
            </div>

            {/* ROW 3: CATEGORIES, WAITERS, REVIEWS, ORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Top Categories */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Top Categories (By Revenue)" action="View All" linkTo="/admin/menu" />
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="h-40 relative mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={top_categories && top_categories.length > 0 ? top_categories : [{name: 'No data', value: 1, color: '#e5e7eb'}]} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                                        {(top_categories && top_categories.length > 0 ? top_categories : [{name: 'No data', value: 1, color: '#e5e7eb'}]).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col space-y-2 px-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: '100px' }}>
                            {top_categories && top_categories.length > 0 ? top_categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
                                    <div className="flex items-center overflow-hidden mr-2">
                                        <div className="w-2 h-2 rounded-sm mr-2 flex-shrink-0" style={{backgroundColor: cat.color}}></div>
                                        <span className="truncate" title={cat.name}>{cat.name}</span>
                                    </div>
                                    <span className="flex-shrink-0 font-bold text-gray-800">₹ {cat.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                                </div>
                            )) : <div className="text-xs text-gray-500 text-center">No categories data.</div>}
                        </div>
                    </div>
                </div>

                {/* Top Waiters */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Top Waiters (By Sales)" action="View All" linkTo="/admin/employees" />
                    <div className="space-y-4 mt-2 overflow-y-auto custom-scrollbar">
                        {top_waiters && top_waiters.length > 0 ? top_waiters.map((waiter, idx) => (
                            <div key={waiter.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-[10px] font-bold text-gray-400 w-4 bg-gray-50 rounded-full h-4 flex items-center justify-center mr-2">{idx+1}</span>
                                    <img src={waiter.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 mr-2" />
                                    <span className="text-xs font-semibold text-gray-800">{waiter.name}</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-900">₹ {waiter.sales.toLocaleString()}</span>
                            </div>
                        )) : <div className="text-xs text-gray-500 py-4 text-center">No waiters data yet.</div>}
                    </div>
                </div>

                {/* Rating & Review */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Rating & Review" action="View All" linkTo="/admin/customers" />
                    <div className="space-y-4 mt-2 overflow-y-auto custom-scrollbar">
                        {recent_reviews && recent_reviews.length > 0 ? recent_reviews.map((review, idx) => (
                            <div key={idx} className="flex flex-col border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold text-gray-800">{review.customer_name || 'Customer'}</span>
                                    <div className="flex items-center">
                                        <Star className="w-3 h-3 text-orange-400 fill-current mr-1" />
                                        <span className="text-[10px] font-bold text-gray-600">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 line-clamp-2">{review.comment}</p>
                            </div>
                        )) : <div className="text-xs text-gray-500 py-4 text-center">No reviews yet.</div>}
                    </div>
                </div>

                {/* Order History */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Order History" action="View All" linkTo="/admin/orders" />
                    <div className="space-y-3 mt-2 overflow-y-auto custom-scrollbar">
                        {recent_orders && recent_orders.length > 0 ? recent_orders.map((order, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <div className="text-[11px] font-bold text-gray-800 mb-0.5">{order.order_id || `#ORD-${1000 + idx}`}</div>
                                    <div className="flex items-center text-[9px] text-gray-500">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {order.time || 'Recent'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-bold text-gray-900">₹ {(order.amount || 0).toLocaleString()}</div>
                                    <div className={`text-[9px] font-bold mt-0.5 ${order.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.status || 'Completed'}
                                    </div>
                                </div>
                            </div>
                        )) : <div className="text-xs text-gray-500 py-4 text-center">No recent orders.</div>}
                    </div>
                </div>
            </div>

            {/* ROW 4: BOTTOM SUMMARY, QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Today's Summary */}
                <div className="lg:col-span-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[200px]">
                    <h3 className="font-bold text-gray-900 text-[15px] mb-4">Today's Summary</h3>
                    <div className="grid grid-cols-5 gap-3 h-full">
                        <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                            <div className="text-[10px] font-semibold text-gray-500 text-center"><div className="w-6 h-6 mx-auto bg-purple-100 text-purple-600 rounded flex items-center justify-center mb-1.5"><IndianRupee className="w-3.5 h-3.5"/></div>Today's Revenue</div>
                            <div className="text-center mt-1"><div className="text-sm font-bold text-gray-900">₹ {today_summary.today_revenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div></div>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                            <div className="text-[10px] font-semibold text-gray-500 text-center"><div className="w-6 h-6 mx-auto bg-blue-100 text-blue-600 rounded flex items-center justify-center mb-1.5"><ClipboardList className="w-3.5 h-3.5"/></div>Today's Orders</div>
                            <div className="text-center mt-1"><div className="text-sm font-bold text-gray-900">{today_summary.today_orders}</div></div>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                            <div className="text-[10px] font-semibold text-gray-500 text-center"><div className="w-6 h-6 mx-auto bg-green-100 text-green-600 rounded flex items-center justify-center mb-1.5"><Receipt className="w-3.5 h-3.5"/></div>Today's Bills</div>
                            <div className="text-center mt-1"><div className="text-sm font-bold text-gray-900">{today_summary.today_bills}</div></div>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                            <div className="text-[10px] font-semibold text-gray-500 text-center"><div className="w-6 h-6 mx-auto bg-orange-100 text-orange-600 rounded flex items-center justify-center mb-1.5"><TrendingDown className="w-3.5 h-3.5"/></div>Today's Discounts</div>
                            <div className="text-center mt-1"><div className="text-sm font-bold text-gray-900">₹ {today_summary.today_discounts.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div></div>
                        </div>
                        <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-col justify-between border border-gray-100">
                            <div className="text-[10px] font-semibold text-gray-500 text-center"><div className="w-6 h-6 mx-auto bg-red-100 text-red-600 rounded flex items-center justify-center mb-1.5"><IndianRupee className="w-3.5 h-3.5"/></div>Today's Payments</div>
                            <div className="text-center mt-1"><div className="text-sm font-bold text-gray-900">₹ {today_summary.today_payments.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div></div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[200px] flex flex-col">
                    <h3 className="font-bold text-gray-900 text-[15px] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-3 h-full">
                        <button onClick={() => navigate('/admin/employees')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1"><UserPlus className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">Add Employee</span>
                        </button>
                        <button onClick={() => navigate('/admin/tables/add')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1"><PlusSquare className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">Add Table</span>
                        </button>
                        <button onClick={() => navigate('/admin/menu/add')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1"><Utensils className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">Add Menu Item</span>
                        </button>
                        <button onClick={() => navigate('/admin/orders')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1"><ClipboardList className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">Create Order</span>
                        </button>
                        <button onClick={() => navigate('/admin/analytics')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1"><FileText className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">Generate Report</span>
                        </button>
                        <button onClick={() => navigate('/admin/tables')} className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-1"><LayoutGrid className="w-4 h-4" /></div>
                            <span className="text-[9px] font-semibold text-gray-600">View Floor Plan</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; display: none; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Dashboard;
