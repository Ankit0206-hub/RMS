import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, ClipboardList, TrendingUp, Clock, AlertCircle, ChefHat, CheckCircle2, UtensilsCrossed, ArrowUp, ArrowDown, Map, Receipt, FileText, ShoppingCart, UserPlus, LayoutGrid, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

const formatTime = (dateStr) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
};

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];

const OperatorDashboard = () => {
    const navigate = useNavigate();
    const [orderTab, setOrderTab] = useState('All');

    // --- DATA FETCHING ---
    const { data: operatorData } = useQuery({ queryKey: ['operator_me'], queryFn: async () => (await api.get('/operator/me')).data });
    const { data: tablesResponse } = useQuery({ queryKey: ['tables'], queryFn: async () => (await api.get('/admin/tables')).data });
    const { data: sessions } = useQuery({ queryKey: ['sessions'], queryFn: async () => (await api.get('/admin/ordering/sessions')).data.data });
    const { data: bills } = useQuery({ queryKey: ['bills'], queryFn: async () => (await api.get('/admin/billing/bills')).data.data });
    const { data: analyticsData } = useQuery({ queryKey: ['analytics_dashboard', 'today'], queryFn: async () => (await api.get('/admin/analytics/dashboard?timeframe=today')).data.data });

    const tables = tablesResponse?.data || [];

    // --- LIVE ORDERS ---
    const allOrders = useMemo(() => {
        if (!sessions || !tables) return [];
        let orders = [];
        sessions.filter(s => s.status === 'Active').forEach(session => {
            const table = tables.find(t => t.id === session.table_id);
            if (session.orders && session.orders.length > 0) {
                session.orders.forEach(order => {
                    if (['Pending', 'Confirmed', 'Cooked'].includes(order.status)) {
                        orders.push({
                            ...order,
                            table_number: table ? table.table_number : 'Unknown',
                            customer_name: session.customer_name || 'Walk-in',
                            session_id: session.id
                        });
                    }
                });
            }
        });
        return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [sessions, tables]);

    const activeTables = tables?.filter(t => t.status === 'Occupied' || t.status === 'Reserved').length || 0;
    
    const waitingOrdersCount = allOrders.filter(o => o.status === 'Pending').length;
    const preparingCount = allOrders.filter(o => o.status === 'Confirmed').length;
    const readyCount = allOrders.filter(o => o.status === 'Cooked').length;
    
    const pendingBills = bills?.filter(b => b.payment_status === 'Pending') || [];
    const pendingBillsAmount = pendingBills.reduce((acc, b) => acc + parseFloat(b.grand_total), 0);

    const revenueToday = analyticsData?.today_summary?.today_revenue || 0;
    const todayOrdersCount = analyticsData?.today_summary?.today_orders || 0;
    
    // Dynamic growth percentages
    const salesGrowth = analyticsData?.sales_summary?.growth || 0;
    const isGrowthPositive = salesGrowth >= 0;

    const displayedOrders = useMemo(() => {
        if (orderTab === 'All') return allOrders;
        if (orderTab === 'Waiting') return allOrders.filter(o => o.status === 'Pending');
        if (orderTab === 'Preparing') return allOrders.filter(o => o.status === 'Confirmed');
        if (orderTab === 'Ready') return allOrders.filter(o => o.status === 'Cooked');
        return allOrders;
    }, [allOrders, orderTab]);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            
            {/* Top Header Removed */}

            {/* TOP METRICS ROW (6 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* 1. Today's Orders */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50">
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg text-indigo-600 mr-3">
                            <ShoppingCart size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Today's Orders</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {todayOrdersCount}
                        </h4>
                        <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${isGrowthPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isGrowthPositive ? <ArrowUp size={10} className="mr-0.5" strokeWidth={3} /> : <ArrowDown size={10} className="mr-0.5" strokeWidth={3} />} 
                            {Math.abs(salesGrowth)}%
                        </div>
                    </div>
                </div>

                {/* 2. Active Tables */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50">
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg text-emerald-600 mr-3">
                            <LayoutGrid size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Active Tables</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {activeTables} <span className="text-base text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">/ {tables.length}</span>
                        </h4>
                        <div className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                            {tables.length > 0 ? Math.round((activeTables/tables.length)*100) : 0}% Occ
                        </div>
                    </div>
                </div>

                {/* 3. Waiting Orders */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50" onClick={() => navigate('/operator/orders')}>
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg text-orange-600 mr-3">
                            <Clock size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Waiting</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {waitingOrdersCount}
                        </h4>
                        <div className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded text-orange-600 bg-orange-50">
                            View <ArrowRight size={10} className="ml-1" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* 4. Preparing Orders */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50">
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg text-blue-600 mr-3">
                            <ChefHat size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Preparing</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {preparingCount}
                        </h4>
                        <div className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                            Kitchen
                        </div>
                    </div>
                </div>

                {/* 5. Ready to Serve */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50" onClick={() => navigate('/operator/orders')}>
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg text-purple-600 mr-3">
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Ready</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {readyCount}
                        </h4>
                        <div className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded text-purple-600 bg-purple-50">
                            Serve <ArrowRight size={10} className="ml-1" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* 6. Pending Bills */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden flex flex-col transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50">
                    <div className="flex items-center mb-3 relative z-10">
                        <div className="p-2 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg text-red-500 mr-3">
                            <Receipt size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Pending</p>
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {pendingBills.length}
                        </h4>
                        <div className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                            ₹{(pendingBillsAmount / 1000).toFixed(1)}k
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-inter">
                
                {/* LEFT COLUMN (Table Overview, Chart, Bills) */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* TABLE STATUS OVERVIEW */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Table Status Overview</h3>
                            <button onClick={() => navigate('/operator/tables')} className="text-[11px] font-bold text-cyan-600 hover:underline">Manage Tables</button>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mb-6 text-sm">
                            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>Available ({tables.filter(t=>t.status==='Available').length})</div>
                            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>Occupied ({tables.filter(t=>t.status==='Occupied').length})</div>
                            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span>Reserved ({tables.filter(t=>t.status==='Reserved').length})</div>
                            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>Cleaning ({tables.filter(t=>t.status==='Cleaning').length})</div>
                            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2"></span>Out of Service ({tables.filter(t=>t.status==='Out of Service').length})</div>
                        </div>

                        {/* Table Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {tables.filter(t => !t.parent_table_id).map(table => {
                                let colors = { border: 'border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50' };
                                if (table.status === 'Occupied') colors = { border: 'border-orange-300', text: 'text-orange-600', bg: 'bg-orange-50' };
                                if (table.status === 'Reserved') colors = { border: 'border-purple-300', text: 'text-purple-600', bg: 'bg-purple-50' };
                                if (table.status === 'Cleaning') colors = { border: 'border-blue-300', text: 'text-blue-600', bg: 'bg-blue-50' };
                                if (table.status === 'Out of Service') colors = { border: 'border-gray-300 dark:border-slate-600', text: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-800/50' };

                                return (
                                    <div key={table.id} className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${colors.border} ${colors.bg}`} title={table.is_virtual ? `Merged Tables: ${table.name}` : ''}>
                                        <div className={`mb-1 ${colors.text}`}>
                                            {table.status === 'Cleaning' ? <Clock size={20} /> : <Users size={20} />}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{table.table_number}</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400 mb-1">{table.capacity} Seats</span>
                                        <span className={`text-[10px] font-semibold uppercase ${colors.text}`}>{table.status}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* TWO COLUMNS: CHART & TOP ITEMS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* TODAY'S SALES SUMMARY CHART */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Today's Sales Summary</h3>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">₹ {revenueToday.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Total Revenue <span className={`ml-1 ${isGrowthPositive ? 'text-emerald-500' : 'text-red-500'}`}>{isGrowthPositive ? '↑' : '↓'} {Math.abs(salesGrowth)}% vs Last Week</span></p>
                                </div>
                                <select className="border border-gray-200 dark:border-slate-700 rounded-md text-sm px-2 py-1 bg-gray-50 dark:bg-slate-800/50 outline-none">
                                    <option>Today</option>
                                    <option>Yesterday</option>
                                </select>
                            </div>
                            <div className="h-56 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsData?.hourly_sales || []}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dx={-10} tickFormatter={(v) => `${v/1000}k`} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* TOP SELLING ITEMS */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Top Selling Items</h3>
                                <button className="text-[11px] font-bold text-cyan-600 hover:underline">View All</button>
                            </div>
                            <div className="space-y-4">
                                {(analyticsData?.top_selling_items || []).slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 overflow-hidden">
                                                <UtensilsCrossed size={20} />
                                            </div>
                                            <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{item.item_name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{item.total_quantity} Plates</span>
                                    </div>
                                ))}
                                {(!analyticsData?.top_selling_items || analyticsData.top_selling_items.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No items sold today yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RECENT BILLS */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Recent Bills</h3>
                            <button onClick={() => navigate('/operator/billing')} className="text-xs text-indigo-600 font-medium hover:underline">View All Bills →</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium border-b border-gray-100 dark:border-slate-800">
                                        <th className="pb-3 font-medium">Bill No.</th>
                                        <th className="pb-3 font-medium">Table</th>
                                        <th className="pb-3 font-medium">Amount (₹)</th>
                                        <th className="pb-3 font-medium">Payment</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(bills || [])
                                        .filter(bill => new Date(bill.generated_at).toDateString() === new Date().toDateString())
                                        .slice(0, 5)
                                        .map(bill => (
                                        <tr key={bill.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50">
                                            <td className="py-3 font-medium text-gray-900 dark:text-white">{bill.bill_number}</td>
                                            <td className="py-3 text-gray-600 dark:text-slate-400">
                                                {(() => {
                                                    const session = (sessions || []).find(s => s.id === bill.session_id);
                                                    const tableNumber = session ? tables.find(t => t.id === session.table_id)?.table_number : null;
                                                    return tableNumber || `S-${bill.session_id}`;
                                                })()}
                                            </td>
                                            <td className="py-3 text-gray-900 dark:text-white font-medium">{parseFloat(bill.grand_total).toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className="flex items-center text-gray-600 dark:text-slate-400 text-xs">
                                                    <span className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded mr-2 flex items-center justify-center text-[8px] font-bold">P</span> 
                                                    {bill.payments?.[0]?.payment_method || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                    bill.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                                                    'bg-orange-50 text-orange-500'
                                                }`}>
                                                    {bill.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-gray-500 dark:text-slate-400 text-xs">{formatTime(bill.generated_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (Live Queue, Waiter Perf, Payment Summary, Actions) */}
                <div className="xl:col-span-1 space-y-6">
                    
                    {/* LIVE ORDER QUEUE */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Live Order Queue</h3>
                            <button onClick={() => navigate('/operator/orders')} className="text-xs text-indigo-600 font-medium hover:underline">View All Orders →</button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4 overflow-x-auto hide-scrollbar">
                            {['All', 'Waiting', 'Preparing', 'Ready'].map(tab => {
                                const count = tab === 'All' ? allOrders.length : tab === 'Waiting' ? waitingOrdersCount : tab === 'Preparing' ? preparingCount : readyCount;
                                return (
                                    <button 
                                        key={tab} 
                                        onClick={() => setOrderTab(tab)}
                                        className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                                            orderTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {tab} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {displayedOrders.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-slate-500 dark:text-slate-400 text-center py-6">No orders in this queue.</p>
                            ) : displayedOrders.map(order => {
                                let statusColor = 'bg-emerald-500';
                                if (order.status === 'Pending') statusColor = 'bg-orange-500';
                                if (order.status === 'Confirmed') statusColor = 'bg-blue-500';

                                return (
                                    <div key={order.id} className="flex justify-between items-start border-b border-gray-50 dark:border-slate-800/50 pb-3 last:border-0">
                                        <div className="flex gap-3">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${statusColor}`}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">ORD{order.id}</span>
                                                    {order.status === 'Pending' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 rounded uppercase">New</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Table {order.table_number} • By {order.waiter_id ? 'Waiter' : 'QR Order'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{formatTime(order.created_at)}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-0.5">{order.items?.length || 0} Items</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <button onClick={() => navigate('/operator/orders')} className="w-full mt-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                            View All Orders
                        </button>
                    </div>

                    {/* WAITER PERFORMANCE */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Waiter Performance (Today)</h3>
                            <button className="text-xs text-indigo-600 font-medium hover:underline">View All →</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="text-gray-400 dark:text-slate-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800">
                                        <th className="pb-2 font-medium">Waiter</th>
                                        <th className="pb-2 font-medium text-center">Orders</th>
                                        <th className="pb-2 font-medium text-right">Sales (₹)</th>
                                        <th className="pb-2 font-medium text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(analyticsData?.top_waiters || []).slice(0, 5).map((waiter, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                                            <td className="py-2 flex items-center gap-2">
                                                <img src={waiter.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 object-cover" />
                                                <span className="font-semibold text-gray-800 dark:text-slate-200">{waiter.name}</span>
                                            </td>
                                            <td className="py-2 text-center text-gray-600 dark:text-slate-400 font-medium">{(waiter.sales/1000).toFixed(0)}</td>
                                            <td className="py-2 text-right text-gray-900 dark:text-white">{waiter.sales.toLocaleString()}</td>
                                            <td className="py-2 text-right flex items-center justify-end text-gray-800 dark:text-slate-200 font-medium">
                                                <Star size={12} className="text-orange-400 mr-1 fill-orange-400" /> 
                                                {(4.8 - (idx * 0.1)).toFixed(1)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!analyticsData?.top_waiters || analyticsData.top_waiters.length === 0) && (
                                        <tr><td colSpan="4" className="text-center py-4 text-gray-500 dark:text-slate-400">No waiter data for today.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAYMENT SUMMARY */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
                        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Payment Summary (Today)</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="w-32 h-32 relative shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData?.sales_by_payment_method || [{name: 'Cash', amount: 1}]}
                                            cx="50%" cy="50%" innerRadius={35} outerRadius={50}
                                            dataKey="amount" paddingAngle={2} stroke="none"
                                        >
                                            {(analyticsData?.sales_by_payment_method || [{name: 'Cash', amount: 1}]).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">Total</span>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">₹ {(revenueToday/1000).toFixed(1)}k</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {(analyticsData?.sales_by_payment_method || []).map((method, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                                            <span className="w-2 h-2 rounded-sm mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                            {method.name}
                                        </div>
                                        <div className="text-gray-900 dark:text-white font-medium whitespace-nowrap ml-2">
                                            ₹ {method.amount.toLocaleString()} <span className="text-gray-400 dark:text-slate-500 dark:text-slate-400 font-normal ml-1">({method.percent})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
