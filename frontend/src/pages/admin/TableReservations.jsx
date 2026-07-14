import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, CalendarCheck, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { DataTable } from '../../components/ui';
import AddReservationModal from './AddReservationModal';
import api from '../../services/api';

const TableReservations = () => {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: reservationsResponse, isLoading } = useQuery({
        queryKey: ['reservations'],
        queryFn: async () => {
            const response = await api.get('/admin/reservations', {
                params: { page: 1, page_size: 1000 }
            });
            return response.data;
        }
    });

    const reservationsData = reservationsResponse?.data || [];

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, table_id }) => {
            const payload = { status };
            if (table_id) payload.table_id = table_id;
            const response = await api.put(`/admin/reservations/${id}`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reservations']);
            queryClient.invalidateQueries(['tables']);
        }
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'text-orange-600 bg-orange-50';
            case 'Confirmed': return 'text-green-600 bg-green-50';
            case 'Cancelled': return 'text-red-600 bg-red-50';
            case 'Completed': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const columns = [
        {
            header: "Customer",
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900 text-[13px]">{row.customer_name}</div>
                    <div className="text-[11px] font-medium text-gray-500">{row.contact_number || 'No contact'}</div>
                </div>
            )
        },
        {
            header: "Date & Time",
            cell: (row) => {
                const date = new Date(row.reservation_time);
                return (
                    <div>
                        <div className="font-bold text-gray-900 text-[12px]">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] font-semibold text-indigo-600">
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )
            }
        },
        {
            header: "Party Size",
            cell: (row) => <span className="font-bold text-gray-900 text-[13px]">{row.party_size} Pax</span>
        },
        {
            header: "Table",
            cell: (row) => (
                <span className="font-bold text-gray-700 text-[12px]">
                    {row.table_number || 'Unassigned'}
                </span>
            )
        },
        {
            header: "Status",
            cell: (row) => (
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${getStatusColor(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cellClassName: "text-right",
            cell: (row) => (
                <div className="flex items-center justify-end space-x-2">
                    {row.status === 'Pending' && (
                        <>
                            <button 
                                onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'Confirmed' })}
                                className="p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                title="Confirm Reservation"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'Cancelled' })}
                                className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                title="Cancel Reservation"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    const filteredData = reservationsData.filter(r => 
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.contact_number && r.contact_number.includes(searchTerm))
    );

    const totalReservations = reservationsData.length;
    const pendingCount = reservationsData.filter(r => r.status === 'Pending').length;
    const confirmedCount = reservationsData.filter(r => r.status === 'Confirmed').length;

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* Header section matching other pages */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Table Reservations</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage upcoming reservations and pre-bookings.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        Timeline View
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-[#6366f1] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-600 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        New Reservation
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Total Reservations</p>
                        <p className="text-2xl font-black text-gray-900">{totalReservations}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Pending Confirmation</p>
                        <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Confirmed Today</p>
                        <p className="text-2xl font-black text-gray-900">{confirmedCount}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                    <h3 className="font-bold text-gray-900 text-[15px]">All Reservations</h3>
                    
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search reservations..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
                            />
                        </div>
                        
                        <select className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-4 py-2 outline-none">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>
                
                <div className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-500">Loading reservations...</div>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={filteredData} 
                            keyField="id"
                        />
                    )}
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
                    padding-top: 10px !important;
                    padding-bottom: 10px !important;
                    border-bottom-
}
                tr {
                    border-bottom-
}
            `}</style>

            <AddReservationModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
        </div>
    );
};

export default TableReservations;
