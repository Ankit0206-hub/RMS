import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Eye, Filter, Download, 
    FileText, CheckSquare, Clock, AlertCircle, RotateCcw,
    LayoutGrid, CreditCard, RefreshCcw, Settings, FileBox, Calculator, BarChart3, Receipt
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DataTable } from '../../components/ui';

const Bills = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Invoices');

    const tabs = ['All Invoices', 'Paid', 'Pending', 'Partially Paid', 'Overdue', 'Cancelled'];

    // Mock data matching the mockup exactly
    const invoicesData = [
        { id: '#INV1263', date: '20 May 2025', time: '12:45 PM', customerName: 'Suresh Yadav', customerPhone: '+91 98765 43210', orderId: '#ORD1263', totalAmount: 812.95, paidAmount: 812.95, status: 'Paid', method: 'UPI' },
        { id: '#INV1262', date: '20 May 2025', time: '12:40 PM', customerName: 'Rajesh Sharma', customerPhone: '+91 91234 56789', orderId: '#ORD1262', totalAmount: 645.50, paidAmount: 300.00, status: 'Partially Paid', method: 'Card' },
        { id: '#INV1261', date: '20 May 2025', time: '12:35 PM', customerName: 'Walk-in Customer', customerPhone: '-', orderId: '#ORD1261', totalAmount: 320.00, paidAmount: 0.00, status: 'Pending', method: '-' },
        { id: '#INV1260', date: '20 May 2025', time: '12:30 PM', customerName: 'Amit Verma', customerPhone: '+91 99876 54321', orderId: '#ORD1260', totalAmount: 1250.00, paidAmount: 1250.00, status: 'Paid', method: 'Cash' },
        { id: '#INV1259', date: '20 May 2025', time: '12:25 PM', customerName: 'Priya Singh', customerPhone: '+91 90011 22334', orderId: '#ORD1259', totalAmount: 280.00, paidAmount: 0.00, status: 'Pending', method: '-' },
        { id: '#INV1258', date: '20 May 2025', time: '12:20 PM', customerName: 'Neha Joshi', customerPhone: '+91 88776 66554', orderId: '#ORD1258', totalAmount: 560.75, paidAmount: 560.75, status: 'Paid', method: 'UPI' },
        { id: '#INV1257', date: '20 May 2025', time: '12:15 PM', customerName: 'Walk-in Customer', customerPhone: '-', orderId: '#ORD1257', totalAmount: 175.00, paidAmount: 175.00, status: 'Paid', method: 'Card' },
        { id: '#INV1256', date: '20 May 2025', time: '12:10 PM', customerName: 'Vikram Singh', customerPhone: '+91 77665 44322', orderId: '#ORD1256', totalAmount: 450.00, paidAmount: 0.00, status: 'Overdue', method: '-' },
        { id: '#INV1255', date: '20 May 2025', time: '12:05 PM', customerName: 'Ramesh Kumar', customerPhone: '+91 66554 33211', orderId: '#ORD1255', totalAmount: 690.30, paidAmount: 690.30, status: 'Paid', method: 'Net Banking' },
        { id: '#INV1254', date: '20 May 2025', time: '12:00 PM', customerName: 'Pooja Sharma', customerPhone: '+91 55443 22110', orderId: '#ORD1254', totalAmount: 910.60, paidAmount: 400.00, status: 'Partially Paid', method: 'UPI' },
    ];

    const statsData = [
        { name: 'Paid', value: 128430, color: '#22c55e' },
        { name: 'Pending', value: 17250, color: '#f97316' },
        { name: 'Refunded', value: 1250, color: '#3b82f6' },
    ];

    const getStatusPill = (status) => {
        switch(status) {
            case 'Paid': return 'text-green-600 bg-green-50';
            case 'Pending': return 'text-red-500 bg-red-50';
            case 'Partially Paid': return 'text-orange-500 bg-orange-50';
            case 'Overdue': return 'text-red-600 bg-red-100';
            case 'Cancelled': return 'text-gray-500 bg-gray-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const columns = [
        { 
            header: "Invoice No.", 
            cell: (row) => <span className="font-bold text-blue-600 text-xs">{row.id}</span> 
        },
        { 
            header: "Date & Time", 
            cell: (row) => (
                <div>
                    <div className="font-semibold text-gray-900 text-[11px]">{row.date}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{row.time}</div>
                </div>
            )
        },
        { 
            header: "Customer", 
            cell: (row) => (
                <div>
                    <div className="font-semibold text-gray-900 text-[11px]">{row.customerName}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{row.customerPhone}</div>
                </div>
            )
        },
        { 
            header: "Order ID", 
            cell: (row) => <span className="font-bold text-gray-600 text-[11px]">{row.orderId}</span> 
        },
        { 
            header: "Total Amount", 
            cell: (row) => <span className="font-bold text-gray-800 text-[11px]">₹ {row.totalAmount.toFixed(2)}</span> 
        },
        { 
            header: "Paid Amount", 
            cell: (row) => <span className="font-bold text-gray-800 text-[11px]">₹ {row.paidAmount.toFixed(2)}</span> 
        },
        { 
            header: "Status", 
            cell: (row) => <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusPill(row.status)}`}>{row.status}</span> 
        },
        { 
            header: "Payment Method", 
            cell: (row) => <span className="font-semibold text-gray-600 text-[11px]">{row.method}</span> 
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Eye className="h-4 w-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Sales (This Month)</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ 1,45,680</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 15.8% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-500">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Invoices</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">142</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 12.4% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Paid Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ 1,28,430</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 16.3% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Pending Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ 17,250</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-4">
                        ↓ 8.7% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Refunded Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ 1,250</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-4">
                        ↑ 2.1% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Main Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Data Table (span 2) */}
                <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    
                    {/* Tab Navigation */}
                    <div className="flex space-x-8 px-6 border-b border-gray-100 bg-white">
                        {tabs.map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-xs font-bold transition-all relative ${activeTab === tab ? 'text-[#5e5ce6]' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e5ce6] rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Invoice No., Customer, Order ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-72 transition-all"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <select className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Partially Paid</option>
                            </select>
                            
                            <select className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                                <option>All Payment Methods</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Cash</option>
                                <option>Net Banking</option>
                            </select>

                            <button className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Filter className="w-3.5 h-3.5 mr-1.5" />
                                Filters
                            </button>
                            
                            <button className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <DataTable 
                            columns={columns} 
                            data={invoicesData} 
                            isLoading={false} 
                            emptyMessage="No invoices found." 
                        />
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                        <div>Showing 1 to 10 of 142 invoices</div>
                        <div className="flex items-center space-x-2">
                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#5e5ce6] text-white font-bold shadow">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">3</button>
                            <span className="px-1 text-gray-400">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">15</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <select className="border border-gray-200 rounded-md px-2 py-1 outline-none font-semibold">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Summary & Actions (span 1) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Payment Summary */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Payment Summary <span className="text-gray-400 font-medium">(This Month)</span></h3>
                        
                        <div className="flex items-center justify-between">
                            <div className="w-28 h-28 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={32}
                                            outerRadius={45}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-black text-sm text-gray-900 leading-none mb-0.5">₹ 1,45,680</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Total Sales</span>
                                </div>
                            </div>

                            <div className="flex-1 ml-4 space-y-3">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center text-gray-700 font-semibold"><div className="w-2 h-2 rounded bg-green-500 mr-2"></div>Paid</div>
                                    <div className="font-bold">₹ 1,28,430 <span className="text-gray-400 ml-1 font-medium">(88.2%)</span></div>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center text-gray-700 font-semibold"><div className="w-2 h-2 rounded bg-orange-500 mr-2"></div>Pending</div>
                                    <div className="font-bold">₹ 17,250 <span className="text-gray-400 ml-1 font-medium">(11.8%)</span></div>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center text-gray-700 font-semibold"><div className="w-2 h-2 rounded bg-blue-500 mr-2"></div>Refunded</div>
                                    <div className="font-bold">₹ 1,250 <span className="text-gray-400 ml-1 font-medium">(1%)</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <button className="text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">
                                View Detailed Report →
                            </button>
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-sm">Recent Payments</h3>
                            <button className="text-indigo-600 font-bold text-[10px] hover:text-indigo-700">View All</button>
                        </div>

                        <div className="space-y-4">
                            {/* Payment Item 1 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-green-600 font-bold text-[10px] italic">
                                        UPI
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-gray-900">Suresh Yadav</span>
                                            <span className="text-[10px] font-semibold text-gray-400">#INV1263</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">UPI • 20 May 2025, 12:45 PM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-gray-900">₹ 812.95</div>
                                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">Success</div>
                                </div>
                            </div>

                            {/* Payment Item 2 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-700 font-black text-[10px] italic tracking-tighter">
                                        VISA
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-gray-900">Rajesh Sharma</span>
                                            <span className="text-[10px] font-semibold text-gray-400">#INV1262</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">Card • 20 May 2025, 12:41 PM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-gray-900">₹ 300.00</div>
                                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">Success</div>
                                </div>
                            </div>

                            {/* Payment Item 3 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-gray-900">Neha Joshi</span>
                                            <span className="text-[10px] font-semibold text-gray-400">#INV1258</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">Net Banking • 20 May 2025, 12:20 PM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-gray-900">₹ 560.75</div>
                                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">Success</div>
                                </div>
                            </div>

                            {/* Payment Item 4 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-green-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-gray-900">Amit Verma</span>
                                            <span className="text-[10px] font-semibold text-gray-400">#INV1260</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">Cash • 20 May 2025, 12:30 PM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-gray-900">₹ 1,250.00</div>
                                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">Success</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-[14px] mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-4 gap-2.5">
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:bg-blue-100"><FileText className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Create<br/>Invoice</span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-1.5 group-hover:bg-green-100"><CheckSquare className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Record<br/>Payment</span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-1.5 group-hover:bg-red-100"><RotateCcw className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Create<br/>Refund</span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:bg-indigo-100"><FileBox className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Manage<br/>Invoices</span>
                            </button>
                            
                            <button onClick={() => navigate('/admin/billing/methods')} className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:bg-purple-100"><CreditCard className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Payment<br/>Methods</span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 group-hover:bg-orange-100"><Calculator className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Expense<br/>Entry</span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-1.5 group-hover:bg-pink-100"><BarChart3 className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Reports<br/></span>
                            </button>
                            <button className="bg-white border border-gray-100 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5 group-hover:bg-teal-100"><Settings className="w-4 h-4" /></div>
                                <span className="font-bold text-gray-700 text-[8px] uppercase tracking-tight text-center leading-tight w-full px-1">Tax<br/>Settings</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                /* Override DataTable base styles for this specific page to match design perfectly */
                th {
                    text-transform: none !important;
                    color: #111827 !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    padding-top: 14px !important;
                    padding-bottom: 14px !important;
                    border-bottom-width: 1px !important;
                    border-bottom-color: #f3f4f6 !important;
                }
                td {
                    padding-top: 12px !important;
                    padding-bottom: 12px !important;
                    border-bottom-color: #f9fafb !important;
                }
                tr {
                    border-bottom-color: #f9fafb !important;
                }
                tr:hover {
                    background-color: #fcfcfd !important;
                }
            `}</style>
        </div>
    );
};

export default Bills;
