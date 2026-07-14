import React, { useState } from 'react';
import { 
    Search, Filter, Download, Users, UserCheck, UserPlus, 
    Eye, MoreVertical, ArrowLeft, Phone, Users2, Receipt
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DataTable, Pagination } from '../../components/ui';

// Helper to get initials
const getInitials = (name) => {
    if (!name) return 'WC';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const Customers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null); // When null, show full list
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: sessionsResponse, isLoading } = useQuery({
        queryKey: ['customerSessions', currentPage, itemsPerPage],
        queryFn: async () => {
            const response = await api.get('/admin/ordering/sessions', {
                params: { page: currentPage, page_size: itemsPerPage }
            });
            return response.data;
        }
    });

    const customersData = React.useMemo(() => {
        if (!sessionsResponse?.data) return [];
        let data = sessionsResponse.data.map(session => ({
            id: session.id,
            rawId: session.id,
            name: session.customer_name || 'Walk-in Customer',
            phone: session.customer_phone || '-',
            peoples: session.number_of_people || 1,
            initials: getInitials(session.customer_name),
            status: session.status,
            orders: session.orders || []
        }));

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(c => 
                c.name.toLowerCase().includes(lowerSearch) || 
                c.phone.includes(lowerSearch)
            );
        }
        return data;
    }, [sessionsResponse, searchTerm]);

    const { data: activeSessionsResponse } = useQuery({
        queryKey: ['activeCustomerSessions'],
        queryFn: async () => {
            const response = await api.get('/admin/ordering/sessions', {
                params: { page: 1, page_size: 1, status: 'Active' }
            });
            return response.data;
        }
    });

    const totalCustomers = sessionsResponse?.meta?.total || 0;
    const activeCustomers = activeSessionsResponse?.meta?.total || 0;
    const newCustomersThisMonth = Math.floor(totalCustomers * 0.15); // Placeholder dynamic value until API supports date filtering

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
        <div className="space-y-2 pb-6 font-inter">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Customers</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{totalCustomers}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">All registered customers</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-green-50 rounded-xl text-green-600 flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">Active Customers</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{activeCustomers}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Currently active customers</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-xl text-orange-500 flex items-center justify-center shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 mb-0.5">New Customers <span className="text-gray-400 font-medium">(This Month)</span></p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{newCustomersThisMonth}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Joined this month</p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6">
                
                {/* Data Table */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    
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
                            isLoading={isLoading} 
                            emptyMessage="No customers found." 
                        />
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={totalCustomers}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        itemName="customers"
                    />
                </div>

                {/* Right Side: Customer Details Drawer */}
                {selectedCustomer && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
                            onClick={() => setSelectedCustomer(null)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
                            
                            {/* Header Profile */}
                            <div className="p-6 border-b border-gray-100 bg-white">
                                <div className="flex justify-end mb-4">
                                    <button 
                                        onClick={() => setSelectedCustomer(null)}
                                        className="rounded-lg p-2 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
                                </div>
    
                                <div className="flex items-start">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg font-black shrink-0 mr-4">
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
                                <div className="w-[90px] pl-8">Order ID</div>
                                <div className="flex-1 pl-2">Date & Time</div>
                                <div className="w-14 text-center">Items</div>
                                <div className="w-20 text-right">Amount</div>
                                <div className="w-20 text-right">Payment</div>
                                <div className="w-20 text-right">Status</div>
                            </div>

                            <div className="relative pl-3 space-y-7 mt-2 pb-4">
                                {/* The vertical connecting line */}
                                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-green-200 border-l border-dashed border-green-300"></div>
                                
                                {selectedCustomer.orders.map((order, idx) => {
                                    const dateObj = new Date(order.created_at);
                                    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    return (
                                    <div key={idx} className="relative flex items-center justify-between">
                                        {/* Icon & Order ID */}
                                        <div className="w-[90px] flex items-center">
                                            <div className="w-6 h-6 rounded bg-green-50 text-green-500 flex items-center justify-center shrink-0 z-10 border border-white shadow-sm absolute -left-[5px]">
                                                <Receipt className="w-3 h-3" />
                                            </div>
                                            <span className="font-bold text-gray-900 text-[11px] pl-8">{order.id}</span>
                                        </div>
                                        
                                        {/* Date & Time */}
                                        <div className="flex-1 min-w-0 pl-2 pr-2">
                                            <div className="font-semibold text-gray-700 text-[11px] leading-tight truncate">{formattedDate}</div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{formattedTime}</div>
                                        </div>

                                        {/* Items */}
                                        <div className="w-14 text-center text-[11px] font-semibold text-gray-600">
                                            {order.items.length} Items
                                        </div>

                                        {/* Amount */}
                                        <div className="w-20 text-right text-[11px] font-bold text-gray-900">
                                            ₹{parseFloat(order.total_amount).toFixed(2)}
                                        </div>

                                        {/* Payment */}
                                        <div className="w-20 text-right text-[11px] font-semibold text-gray-600">
                                            -
                                        </div>

                                        {/* Status */}
                                        <div className="w-20 flex justify-end">
                                            <span className="bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* View All Button */}
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-center">
                            <button className="w-full bg-[#3b82f6] text-white font-bold text-xs px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                                View Full Order History
                            </button>
                        </div>

                    </div>
                    </>
                )}
            </div>

            <style>{`
                /* Specific Timeline Grid adjustments for Status */
                th {
                    text-transform: none !important;
font-size: 11px !important;
                    font-weight: 700 !important;
                    padding-top: 14px !important;
                    padding-bottom: 14px !important;
                    border-bottom-width: 1px !important;
                    border-bottom-
}
                td {
                    padding-top: 12px !important;
                    padding-bottom: 12px !important;
                    border-bottom-
}
                tr {
                    border-bottom-
}
                tr:hover {
                    background-
}
            `}</style>
        </div>
    );
};

export default Customers;
