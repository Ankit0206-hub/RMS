import React, { useState } from 'react';
import { 
    Filter, Download, Search, X, List, User, ShoppingCart, 
    Receipt, Lock, ShieldAlert, CheckCircle2, ChevronRight, 
    RefreshCcw, FileText, ChevronDown, CheckCircle, IndianRupee
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    LineChart, Line
} from 'recharts';

const Logs = () => {
    const [selectedLog, setSelectedLog] = useState(null);

    // Mock Data for Table
    const logsData = [
        { id: 1, time: '20 May 2025\n10:20:45 AM', empName: 'Suresh Kumar', empImg: 'https://ui-avatars.com/api/?name=Suresh+Kumar&background=e0e7ff&color=4f46e5', role: 'Operator', module: 'Billing', action: 'Generated Bill', ref: 'BILL00125', table: 'T-05', ip: '192.168.1.5', status: 'Success', severity: 'Info' },
        { id: 2, time: '20 May 2025\n10:18:30 AM', empName: 'Priya Singh', empImg: 'https://i.pravatar.cc/150?img=5', role: 'Waiter', module: 'Orders', action: 'Order Served', ref: 'ORD01254', table: 'T-12', ip: '192.168.1.7', status: 'Success', severity: 'Info' },
        { id: 3, time: '20 May 2025\n10:16:12 AM', empName: 'Amit Verma', empImg: 'https://i.pravatar.cc/150?img=11', role: 'Operator', module: 'Orders', action: 'Order Confirmed', ref: 'ORD01254', table: 'T-12', ip: '192.168.1.5', status: 'Success', severity: 'Info' },
        { id: 4, time: '20 May 2025\n10:12:05 AM', empName: 'Raj Sharma', empImg: 'https://ui-avatars.com/api/?name=Raj+Sharma&background=dcfce7&color=15803d', role: 'Operator', module: 'Menu', action: 'Updated Price', ref: 'ITEM015', table: '-', ip: '192.168.1.5', status: 'Success', severity: 'Warning' },
        { id: 5, time: '20 May 2025\n10:08:41 AM', empName: 'Neha Joshi', empImg: 'https://i.pravatar.cc/150?img=9', role: 'Waiter', module: 'Orders', action: 'Item Added', ref: 'ORD01253', table: 'T-03', ip: '192.168.1.7', status: 'Success', severity: 'Info' },
        { id: 6, time: '20 May 2025\n10:05:22 AM', empName: 'Suresh Kumar', empImg: 'https://ui-avatars.com/api/?name=Suresh+Kumar&background=e0e7ff&color=4f46e5', role: 'Operator', module: 'Payments', action: 'Payment Received', ref: 'PAY00985', table: 'T-05', ip: '192.168.1.5', status: 'Success', severity: 'Info' },
        { id: 7, time: '20 May 2025\n10:01:15 AM', empName: 'Admin Owner', empImg: 'https://ui-avatars.com/api/?name=Admin+Owner&background=fef3c7&color=b45309', role: 'Admin', module: 'Employees', action: 'Added Employee', ref: 'EMP0054', table: '-', ip: '192.168.1.2', status: 'Success', severity: 'Info' },
        { id: 8, time: '20 May 2025\n09:58:11 AM', empName: 'Amit Verma', empImg: 'https://i.pravatar.cc/150?img=11', role: 'Operator', module: 'Menu', action: 'Category Created', ref: 'CAT0008', table: '-', ip: '192.168.1.5', status: 'Success', severity: 'Info' },
    ];

    // Mock Data for Charts
    const moduleData = [
        { name: 'Orders', value: 35, color: '#22c55e' },
        { name: 'Billing', value: 20, color: '#3b82f6' },
        { name: 'Menu', value: 15, color: '#8b5cf6' },
        { name: 'Employees', value: 10, color: '#ec4899' },
        { name: 'Payments', value: 8, color: '#f97316' },
        { name: 'Others', value: 12, color: '#0ea5e9' },
    ];

    const empActivityData = [
        { name: 'Suresh Kumar', activities: 645 },
        { name: 'Amit Verma', activities: 498 },
        { name: 'Priya Singh', activities: 412 },
        { name: 'Raj Sharma', activities: 309 },
        { name: 'Neha Joshi', activities: 256 },
    ];

    const timelineData = [
        { name: 'May 14', activities: 500 },
        { name: 'May 15', activities: 580 },
        { name: 'May 16', activities: 510 },
        { name: 'May 17', activities: 650 },
        { name: 'May 18', activities: 590 },
        { name: 'May 19', activities: 750 },
        { name: 'May 20', activities: 700 },
    ];

    // Render Helpers
    const getRoleColor = (role) => {
        if (role === 'Operator') return 'text-blue-600 bg-blue-50';
        if (role === 'Waiter') return 'text-green-600 bg-green-50';
        if (role === 'Admin') return 'text-purple-600 bg-purple-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getSeverityColor = (sev) => {
        if (sev === 'Info') return 'text-blue-500 bg-blue-50';
        if (sev === 'Warning') return 'text-orange-500 bg-orange-50';
        if (sev === 'Critical') return 'text-red-500 bg-red-50';
        return 'text-gray-500 bg-gray-50';
    };

    return (
        <div className="space-y-6 pb-10 font-inter">
            
            {/* KPI Cards Row (6 cols) */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Activities', value: '2,458', trend: '↑ 10.6%', icon: <List className="w-5 h-5"/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Employee Activities', value: '1,245', trend: '↑ 16.4%', icon: <User className="w-5 h-5"/>, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Order Activities', value: '654', trend: '↑ 12.7%', icon: <ShoppingCart className="w-5 h-5"/>, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Billing Activities', value: '352', trend: '↑ 11.3%', icon: <Receipt className="w-5 h-5"/>, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Login Activities', value: '189', trend: '↑ 8.9%', icon: <Lock className="w-5 h-5"/>, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Critical Events', value: '18', trend: '↓ 5.2%', trendColor: 'text-red-500', icon: <ShieldAlert className="w-5 h-5"/>, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color} shrink-0`}>
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-500 mb-0.5 leading-tight">{kpi.label}</p>
                                <p className="text-lg font-black text-gray-900 leading-none">{kpi.value}</p>
                            </div>
                        </div>
                        <div className={`text-[8px] font-bold ${kpi.trendColor || 'text-green-500'} mt-1 tracking-tight`}>
                            {kpi.trend} <span className="text-gray-400 font-medium ml-1">vs May 07 - May 13</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout Grid */}
            <div className={`grid grid-cols-1 ${selectedLog ? 'xl:grid-cols-4' : 'xl:grid-cols-1'} gap-6`}>
                
                {/* Left Panel: Table (Span 3 when selected, Span 1 otherwise) */}
                <div className={`${selectedLog ? 'xl:col-span-3' : 'xl:col-span-1'} bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col`}>
                    
                    {/* Advanced Filters Section */}
                    <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                        <div className="grid grid-cols-5 gap-3">
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Date Range</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span className="flex items-center"><FileText className="w-3 h-3 mr-1.5"/> May 14, 2025 - May 20, 2025</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Employee</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Employees</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Role</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Roles</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Module</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Modules</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Activity Type</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Types</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-3 items-end">
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Table Number</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Tables</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Order ID</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Orders</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Bill Number</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Bills</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Severity</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Severity</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-gray-500 mb-1 block">Status</label>
                                <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-700 bg-gray-50">
                                    <span>All Status</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400"/>
                                </div>
                            </div>
                            <div className="flex space-x-2 justify-end">
                                <button className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors w-full justify-center">
                                    <Filter className="w-3 h-3 mr-1.5 text-gray-500" />
                                    Filters
                                </button>
                                <button className="flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors w-full justify-center">
                                    <RefreshCcw className="w-3 h-3 mr-1.5 text-gray-500" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by employee, action, order ID, bill number..." 
                                    className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-900 focus:outline-none focus:border-indigo-500 w-full font-medium"
                                />
                            </div>
                            <button className="flex items-center bg-white border border-gray-200 px-4 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-gray-100 bg-white">
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Time</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Employee</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Role</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Module</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Action</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Reference</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Table</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">IP Address</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase">Status</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-gray-500 uppercase text-right">Severity</th>
                                    <th className="py-3 px-2 text-[9px] font-bold text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logsData.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => setSelectedLog(log)}
                                        className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="text-[10px] font-bold text-gray-900 whitespace-pre-line leading-snug">{log.time}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <img src={log.empImg} alt={log.empName} className="w-6 h-6 rounded-full" />
                                                <span className="text-[10px] font-bold text-gray-900">{log.empName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getRoleColor(log.role)}`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-1.5">
                                                <div className="w-5 h-5 rounded flex items-center justify-center bg-gray-50 text-gray-500">
                                                    {log.module === 'Billing' && <Receipt className="w-3 h-3"/>}
                                                    {log.module === 'Orders' && <ShoppingCart className="w-3 h-3"/>}
                                                    {log.module === 'Menu' && <List className="w-3 h-3"/>}
                                                    {log.module === 'Payments' && <IndianRupee className="w-3 h-3"/>}
                                                    {log.module === 'Employees' && <User className="w-3 h-3"/>}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-700">{log.module}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[10px] font-bold text-gray-900">{log.action}</td>
                                        <td className="py-3 px-4 text-[10px] font-bold text-gray-600">{log.ref}</td>
                                        <td className="py-3 px-4 text-[10px] font-bold text-gray-600">{log.table}</td>
                                        <td className="py-3 px-4 text-[10px] font-bold text-gray-600">{log.ip}</td>
                                        <td className="py-3 px-4">
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getSeverityColor(log.severity)}`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 p-1">⋮</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 font-medium bg-white">
                        <div>Showing 1 to 10 of 2,458 activities</div>
                        <div className="flex items-center space-x-1">
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded bg-[#5e5ce6] text-white font-bold shadow">1</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">3</button>
                            <span className="px-1 text-gray-400">...</span>
                            <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">246</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <select className="border border-gray-200 rounded px-1 py-0.5 outline-none font-semibold text-gray-700">
                                <option>10</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Log Details (Span 1) */}
                {selectedLog && (
                    <div className="xl:col-span-1 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col h-[700px] sticky top-6">
                        
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-sm font-black text-gray-900">{selectedLog.action}</h3>
                                        <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Success</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">20 May 2025 at 10:20:45 AM</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Details List */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Employee</div>
                                    <div className="font-bold text-gray-900">{selectedLog.empName}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Role</div>
                                    <div className="font-bold text-gray-900">{selectedLog.role}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Module</div>
                                    <div className="font-bold text-gray-900">{selectedLog.module}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Action</div>
                                    <div className="font-bold text-gray-900">{selectedLog.action}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Reference (Bill No.)</div>
                                    <div className="font-bold text-gray-900">{selectedLog.ref}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Related Order</div>
                                    <div className="font-bold text-gray-900">ORD01254</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Table</div>
                                    <div className="font-bold text-gray-900">{selectedLog.table}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Customer</div>
                                    <div className="font-bold text-gray-900">Rahul Sharma</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Amount</div>
                                    <div className="font-bold text-gray-900">₹ 1,250.00</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">IP Address</div>
                                    <div className="font-bold text-gray-900">{selectedLog.ip}</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Device</div>
                                    <div className="font-bold text-gray-900">Windows 11 / Chrome</div>
                                </div>
                                <div className="grid grid-cols-2 text-[10px]">
                                    <div className="font-bold text-gray-500">Severity</div>
                                    <div className={`font-bold ${getSeverityColor(selectedLog.severity).split(' ')[0]}`}>{selectedLog.severity}</div>
                                </div>
                                <div className="text-[10px]">
                                    <div className="font-bold text-gray-500 mb-1">Description</div>
                                    <div className="font-semibold text-gray-700 leading-snug">Operator generated bill BILL00125 for Order ORD01254. Amount ₹ 1,250.00.</div>
                                </div>
                            </div>

                            {/* Mini Timeline */}
                            <div className="mt-8">
                                <h4 className="text-[11px] font-bold text-gray-900 mb-4">Activity Timeline (This Order)</h4>
                                <div className="relative pl-3 space-y-4">
                                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-green-200 border-l border-dashed border-green-300"></div>
                                    
                                    <div className="relative flex items-start text-[9px]">
                                        <div className="w-4 h-4 rounded-full bg-white border border-green-500 text-green-500 flex items-center justify-center shrink-0 z-10 mr-3 absolute -left-2">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="pl-6 flex-1 flex justify-between items-center">
                                            <span className="font-bold text-gray-500">10:16 AM</span>
                                            <span className="font-bold text-gray-900">Order Confirmed by Amit Verma</span>
                                        </div>
                                    </div>
                                    
                                    <div className="relative flex items-start text-[9px]">
                                        <div className="w-4 h-4 rounded-full bg-white border border-green-500 text-green-500 flex items-center justify-center shrink-0 z-10 mr-3 absolute -left-2">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="pl-6 flex-1 flex justify-between items-center">
                                            <span className="font-bold text-gray-500">10:18 AM</span>
                                            <span className="font-bold text-gray-900">Order Served by Priya Singh</span>
                                        </div>
                                    </div>

                                    <div className="relative flex items-start text-[9px]">
                                        <div className="w-4 h-4 rounded-full bg-white border border-green-500 text-green-500 flex items-center justify-center shrink-0 z-10 mr-3 absolute -left-2">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="pl-6 flex-1 flex justify-between items-center">
                                            <span className="font-bold text-gray-500">10:20 AM</span>
                                            <span className="font-bold text-gray-900">Bill Generated by Suresh Kumar</span>
                                        </div>
                                    </div>

                                    <div className="relative flex items-start text-[9px]">
                                        <div className="w-4 h-4 rounded-full bg-white border border-green-500 text-green-500 flex items-center justify-center shrink-0 z-10 mr-3 absolute -left-2">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="pl-6 flex-1 flex justify-between items-center">
                                            <span className="font-bold text-gray-500">10:22 AM</span>
                                            <span className="font-bold text-gray-900">Payment Received via UPI</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-center">
                            <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors w-full">
                                View Full Order Details
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Activities by Module Donut */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 text-[11px] mb-4">Activities by Module</h3>
                    <div className="flex flex-col items-center justify-center h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={moduleData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                                    {moduleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-0 right-0 bottom-0 flex flex-col justify-center space-y-1 pr-2 w-1/2">
                            {moduleData.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[8px] font-bold">
                                    <div className="flex items-center text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-sm mr-1.5" style={{backgroundColor: item.color}}></div>
                                        {item.name}
                                    </div>
                                    <div className="text-gray-900">{item.value}% <span className="text-gray-400 font-medium ml-0.5">({item.value * 18})</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Employee Activity Bar Chart (Horizontal conceptually, but we can fake it or use BarChart with layout="vertical") */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 text-[11px] mb-4">Employee Activity (Top 5)</h3>
                    <div className="flex flex-col justify-between h-40">
                        {empActivityData.map((item, idx) => {
                            const max = empActivityData[0].activities;
                            const width = (item.activities / max) * 100;
                            return (
                                <div key={idx} className="flex items-center text-[9px]">
                                    <div className="w-20 font-bold text-gray-700 truncate pr-2">{item.name}</div>
                                    <div className="flex-1 h-1.5 bg-indigo-50 rounded-r-full overflow-hidden flex items-center">
                                        <div className="h-full bg-indigo-600 rounded-r-full" style={{ width: `${width}%` }}></div>
                                    </div>
                                    <div className="w-8 text-right font-bold text-gray-900">{item.activities}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Activity Timeline Line Chart */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-[11px]">Activity Timeline</h3>
                        <select className="bg-white border border-gray-200 text-gray-700 text-[9px] font-bold rounded px-1.5 py-0.5 outline-none">
                            <option>Daily</option>
                        </select>
                    </div>
                    <div className="h-36 w-full text-[8px] font-semibold">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 8}} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 8}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '9px', fontWeight: 'bold' }} />
                                <Line type="linear" dataKey="activities" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', stroke: '#fff', strokeWidth: 1 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Critical Events */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col justify-between">
                    <h3 className="font-bold text-gray-900 text-[11px] mb-4">Critical Events</h3>
                    <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-red-500 mr-2" />
                                Failed Login Attempts
                            </div>
                            <span className="font-black text-red-500">5</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-red-500 mr-2" />
                                Deleted Menu Items
                            </div>
                            <span className="font-black text-red-500">4</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-red-500 mr-2" />
                                Cancelled Bills
                            </div>
                            <span className="font-black text-red-500">3</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-orange-400 mr-2" />
                                High Discounts ({'>20%'})
                            </div>
                            <span className="font-black text-red-500">2</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-orange-400 mr-2" />
                                Refunded Payments
                            </div>
                            <span className="font-black text-red-500">2</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <div className="flex items-center text-gray-700 font-bold">
                                <ShieldAlert className="w-3 h-3 text-orange-400 mr-2" />
                                Unauthorized Access
                            </div>
                            <span className="font-black text-red-500">2</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            View All Critical Events →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Logs;
