import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ChevronRight, Search, Filter, RefreshCw, Eye, Edit2, MoreVertical, X, CheckCircle2, Clock, Map, Users, Square, RefreshCcw, Trash } from 'lucide-react';

const Tables = () => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: tablesResponse, isLoading, refetch } = useQuery({
        queryKey: ['operator-tables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables', { params: { page: 1, page_size: 1000 } });
            return res.data;
        }
    });

    const tables = tablesResponse?.data || [];

    const totalTables = tables.length;
    const available = tables.filter(t => t.status === 'Available').length;
    const occupied = tables.filter(t => t.status === 'Occupied').length;
    const reserved = tables.filter(t => t.status === 'Reserved').length;
    const cleaning = tables.filter(t => t.status === 'Cleaning').length;
    const outOfService = tables.filter(t => t.status === 'Out of Service' || t.status === 'Out of Order').length;

    const filteredTables = tables.filter(t => {
        if (searchTerm && !t.table_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !(t.floor || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
            case 'Occupied': return { text: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500' };
            case 'Reserved': return { text: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' };
            case 'Cleaning': return { text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
            default: return { text: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-800/50', dot: 'bg-gray-500' };
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter">Loading Tables...</div>;

    return (
        <div className="flex h-full font-inter overflow-hidden">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedTable ? 'lg:mr-[380px]' : ''}`}>
                <div className="overflow-y-auto flex-1 scrollbar-hide space-y-4">
                    {/* Header Action Buttons */}
                    <div className="flex justify-end mb-4">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                            <span className="text-lg mr-1">+</span> Add Table
                        </button>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4"><Map size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Tables</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{totalTables}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">All Tables</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 mr-4"><Square size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Available</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{available}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((available/totalTables)*100 || 0)}%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-orange-50 text-orange-500 mr-4"><Users size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Occupied</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{occupied}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((occupied/totalTables)*100 || 0)}%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4"><Users size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Reserved</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{reserved}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((reserved/totalTables)*100 || 0)}%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4"><Clock size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Cleaning</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{cleaning}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((cleaning/totalTables)*100 || 0)}%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                            <div className="p-3 rounded-lg bg-red-50 text-red-500 mr-4"><Trash size={20} /></div>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">Out of Service</p>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{outOfService}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((outOfService/totalTables)*100 || 0)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between rounded-t-2xl">
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search table by number or section..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Section</p>
                                    <select className="border border-gray-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-3 py-2 bg-white dark:bg-slate-900 outline-none min-w-[130px]">
                                        <option>All Sections</option>
                                        <option>Main Hall</option>
                                        <option>Garden Area</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Status</p>
                                    <select className="border border-gray-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-3 py-2 bg-white dark:bg-slate-900 outline-none min-w-[130px]">
                                        <option>All Status</option>
                                        <option>Available</option>
                                        <option>Occupied</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Capacity</p>
                                    <select className="border border-gray-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-3 py-2 bg-white dark:bg-slate-900 outline-none min-w-[130px]">
                                        <option>All Capacity</option>
                                        <option>2 Seats</option>
                                        <option>4 Seats</option>
                                    </select>
                                </div>
                                <button className="mt-4 flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                                    <Filter size={14} className="mr-2" /> Filters
                                </button>
                                <button onClick={() => refetch()} className="mt-4 flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors">
                                    <RefreshCw size={14} className="mr-2" /> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">
                                        <th className="px-5 py-4">Table No.</th>
                                        <th className="px-5 py-4">Section</th>
                                        <th className="px-5 py-4 text-center">Capacity</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Assigned Waiter</th>
                                        <th className="px-5 py-4 text-center">Current Guests</th>
                                        <th className="px-5 py-4 text-center">Current Orders</th>
                                        <th className="px-5 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTables.map((table) => {
                                        const statusColors = getStatusColor(table.status);
                                        return (
                                            <tr key={table.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50/50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className="font-bold text-gray-900 dark:text-white text-[13px]">{table.table_number}</span>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-indigo-900">
                                                    {table.floor || 'Main Hall'}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-bold text-gray-900 dark:text-white">
                                                    {table.capacity} Seats
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-[10px] font-bold ${statusColors.text}`}>
                                                        {table.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {table.assigned_waiter_name ? (
                                                        <div className="flex items-center gap-2">
                                                            <img src={`https://ui-avatars.com/api/?name=${table.assigned_waiter_name}&background=random`} className="w-6 h-6 rounded-full" />
                                                            <span className="font-semibold text-gray-800 dark:text-slate-200">{table.assigned_waiter_name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-400">
                                                    {table.status === 'Occupied' ? (table.capacity - 1) : 0}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-400">
                                                    {table.current_order_id ? 1 : 0}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => setSelectedTable(table)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Eye size={15} /></button>
                                                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit2 size={15} /></button>
                                                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><MoreVertical size={15} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-over Panel (Table Details) */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${selectedTable ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedTable && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Table Details</h3>
                            <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            
                            {/* Profile Header */}
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 shrink-0">
                                    <Square size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mr-3">{selectedTable.table_number}</h2>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(selectedTable.status).text} ${getStatusColor(selectedTable.status).bg}`}>
                                            {selectedTable.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Map size={14} className="mr-2" /> Section</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{selectedTable.floor || 'Main Hall'}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Users size={14} className="mr-2" /> Capacity</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{selectedTable.capacity} Seats</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><CheckCircle2 size={14} className="mr-2" /> Status</div>
                                    <div className={`font-bold ${getStatusColor(selectedTable.status).text}`}>{selectedTable.status}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Users size={14} className="mr-2" /> Assigned Waiter</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{selectedTable.assigned_waiter_name || 'Not Assigned'}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Users size={14} className="mr-2" /> Current Guests</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{selectedTable.status === 'Occupied' ? (selectedTable.capacity - 1) : 0}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Clock size={14} className="mr-2" /> Current Orders</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{selectedTable.current_order_id ? 1 : 0}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold"><Edit2 size={14} className="mr-2" /> Notes</div>
                                    <div className="font-bold text-gray-400">-</div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <h4 className="text-[11px] font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                                <div className="space-y-2.5">
                                    <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                                        <Edit2 size={14} className="mr-3 text-indigo-600" /> Edit Table
                                    </button>
                                    <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                                        <RefreshCcw size={14} className="mr-3 text-orange-600" /> Change Status
                                    </button>
                                    <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                        <Users size={14} className="mr-3 text-red-600" /> Clean Table
                                    </button>
                                    <button className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                                        <Eye size={14} className="mr-3 text-indigo-600" /> View Orders
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            
            {/* Mobile Backdrop for Slide-over */}
            {selectedTable && (
                <div 
                    className="fixed inset-0 bg-gray-900/20 z-10 lg:hidden"
                    onClick={() => setSelectedTable(null)}
                />
            )}
        </div>
    );
};

export default Tables;
