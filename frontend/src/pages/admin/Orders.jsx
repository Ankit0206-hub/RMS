import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Eye, Filter, Download, 
    ClipboardList, CheckCircle2, Clock, XCircle, IndianRupee 
} from 'lucide-react';
import { DataTable } from '../../components/ui';

const Orders = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data perfectly matching the user's mockup
    const ordersData = [
        { id: '#ORD1263', date: '20 May 2025', time: '12:45 PM', customerName: 'Suresh Yadav', customerPhone: '+91 98765 43210', table: 'T2 - Table 2', type: 'Dine In', amount: 812.95, status: 'Completed' },
        { id: '#ORD1262', date: '20 May 2025', time: '12:40 PM', customerName: 'Rajesh Sharma', customerPhone: '+91 91234 56789', table: 'T4 - Table 4', type: 'Dine In', amount: 645.50, status: 'Preparing' },
        { id: '#ORD1261', date: '20 May 2025', time: '12:35 PM', customerName: 'Walk-in Customer', customerPhone: '-', table: 'T1 - Table 1', type: 'Walk-in', amount: 320.00, status: 'Confirmed' },
        { id: '#ORD1260', date: '20 May 2025', time: '12:30 PM', customerName: 'Amit Verma', customerPhone: '+91 99876 54321', table: 'T3 - Table 3', type: 'Dine In', amount: 1250.00, status: 'Preparing' },
        { id: '#ORD1259', date: '20 May 2025', time: '12:25 PM', customerName: 'Priya Singh', customerPhone: '+91 90011 22334', table: 'T5 - Table 5', type: 'Take Away', amount: 280.00, status: 'Completed' },
        { id: '#ORD1258', date: '20 May 2025', time: '12:20 PM', customerName: 'Neha Joshi', customerPhone: '+91 88776 66554', table: 'T6 - Table 6', type: 'Dine In', amount: 560.75, status: 'Cancelled' },
        { id: '#ORD1257', date: '20 May 2025', time: '12:15 PM', customerName: 'Walk-in Customer', customerPhone: '-', table: 'T2 - Table 2', type: 'Walk-in', amount: 175.00, status: 'Confirmed' },
        { id: '#ORD1256', date: '20 May 2025', time: '12:10 PM', customerName: 'Vikram Singh', customerPhone: '+91 77665 44322', table: 'T7 - Table 7', type: 'Take Away', amount: 450.00, status: 'Completed' },
        { id: '#ORD1255', date: '20 May 2025', time: '12:05 PM', customerName: 'Ramesh Kumar', customerPhone: '+91 66554 33211', table: 'T8 - Table 8', type: 'Dine In', amount: 690.30, status: 'Preparing' },
        { id: '#ORD1254', date: '20 May 2025', time: '12:00 PM', customerName: 'Pooja Sharma', customerPhone: '+91 55443 22110', table: 'T9 - Table 9', type: 'Dine In', amount: 910.60, status: 'Confirmed' },
    ];

    const getOrderTypePill = (type) => {
        switch(type) {
            case 'Dine In': return 'text-green-600 bg-green-50';
            case 'Walk-in': return 'text-indigo-600 bg-indigo-50';
            case 'Take Away': return 'text-orange-500 bg-orange-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const getStatusPill = (status) => {
        switch(status) {
            case 'Completed': return 'text-green-600 bg-green-50 border border-green-100';
            case 'Preparing': return 'text-orange-500 bg-orange-50 border border-orange-100';
            case 'Confirmed': return 'text-blue-500 bg-blue-50 border border-blue-100';
            case 'Cancelled': return 'text-red-500 bg-red-50 border border-red-100';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const columns = [
        { 
            header: "Order ID", 
            cell: (row) => <span className="font-bold text-gray-900 text-xs">{row.id}</span> 
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
            header: "Table", 
            cell: (row) => <span className="font-semibold text-gray-600 text-[11px]">{row.table}</span> 
        },
        { 
            header: "Order Type", 
            cell: (row) => <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getOrderTypePill(row.type)}`}>{row.type}</span> 
        },
        { 
            header: "Total Amount", 
            cell: (row) => <span className="font-bold text-gray-800 text-[11px]">₹ {row.amount.toFixed(2)}</span> 
        },
        { 
            header: "Status", 
            cell: (row) => <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusPill(row.status)}`}>{row.status}</span> 
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center">
                    <button 
                        onClick={() => navigate(`/admin/orders/${row.id.replace('#', '')}`)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
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
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">142</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 15.8% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Completed</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">48</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 12.1% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Preparing</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">35</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-4">
                        ↓ 4.3% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Cancelled</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">9</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-4">
                        ↑ 2.2% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ 1,45,680</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-4">
                        ↑ 18.6% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
                    </div>
                </div>
            </div>

            {/* Main Data Table Area */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID, Customer, Table..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-72 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <select className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                            <option>All Status</option>
                            <option>Completed</option>
                            <option>Preparing</option>
                            <option>Confirmed</option>
                            <option>Cancelled</option>
                        </select>
                        
                        <select className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                            <option>All Order Type</option>
                            <option>Dine In</option>
                            <option>Walk-in</option>
                            <option>Take Away</option>
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
                        data={ordersData} 
                        isLoading={false} 
                        emptyMessage="No orders found." 
                    />
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium">
                    <div>Showing 1 to 10 of 142 orders</div>
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

export default Orders;
