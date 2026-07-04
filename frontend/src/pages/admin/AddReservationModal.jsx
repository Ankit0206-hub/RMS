import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Clock, Users, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AddReservationModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        customer_name: '',
        contact_number: '',
        date: '',
        time: '',
        party_size: 2,
        table_id: ''
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch tables to populate dropdown
    const { data: tablesResponse } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await api.get('/admin/tables', {
                params: { page: 1, page_size: 1000 }
            });
            return response.data;
        }
    });
    
    const tables = tablesResponse?.data || [];

    const addReservationMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await api.post('/admin/reservations', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reservations']);
            queryClient.invalidateQueries(['tables']);
            setSuccess('Reservation created successfully!');
            setTimeout(() => {
                setSuccess('');
                onClose();
                // Reset form
                setFormData({
                    customer_name: '',
                    contact_number: '',
                    date: '',
                    time: '',
                    party_size: 2,
                    table_id: ''
                });
            }, 1500);
        },
        onError: (err) => {
            setError(err.response?.data?.detail || 'Failed to create reservation');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.date || !formData.time) {
            setError('Please select both date and time.');
            return;
        }

        // Combine date and time into a single ISO string
        const datetimeString = `${formData.date}T${formData.time}:00`;
        const reservationTime = new Date(datetimeString).toISOString();

        const payload = {
            customer_name: formData.customer_name,
            contact_number: formData.contact_number,
            reservation_time: reservationTime,
            party_size: parseInt(formData.party_size, 10),
            table_id: formData.table_id ? parseInt(formData.table_id, 10) : null,
            status: "Pending"
        };

        addReservationMutation.mutate(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm font-inter">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">New Reservation</h3>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Book a table for a customer</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-semibold rounded-xl flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Customer Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.contact_number}
                                        onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="date"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Time *</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="time"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Party Size *</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={formData.party_size}
                                        onChange={(e) => setFormData({...formData, party_size: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Assign Table (Optional)</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.table_id}
                                    onChange={(e) => setFormData({...formData, table_id: e.target.value})}
                                >
                                    <option value="">No table assigned yet</option>
                                    {tables.map(table => (
                                        <option key={table.id} value={table.id}>
                                            {table.table_number} {table.name ? `- ${table.name}` : ''} (Cap: {table.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addReservationMutation.isPending}
                                className="bg-[#6366f1] hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center"
                            >
                                {addReservationMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Create Reservation'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddReservationModal;
