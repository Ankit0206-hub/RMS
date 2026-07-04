import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const AddTable = () => {
    const navigate = useNavigate();
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

    const addTableMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/admin/tables', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tables']);
            setSuccess('Table added successfully!');
            setTimeout(() => {
                navigate('/admin/tables');
            }, 1500);
        },
        onError: (err) => {
            setError(err.response?.data?.detail || 'Failed to add table');
        }
    });

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
        <div className="font-inter space-y-6 pb-10">
            <div className="flex items-center space-x-4 mb-6">
                <button 
                    onClick={() => navigate('/admin/tables')}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">Add New Table</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">Create a new table for your restaurant</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-semibold rounded-xl flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-3" />
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
                            onClick={() => navigate('/admin/tables')}
                            className="mr-3 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addTableMutation.isPending}
                            className="bg-[#6366f1] hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
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
    );
};

export default AddTable;
