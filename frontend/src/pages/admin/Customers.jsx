import React, { useState } from 'react';
import { 
    Search, Filter, Download, Users, UserCheck, UserPlus, 
    Eye, MoreVertical, ArrowLeft, Phone, Users2, Receipt
} from 'lucide-react';
import { DataTable } from '../../components/ui';

const Customers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null); // When null, show full list

    // Exact mock data from the user's mockup
    const customersData = [
        { id: 1, name: 'Suresh Yadav', phone: '+91 98765 43210', peoples: 4, initials: 'SY', status: 'Active' },
        { id: 2, name: 'Rajesh Sharma', phone: '+91 91234 56789', peoples: 3, initials: 'RS', status: 'Active' },
        { id: 3, name: 'Amit Verma', phone: '+91 99876 54321', peoples: 2, initials: 'AV', status: 'Active' },
        { id: 4, name: 'Priya Singh', phone: '+91 90011 22334', peoples: 5, initials: 'PS', status: 'Active' },
        { id: 5, name: 'Neha Joshi', phone: '+91 88776 66554', peoples: 3, initials: 'NJ', status: 'Active' },
        { id: 6, name: 'Vikram Singh', phone: '+91 77665 44322', peoples: 6, initials: 'VS', status: 'Active' },
        { id: 7, name: 'Ramesh Kumar', phone: '+91 66554 33211', peoples: 4, initials: 'RK', status: 'Active' },
        { id: 8, name: 'Pooja Sharma', phone: '+91 55443 22110', peoples: 2, initials: 'PS', status: 'Active' },
        { id: 9, name: 'Ankit Kumar', phone: '+91 99881 12345', peoples: 3, initials: 'AK', status: 'Active' },
        { id: 10, name: 'Kavita Patel', phone: '+91 88990 11223', peoples: 4, initials: 'KP', status: 'Active' },
    ];

    // Mock order history for a selected customer
    const orderHistory = [
        { id: '#ORD1263', date: '20 May 2025', time: '12:45 PM', items: '5 Items', amount: 812.95, status: 'Completed' },
        { id: '#ORD1208', date: '15 May 2025', time: '08:20 PM', items: '3 Items', amount: 645.50, status: 'Completed' },
        { id: '#ORD1156', date: '10 May 2025', time: '07:15 PM', items: '4 Items', amount: 690.30, status: 'Completed' },
        { id: '#ORD1093', date: '05 May 2025', time: '01:10 PM', items: '2 Items', amount: 320.00, status: 'Completed' },
        { id: '#ORD1045', date: '30 Apr 2025', time: '08:45 PM', items: '6 Items', amount: 1125.00, status: 'Completed' },
        { id: '#ORD0987', date: '25 Apr 2025', time: '07:30 PM', items: '3 Items', amount: 560.75, status: 'Completed' },
        { id: '#ORD0921', date: '20 Apr 2025', time: '06:05 PM', items: '4 Items', amount: 730.40, status: 'Completed' },
    ];

    // Columns for the left list view
    const columns = [
        { 
            header: "#", 
            cell: (row) => <span className="text-gray-900 font-semibold text-xs">{row.id}</span> 
        },
        { 
            header: "Customer Name", 
            cell: (row) => <span className="text-gray-900 font-bold text-[11px]">{row.name}</span> 
        },
        { 
            header: "Contact Number", 
            cell: (row) => <span className="text-gray-600 font-semibold text-[11px]">{row.phone}</span> 
        },
        { 
            header: "No. of Peoples", 
            cell: (row) => <span className="text-gray-600 font-semibold text-[11px] ml-4">{row.peoples}</span> 
        },
        { 
            header: "Actions", 
            className: "text-right",
            cellClassName: "text-right",
            cell: (row) => (
                <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => setSelectedCustomer(row)}
                        className={`p-1.5 rounded-lg transition-colors ${selectedCustomer?.id === row.id ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* KPI Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${selectedCustomer ? 'lg:w-[65%]' : 'w-full'}`}>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Customers</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">196</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">All registered customers</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-green-50 rounded-xl text-green-600 flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">Active Customers</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">168</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Currently active customers</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-xl text-orange-500 flex items-center justify-center shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">New Customers <span className="text-gray-400 font-medium">(This Month)</span></p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">23</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Joined this month</p>
                    </div>
                </div>
            </div>

            {/* Main Split Grid */}
            <div className={`grid grid-cols-1 ${selectedCustomer ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
                
                {/* Left Side: Data Table */}
                <div className={`${selectedCustomer ? 'lg:col-span-2' : 'lg:col-span-1'} bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col`}>
                    
                    {/* Toolbar */}
                    <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or contact number..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-80 transition-all font-medium"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Filter className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                Filters
                            </button>
                            
                            <button className="flex items-center bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <DataTable 
                            columns={columns} 
                            data={customersData} 
                            isLoading={false} 
                            emptyMessage="No customers found." 
                        />
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-medium bg-white">
                        <div>Showing 1 to 10 of 196 customers</div>
                        <div className="flex items-center space-x-2">
                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#5e5ce6] text-white font-bold shadow">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">3</button>
                            <span className="px-1 text-gray-400">...</span>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-50">20</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <select className="border border-gray-200 rounded-md px-2 py-1 outline-none font-semibold text-gray-700">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Side: Customer Details Panel */}
                {selectedCustomer && (
                    <div className="lg:col-span-1 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col relative h-[800px] sticky top-6">
                        
                        {/* Header Profile */}
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="flex items-center text-indigo-600 hover:text-indigo-800 text-[11px] font-bold mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                Back to Customers
                            </button>

                            <div className="flex items-start">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg font-black shrink-0 mr-4">
                                    {selectedCustomer.initials}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-lg font-black text-gray-900 leading-none">{selectedCustomer.name}</h2>
                                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100">
                                            {selectedCustomer.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-gray-600 space-x-4">
                                        <span className="flex items-center">
                                            <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                            {selectedCustomer.phone}
                                        </span>
                                        <span className="flex items-center">
                                            <Users2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                            {selectedCustomer.peoples} Peoples
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Activity Timeline */}
                        <div className="flex-1 overflow-y-auto bg-white p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-6">Customer Activity <span className="text-gray-500 font-medium">(Order History)</span></h3>

                            {/* Timeline Table Header */}
                            <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                <div className="w-24 pl-8">Order ID</div>
                                <div className="w-28">Date & Time</div>
                                <div className="w-16 text-center">Items</div>
                                <div className="w-20 text-right">Amount</div>
                                <div className="w-24 text-right">Status</div>
                            </div>

                            <div className="relative pl-3 space-y-7 mt-2 pb-4">
                                {/* The vertical connecting line */}
                                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-green-200 border-l border-dashed border-green-300"></div>
                                
                                {orderHistory.map((order, idx) => (
                                    <div key={idx} className="relative flex items-center">
                                        {/* Icon & Order ID */}
                                        <div className="w-24 flex items-center">
                                            <div className="w-6 h-6 rounded bg-green-50 text-green-500 flex items-center justify-center shrink-0 z-10 border border-white shadow-sm absolute -left-[5px]">
                                                <Receipt className="w-3 h-3" />
                                            </div>
                                            <span className="font-bold text-gray-900 text-[11px] pl-8">{order.id}</span>
                                        </div>
                                        
                                        {/* Date & Time */}
                                        <div className="w-28">
                                            <div className="font-semibold text-gray-700 text-[11px] leading-tight">{order.date}</div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{order.time}</div>
                                        </div>

                                        {/* Items */}
                                        <div className="w-16 text-center text-[11px] font-semibold text-gray-600">
                                            {order.items}
                                        </div>

                                        {/* Amount */}
                                        <div className="w-20 text-right text-[11px] font-bold text-gray-900">
                                            ₹ {order.amount.toFixed(2)}
                                        </div>
                                        
                                        {/* Status Pill */}
                                        <div className="w-24 text-right">
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* View All Button */}
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-center">
                            <button className="border border-indigo-200 text-indigo-600 font-bold text-[11px] px-6 py-2 rounded hover:bg-indigo-50 transition-colors">
                                View All Orders
                            </button>
                        </div>

                    </div>
                )}
            </div>

            <style>{`
                /* Specific Timeline Grid adjustments for Status */
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

export default Customers;
