import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Search, Eye, Filter, Download, 
    ClipboardList, CheckCircle2, Clock, XCircle, IndianRupee 
} from 'lucide-react';
import { DataTable, Pagination } from '../../components/ui';

const Orders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(location.state?.searchCustomer || '');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [orderTypeFilter, setOrderTypeFilter] = useState('All Order Type');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: ordersResponse, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await api.get('/admin/ordering/orders', {
                params: { page: 1, page_size: 1000 }
            });
            return response.data;
        }
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
                status: order.status
            };
        });
    }, [ordersResponse]);

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
                        onClick={() => navigate(`/admin/orders/${row.rawId}`)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Calculate KPIs
    const totalOrders = ordersData.length;
    const completedOrders = ordersData.filter(o => o.status === 'Completed').length;
    const preparingOrders = ordersData.filter(o => o.status === 'Preparing').length;
    const cancelledOrders = ordersData.filter(o => o.status === 'Cancelled').length;
    const totalRevenue = ordersData.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.amount, 0);

    const filteredData = ordersData.filter(o => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = o.id.toLowerCase().includes(term) ||
               o.customerName.toLowerCase().includes(term) ||
               o.customerPhone.toLowerCase().includes(term) ||
               o.table.toLowerCase().includes(term);
               
        const matchesStatus = statusFilter === 'All Status' || o.status === statusFilter;
        const matchesType = orderTypeFilter === 'All Order Type' || o.type === orderTypeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="space-y-2 pb-10 font-inter">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div 
                    className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${statusFilter === 'All Status' ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                    onClick={() => { setStatusFilter('All Status'); setCurrentPage(1); }}
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${statusFilter === 'Completed' ? 'border-green-400 ring-2 ring-green-50' : 'border-gray-100 hover:border-gray-300'}`}
                    onClick={() => { setStatusFilter('Completed'); setCurrentPage(1); }}
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Completed</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{completedOrders}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${statusFilter === 'Preparing' ? 'border-orange-400 ring-2 ring-orange-50' : 'border-gray-100 hover:border-gray-300'}`}
                    onClick={() => { setStatusFilter('Preparing'); setCurrentPage(1); }}
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Preparing</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{preparingOrders}</p>
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${statusFilter === 'Cancelled' ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-100 hover:border-gray-300'}`}
                    onClick={() => { setStatusFilter('Cancelled'); setCurrentPage(1); }}
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Cancelled</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{cancelledOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
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
                        <select 
                            className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All Status">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Served">Served</option>
                        </select>
                        
                        <select 
                            className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-4 py-2 outline-none"
                            value={orderTypeFilter}
                            onChange={(e) => { setOrderTypeFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All Order Type">All Order Type</option>
                            <option value="Dine In">Dine In</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Take Away">Take Away</option>
                        </select>
                        
                        <button className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Export
                        </button>
                    </div>
                </div>
                
                <div className="flex-1">
                    <DataTable 
                        columns={columns} 
                        data={filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
                        isLoading={isLoading} 
                        emptyMessage="No orders found." 
                        onRowClick={(row) => navigate(`/admin/orders/${row.rawId}`)}
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
                /* Override DataTable base styles for this specific page to match design perfectly */
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

export default Orders;
