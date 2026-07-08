import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Search, Edit2, MoreVertical, LayoutGrid, Calendar, Settings, Filter, Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DataTable, Pagination } from '../../components/ui';
import EditTableModal from './EditTableModal';

const Tables = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [floorFilter, setFloorFilter] = useState('All Floors');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTable, setEditingTable] = useState(null);

    const { data: tablesResponse, isLoading } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await api.get('/admin/tables', {
                params: { page: 1, page_size: 1000 }
            });
            return response.data;
        }
    });

    const tablesData = tablesResponse?.data || [];

    const totalTables = tablesData.length;
    const available = tablesData.filter(t => t.status === 'Available').length;
    const occupied = tablesData.filter(t => t.status === 'Occupied').length;
    const reserved = tablesData.filter(t => t.status === 'Reserved').length;
    const outOfOrder = tablesData.filter(t => t.status === 'Out of Order').length;

    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return 'text-green-600 bg-green-50';
            case 'Occupied': return 'text-orange-500 bg-orange-50';
            case 'Reserved': return 'text-indigo-600 bg-indigo-50';
            case 'Out of Order': return 'text-red-500 bg-red-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const columns = [
        { 
            header: "Table No.", 
            cell: (row) => <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${getStatusColor(row.status)}`}>{row.table_number}</span> 
        },
        { 
            header: "Table Name", 
            cell: (row) => <span className="font-bold text-gray-900 text-[13px]">{row.name || 'N/A'}</span> 
        },
        { 
            header: "Floor", 
            cell: (row) => <span className="font-semibold text-gray-600 text-xs">{row.floor || 'N/A'}</span> 
        },
        { 
            header: "Capacity", 
            cell: (row) => <span className="font-bold text-gray-900 text-xs">{row.capacity}</span> 
        },
        { 
            header: "Status", 
            cell: (row) => <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusColor(row.status)}`}>{row.status}</span> 
        },
        { 
            header: "Current Order", 
            cell: (row) => (
                row.current_order_id ? (
                    <div>
                        <div className="font-bold text-gray-900 text-xs">{row.current_order_id}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{row.current_order_amount}</div>
                    </div>
                ) : (
                    <span className="text-gray-400 font-medium">-</span>
                )
            )
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button 
                        onClick={() => setEditingTable(row)}
                        className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical className="h-4 w-4" /></button>
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
                        <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Total Tables</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{totalTables}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-400 mt-4 text-center">
                        All Floors
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-50 rounded-full text-green-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Available</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{available}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-4 text-center">
                        {totalTables ? Math.round((available / totalTables) * 100) : 0}% of total
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-50 rounded-full text-orange-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Occupied</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{occupied}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-4 text-center">
                        {totalTables ? Math.round((occupied / totalTables) * 100) : 0}% of total
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-50 rounded-full text-red-500">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Reserved</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{reserved}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-4 text-center">
                        {totalTables ? Math.round((reserved / totalTables) * 100) : 0}% of total
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-500">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 mb-0.5">Out of Order</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{outOfOrder}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-4 text-center">
                        {totalTables ? Math.round((outOfOrder / totalTables) * 100) : 0}% of total
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 gap-6">
                
                {/* Data Table */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                        <h3 className="font-bold text-gray-900 text-[15px]">All Tables</h3>
                        
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search table by number or name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
                                />
                            </div>
                            
                            <select className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                                <option>All Floors</option>
                                <option>Ground Floor</option>
                                <option>First Floor</option>
                                <option>Terrace</option>
                            </select>
                            
                            <select className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                                <option>All Status</option>
                                <option>Available</option>
                                <option>Occupied</option>
                                <option>Reserved</option>
                            </select>

                            <button className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                <Filter className="w-3.5 h-3.5 mr-1.5" />
                                Filters
                            </button>
                            
                            <button 
                                onClick={() => navigate('/admin/tables/add')}
                                className="flex items-center bg-[#6366f1] text-white px-3 py-2 rounded-lg text-xs font-bold shadow hover:bg-indigo-600 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Table
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <DataTable 
                            columns={columns} 
                            data={tablesData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} 
                            isLoading={false} 
                            emptyMessage="No tables found." 
                        />
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalItems={tablesData.length}
                        itemsPerPage={rowsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(val) => {
                            setRowsPerPage(val);
                            setCurrentPage(1);
                        }}
                        itemName="tables"
                    />
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
                    padding-top: 10px !important;
                    padding-bottom: 10px !important;
                    border-bottom-color: #f9fafb !important;
                }
                tr {
                    border-bottom-color: #f9fafb !important;
                }
            `}</style>

            <EditTableModal 
                isOpen={!!editingTable} 
                table={editingTable} 
                onClose={() => setEditingTable(null)} 
            />
        </div>
    );
};

export default Tables;
