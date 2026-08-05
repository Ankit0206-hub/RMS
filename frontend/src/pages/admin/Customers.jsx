import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/operator') ? '/operator' : '/admin';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null); // When null, show full list
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            orders: session.orders || [],
            date: session.created_at ? new Date(session.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            totalSpent: (session.orders || []).reduce((acc, order) => acc + (parseFloat(order.total_amount) || 0), 0)
        }));

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(c => 
                c.name.toLowerCase().includes(lowerSearch) || 
                c.phone.includes(lowerSearch)
            );
        }

        if (statusFilter !== 'All') {
            data = data.filter(c => c.status === statusFilter);
        }

        return data;
    }, [sessionsResponse, searchTerm, statusFilter]);

    const exportToCSV = () => {
        if (!customersData || customersData.length === 0) return;
        
        const headers = ['ID', 'Name', 'Phone', 'No. of People', 'Date', 'Total Spent', 'Status'];
        const csvRows = [headers.join(',')];
        
        customersData.forEach(c => {
            const row = [
                c.id,
                `"${c.name}"`,
                `"${c.phone}"`,
                c.peoples,
                `"${c.date}"`,
                c.totalSpent.toFixed(2),
                c.status
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customers_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            cell: (row) => <span className="text-gray-900 dark:text-white font-semibold text-xs">{row.id}</span> 
        },
        { 
            header: "Customer Name", 
            cell: (row) => <span className="text-gray-900 dark:text-white font-bold text-[11px]">{row.name}</span> 
        },
        { 
            header: "Contact Number", 
            cell: (row) => <span className="text-gray-600 dark:text-slate-400 font-semibold text-[11px]">{row.phone}</span> 
        },
        { 
            header: "No. of Peoples", 
            cell: (row) => <span className="text-gray-600 dark:text-slate-400 font-semibold text-[11px] ml-4">{row.peoples}</span> 
        },
        { 
            header: "Date", 
            cell: (row) => <span className="text-gray-600 dark:text-slate-400 font-semibold text-[11px]">{row.date}</span> 
        },
        { 
            header: "Total Spent", 
            cell: (row) => <span className="text-gray-900 dark:text-white font-bold text-[11px]">₹{row.totalSpent.toFixed(2)}</span> 
        },
        { 
            header: "Actions", 
            className: "text-right",
            cellClassName: "text-right",
            cell: (row) => (
                <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => setSelectedCustomer(row)}
                        className={`p-1.5 rounded-lg transition-colors ${selectedCustomer?.id === row.id ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
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
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Total Customers</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{totalCustomers}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold mt-1">All registered customers</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
                    <div className="w-14 h-14 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Active Customers</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{activeCustomers}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold mt-1">Currently active customers</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
                    <div className="w-14 h-14 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">New Customers <span className="text-gray-400 dark:text-slate-500 font-medium">(This Month)</span></p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{newCustomersThisMonth}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold mt-1">Joined this month</p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className={`flex flex-col xl:flex-row gap-6 items-start ${selectedCustomer ? '' : 'w-full'}`}>
                
                {/* Data Table */}
                <div className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col w-full transition-colors ${selectedCustomer ? 'xl:w-1/2 2xl:w-3/5' : ''}`}>
                    
                    {/* Toolbar */}
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search by name or contact number..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-80 transition-all font-medium placeholder-gray-400 dark:placeholder-slate-500"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    className="flex items-center justify-between min-w-[140px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                >
                                    <div className="flex items-center">
                                        <Filter className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                        {statusFilter === 'All' ? 'All Statuses' : statusFilter}
                                    </div>
                                    <svg className={`w-3.5 h-3.5 ml-2 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top transition-all duration-200">
                                        {['All', 'Active', 'Completed', 'Cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setStatusFilter(status);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                                                    statusFilter === status 
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {status === 'All' ? 'All Statuses' : status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={exportToCSV}
                                className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5 mr-2 text-gray-500 dark:text-slate-400" />
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
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

                {/* Right Side: Customer Details Drawer / Pane */}
                {selectedCustomer && (
                    <>
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden transition-opacity" 
                            onClick={() => setSelectedCustomer(null)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0 xl:static xl:w-1/2 2xl:w-2/5 xl:max-w-none xl:rounded-xl xl:shadow-sm xl:border xl:border-gray-100 xl:dark:border-slate-800 xl:transform-none xl:z-0 xl:h-auto">
                            
                            {/* Header Profile */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl transition-colors">
                                <div className="flex justify-between items-center mb-4 xl:justify-end">
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white xl:hidden">Customer Details</h2>
                                    <button 
                                        onClick={() => setSelectedCustomer(null)}
                                        className="rounded-lg p-2 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
                                </div>
    
                                <div className="flex items-start">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-lg font-black shrink-0 mr-4">
                                        {selectedCustomer.initials}
                                    </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white leading-none">{selectedCustomer.name}</h2>
                                        <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100 dark:border-green-500/20">
                                            {selectedCustomer.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-gray-600 dark:text-slate-400 space-x-4">
                                        <span className="flex items-center">
                                            <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                                            {selectedCustomer.phone}
                                        </span>
                                        <span className="flex items-center">
                                            <Users2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                                            {selectedCustomer.peoples} Peoples
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Activity Timeline */}
                        <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 p-6 rounded-b-xl transition-colors">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Customer Activity <span className="text-gray-500 dark:text-slate-400 font-medium">(Order History)</span></h3>

                            <div className="min-w-[500px]">
                                {/* Timeline Table Header */}
                                <div className="flex items-center text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                                <div className="w-[90px] pl-8">Order ID</div>
                                <div className="flex-1 pl-2">Date & Time</div>
                                <div className="w-14 text-center">Items</div>
                                <div className="w-20 text-right">Amount</div>
                                <div className="w-20 text-right">Payment</div>
                                <div className="w-20 text-right">Status</div>
                            </div>

                            <div className="relative pl-3 space-y-7 mt-2 pb-4">
                                {/* The vertical connecting line */}
                                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-green-200 dark:bg-green-500/30 border-l border-dashed border-green-300 dark:border-green-500/50"></div>
                                
                                {selectedCustomer.orders.map((order, idx) => {
                                    const dateObj = new Date(order.created_at);
                                    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    return (
                                    <div 
                                        key={idx} 
                                        onClick={() => navigate(`${basePath}/orders/${order.id}`)}
                                        className="relative flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors -ml-2"
                                    >
                                        {/* Icon & Order ID */}
                                        <div className="w-[90px] flex items-center">
                                            <div className="w-6 h-6 rounded bg-green-50 dark:bg-green-500/10 text-green-500 dark:text-green-400 flex items-center justify-center shrink-0 z-10 border border-white dark:border-slate-900 shadow-sm absolute -left-[5px] ml-2">
                                                <Receipt className="w-3 h-3" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-[11px] pl-8 ml-2">{order.id}</span>
                                        </div>
                                        
                                        {/* Date & Time */}
                                        <div className="flex-1 min-w-0 pl-2 pr-2">
                                            <div className="font-semibold text-gray-700 dark:text-slate-300 text-[11px] leading-tight truncate">{formattedDate}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-0.5 truncate">{formattedTime}</div>
                                        </div>

                                        {/* Items */}
                                        <div className="w-14 text-center text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                                            {order.items.length} Items
                                        </div>

                                        {/* Amount */}
                                        <div className="w-20 text-right text-[11px] font-bold text-gray-900 dark:text-white">
                                            ₹{parseFloat(order.total_amount).toFixed(2)}
                                        </div>

                                        {/* Payment */}
                                        <div className="w-20 text-right text-[11px] font-semibold text-gray-600 dark:text-slate-400">
                                            -
                                        </div>

                                        {/* Status */}
                                        <div className="w-20 flex justify-end">
                                            <span className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                )})}
                            </div>
                            </div>
                        </div>

                        {/* View All Button */}
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center mt-auto shrink-0 transition-colors">
                            <button 
                                onClick={() => navigate(`${basePath}/orders`, { state: { searchCustomer: selectedCustomer.phone !== '-' ? selectedCustomer.phone : selectedCustomer.name } })}
                                className="w-full sm:w-auto min-w-[200px] bg-[#3b82f6] text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                            >
                                View Full Order History
                            </button>
                        </div>

                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Customers;
