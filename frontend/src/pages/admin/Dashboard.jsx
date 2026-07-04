import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { IndianRupee, ClipboardList, Users, LayoutDashboard, Receipt, TrendingUp, TrendingDown, Eye, UserPlus, PlusSquare, Utensils, FileText, LayoutGrid } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboardData'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics/dashboard?timeframe=all');
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
        }
    } = dashboardData || {};

    if (isLoading) {
        return <div className="text-gray-900 text-center py-20 font-bold">Loading ERP Dashboard...</div>;
    }

    const SectionHeader = ({ title, action }) => (
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 text-[15px]">{title}</h3>
            {action && <a href="#" className="text-xs font-bold text-blue-600 hover:underline">{action}</a>}
        </div>
    );

    return (
        <div className="space-y-4 pb-12 font-inter">
            {/* ROW 1: TOP 6 KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 1. Total Revenue */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#f3e8ff] rounded-lg">
                            <IndianRupee className="w-5 h-5 text-[#9333ea]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Revenue</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">₹ {kpis.total_revenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-green-600 mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> All Time
                    </div>
                </div>

                {/* 2. Total Orders */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#e0f2fe] rounded-lg">
                            <ClipboardList className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Orders</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">{kpis.total_orders}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-green-600 mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> All Time
                    </div>
                </div>

                {/* 3. Active Sessions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#dcfce7] rounded-lg">
                            <Users className="w-5 h-5 text-[#16a34a]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Active Sessions</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">{kpis.active_sessions}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-green-600 mt-2">
                        Live Now
                    </div>
                </div>

                {/* 4. Available Tables */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#ffedd5] rounded-lg">
                            <LayoutDashboard className="w-5 h-5 text-[#ea580c]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Available Tables</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">{kpis.available_tables} / {kpis.total_tables}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-medium text-gray-500 mt-2">
                        {kpis.total_tables ? Math.round((kpis.available_tables / kpis.total_tables) * 100) : 0}% Available
                    </div>
                </div>

                {/* 5. Average Bill Value */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#fee2e2] rounded-lg">
                            <Receipt className="w-5 h-5 text-[#dc2626]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Average Bill Value</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">₹ {kpis.average_bill_value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-green-600 mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> All Time
                    </div>
                </div>

                {/* 6. Total Customers */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-[#ccfbf1] rounded-lg">
                            <Users className="w-5 h-5 text-[#0d9488]" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Customers</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">{kpis.total_customers}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-green-600 mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> All Time
                    </div>
                </div>
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-[15px]">Revenue Overview (Last 7 Days)</h3>
                    </div>
                    <div className="flex-1 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(val) => `₹${val/1000}K`} />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'white'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
                    <SectionHeader title="Top Selling Items" action="View All" />
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

            {/* ROW 3: CATEGORIES, WAITERS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Top Categories */}
                <div className="lg:col-span-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Top Categories (By Revenue)" action="View All" />
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
                        <div className="grid grid-cols-2 gap-y-2 px-2">
                            {top_categories && top_categories.length > 0 ? top_categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-gray-600 pr-4">
                                    <div className="flex items-center"><div className="w-2 h-2 rounded-sm mr-2 flex-shrink-0" style={{backgroundColor: cat.color}}></div><span className="truncate">{cat.name}</span></div>
                                    <span className="flex-shrink-0 ml-2">₹ {cat.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                                </div>
                            )) : <div className="col-span-2 text-xs text-gray-500 text-center">No categories data.</div>}
                        </div>
                    </div>
                </div>

                {/* Top Waiters */}
                <div className="lg:col-span-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[340px] flex flex-col">
                    <SectionHeader title="Top Waiters (By Sales)" action="View All" />
                    <div className="space-y-4 mt-2">
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
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
            `}</style>
        </div>
    );
};

export default Dashboard;
