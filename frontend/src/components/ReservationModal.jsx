import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminApi } from '../services/adminApi';

const ReservationModal = ({ isOpen, onClose, onSuccess, tables, reservation = null }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        contact_number: '',
        reservation_time: '',
        party_size: 1,
        status: 'Pending',
        table_id: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reservation) {
            // Format datetime-local string (YYYY-MM-DDTHH:mm)
            let formattedTime = '';
            if (reservation.reservation_time) {
                const date = new Date(reservation.reservation_time);
                // Adjust for local timezone
                const tzOffset = date.getTimezoneOffset() * 60000; 
                formattedTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
            }

            setFormData({
                customer_name: reservation.customer_name || '',
                contact_number: reservation.contact_number || '',
                reservation_time: formattedTime,
                party_size: reservation.party_size || 1,
                status: reservation.status || 'Pending',
                table_id: reservation.table_id || ''
            });
        } else {
            setFormData({
                customer_name: '',
                contact_number: '',
                reservation_time: '',
                party_size: 1,
                status: 'Pending',
                table_id: ''
            });
        }
    }, [reservation, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                table_id: formData.table_id ? parseInt(formData.table_id) : null,
                party_size: parseInt(formData.party_size),
                // Ensure date is valid format
                reservation_time: new Date(formData.reservation_time).toISOString()
            };

            if (reservation) {
                await adminApi.updateReservation(reservation.id, dataToSubmit);
            } else {
                await adminApi.createReservation(dataToSubmit);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save reservation", error);
            // Optionally add toast error here
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {reservation ? 'Edit Reservation' : 'New Reservation'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                name="reservation_time"
                                value={formData.reservation_time}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                Party Size
                            </label>
                            <input
                                type="number"
                                name="party_size"
                                min="1"
                                value={formData.party_size}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                Assign Table
                            </label>
                            <select
                                name="table_id"
                                value={formData.table_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                            >
                                <option value="">No Table</option>
                                {tables.map(table => (
                                    <option key={table.id} value={table.id}>
                                        {table.table_number} ({table.capacity} seats)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Reservation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
