import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EditItemModal = ({ item, onClose }) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        half_price: '',
        category_id: '',
        kitchen_id: '',
        is_veg: true,
        is_available: true
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const { data: kitchens } = useQuery({
        queryKey: ['kitchens'],
        queryFn: async () => {
            const response = await api.get('/admin/kitchen/list');
            return response.data.data;
        }
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                half_price: item.half_price || '',
                category_id: item.category_id || '',
                kitchen_id: item.kitchen_id || '',
                is_veg: item.is_veg !== undefined ? item.is_veg : true,
                is_available: item.is_available !== undefined ? item.is_available : true
            });
        }
    }, [item]);

    const updateItemMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put(`/admin/menu/${item.id}`, data);
            return res.data;
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                half_price: formData.half_price ? parseFloat(formData.half_price) : null,
                category_id: parseInt(formData.category_id),
                kitchen_id: formData.kitchen_id ? parseInt(formData.kitchen_id) : null
            };

            await updateItemMutation.mutateAsync(payload);
            queryClient.invalidateQueries(['menuItems']);
            toast.success("Item updated successfully");
            onClose();
        } catch (error) {
            console.error("Failed to update item", error);
            toast.error(error.response?.data?.detail || "Failed to update item");
        }
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 font-inter">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden relative">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Edit Menu Item</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Item Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Price (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Half Price (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="half_price"
                                value={formData.half_price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" disabled>Select category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Kitchen</label>
                            <select
                                name="kitchen_id"
                                value={formData.kitchen_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">No Kitchen Assigned</option>
                                {kitchens?.map(k => (
                                    <option key={k.id} value={k.id}>{k.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="is_veg" checked={formData.is_veg} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <label className="text-sm font-semibold text-gray-700">Is Veg?</label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <label className="text-sm font-semibold text-gray-700">In Stock?</label>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={updateItemMutation.isPending} className="px-6 py-2 text-sm font-bold text-white bg-[#6366f1] hover:bg-indigo-600 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;
