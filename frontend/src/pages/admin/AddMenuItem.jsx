import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ChevronRight, Save, ArrowLeft } from 'lucide-react';

const menuItemSchema = z.object({
    category_id: z.coerce.number().min(1, "Please select a category"),
    item_code: z.string().min(1, "Item Code is required"),
    name: z.string().min(1, "Item Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0.1, "Price must be greater than 0"),
    is_available: z.boolean().default(true),
    is_veg: z.boolean().default(true),
});

const AddMenuItem = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch categories to populate dropdown
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            is_available: true,
            is_veg: true
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/admin/menu/', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Menu item created successfully");
            queryClient.invalidateQueries(['menuItems']);
            navigate('/admin/menu');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create menu item");
        }
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10 font-inter">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add Menu Item</h2>
                    <div className="flex items-center text-xs text-gray-500 mt-1.5 font-medium">
                        <span onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-600 cursor-pointer">Dashboard</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span onClick={() => navigate('/admin/menu')} className="hover:text-blue-600 cursor-pointer">Menu Management</span>
                        <ChevronRight className="w-3 h-3 mx-1" />
                        <span className="text-gray-900">Add Menu Item</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/admin/menu')}
                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Menu
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Basic Info */}
                        <div className="space-y-4 md:col-span-2 border-b border-gray-100 pb-6">
                            <h3 className="text-sm font-bold text-gray-900">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Item Name *</label>
                                    <input 
                                        type="text" 
                                        {...register('name')}
                                        placeholder="e.g. Paneer Tikka"
                                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Item Code *</label>
                                    <input 
                                        type="text" 
                                        {...register('item_code')}
                                        placeholder="e.g. ITM-001"
                                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                    {errors.item_code && <p className="text-red-500 text-xs mt-1">{errors.item_code.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea 
                                    {...register('description')}
                                    placeholder="Brief description of the item..."
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Categorization & Pricing */}
                        <div className="space-y-4 md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-900">Details & Pricing</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
                                    <select 
                                        {...register('category_id')}
                                        className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        disabled={categoriesLoading}
                                    >
                                        <option value="">Select Category...</option>
                                        {categories?.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            {...register('price')}
                                            placeholder="0.00"
                                            className="w-full pl-8 bg-gray-50 border border-gray-200 text-sm rounded-lg pr-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="space-y-4 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2 flex flex-col md:flex-row gap-6">
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="is_available" 
                                    {...register('is_available')}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <div>
                                    <label htmlFor="is_available" className="text-sm font-semibold text-gray-900 cursor-pointer">Available in Menu</label>
                                    <p className="text-xs text-gray-500">Item can be ordered by customers</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="is_veg" 
                                    {...register('is_veg')}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <div>
                                    <label htmlFor="is_veg" className="text-sm font-semibold text-gray-900 cursor-pointer">Vegetarian Item</label>
                                    <p className="text-xs text-gray-500">Displays the green veg indicator</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                    <button 
                        type="button"
                        onClick={() => navigate('/admin/menu')}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-5 py-2.5 bg-[#5e5ce6] hover:bg-[#4f46e5] text-white font-semibold text-sm rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {createMutation.isPending ? 'Saving...' : 'Save Menu Item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMenuItem;
