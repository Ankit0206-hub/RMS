import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ChefHat, Plus, Edit2 } from 'lucide-react';

const Kitchens = () => {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedKitchen, setSelectedKitchen] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        email: '',
        password: ''
    });

    const { data: kitchens, isLoading } = useQuery({
        queryKey: ['kitchens'],
        queryFn: async () => {
            const res = await api.get('/admin/kitchen/list');
            return res.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/admin/kitchen/', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Kitchen created successfully');
            queryClient.invalidateQueries(['kitchens']);
            setIsAddModalOpen(false);
            setFormData({ name: '', description: '', is_active: true, email: '', password: '' });
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to create kitchen');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.patch(`/admin/kitchen/${data.id}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Kitchen updated successfully');
            queryClient.invalidateQueries(['kitchens']);
            setIsEditModalOpen(false);
            setSelectedKitchen(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to update kitchen');
        }
    });

    const handleOpenEdit = (kitchen) => {
        setSelectedKitchen(kitchen);
        setFormData({
            name: kitchen.name,
            description: kitchen.description || '',
            is_active: kitchen.is_active,
            email: '',
            password: ''
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddModalOpen) {
            createMutation.mutate(formData);
        } else {
            updateMutation.mutate({ id: selectedKitchen.id, ...formData });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="p-4 sm:p-6 w-full font-inter">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ChefHat className="text-indigo-600" />
                        Kitchens Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage kitchen stations (e.g., Veg, Non-Veg) for order routing</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', description: '', is_active: true, email: '', password: '' });
                        setIsAddModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Kitchen
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kitchen Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading kitchens...</td>
                            </tr>
                        ) : kitchens?.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No kitchens found. Add one to get started.</td>
                            </tr>
                        ) : (
                            kitchens?.map(kitchen => (
                                <tr key={kitchen.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{kitchen.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">{kitchen.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kitchen.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {kitchen.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenEdit(kitchen)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 w-full"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{isAddModalOpen ? 'Add Kitchen' : 'Edit Kitchen'}</h3>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Kitchen Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="e.g. Veg Kitchen"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Optional description"
                                ></textarea>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    name="is_active" 
                                    id="is_active"
                                    checked={formData.is_active} 
                                    onChange={handleChange} 
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                                />
                                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">Active</label>
                            </div>
                            
                            {isAddModalOpen && (
                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Kitchen Login Credentials</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Login Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required={isAddModalOpen}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="e.g. veg@kitchen.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required={isAddModalOpen}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Enter password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center">
                                    {isAddModalOpen ? 'Create Kitchen' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kitchens;
