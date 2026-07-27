import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Coffee, Tag, FileText, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Input } from '../../components/ui';

const generateEmptyItem = () => ({
    id: Date.now() + Math.random(), // unique local id for rendering
    item_code: '',
    name: '',
    price: '',
    description: '',
    kitchen_id: '',
    is_veg: true,
    is_available: true
});

const AddItem = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/operator') ? '/operator' : '/admin';
    const queryClient = useQueryClient();

    const [items, setItems] = useState([generateEmptyItem()]);

    // Fetch the category so we can display its name
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    // Fetch kitchens
    const { data: kitchens } = useQuery({
        queryKey: ['kitchens'],
        queryFn: async () => {
            const response = await api.get('/admin/kitchen/list');
            return response.data.data;
        }
    });

    const currentCategory = categories?.find(c => c.id === parseInt(categoryId));

    const mutation = useMutation({
        mutationFn: async (payloads) => {
            const response = await api.post('/admin/menu/bulk', payloads);
            return response.data;
        },
        onSuccess: () => {
            toast.success(`Successfully added ${items.length} items!`);
            queryClient.invalidateQueries(['menuItems', categoryId]);
            navigate(`${basePath}/food-items/${categoryId}/menu`);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to add items. Ensure all item codes are unique.';
            toast.error(message);
        }
    });

    const handleChange = (id, e) => {
        const { name, value, type, checked } = e.target;
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    [name]: type === 'checkbox' ? checked : value
                };
            }
            return item;
        }));
    };

    const handleAddItemBlock = () => {
        setItems(prev => [...prev, generateEmptyItem()]);
    };

    const handleRemoveItemBlock = (id) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payloads = items.map(item => ({
            item_code: item.item_code,
            name: item.name,
            price: parseFloat(item.price),
            description: item.description,
            is_veg: item.is_veg,
            is_available: item.is_available,
            kitchen_id: item.kitchen_id ? parseInt(item.kitchen_id) : null,
            category_id: parseInt(categoryId)
        }));

        mutation.mutate(payloads);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-gray-50">
            {/* Top Header */}
            <div className=" px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/food-items/${categoryId}/menu`)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Items</h2>
                        <p className="text-xs text-gray-500">Adding to {currentCategory?.name || 'Category'}</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {mutation.isPending ? 'Saving...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save All Items
                        </>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 mx-auto w-full space-y-4">

                {items.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-8 relative group">

                        {/* Header & Remove Button */}
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center">
                                <div className="h-8 w-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center font-bold mr-3">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Item Details</h3>
                            </div>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItemBlock(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                    title="Remove this item"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Input
                                label="Item Name"
                                name="name"
                                value={item.name}
                                onChange={(e) => handleChange(item.id, e)}
                                placeholder="e.g. Garlic Bread"
                                required
                            />
                            <Input
                                label="Item Code"
                                name="item_code"
                                value={item.item_code}
                                onChange={(e) => handleChange(item.id, e)}
                                placeholder="e.g. STR-01"
                                required
                            />
                        </div>

                        {/* Pricing & Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Input
                                label="Price (₹)"
                                type="number"
                                step="0.01"
                                min="0"
                                name="price"
                                value={item.price}
                                onChange={(e) => handleChange(item.id, e)}
                                placeholder="0.00"
                                required
                            />

                            <div className="flex flex-col space-y-4 justify-center mt-2 md:mt-0">
                                <div className="flex items-center">
                                    <input
                                        id={`is_veg_${item.id}`}
                                        type="checkbox"
                                        name="is_veg"
                                        checked={item.is_veg}
                                        onChange={(e) => handleChange(item.id, e)}
                                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                                    />
                                    <label htmlFor={`is_veg_${item.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                        Vegetarian / Plant-Based
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id={`is_available_${item.id}`}
                                        type="checkbox"
                                        name="is_available"
                                        checked={item.is_available}
                                        onChange={(e) => handleChange(item.id, e)}
                                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                                    />
                                    <label htmlFor={`is_available_${item.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                        Currently Available in Stock
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Description & Image Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Item Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    value={item.description}
                                    onChange={(e) => handleChange(item.id, e)}
                                    placeholder="Describe the item, ingredients, or allergens..."
                                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 transition-colors mb-4"
                                />
                                <label className="block text-sm font-semibold text-gray-700 mb-1 mt-4">
                                    Assign Kitchen
                                </label>
                                <select
                                    name="kitchen_id"
                                    value={item.kitchen_id}
                                    onChange={(e) => handleChange(item.id, e)}
                                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 transition-colors"
                                >
                                    <option value="">No Kitchen Assigned</option>
                                    {kitchens?.map(k => (
                                        <option key={k.id} value={k.id}>{k.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Item Image
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor={`file-upload-${item.id}`} className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                                                <span>Upload a file</span>
                                                <input id={`file-upload-${item.id}`} name="file-upload" type="file" className="sr-only" accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}

                {/* Add Another Button */}
                <div className="flex justify-center pt-4 pb-8">
                    <button
                        type="button"
                        onClick={handleAddItemBlock}
                        className="flex items-center px-6 py-3 text-sm font-semibold text-cyan-700 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors border border-cyan-200 shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Another Item
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddItem;
