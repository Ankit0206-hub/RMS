import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const AddTableModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        table_number: '',
        name: '',
        floor: '',
        capacity: 2,
        status: 'Available'
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                table_number: '',
                name: '',
                floor: '',
                capacity: 2,
                status: 'Available'
            });
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const addTableMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/admin/tables', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tables']);
            setSuccess('Table added successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        },
        onError: (err) => {
            setError(err.response?.data?.detail || 'Failed to add table');
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        const payload = {
            table_number: formData.table_number,
            name: formData.name,
            floor: formData.floor,
            capacity: parseInt(formData.capacity, 10),
            status: formData.status
        };

        addTableMutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter px-4 sm:px-0">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Table</h2>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Create a new table for your restaurant</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors shadow-sm border border-transparent hover:border-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-semibold rounded-xl flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Table No. *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.table_number}
                                    onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                                    placeholder="e.g. T12"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Capacity *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Table Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Balcony VIP"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Floor</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                    placeholder="e.g. Ground Floor"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Initial Status</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="Out of Order">Out of Order</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-3 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addTableMutation.isPending}
                                className="bg-[#6366f1] hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                            >
                                {addTableMutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Add Table'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTableModal;
