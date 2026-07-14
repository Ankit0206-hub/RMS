import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Search, Filter, Download, 
    ClipboardList, Clock, CheckCircle2, IndianRupee, RotateCcw, 
    Eye, MoreVertical 
} from 'lucide-react';
import { DataTable, Pagination } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

const OperatorOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Orders');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    const { data: ordersResponse, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await api.get('/admin/ordering/orders', {
                params: { page: 1, page_size: 1000 }
            });
            return response.data;
        },
        refetchInterval: 30000 // auto-refresh every 30 seconds for operator dashboard
    });

    const ordersData = useMemo(() => {
        if (!ordersResponse?.data) return [];
        return ordersResponse.data.map(order => {
            const dateObj = new Date(order.created_at);
            return {
                id: `#ORD${order.id}`,
                rawId: order.id,
                date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                customerName: order.customer_name || 'Walk-in Customer',
                customerPhone: order.customer_phone || '-',
                table: order.table_number || '-',
                type: order.order_type || 'Take Away',
                amount: order.total_amount || 0.00,
                status: order.status,
                waiterName: 'Amit Verma', // Waiter assignment logic pending in backend
                items: null // We'll mock this in the details panel until backend provides nested items
            };
        });
    }, [ordersResponse]);

    const getStatusPill = (status) => {
        switch(status) {
            case 'Completed':
            case 'Served': return 'text-green-600 bg-green-50';
            case 'Preparing': return 'text-[#5e5ce6] bg-indigo-50';
            case 'New':
            case 'Confirmed': return 'text-orange-500 bg-orange-50';
            case 'Cancelled': return 'text-red-500 bg-red-50';
            case 'Ready': return 'text-[#5e5ce6] bg-indigo-50';
            default: return 'text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50';
        }
    };

    const handleViewOrder = (order) => {
        navigate(`/operator/orders/${order.rawId}`);
    };

    const columns = [
        { 
            header: "Order ID", 
            cell: (row) => (
                <div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'New' || row.status === 'Confirmed' ? 'bg-orange-500' : row.status === 'Preparing' ? 'bg-[#5e5ce6]' : row.status === 'Completed' || row.status === 'Served' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-bold text-gray-900 dark:text-white text-[11px]">{row.id}</span>
                        {row.status === 'New' && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[8px] rounded">New</span>}
                    </div>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">{row.type}</div>
                </div>
            )
        },
        { 
            header: "Table", 
            cell: (row) => (
                <div>
                    <span className="font-bold text-gray-900 dark:text-white text-[11px]">{row.table}</span>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">4 Seats</div>
                </div>
            ) 
        },
        { 
            header: "Customer", 
            cell: (row) => (
                <div>
                    <div className="flex items-center space-x-1.5">
                        <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white text-[11px]">{row.customerName}</div>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1 ml-5.5">{row.customerPhone}</div>
                </div>
            )
        },
        { 
            header: "Waiter", 
            cell: (row) => <span className="font-bold text-gray-900 dark:text-white text-[11px]">{row.waiterName}</span> 
        },
        { 
            header: "Time", 
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-white text-[11px]">{row.time}</div>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">Today</div>
                </div>
            )
        },
        { 
            header: "Status", 
            cell: (row) => <span className={`px-2 py-1 rounded text-[9px] font-bold ${getStatusPill(row.status)}`}>{row.status}</span> 
        },
        { 
            header: "Amount", 
            cell: (row) => <span className="font-bold text-gray-900 dark:text-white text-[11px]">₹ {row.amount.toFixed(2)}</span> 
        },
        { 
            header: "Action", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleViewOrder(row); }} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 transition-colors"><MoreVertical className="h-3.5 w-3.5" /></button>
                </div>
            )
        }
    ];

    const totalOrders = ordersData.length;
    const newOrders = ordersData.filter(o => o.status === 'New' || o.status === 'Confirmed').length;
    const preparingOrders = ordersData.filter(o => o.status === 'Preparing').length;
    const readyOrders = ordersData.filter(o => o.status === 'Ready').length;
    const servedOrders = ordersData.filter(o => o.status === 'Completed' || o.status === 'Served').length;
    const cancelledOrders = ordersData.filter(o => o.status === 'Cancelled').length;

    const tabs = [
        { name: 'All Orders', count: null },
        { name: 'New', count: newOrders },
        { name: 'Preparing', count: preparingOrders },
        { name: 'Ready', count: readyOrders },
        { name: 'Served', count: servedOrders },
        { name: 'Cancelled', count: cancelledOrders },
    ];

    const filteredData = ordersData.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              o.table.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesTab = true;
        if (activeTab === 'New') matchesTab = o.status === 'New' || o.status === 'Confirmed';
        if (activeTab === 'Preparing') matchesTab = o.status === 'Preparing';
        if (activeTab === 'Ready') matchesTab = o.status === 'Ready';
        if (activeTab === 'Served') matchesTab = o.status === 'Completed' || o.status === 'Served';
        if (activeTab === 'Cancelled') matchesTab = o.status === 'Cancelled';

        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-4 pb-10 font-inter max-w-7xl mx-auto">
            
            {/* Header Title if not handled by layout */}
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-indigo-50 rounded-xl text-[#5e5ce6]">
                        <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Total Orders</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{totalOrders}</p>
                            <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mb-0.5">Today</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-orange-100 shadow-sm flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-orange-50 rounded-xl text-orange-500">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">New Orders</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{newOrders}</p>
                        </div>
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-1 truncate">Need Confirmation</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-500">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Preparing</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{preparingOrders}</p>
                        </div>
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-1 truncate">In Kitchen</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-purple-100 shadow-sm flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-xl text-purple-500">
                        <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Ready to Serve</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{readyOrders}</p>
                        </div>
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-1 truncate">Ready for Waiter</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-green-100 shadow-sm flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-green-50 rounded-xl text-green-500">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">Served</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{servedOrders}</p>
                        </div>
                        <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-1 truncate">Completed Orders</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-6 border-b border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide pt-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => { setActiveTab(tab.name); setCurrentPage(1); }}
                        className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                            activeTab === tab.name 
                            ? 'border-[#5e5ce6] text-[#5e5ce6]' 
                            : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
                        }`}
                    >
                        {tab.name} {tab.count !== null && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Main Data Table Area */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center bg-white dark:bg-slate-900">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID, Table, Customer or Waiter..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-80 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                        <div className="flex flex-col space-y-1 shrink-0">
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500">Date</label>
                            <select className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]">
                                <option>May 20, 2025</option>
                                <option>Today</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col space-y-1 shrink-0">
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500">Order Type</label>
                            <select className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]">
                                <option>All</option>
                                <option>Dine In</option>
                                <option>Take Away</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col space-y-1 shrink-0">
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500">Table</label>
                            <select className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]">
                                <option>All</option>
                                <option>T-01</option>
                                <option>T-02</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col space-y-1 shrink-0">
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500">Status</label>
                            <select className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]">
                                <option>All</option>
                                <option>New</option>
                                <option>Preparing</option>
                            </select>
                        </div>
                        
                        <div className="flex items-end shrink-0 pt-[14px]">
                            <button className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-slate-500" />
                                Filters
                            </button>
                        </div>

                        <div className="flex items-end shrink-0 pt-[14px]">
                            <button className="flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 w-7 h-7 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1">
                    <DataTable 
                        columns={columns} 
                        data={filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
                        isLoading={isLoading} 
                        emptyMessage="No orders found." 
                        onRowClick={(row) => handleViewOrder(row)}
                    />
                </div>

                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                    itemName="orders"
                />
            </div>

            <style>{`
                /* Override DataTable base styles for this specific page to match design */
                th {
                    text-transform: none !important;
font-size: 11px !important;
                    font-weight: 700 !important;
                    padding-top: 14px !important;
                    padding-bottom: 14px !important;
                    border-bottom-width: 2px !important;
                    border-bottom-
}
                td {
                    padding-top: 16px !important;
                    padding-bottom: 16px !important;
                    border-bottom-
}
                tr {
                    border-bottom-
}
                tr:hover {
                    background-
}
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default OperatorOrders;
