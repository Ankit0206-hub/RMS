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

const AnalyticsOverview = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Waiter / Operator Performance', 'Menu / Food Analytics', 'Sales Analytics', 'Customer Analytics'];

    // --- Mock Data ---

    const salesOverviewData = [
        { name: 'May 14', sales: 18000 },
        { name: 'May 15', sales: 22000 },
        { name: 'May 16', sales: 17000 },
        { name: 'May 17', sales: 30000 },
        { name: 'May 18', sales: 24000 },
        { name: 'May 19', sales: 35000 },
        { name: 'May 20', sales: 42000 },
    ];

    const orderTypeData = [
        { name: 'Dine In', value: 49.2, color: '#3b82f6' },
        { name: 'Take Away', value: 28.7, color: '#22c55e' },
        { name: 'Delivery', value: 18.6, color: '#f97316' },
        { name: 'Others', value: 3.5, color: '#8b5cf6' },
    ];

    const paymentMethodData = [
        { name: 'Cash', value: 58240, percent: '40.0%' },
        { name: 'UPI', value: 49360, percent: '34.0%' },
        { name: 'Card', value: 26480, percent: '18.2%' },
        { name: 'Net Banking', value: 9600, percent: '6.6%' },
        { name: 'Wallet', value: 2000, percent: '1.2%' },
    ];

    const hourlySalesData = [
        { name: '6 AM', sales: 500 }, { name: '8 AM', sales: 2500 }, { name: '10 AM', sales: 5000 },
        { name: '12 PM', sales: 12000 }, { name: '2 PM', sales: 14000 }, { name: '4 PM', sales: 8000 },
        { name: '6 PM', sales: 18000 }, { name: '8 PM', sales: 28650 }, { name: '10 PM', sales: 15000 },
    ];

    const waiters = [
        { name: 'Suresh Yadav', avatar: 'https://ui-avatars.com/api/?name=Suresh+Yadav&background=e0e7ff&color=4f46e5', orders: 128, sales: 22840, avg: 178.44, rating: 4.8 },
        { name: 'Amit Verma', avatar: 'https://i.pravatar.cc/150?img=11', orders: 112, sales: 19650, avg: 175.45, rating: 4.6 },
        { name: 'Priya Singh', avatar: 'https://i.pravatar.cc/150?img=5', orders: 98, sales: 16780, avg: 171.22, rating: 4.5 },
        { name: 'Rajesh Sharma', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Sharma&background=dcfce7&color=15803d', orders: 95, sales: 15320, avg: 161.26, rating: 4.3 },
        { name: 'Neha Joshi', avatar: 'https://i.pravatar.cc/150?img=9', orders: 85, sales: 13880, avg: 163.29, rating: 4.2 },
    ];

    const categories = [
        { name: 'Main Course', img: '🥘', sales: 65240, items: 1420, percent: '44.8%' },
        { name: 'Beverages', img: '🥤', sales: 28760, items: 820, percent: '19.7%' },
        { name: 'Starters', img: '🥟', sales: 24350, items: 610, percent: '16.7%' },
        { name: 'Desserts', img: '🍰', sales: 15680, items: 320, percent: '10.8%' },
        { name: 'Soups', img: '🥣', sales: 6250, items: 242, percent: '4.3%' },
        { name: 'Salads', img: '🥗', sales: 5400, items: 178, percent: '3.7%' },
    ];

    const foodItems = [
        { name: 'Paneer Butter Masala', category: 'Main Course', qty: 312, sales: 6240, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=50&h=50&fit=crop' },
        { name: 'Veg Biryani', category: 'Main Course', qty: 278, sales: 5560, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=50&h=50&fit=crop' },
        { name: 'Chicken Tikka', category: 'Starters', qty: 245, sales: 4900, img: 'https://images.unsplash.com/photo-1599487405270-87a26f30a9e7?w=50&h=50&fit=crop' },
        { name: 'Cold Coffee', category: 'Beverages', qty: 210, sales: 3780, img: 'https://images.unsplash.com/photo-1461023058943-0708e58b5eff?w=50&h=50&fit=crop' },
        { name: 'Gulab Jamun', category: 'Desserts', qty: 186, sales: 3160, img: 'https://images.unsplash.com/photo-1596568212629-9e2c608f60dc?w=50&h=50&fit=crop' },
    ];

    // Custom YAxis tick formatter for thousands (e.g. 40K)
    const formatYAxis = (tickItem) => {
        if (tickItem === 0) return '₹ 0';
        return `₹ ${tickItem / 1000}K`;
    };

    return (
        <div className="space-y-6 pb-10 font-inter">
            
            {/* Top Navigation & Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex space-x-6 overflow-x-auto">
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
                <div className="flex items-center space-x-3">
                    <button className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        Filters
                    </button>
                    <button className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards Row (6 cols) */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Sales', value: '₹ 1,45,680', trend: '↑ 15.8%', icon: <FileText className="w-5 h-5"/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Orders', value: '842', trend: '↑ 12.6%', icon: <CheckSquare className="w-5 h-5"/>, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Average Order Value', value: '₹ 172.95', trend: '↑ 8.3%', icon: <Receipt className="w-5 h-5"/>, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Total Customers', value: '196', trend: '↑ 10.4%', icon: <Users className="w-5 h-5"/>, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Total Items Sold', value: '3,412', trend: '↑ 14.2%', icon: <Utensils className="w-5 h-5"/>, color: 'text-orange-400', bg: 'bg-orange-50' },
                    { label: 'Gross Profit', value: '₹ 56,780', trend: '↑ 16.7%', icon: <TrendingUp className="w-5 h-5"/>, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start space-x-3">
                            <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shrink-0`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 mb-0.5 leading-tight">{kpi.label}</p>
                                <p className="text-lg font-black text-gray-900 leading-none">{kpi.value}</p>
                            </div>
                        </div>
                        <div className="text-[9px] font-bold text-green-500 mt-4 tracking-tight">
                            {kpi.trend} <span className="text-gray-400 font-medium ml-1">vs May 07 - May 13</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sales Overview Area Chart */}
                <div className="lg:col-span-5 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
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
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} tickFormatter={formatYAxis} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Order Type Donut */}
                <div className="lg:col-span-3 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">Sales by Order Type</h3>
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-full h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                                        {orderTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 mt-2 px-4">
                            {orderTypeData.map((item, idx) => (
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
                </div>

                {/* Sales by Payment Method Bar Chart */}
                <div className="lg:col-span-4 bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Sales by Payment Method</h3>
                    <div className="flex-1 flex flex-col justify-center space-y-5">
                        {paymentMethodData.map((item, idx) => {
                            const max = paymentMethodData[0].value;
                            const width = (item.value / max) * 100;
                            return (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1.5">
                                        <span>{item.name}</span>
                                        <span className="text-gray-900">₹ {item.value.toLocaleString()} ({item.percent})</span>
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
                                        <td className="py-2 px-4 text-center text-[10px] font-bold text-gray-600">{w.orders}</td>
                                        <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{w.sales.toLocaleString()}</td>
                                        <td className="py-2 px-4 text-right text-[10px] font-semibold text-gray-600">{w.avg.toFixed(2)}</td>
                                        <td className="py-2 px-4 text-right">
                                            <div className="flex items-center justify-end text-[10px] font-bold text-gray-900">
                                                <Star className="w-3 h-3 text-orange-400 fill-current mr-1" />
                                                {w.rating}
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
                                                <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-xs">{c.img}</div>
                                                <span className="text-[10px] font-bold text-gray-900">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{c.sales.toLocaleString()}</td>
                                        <td className="py-2 px-4 text-center text-[10px] font-semibold text-gray-600">{c.items}</td>
                                        <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-600">{c.percent}</td>
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
                                                <img src={f.img} alt={f.name} className="w-6 h-6 rounded object-cover" />
                                                <span className="text-[10px] font-bold text-gray-900 truncate w-24 block" title={f.name}>{f.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-[10px] font-semibold text-gray-600">{f.category}</td>
                                        <td className="py-2 px-4 text-center text-[10px] font-bold text-gray-600">{f.qty}</td>
                                        <td className="py-2 px-4 text-right text-[10px] font-bold text-gray-900">{f.sales.toLocaleString()}</td>
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
                <div className="lg:col-span-4 bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col">
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

                {/* Peak Hours & Sales Summary */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Peak Hours</h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 mb-0.5 leading-tight">Busiest Time of the Day</p>
                                <p className="text-[15px] font-black text-gray-900 leading-none">7 PM - 9 PM</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales</p>
                            <p className="text-sm font-black text-gray-900">₹ 28,650</p>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-3">
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 h-full flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Sales Summary</h3>
                        
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500">This Week <span className="font-medium text-gray-400 text-[10px] ml-1">(May 14 - May 20)</span></span>
                                <span className="font-black text-gray-900">₹ 1,45,680</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500">Last Week <span className="font-medium text-gray-400 text-[10px] ml-1">(May 07 - May 13)</span></span>
                                <span className="font-black text-gray-900">₹ 1,25,820</span>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2">
                                <span className="font-bold text-gray-500 text-xs">Growth</span>
                                <span className="font-black text-green-500 text-xs">↑ 15.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Reports */}
                <div className="lg:col-span-3 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Reports</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-2"><BarChart2 className="w-3.5 h-3.5"/></div>
                            Sales Report
                        </button>
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center mr-2"><Users className="w-3.5 h-3.5"/></div>
                            Operator Report
                        </button>
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center mr-2"><Utensils className="w-3.5 h-3.5"/></div>
                            Menu Report
                        </button>
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center mr-2"><Receipt className="w-3.5 h-3.5"/></div>
                            Order Report
                        </button>
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center mr-2"><FileText className="w-3.5 h-3.5"/></div>
                            Category Report
                        </button>
                        <button className="flex items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg hover:border-indigo-200 hover:bg-white transition-all text-[10px] font-bold text-gray-700">
                            <div className="w-6 h-6 rounded bg-pink-50 text-pink-600 flex items-center justify-center mr-2"><Star className="w-3.5 h-3.5"/></div>
                            Item Report
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsOverview;
