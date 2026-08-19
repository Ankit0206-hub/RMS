import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ChevronRight, Search, Filter, RefreshCw, Eye, Edit2, X, CheckCircle2, Clock, Map, Users, Square, Trash, QrCode } from 'lucide-react';
import QRCodeModal from '../admin/QRCodeModal';

const Tables = () => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [qrTable, setQrTable] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [tableForm, setTableForm] = useState({ table_number: '', capacity: 4, floor: 'Main Hall' });
    const [clearConfirmTable, setClearConfirmTable] = useState(null);
    const [isClearing, setIsClearing] = useState(false);

    const { data: tablesResponse, isLoading, refetch } = useQuery({
        queryKey: ['operator-tables'],
        queryFn: async () => {
            const res = await api.get('/admin/tables/', { params: { page: 1, page_size: 1000 } });
            return res.data;
        }
    });

    const tables = tablesResponse?.data || [];

    const { data: settings = {} } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            return res.data;
        }
    });

    const generateNextTableName = (tablesList, settingsData, selectedFloor) => {
        const convention = settingsData.table_naming_convention || 'Numeric';
        const globalPrefix = settingsData.normal_table_prefix || 'T-';
        const floorPrefixes = settingsData.floor_prefixes || {};
        let prefix = globalPrefix;
        if (selectedFloor && floorPrefixes[selectedFloor]) {
            prefix = floorPrefixes[selectedFloor];
        }
        const floorTables = tablesList.filter(t => (t.floor || 'Main Hall') === (selectedFloor || 'Main Hall'));
        const count = floorTables.length + 1;
        if (convention === 'Numeric') return `${prefix}${count}`;
        else if (convention === 'Alphabetic') return `${prefix}${String.fromCharCode(64 + count)}`;
        return `${prefix}${count}`;
    };

    const openTableModal = (table = null) => {
        if (table) {
            setEditingTable(table);
            setTableForm({ table_number: table.table_number, capacity: table.capacity, floor: table.floor || 'Main Hall' });
        } else {
            setEditingTable(null);
            setTableForm({ table_number: generateNextTableName(tables, settings, 'Main Hall'), capacity: 4, floor: 'Main Hall' });
        }
        setTableModalOpen(true);
    };

    const tableMutation = useMutation({
        mutationFn: async (data) => {
            if (editingTable) return api.put(`/admin/tables/${editingTable.id}`, data);
            else return api.post('/admin/tables/', data);
        },
        onSuccess: () => {
            toast.success(editingTable ? 'Table updated!' : 'Table created!');
            queryClient.invalidateQueries({ queryKey: ['operator-tables'] });
            setTableModalOpen(false);
        },
        onError: () => toast.error('Failed to save table')
    });

    const handleTableSubmit = () => {
        const payload = {
            table_number: tableForm.table_number,
            capacity: parseInt(tableForm.capacity),
            floor: tableForm.floor,
        };
        if (!editingTable) {
            payload.status = 'Available';
            payload.qr_code = 'temp';
        }
        tableMutation.mutate(payload);
    };

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

    const handleClearTable = async () => {
        if (!clearConfirmTable) return;
        setIsClearing(true);
        try {
            await api.post(`/operator/tables/${clearConfirmTable.id}/clear`);
            toast.success(`Table ${clearConfirmTable.table_number} has been freed up!`);
            refetch();
            setSelectedTable(null);
            setClearConfirmTable(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to clear table. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
            case 'Occupied': return { text: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500' };
            case 'Reserved': return { text: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' };
            case 'Cleaning': return { text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
            default: return { text: 'text-gray-500', bg: 'bg-gray-50', dot: 'bg-gray-500' };
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-inter">Loading Tables...</div>;

    return (
        <div className="flex h-full font-inter overflow-hidden">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedTable ? 'lg:mr-[380px]' : ''}`}>
                <div className="overflow-y-auto flex-1 scrollbar-hide space-y-4">
                    {/* Header */}
                    <div className="flex justify-end mb-4">
                        <button onClick={openTableModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors">
                            <span className="text-lg mr-1">+</span> Add Table
                        </button>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[
                            { label: 'Total Tables', value: totalTables, sub: 'All Tables', iconBg: 'bg-indigo-50 text-indigo-600', Icon: Map },
                            { label: 'Available', value: available, sub: `${Math.round((available / totalTables) * 100 || 0)}%`, iconBg: 'bg-emerald-50 text-emerald-600', Icon: Square },
                            { label: 'Occupied', value: occupied, sub: `${Math.round((occupied / totalTables) * 100 || 0)}%`, iconBg: 'bg-orange-50 text-orange-500', Icon: Users },
                            { label: 'Reserved', value: reserved, sub: `${Math.round((reserved / totalTables) * 100 || 0)}%`, iconBg: 'bg-purple-50 text-purple-600', Icon: Users },
                            { label: 'Cleaning', value: cleaning, sub: `${Math.round((cleaning / totalTables) * 100 || 0)}%`, iconBg: 'bg-blue-50 text-blue-600', Icon: Clock },
                            { label: 'Out of Service', value: outOfService, sub: `${Math.round((outOfService / totalTables) * 100 || 0)}%`, iconBg: 'bg-red-50 text-red-500', Icon: Trash },
                        ].map(({ label, value, sub, iconBg, Icon }) => (
                            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 flex items-center shadow-sm">
                                <div className={`p-3 rounded-lg ${iconBg} mr-4`}><Icon size={20} /></div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">{label}</p>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</h4>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{sub}</p>
                                </div>
                            </div>
                        ))}
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
                            <div className="flex items-center gap-3">
                                <button className="flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <Filter size={14} className="mr-2" /> Filters
                                </button>
                                <button onClick={() => refetch()} className="flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <RefreshCw size={14} className="mr-2" /> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">
                                        <th className="px-5 py-4">Table No.</th>
                                        <th className="px-5 py-4">Section</th>
                                        <th className="px-5 py-4 text-center">Capacity</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Assigned Waiter</th>
                                        <th className="px-5 py-4 text-center">Current Orders</th>
                                        <th className="px-5 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTables.map((table) => {
                                        const sc = getStatusColor(table.status);
                                        return (
                                            <tr key={table.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className="font-bold text-gray-900 dark:text-white text-[13px]">{table.table_number}</span>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-indigo-900 dark:text-indigo-300">{table.floor || 'Main Hall'}</td>
                                                <td className="px-5 py-3.5 text-center font-bold text-gray-900 dark:text-white">{table.capacity} Seats</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${sc.text} ${sc.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                                                        {table.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {table.assigned_waiter_name ? (
                                                        <div className="flex items-center gap-2">
                                                            <img src={`https://ui-avatars.com/api/?name=${table.assigned_waiter_name}&background=random`} className="w-6 h-6 rounded-full" alt="" />
                                                            <span className="font-semibold text-gray-800 dark:text-slate-200">{table.assigned_waiter_name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-semibold text-gray-600 dark:text-slate-400">
                                                    {table.current_order_id ? 1 : 0}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex justify-center space-x-1">
                                                        <button onClick={() => setSelectedTable(table)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View Details"><Eye size={15} /></button>
                                                        <button onClick={() => openTableModal(table)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit Table"><Edit2 size={15} /></button>
                                                        <button onClick={() => setQrTable(table)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View QR Code"><QrCode size={15} /></button>
                                                        {table.status === 'Occupied' && (
                                                            <button onClick={() => setClearConfirmTable(table)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Free Up Table"><Trash size={15} /></button>
                                                        )}
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

            {/* Slide-over Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${selectedTable ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedTable && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Table Details</h3>
                            <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Header */}
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 shrink-0">
                                    <Square size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedTable.table_number}</h2>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(selectedTable.status).text} ${getStatusColor(selectedTable.status).bg}`}>
                                            {selectedTable.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                {[
                                    { Icon: Map, label: 'Section', value: selectedTable.floor || 'Main Hall' },
                                    { Icon: Users, label: 'Capacity', value: `${selectedTable.capacity} Seats` },
                                    { Icon: CheckCircle2, label: 'Status', value: selectedTable.status, className: getStatusColor(selectedTable.status).text },
                                    { Icon: Users, label: 'Assigned Waiter', value: selectedTable.assigned_waiter_name || 'Not Assigned' },
                                    { Icon: Clock, label: 'Current Orders', value: selectedTable.current_order_id ? 1 : 0 },
                                ].map(({ Icon, label, value, className }) => (
                                    <div key={label} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center text-gray-500 dark:text-slate-400 font-semibold">
                                            <Icon size={14} className="mr-2" /> {label}
                                        </div>
                                        <div className={`font-bold text-gray-900 dark:text-white ${className || ''}`}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <h4 className="text-[11px] font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                                {selectedTable.status === 'Occupied' && (
                                    <button
                                        onClick={() => setClearConfirmTable(selectedTable)}
                                        className="w-full mb-3 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 py-2.5 rounded-xl font-bold transition-colors"
                                    >
                                        Free Up Table
                                    </button>
                                )}
                                <div className="space-y-2.5">
                                    <button onClick={() => navigate('/operator/orders', { state: { tableNumber: selectedTable.table_number } })} className="w-full flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                                        <Eye size={14} className="mr-3 text-indigo-600" /> View Orders
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Backdrop */}
            {selectedTable && (
                <div className="fixed inset-0 bg-gray-900/20 z-10 lg:hidden" onClick={() => setSelectedTable(null)} />
            )}

            {/* Add/Edit Table Modal */}
            {tableModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">{editingTable ? 'Edit Table' : 'Add Table'}</h2>
                            <button onClick={() => setTableModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Table Number/Name</label>
                                <input
                                    type="text"
                                    value={tableForm.table_number}
                                    onChange={(e) => setTableForm(prev => ({ ...prev, table_number: e.target.value }))}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    placeholder="e.g. T-01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Capacity</label>
                                <input
                                    type="number"
                                    value={tableForm.capacity}
                                    onChange={(e) => setTableForm(prev => ({ ...prev, capacity: e.target.value }))}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Section/Floor</label>
                                <select
                                    value={tableForm.floor}
                                    onChange={(e) => {
                                        const newFloor = e.target.value;
                                        setTableForm(prev => ({
                                            ...prev,
                                            floor: newFloor,
                                            table_number: generateNextTableName(tables, settings, newFloor)
                                        }));
                                    }}
                                    className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                >
                                    {(settings.floors_areas || ['Main Hall', 'Patio', 'Bar', 'VIP', 'Balcony', 'Garden', 'Rooftop']).map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setTableModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                            <button
                                onClick={handleTableSubmit}
                                disabled={!tableForm.table_number || tableMutation.isPending || tableForm.capacity === '' || tableForm.capacity <= 0}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {editingTable ? 'Save Changes' : (tableMutation.isPending ? 'Creating...' : 'Create Table')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <QRCodeModal
                isOpen={!!qrTable}
                table={qrTable}
                onClose={() => setQrTable(null)}
            />

            {/* Free Up Table Confirmation Modal */}
            {clearConfirmTable && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                <Square size={32} className="text-red-500" />
                            </div>
                        </div>

                        {/* Title & Message */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Free Up Table?</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                                You are about to mark{' '}
                                <span className="font-bold text-gray-900 dark:text-white">Table {clearConfirmTable.table_number}</span>
                                {' '}as <span className="font-bold text-emerald-600">Available</span>. This will end the current session and close all active orders on this table.
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 text-center">
                                ⚠️ Make sure billing is completed before freeing the table.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setClearConfirmTable(null)}
                                disabled={isClearing}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearTable}
                                disabled={isClearing}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isClearing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        Clearing...
                                    </>
                                ) : 'Yes, Free Up Table'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tables;
