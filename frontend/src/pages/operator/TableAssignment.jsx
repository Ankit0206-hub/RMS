import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { adminApi } from '../../services/adminApi';
import { 
    Calendar, Clock, User, Users, Info, Plus, ChevronDown, 
    MoreVertical, Search, Filter, Trash2, Printer, Download, Eye, AlertTriangle
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const TableAssignment = () => {
    const queryClient = useQueryClient();
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedWaiter, setSelectedWaiter] = useState('');
    const [searchWaiter, setSearchWaiter] = useState('');
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [targetTransferTable, setTargetTransferTable] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('All');

    // Fetch Tables
    const { data: tablesData, isLoading: tablesLoading } = useQuery({
        queryKey: ['adminTables'],
        queryFn: async () => {
            const res = await adminApi.getTables(1, 1000);
            return res.data || [];
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
        }
    });

    const unassignMutation = useMutation({
        mutationFn: async (tableId) => {
            const res = await api.delete(`/admin/tables/${tableId}/assign`);
            return res.data;
        }
    });

    const clearAllAssignmentsMutation = useMutation({
        mutationFn: async () => {
            const res = await api.delete('/admin/tables/assignments/clear-all');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminTables'] });
            setSelectedTables([]);
            setIsConfirmClearOpen(false);
        }
    });

    const transferMutation = useMutation({
        mutationFn: async ({ tableId, targetTableId }) => {
            const res = await api.post(`/admin/tables/${tableId}/transfer`, { target_table_id: targetTableId });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminTables'] });
            setSelectedTables([]);
            setIsTransferModalOpen(false);
            setTargetTransferTable('');
        }
    });

    // Fetch Reservations for dynamic status
    const { data: reservationsData } = useQuery({
        queryKey: ['adminReservations'],
        queryFn: async () => {
            const res = await adminApi.getReservations(1, 1000);
            return res.data || [];
        }
    });

    const currentTime = new Date();
    const activeReservations = (reservationsData || []).filter(r => r.status === 'Confirmed' || r.status === 'Pending');

    const tables = (tablesData || []).map(dbTable => {
        let status = dbTable.status || 'Available';
        // Clear dummy states
        if (status === 'Vacant' || status === 'Reserved') {
            status = 'Available';
        }

        // Apply dynamic Reserved status within 15 minutes
        if (status !== 'Occupied') {
            const tableRes = activeReservations.filter(r => r.table_id === dbTable.id);
            const nextRes = tableRes.find(r => new Date(r.reservation_time) > currentTime);
            if (nextRes) {
                const diffMins = (new Date(nextRes.reservation_time) - currentTime) / 60000;
                if (diffMins <= 15) {
                    status = 'Reserved';
                }
            }
        }
        return { ...dbTable, status };
    });

    const uniqueFloors = ['All', ...new Set(tables.map(t => t.floor || 'Main Hall'))];
    const filteredTablesByFloor = tables.filter(t => !t.parent_table_id && (selectedFloor === 'All' || (t.floor || 'Main Hall') === selectedFloor));

    const waiters = (employeesData || [])
        .filter(e => e.role_name?.toLowerCase() === 'waiter')
        .map(w => ({ ...w, full_name: `${w.first_name} ${w.last_name}`.trim() }));
    
    // Calculate workload per waiter and sort by ascending assigned tables
    const waiterWorkload = waiters.map(w => {
        const assigned = tables.filter(t => t.assigned_waiter_id === w.id).length;
        return { ...w, assignedCount: assigned };
    }).sort((a, b) => a.assignedCount - b.assignedCount);

    // Filter waiters by search
    const filteredWaiters = waiterWorkload.filter(w => w.full_name.toLowerCase().includes(searchWaiter.toLowerCase()));

    // Metrics
    const totalTables = tables.length;
    const assignedTables = tables.filter(t => t.assigned_waiter_id).length;
    const unassignedTables = tables.filter(t => !t.assigned_waiter_id).length;
    const assignedPercentage = totalTables > 0 ? Math.round((assignedTables / totalTables) * 100) : 0;
    const unassignedPercentage = totalTables > 0 ? Math.round((unassignedTables / totalTables) * 100) : 0;

    const activeWaiters = waiters.length; 
    const availableWaiters = waiters.filter(w => !w.status || w.status !== 'Inactive').length; 

    // Auto-cleanup for "zombie" waiters (waiters deleted from DB but still assigned to tables)
    React.useEffect(() => {
        if (!tablesData || !employeesData) return;
        
        const currentWaiters = employeesData.filter(e => e.role_name?.toLowerCase() === 'waiter');
        const activeWaiterIds = new Set(currentWaiters.map(w => w.id));
        const zombieTables = tablesData.filter(t => t.assigned_waiter_id && !activeWaiterIds.has(t.assigned_waiter_id));
        
        if (zombieTables.length > 0) {
            console.log(`Cleaning up ${zombieTables.length} zombie table assignments...`);
            Promise.all(zombieTables.map(t => api.delete(`/admin/tables/${t.id}/assign`)))
                .then(() => queryClient.invalidateQueries({ queryKey: ['adminTables'] }))
                .catch(console.error);
        }
    }, [tablesData, employeesData, queryClient]);

    const handleAssign = async () => {
        if (selectedTables.length === 0 || !selectedWaiter) return;
        
        const waiterId = parseInt(selectedWaiter);
        const tablesToAssign = selectedTables.filter(t => t.assigned_waiter_id !== waiterId);
        
        if (tablesToAssign.length === 0) {
             setSelectedTables([]);
             setSelectedWaiter('');
             return;
        }

        setIsAssigning(true);
        try {
            for (const t of tablesToAssign) {
                await assignMutation.mutateAsync({ tableId: t.id, employeeId: waiterId });
            }
            queryClient.invalidateQueries({ queryKey: ['adminTables'] });
            setSelectedTables([]);
            setSelectedWaiter('');
        } catch (error) {
            console.error('Error assigning tables:', error);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUnassign = async () => {
        const tablesToUnassign = selectedTables.filter(t => t.assigned_waiter_id);
        if (tablesToUnassign.length === 0) return;

        setIsAssigning(true);
        try {
            for (const t of tablesToUnassign) {
                await unassignMutation.mutateAsync(t.id);
            }
            queryClient.invalidateQueries({ queryKey: ['adminTables'] });
            setSelectedTables([]);
        } catch (error) {
            console.error('Error unassigning tables:', error);
        } finally {
            setIsAssigning(false);
        }
    };



    if (tablesLoading || employeesLoading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-inter text-sm lg:text-[15px] 2xl:text-base font-bold">Loading Floor Data...</div>;

    return (
        <div className="space-y-6 font-inter">
            {/* KPI TOP BAR */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500 mr-4"><Calendar size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Total Tables</p>
                        <h4 className="text-lg lg:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{totalTables}</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">All Tables</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500 mr-4"><Users size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Assigned Tables</p>
                        <h4 className="text-lg lg:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{assignedTables}</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">{assignedPercentage}% of total</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-500 mr-4"><User size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Unassigned Tables</p>
                        <h4 className="text-lg lg:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{unassignedTables}</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">{unassignedPercentage}% of total</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-500 mr-4"><Users size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Active Waiters</p>
                        <h4 className="text-lg lg:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{activeWaiters}</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">On Duty</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg text-green-500 mr-4"><User size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Available Waiters</p>
                        <h4 className="text-lg lg:text-xl 2xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{availableWaiters}</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium">Available Now</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-500 mr-4 shrink-0"><Clock size={20} /></div>
                    <div>
                        <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-0.5">Current Shift</p>
                        <h4 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white leading-tight mt-1">Morning Shift</h4>
                        <p className="text-[9px] lg:text-[10px] 2xl:text-[11px] text-gray-400 dark:text-slate-500 dark:text-slate-400 font-medium mt-1">07:00 AM - 03:00 PM</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: RESTAURANT FLOOR */}
                <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <h3 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white mr-3">
                                    Restaurant Floor
                                </h3>
                                <select 
                                    className="bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs lg:text-[13px] 2xl:text-sm font-bold text-gray-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    value={selectedFloor}
                                    onChange={(e) => {
                                        setSelectedFloor(e.target.value);
                                        setSelectedTables([]); // Clear selection when switching floors
                                    }}
                                >
                                    {uniqueFloors.map(floor => (
                                        <option key={floor} value={floor}>{floor}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                {selectedTables.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedTables([])}
                                        className="flex items-center px-3 py-1.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-lg text-[11px] lg:text-xs 2xl:text-sm font-bold transition-colors"
                                    >
                                        Clear Selection ({selectedTables.length})
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsConfirmClearOpen(true)}
                                    className="flex items-center px-3 py-1.5 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[11px] lg:text-xs 2xl:text-sm font-bold transition-colors"
                                >
                                    <Trash2 size={14} className="mr-1.5" /> Clear All Assignments
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Available</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span> Occupied</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> Reserved</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Out of Service</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-300 mr-1.5"></span> Unassigned</span>
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-8">
                            {[...filteredTablesByFloor].sort((a, b) => a.capacity - b.capacity).map(table => {
                                const renderChairs = (seats, status) => {
                                    const chairs = [];
                                    // Clamp max visual chairs to 24 to prevent browser memory leaks/crashes from huge capacity values
                                    const visualSeats = Math.min(parseInt(seats) || 0, 24);
                                    const topSeats = Math.ceil(visualSeats / 2);
                                    const bottomSeats = Math.floor(visualSeats / 2);
                                    
                                    const occupiedSeatsCount = status === 'Occupied' ? Math.max(1, visualSeats - 1) : status === 'Reserved' ? visualSeats : 0;
                                    let highlightedCount = 0;

                                    for (let i = 0; i < topSeats; i++) {
                                        const leftPct = (100 / (topSeats + 1)) * (i + 1);
                                        const isOccupied = highlightedCount < occupiedSeatsCount;
                                        if (isOccupied) highlightedCount++;
                                        const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-blue-400' : (status === 'Occupied' && isOccupied) ? 'bg-orange-400' : 'bg-gray-200 dark:bg-slate-700';
                                        
                                        chairs.push(<div key={`t${i}`} className={`absolute -top-1.5 w-6 h-3 rounded-t-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
                                    }
                                    for (let i = 0; i < bottomSeats; i++) {
                                        const leftPct = (100 / (bottomSeats + 1)) * (i + 1);
                                        const isOccupied = highlightedCount < occupiedSeatsCount;
                                        if (isOccupied) highlightedCount++;
                                        const chairColor = (status === 'Reserved' && isOccupied) ? 'bg-blue-400' : (status === 'Occupied' && isOccupied) ? 'bg-orange-400' : 'bg-gray-200 dark:bg-slate-700';
                                        
                                        chairs.push(<div key={`b${i}`} className={`absolute -bottom-1.5 w-6 h-3 rounded-b-full transition-colors group-hover:opacity-80 ${chairColor}`} style={{ left: `calc(${leftPct}% - 12px)` }}></div>);
                                    }
                                    return chairs;
                                };

                                let borderClass = 'bg-emerald-400';
                                let textClass = 'text-emerald-600 dark:text-emerald-400';
                                
                                if (table.status === 'Occupied') {
                                    borderClass = 'bg-orange-400';
                                    textClass = 'text-orange-600 dark:text-orange-400';
                                } else if (table.status === 'Reserved') {
                                    borderClass = 'bg-blue-400';
                                    textClass = 'text-blue-600 dark:text-blue-400';
                                } else if (table.status === 'Cleaning') {
                                    borderClass = 'bg-purple-400';
                                    textClass = 'text-purple-600 dark:text-purple-400';
                                } else if (table.status === 'Out of Service') {
                                    borderClass = 'bg-red-400';
                                    textClass = 'text-red-600 dark:text-red-400';
                                }

                                const isUnassigned = !table.assigned_waiter_id;
                                const isSelected = selectedTables.some(st => st.id === table.id);
                                
                                let colSpanClass = 'col-span-1';
                                if (table.capacity >= 5 && table.capacity <= 8) {
                                    colSpanClass = 'col-span-1 sm:col-span-2';
                                } else if (table.capacity > 8) {
                                    colSpanClass = 'col-span-2 sm:col-span-3';
                                }
                                
                                if (isUnassigned) {
                                    borderClass = 'bg-gray-300 dark:bg-slate-600';
                                    textClass = 'text-gray-500 dark:text-slate-400';
                                }
                                
                                return (
                                    <div 
                                        key={table.id}
                                        onClick={() => setSelectedTables(prev => prev.some(t => t.id === table.id) ? prev.filter(t => t.id !== table.id) : [...prev, table])}
                                        className={`relative w-full h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md group flex ${colSpanClass}
                                            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 border-indigo-200 dark:border-indigo-800' : 'border-gray-200 dark:border-slate-700'}`}
                                        title={table.is_virtual ? `Merged Tables: ${table.name}` : ''}
                                    >
                                        {/* Colored Status Stripe */}
                                        <div className={`w-3 shrink-0 rounded-l-2xl ${borderClass}`}></div>
                                        
                                        {/* Table Content */}
                                        <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-gray-400 dark:text-slate-500 dark:text-slate-400 font-bold text-[10px] lg:text-[11px] 2xl:text-xs truncate w-full">{table.table_number}</span>
                                                <span className={`text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold ${textClass} truncate w-full`}>
                                                    {table.status === 'Reserved' ? `Reserved for ${table.capacity}` : table.status}
                                                </span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-bold text-xs lg:text-[14px] 2xl:text-base truncate w-full block leading-tight">
                                                {table.assigned_waiter_name || 'Unassigned'}
                                            </span>
                                        </div>

                                        {renderChairs(table.capacity, table.status)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* MIDDLE: WAITERS & ASSIGN */}
                <div className="lg:col-span-3 flex flex-col space-y-6">
                    {/* Waiters List */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white mb-4">Waiters ({waiters.length})</h3>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search waiter..." 
                                        value={searchWaiter}
                                        onChange={e => setSearchWaiter(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs lg:text-[13px] 2xl:text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <button className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50"><Filter size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="p-2 overflow-y-auto flex-1 h-[250px]">
                            {filteredWaiters.map(waiter => {
                                const workload = waiterWorkload.find(w => w.id === waiter.id)?.assignedCount || 0;
                                const isBusy = workload > 3; // mock logic
                                const statusClass = isBusy ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50";
                                const statusText = isBusy ? "Busy" : "Available";
                                
                                const isDisabled = selectedTables.length > 0 && selectedTables.every(t => t.assigned_waiter_id === waiter.id);

                                return (
                                    <div 
                                        key={waiter.id} 
                                        onClick={() => !isDisabled && setSelectedWaiter(waiter.id.toString())}
                                        className={`flex items-center p-3 rounded-xl transition-colors border 
                                            ${isDisabled ? 'opacity-50 cursor-not-allowed border-transparent bg-gray-50 dark:bg-slate-800/50/50 dark:bg-slate-800/30' : 
                                            selectedWaiter === waiter.id.toString() ? 'border-indigo-500 bg-indigo-50/30 cursor-pointer' : 
                                            'border-transparent hover:border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 cursor-pointer'}`}
                                    >
                                        <div className="text-gray-300 mr-2"><MoreVertical size={16} /></div>
                                        <img src={`https://ui-avatars.com/api/?name=${waiter.full_name}&background=random`} alt={waiter.full_name} className="w-10 h-10 rounded-full mr-3 border border-gray-200 dark:border-slate-700" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="text-xs lg:text-[13px] 2xl:text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                                                    {waiter.full_name} {isDisabled && <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">(Assigned)</span>}
                                                </h4>
                                                <span className={`text-[9px] 2xl:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusClass}`}>{statusText}</span>
                                            </div>
                                            <p className="text-[10px] lg:text-[11px] 2xl:text-xs text-gray-500 dark:text-slate-400 truncate">{workload} Tables • Main Hall</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Assign Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 shrink-0 flex flex-col">
                        <h3 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center"><User size={16} className="mr-2 text-indigo-500"/> Assign Table</h3>
                        
                        <div className="mb-4">
                            <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">Selected Table</p>
                            
                            {/* Read-only view */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-3 justify-between items-center min-w-0">
                                <div className="min-w-0 flex-1 pr-2">
                                    <div className="flex items-center flex-wrap gap-1">
                                        <h4 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white mr-2 truncate">
                                            {selectedTables.length > 0 ? `${selectedTables.length} Selected` : 'None'}
                                        </h4>
                                    </div>
                                    <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">
                                        {selectedTables.length > 0 ? selectedTables.map(t => t.table_number).join(', ') : 'Click tables on the map to select'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-[10px] lg:text-[11px] 2xl:text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">Assign To Waiter</p>
                            <select 
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs lg:text-[13px] 2xl:text-sm font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                                value={selectedWaiter}
                                onChange={(e) => setSelectedWaiter(e.target.value)}
                            >
                                <option value="">Select waiter...</option>
                                {waiters.map(w => {
                                    const isDisabled = selectedTables.length > 0 && selectedTables.every(t => t.assigned_waiter_id === w.id);
                                    return (
                                        <option key={w.id} value={w.id} disabled={isDisabled}>
                                            {w.full_name} {isDisabled ? '(Already Assigned)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="mt-auto space-y-2">
                            <button 
                                onClick={handleAssign}
                                disabled={selectedTables.length === 0 || !selectedWaiter || isAssigning}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 dark:text-slate-400 text-white font-bold text-xs lg:text-[13px] 2xl:text-sm py-2.5 rounded-xl transition-colors"
                            >
                                {isAssigning ? 'Assigning...' : 'Assign Table'}
                            </button>
                            {selectedTables.some(t => t.assigned_waiter_id) && (
                                <button 
                                    onClick={handleUnassign}
                                    disabled={isAssigning}
                                    className="w-full border border-red-200 bg-white dark:bg-slate-900 hover:bg-red-50 text-red-600 font-bold text-xs lg:text-[13px] 2xl:text-sm py-2.5 rounded-xl transition-colors"
                                >
                                    Remove Assignment
                                </button>
                            )}
                            {selectedTables.length === 1 && selectedTables[0].status !== 'Available' && (
                                <button 
                                    onClick={() => setIsTransferModalOpen(true)}
                                    disabled={isAssigning || transferMutation.isPending}
                                    className="w-full border border-orange-200 bg-white dark:bg-slate-900 hover:bg-orange-50 text-orange-600 font-bold text-xs lg:text-[13px] 2xl:text-sm py-2.5 rounded-xl transition-colors"
                                >
                                    Transfer Table
                                </button>
                            )}
                            <button className="w-full flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-indigo-600 font-semibold text-[10px] lg:text-[11px] 2xl:text-xs py-2">
                                <Eye size={14} className="mr-1.5" /> View Table Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SUMMARY & WORKLOAD */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Floor Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
                        <h3 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white mb-4">Floor Summary</h3>
                        
                        <div className="flex items-center mb-6">
                            {/* Simple CSS Donut Chart */}
                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0 mr-4" style={{
                                background: `conic-gradient(#10b981 ${assignedPercentage}%, #e5e7eb ${assignedPercentage}%)`
                            }}>
                                <div className="absolute w-16 h-16 bg-white dark:bg-slate-900 rounded-full"></div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center text-[10px] lg:text-[11px] 2xl:text-xs font-bold text-gray-600 dark:text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> 
                                    {assignedTables} Assigned ({assignedPercentage}%)
                                </div>
                                <div className="flex items-center text-[10px] lg:text-[11px] 2xl:text-xs font-bold text-gray-600 dark:text-slate-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 mr-2"></span> 
                                    {unassignedTables} Unassigned ({unassignedPercentage}%)
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs lg:text-[13px] 2xl:text-sm font-bold text-gray-800 dark:text-slate-200">Unassigned Tables ({unassignedTables})</h4>
                                <button className="text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold text-indigo-600 hover:underline">View All</button>
                            </div>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                {tables.filter(t => !t.assigned_waiter_id).slice(0, 6).map(table => (
                                    <div key={table.id} className="flex justify-between items-center text-[10px] lg:text-[11px] 2xl:text-xs">
                                        <span className="font-bold text-gray-900 dark:text-white w-12">{table.table_number}</span>
                                        <span className="text-gray-500 dark:text-slate-400 font-medium">{table.capacity} Seats</span>
                                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold">Unassigned</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Waiter Workload */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm lg:text-[15px] 2xl:text-base font-bold text-gray-900 dark:text-white">Waiter Workload</h3>
                            <button className="text-[9px] lg:text-[10px] 2xl:text-[11px] font-bold text-indigo-600 hover:underline">View All</button>
                        </div>
                        <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
                            {waiterWorkload.slice(0, 5).map(waiter => {
                                const maxTables = 10; // arbitrary max for visual scale
                                const widthPct = Math.min((waiter.assignedCount / maxTables) * 100, 100);
                                return (
                                    <div key={waiter.id}>
                                        <div className="flex justify-between items-center text-[10px] lg:text-[11px] 2xl:text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                            <span>{waiter.full_name}</span>
                                            <span>{waiter.assignedCount} Tables</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${widthPct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>



                </div>
            </div>

            <Modal isOpen={isConfirmClearOpen} onClose={() => !clearAllAssignmentsMutation.isPending && setIsConfirmClearOpen(false)} title="Clear All Assignments">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
                        This action will immediately remove all waiter assignments from every table on the floor. This cannot be undone.
                    </p>
                    <div className="flex space-x-3 w-full">
                        <button 
                            onClick={() => setIsConfirmClearOpen(false)}
                            disabled={clearAllAssignmentsMutation.isPending}
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => clearAllAssignmentsMutation.mutate()}
                            disabled={clearAllAssignmentsMutation.isPending}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors disabled:bg-red-400 flex items-center justify-center"
                        >
                            {clearAllAssignmentsMutation.isPending ? 'Clearing...' : 'Yes, Clear All'}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isTransferModalOpen} onClose={() => !transferMutation.isPending && setIsTransferModalOpen(false)} title="Transfer Table">
                <div className="flex flex-col p-4">
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Transfer customer, active orders, and waiter assignment from <strong>{selectedTables[0]?.table_number}</strong> to an available table.
                    </p>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">Select Destination Table</label>
                        <select 
                            className="w-full bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                            value={targetTransferTable}
                            onChange={(e) => setTargetTransferTable(e.target.value)}
                        >
                            <option value="">Choose an available table...</option>
                            {tables.filter(t => t.status === 'Available').sort((a, b) => a.capacity - b.capacity).map(t => (
                                <option key={t.id} value={t.id}>{t.table_number} ({t.capacity} Seats)</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-3 w-full">
                        <button 
                            onClick={() => setIsTransferModalOpen(false)}
                            disabled={transferMutation.isPending}
                            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                if(targetTransferTable) {
                                    transferMutation.mutate({ tableId: selectedTables[0].id, targetTableId: targetTransferTable });
                                }
                            }}
                            disabled={!targetTransferTable || transferMutation.isPending}
                            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors disabled:bg-orange-300 flex items-center justify-center"
                        >
                            {transferMutation.isPending ? 'Transferring...' : 'Confirm Transfer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TableAssignment;