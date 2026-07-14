import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Eye, Filter, Download, 
    FileText, CheckSquare, Clock, AlertCircle, RotateCcw,
    LayoutGrid, CreditCard, RefreshCcw, Settings, FileBox, Calculator, BarChart3, Receipt
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DataTable, Pagination } from '../../components/ui';
import api from '../../services/api';
import InvoiceModal from './InvoiceModal';

const Bills = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Invoices');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedBill, setSelectedBill] = useState(null);

    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalInvoices: 0,
        paidAmount: 0,
        pendingAmount: 0,
        refundedAmount: 0
    });

    const tabs = ['All Invoices', 'Paid', 'Pending', 'Partially Paid', 'Overdue', 'Cancelled'];

    useEffect(() => {
        fetchBills();
    }, [currentPage, itemsPerPage, activeTab]);

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            let statusQuery = '';
            if (activeTab !== 'All Invoices') {
                statusQuery = `&payment_status=${activeTab}`;
            }
            
            const response = await api.get(`/admin/billing/bills?page=${currentPage}&page_size=${itemsPerPage}${statusQuery}`);
            if (response.data.success) {
                setBills(response.data.data);
                setTotalItems(response.data.meta?.total || 0);
            }

            // Fetch all bills for calculating stats (temporary solution for demo)
            const statsResponse = await api.get(`/admin/billing/bills?page=1&page_size=10000`);
            if (statsResponse.data.success) {
                const allBills = statsResponse.data.data;
                let totalSales = 0;
                let paidAmt = 0;
                let pendingAmt = 0;
                let refundedAmt = 0;
                
                allBills.forEach(bill => {
                    const paid = bill.payments?.reduce((s, p) => s + p.amount, 0) || 0;
                    totalSales += bill.grand_total || 0;
                    paidAmt += paid;
                    pendingAmt += Math.max(0, (bill.grand_total || 0) - paid);
                    if (bill.payment_status === 'Refunded') {
                        refundedAmt += paid;
                    }
                });

                setStats({
                    totalSales,
                    totalInvoices: allBills.length,
                    paidAmount: paidAmt,
                    pendingAmount: pendingAmt,
                    refundedAmount: refundedAmt
                });
            }

        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Handle page changes
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const statsData = [
        { name: 'Paid', value: stats.paidAmount, color: '#22c55e' },
        { name: 'Pending', value: stats.pendingAmount, color: '#f97316' },
        { name: 'Refunded', value: stats.refundedAmount, color: '#3b82f6' },
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
            cell: (row) => <span className="font-bold text-blue-600 text-xs">{row.bill_number}</span> 
        },
        { 
            header: "Date & Time", 
            cell: (row) => {
                const dateObj = new Date(row.generated_at);
                const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return (
                    <div>
                        <div className="font-semibold text-gray-900 text-[11px]">{date}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{time}</div>
                    </div>
                );
            }
        },
        { 
            header: "Customer", 
            cell: (row) => <span className="font-semibold text-gray-900 text-[11px]">{row.session?.customer_name || 'Walk-in Customer'}</span>
        },
        { 
            header: "Contact Number", 
            cell: (row) => <span className="text-[11px] text-gray-500 font-medium">{row.session?.customer_phone || '-'}</span>
        },
        { 
            header: "Order ID", 
            cell: (row) => <span className="font-bold text-gray-600 text-[11px]">#ORD{row.session_id}</span> 
        },
        { 
            header: "Paid Amount", 
            cell: (row) => {
                const paid = row.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                return <span className="font-bold text-gray-800 text-[11px]">₹ {paid.toFixed(2)}</span>;
            }
        },
        { 
            header: "Payment Method", 
            cell: (row) => {
                const method = row.payments?.length > 0 ? row.payments[row.payments.length - 1].payment_method : '-';
                return <span className="font-semibold text-gray-600 text-[11px]">{method}</span>;
            }
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button 
                        onClick={() => setSelectedBill(row)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setSelectedBill(row)}
                        className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <Download className="h-4 w-4" />
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
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ {stats.totalSales.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-500">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Invoices</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">{stats.totalInvoices.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Paid Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ {stats.paidAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Pending Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ {stats.pendingAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Refunded Amount</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight">₹ {stats.refundedAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6">
                
                {/* Left Side: Data Table */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    


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
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Export
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <DataTable 
                            columns={columns} 
                            data={bills} 
                            isLoading={isLoading} 
                            emptyMessage="No invoices found." 
                        />
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                        itemName="invoices"
                    />
                </div>

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
            
            <InvoiceModal 
                isOpen={!!selectedBill} 
                onClose={() => setSelectedBill(null)} 
                bill={selectedBill} 
            />
        </div>
    );
};

export default Bills;
