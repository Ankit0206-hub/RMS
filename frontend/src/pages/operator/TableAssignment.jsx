import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
    Calendar, Clock, User, Users, Info, Plus, ChevronDown, 
    MoreVertical, Search, Filter, Trash2, Printer, Download, Eye
} from 'lucide-react';

const TableAssignment = () => {
    const queryClient = useQueryClient();
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedWaiter, setSelectedWaiter] = useState('');
    const [searchWaiter, setSearchWaiter] = useState('');

    // Fetch Tables
    const { data: tablesData, isLoading: tablesLoading } = useQuery({
        queryKey: ['adminTables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables', { params: { page: 1, page_size: 1000 } });
            return res.data.data;
        }
    });

    // Fetch Waiters
    const { data: employeesData, isLoading: employeesLoading } = useQuery({
        queryKey: ['adminEmployees'],
        queryFn: async () => {
            const res = await api.get('/admin/employees', { params: { page: 1, page_size: 100 } });
            return res.data.data;
        }
    });

    // Mutations
    const assignMutation = useMutation({
        mutationFn: async ({ tableId, employeeId }) => {
            const res = await api.post(`/admin/tables/${tableId}/assign`, { employee_id: employeeId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTables']);
            setSelectedWaiter('');
            setSelectedTable(null);
        }
    });

    const unassignMutation = useMutation({
        mutationFn: async (tableId) => {
            const res = await api.delete(`/admin/tables/${tableId}/assign`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTables']);
            if (selectedTable) {
                setSelectedTable(prev => ({...prev, assigned_waiter_name: null, assigned_waiter_id: null}));
            }
        }
    });

    if (tablesLoading || employeesLoading) return <div className="p-8 text-center text-gray-500 font-inter text-[15px] font-bold">Loading Floor Data...</div>;

    const tables = tablesData || [];
    const waiters = (employeesData || [])
        .filter(e => e.role_name?.toLowerCase() === 'waiter' || e.role_id === 2 || e.role_id === 3)
        .map(w => ({ ...w, full_name: `${w.first_name} ${w.last_name}`.trim() }));
    
    // Filter waiters by search
    const filteredWaiters = waiters.filter(w => w.full_name.toLowerCase().includes(searchWaiter.toLowerCase()));

    // Metrics
    const totalTables = tables.length;
    const assignedTables = tables.filter(t => t.assigned_waiter_id).length;
    const unassignedTables = tables.filter(t => !t.assigned_waiter_id).length;
    const assignedPercentage = totalTables > 0 ? Math.round((assignedTables / totalTables) * 100) : 0;
    const unassignedPercentage = totalTables > 0 ? Math.round((unassignedTables / totalTables) * 100) : 0;

    const activeWaiters = waiters.length; 
    const availableWaiters = waiters.filter(w => !w.status || w.status !== 'Inactive').length; 

    const handleAssign = () => {
        if (!selectedTable || !selectedWaiter) return;
        assignMutation.mutate({ tableId: selectedTable.id, employeeId: parseInt(selectedWaiter) });
    };

    const handleUnassign = (tableId) => {
        unassignMutation.mutate(tableId);
    };

    // Calculate workload per waiter
    const waiterWorkload = waiters.map(w => {
        const assigned = tables.filter(t => t.assigned_waiter_id === w.id).length;
        return { ...w, assignedCount: assigned };
    }).sort((a, b) => b.assignedCount - a.assignedCount);

    return (
        <div className="space-y-6 pb-12 font-inter">
            {/* KPI TOP BAR */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500 mr-4"><Calendar size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Total Tables</p>
                        <h4 className="text-[22px] font-bold text-gray-900 leading-tight">{totalTables}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">All Tables</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500 mr-4"><Users size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Assigned Tables</p>
                        <h4 className="text-[22px] font-bold text-gray-900 leading-tight">{assignedTables}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{assignedPercentage}% of total</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-500 mr-4"><User size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Unassigned Tables</p>
                        <h4 className="text-[22px] font-bold text-gray-900 leading-tight">{unassignedTables}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{unassignedPercentage}% of total</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-500 mr-4"><Users size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Active Waiters</p>
                        <h4 className="text-[22px] font-bold text-gray-900 leading-tight">{activeWaiters}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">On Duty</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg text-green-500 mr-4"><User size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Available Waiters</p>
                        <h4 className="text-[22px] font-bold text-gray-900 leading-tight">{availableWaiters}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Available Now</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-500 mr-4"><Clock size={20} /></div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">Current Shift</p>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight whitespace-nowrap mt-1">Morning Shift</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">07:00 AM - 03:00 PM</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: RESTAURANT FLOOR */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-gray-100 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900 flex items-center cursor-pointer">
                                Restaurant Floor (Main Hall) <ChevronDown size={16} className="ml-2 text-gray-400" />
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Available</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span> Occupied</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Reserved</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span> Cleaning</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Out of Service</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-300 mr-1.5"></span> Unassigned</span>
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {tables.map(table => {
                                let statusColors = { border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' };
                                if (table.status === 'Occupied') statusColors = { border: 'border-orange-300', text: 'text-orange-600', dot: 'bg-orange-500' };
                                else if (table.status === 'Reserved') statusColors = { border: 'border-blue-300', text: 'text-blue-600', dot: 'bg-blue-500' };
                                else if (table.status === 'Cleaning') statusColors = { border: 'border-purple-300', text: 'text-purple-600', dot: 'bg-purple-500' };
                                else if (table.status === 'Out of Service') statusColors = { border: 'border-red-300', text: 'text-red-600', dot: 'bg-red-500' };

                                // Unassigned overrides borders
                                const isUnassigned = !table.assigned_waiter_id;
                                const isSelected = selectedTable?.id === table.id;
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => setSelectedTable(table)}
                                        className={`relative border rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                            isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 border-indigo-200 bg-indigo-50/30' : 
                                            isUnassigned ? 'border-gray-200 bg-gray-50/50 hover:border-gray-300' : 
                                            `${statusColors.border} hover:shadow-md`
                                        }`}
                                    >
                                        <h4 className="text-[15px] font-bold text-gray-900">{table.table_number}</h4>
                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{table.capacity} Seats</p>
                                        
                                        <div className={`text-[11px] font-bold mt-2 mb-2 ${statusColors.text}`}>
                                            {table.status}
                                        </div>
                                        
                                        <div className={`flex items-center justify-center text-[11px] font-bold w-full truncate ${isUnassigned ? 'text-gray-400' : 'text-gray-700'}`}>
                                            <User size={12} className="mr-1 shrink-0" /> 
                                            <span className="truncate">{table.assigned_waiter_name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 rounded-b-2xl text-[11px] font-semibold text-gray-600">
                        <div className="flex items-center text-indigo-600">
                            <Info size={14} className="mr-1.5" /> Drag & drop waiter to assign table (or use panel)
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                Select Multiple
                            </label>
                            <button className="flex items-center border border-indigo-200 text-indigo-600 bg-white px-3 py-1.5 rounded-lg hover:bg-indigo-50">
                                <Plus size={14} className="mr-1" /> Bulk Actions
                            </button>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: WAITERS & ASSIGN */}
                <div className="lg:col-span-3 flex flex-col space-y-6">
                    {/* Waiters List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="p-5 border-b border-gray-100 shrink-0">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-4">Waiters ({waiters.length})</h3>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search waiter..." 
                                        value={searchWaiter}
                                        onChange={e => setSearchWaiter(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Filter size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="p-2 overflow-y-auto flex-1 h-[250px]">
                            {filteredWaiters.map(waiter => {
                                const workload = waiterWorkload.find(w => w.id === waiter.id)?.assignedCount || 0;
                                const isBusy = workload > 3; // mock logic
                                const statusClass = isBusy ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50";
                                const statusText = isBusy ? "Busy" : "Available";

                                return (
                                    <div key={waiter.id} className="flex items-center p-3 hover:bg-gray-50 rounded-xl cursor-grab transition-colors border border-transparent hover:border-gray-100">
                                        <div className="text-gray-300 cursor-grab mr-2"><MoreVertical size={16} /></div>
                                        <img src={`https://ui-avatars.com/api/?name=${waiter.full_name}&background=random`} alt={waiter.full_name} className="w-10 h-10 rounded-full mr-3 border border-gray-200" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="text-[13px] font-bold text-gray-900 truncate pr-2">{waiter.full_name}</h4>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusClass}`}>{statusText}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate">{workload} Tables • Main Hall</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Assign Panel */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 flex flex-col h-[326px]">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center"><User size={16} className="mr-2 text-indigo-500"/> Assign Table</h3>
                        
                        <div className="mb-4">
                            <p className="text-[11px] font-semibold text-gray-500 mb-2">Selected Table</p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center">
                                        <h4 className="text-[18px] font-black text-gray-900 mr-3">{selectedTable ? selectedTable.table_number : 'None'}</h4>
                                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{selectedTable?.assigned_waiter_id ? 'Assigned' : 'Unassigned'}</span>
                                    </div>
                                    <p className="text-[11px] font-semibold text-gray-500 mt-1">Capacity: {selectedTable?.capacity || '-'} Seats</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-semibold mb-1">Status</p>
                                    <p className="text-[11px] font-bold text-gray-800">{selectedTable?.status || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-[11px] font-semibold text-gray-500 mb-2">Assign To Waiter</p>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-700 focus:outline-none focus:border-indigo-500"
                                value={selectedWaiter}
                                onChange={(e) => setSelectedWaiter(e.target.value)}
                                disabled={!selectedTable}
                            >
                                <option value="">Select waiter...</option>
                                {waiters.map(w => (
                                    <option key={w.id} value={w.id}>{w.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-auto space-y-2">
                            <button 
                                onClick={handleAssign}
                                disabled={!selectedTable || !selectedWaiter || assignMutation.isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors"
                            >
                                {assignMutation.isLoading ? 'Assigning...' : 'Assign Table'}
                            </button>
                            {selectedTable?.assigned_waiter_id && (
                                <button 
                                    onClick={() => handleUnassign(selectedTable.id)}
                                    disabled={unassignMutation.isLoading}
                                    className="w-full border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-[13px] py-2.5 rounded-xl transition-colors"
                                >
                                    Remove Assignment
                                </button>
                            )}
                            <button className="w-full flex items-center justify-center text-gray-500 hover:text-indigo-600 font-semibold text-[11px] py-2">
                                <Eye size={14} className="mr-1.5" /> View Table Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SUMMARY & WORKLOAD */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Floor Summary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Floor Summary</h3>
                        
                        <div className="flex items-center mb-6">
                            {/* Simple CSS Donut Chart */}
                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0 mr-4" style={{
                                background: `conic-gradient(#10b981 ${assignedPercentage}%, #e5e7eb ${assignedPercentage}%)`
                            }}>
                                <div className="absolute w-16 h-16 bg-white rounded-full"></div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center text-[11px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> 
                                    {assignedTables} Assigned ({assignedPercentage}%)
                                </div>
                                <div className="flex items-center text-[11px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 mr-2"></span> 
                                    {unassignedTables} Unassigned ({unassignedPercentage}%)
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-[13px] font-bold text-gray-800">Unassigned Tables ({unassignedTables})</h4>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                            </div>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                {tables.filter(t => !t.assigned_waiter_id).slice(0, 6).map(table => (
                                    <div key={table.id} className="flex justify-between items-center text-[11px]">
                                        <span className="font-bold text-gray-900 w-12">{table.table_number}</span>
                                        <span className="text-gray-500 font-medium">{table.capacity} Seats</span>
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">Unassigned</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Waiter Workload */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900">Waiter Workload</h3>
                            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                        </div>
                        <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
                            {waiterWorkload.slice(0, 5).map(waiter => {
                                const maxTables = 10; // arbitrary max for visual scale
                                const widthPct = Math.min((waiter.assignedCount / maxTables) * 100, 100);
                                return (
                                    <div key={waiter.id}>
                                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 mb-1">
                                            <span>{waiter.full_name}</span>
                                            <span>{waiter.assignedCount} Tables</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${widthPct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-center p-2.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Printer size={14} className="mr-2" /> Print Assignment Sheet
                            </button>
                            <button className="w-full flex items-center justify-center p-2.5 border border-red-100 bg-red-50 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 size={14} className="mr-2" /> Remove All Assignments
                            </button>
                            <button className="w-full flex items-center justify-center p-2.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download size={14} className="mr-2" /> Export to PDF
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TableAssignment;