import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const EditTableModal = ({ isOpen, onClose, table }) => {
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        table_number: '',
        floor: 'Main Hall',
        capacity: 2,
        status: 'Available'
    });

    const { data: settingsResponse } = useQuery({
        queryKey: ['operator-settings'],
        queryFn: async () => {
            const res = await api.get('/operator/settings');
            return res.data;
        }
    });

    const settings = settingsResponse?.data || {};
    const customFloors = settings.floors_or_areas || [];
    const floorsOrAreas = ['Main Hall', ...customFloors.filter(f => f !== 'Main Hall')];

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (table) {
            setFormData({
                table_number: table.table_number || '',
                floor: table.floor || 'Main Hall',
                capacity: table.capacity || 2,
                status: table.status || 'Available'
            });
            setError('');
            setSuccess('');
        }
    }, [table]);

    const updateTableMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put(`/admin/tables/${table.id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tables']);
            setSuccess('Table updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        },
        onError: (err) => {
            setError(err.response?.data?.detail || 'Failed to update table');
        }
    });

    if (!isOpen || !table) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        const payload = {
            table_number: formData.table_number,
            floor: formData.floor,
            capacity: parseInt(formData.capacity, 10),
            status: formData.status
        };

        updateTableMutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Table</h2>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Update table details and status</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors shadow-sm border border-transparent hover:border-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-semibold rounded-xl flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Table No.</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.table_number}
                                    onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                                    placeholder="e.g. T1"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Capacity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Section</label>
                                <select
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                >
                                    {floorsOrAreas.map(floor => (
                                        <option key={floor} value={floor}>{floor}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                                <select
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updateTableMutation.isPending}
                                className="w-full bg-[#6366f1] hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm shadow-indigo-200 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {updateTableMutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTableModal;
