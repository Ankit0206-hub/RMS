import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Select from 'react-select';

const AddCategoryWithItems = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isOperator = window.location.pathname.startsWith('/operator');
    const returnPath = isOperator ? '/operator/menu-items' : '/admin/menu';

    const [category, setCategory] = useState({
        name: '',
        description: '',
        is_active: true
    });
    
    const [isNewCategory, setIsNewCategory] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const { data: categories } = useQuery({
        queryKey: ['categoriesList'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const { data: kitchens } = useQuery({
        queryKey: ['kitchensList'],
        queryFn: async () => {
            const response = await api.get('/admin/kitchen/list');
            return response.data.data || [];
        }
    });

    const [items, setItems] = useState([
        { item_code: '', name: '', description: '', price: '', half_price: '', kitchen_id: '', is_veg: true, is_available: true }
    ]);

    const handleCategoryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCategory(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [name]: type === 'checkbox' ? checked : value
        };
        setItems(newItems);
    };

    const addItemRow = () => {
        setItems(prev => [...prev, { item_code: '', name: '', description: '', price: '', half_price: '', kitchen_id: '', is_veg: true, is_available: true }]);
    };

    const removeItemRow = (index) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const createCategoryMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/admin/categories/', data);
            return res.data.data;
        }
    });

    const createBulkItemsMutation = useMutation({
        mutationFn: async (bulkData) => {
            const res = await api.post('/admin/menu/bulk', bulkData);
            return res.data.data;
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isNewCategory && !category.name.trim()) {
            toast.error("Category name is required");
            return;
        }
        
        if (!isNewCategory && !selectedCategoryId) {
            toast.error("Please select an existing category");
            return;
        }

        const validItems = items.filter(i => i.name.trim() && i.item_code.trim() && i.price);
        if (validItems.length === 0) {
            toast.error("Please add at least one valid menu item with Code, Name, and Price.");
            return;
        }

        try {
            let categoryIdToUse = selectedCategoryId;

            if (isNewCategory) {
                // 1. Create Category
                const newCategory = await createCategoryMutation.mutateAsync(category);
                categoryIdToUse = newCategory.id;
            }
            
            // 2. Prepare items with target category_id
            const bulkItems = validItems.map(item => ({
                ...item,
                price: parseFloat(item.price),
                half_price: item.half_price ? parseFloat(item.half_price) : null,
                kitchen_id: item.kitchen_id ? parseInt(item.kitchen_id) : null,
                category_id: categoryIdToUse
            }));

            // 3. Bulk Create Items
            await createBulkItemsMutation.mutateAsync(bulkItems);
            
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['menuItems']);
            queryClient.invalidateQueries(['menu', 'kpis']);

            toast.success(isNewCategory ? "Category and items created successfully!" : "Items added to category successfully!");
            navigate(returnPath);
        } catch (error) {
            console.error("Error creating/adding items:", error);
            toast.error(error.response?.data?.detail || "Failed to process request.");
        }
    };

    return (
        <div className="space-y-6 pb-10 font-inter">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    {/* Header text removed */}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Details */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Category Selection</h3>
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setIsNewCategory(true)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${isNewCategory ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'}`}
                            >
                                Create New
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsNewCategory(false)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!isNewCategory ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'}`}
                            >
                                Select Existing
                            </button>
                        </div>
                    </div>
                    
                    {isNewCategory ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Category Name *</label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={category.name}
                                    onChange={handleCategoryChange}
                                    required={isNewCategory}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. Starters, Main Course"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Description</label>
                                <input 
                                    type="text"
                                    name="description"
                                    value={category.description}
                                    onChange={handleCategoryChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Optional category description"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Category Image</label>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-1.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Select Category *</label>
                            <Select
                                options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
                                value={categories?.map(c => ({ value: c.id, label: c.name })).find(c => c.value === selectedCategoryId) || null}
                                onChange={(opt) => setSelectedCategoryId(opt ? opt.value : '')}
                                isClearable
                                isSearchable
                                placeholder="Search or select a category..."
                                classNamePrefix="react-select"
                                className="text-sm react-select-container"
                            />
                        </div>
                    )}
                </div>

                {/* Menu Items Details */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Menu Items</h3>
                        <button 
                            type="button" 
                            onClick={addItemRow}
                            className="text-xs font-bold text-[#6366f1] bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 font-bold">Item Code *</th>
                                    <th className="px-4 py-3 font-bold">Name *</th>
                                    <th className="px-4 py-3 font-bold">Description</th>
                                    <th className="px-4 py-3 font-bold w-28">Full Price (₹) *</th>
                                    <th className="px-4 py-3 font-bold w-28">Half Price (₹)</th>
                                    <th className="px-4 py-3 font-bold w-36">Kitchen</th>
                                    <th className="px-4 py-3 font-bold w-32">Image</th>
                                    <th className="px-4 py-3 font-bold w-20 text-center">Is Veg?</th>
                                    <th className="px-4 py-3 font-bold w-32 text-center">In Stock?</th>
                                    <th className="px-4 py-3 font-bold w-16 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:bg-slate-800/50/50">
                                        <td className="px-2 py-3">
                                            <input 
                                                type="text" 
                                                name="item_code" 
                                                value={item.item_code} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                required
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="Code"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={item.name} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                required
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="Name"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input 
                                                type="text" 
                                                name="description" 
                                                value={item.description} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="Optional desc"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                name="price" 
                                                value={item.price} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                required
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                name="half_price" 
                                                value={item.half_price} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="px-2 py-3">
                                            <select
                                                name="kitchen_id"
                                                value={item.kitchen_id}
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">No Kitchen</option>
                                                {kitchens?.map(k => (
                                                    <option key={k.id} value={k.id}>{k.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-slate-300"
                                            />
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                name="is_veg" 
                                                checked={item.is_veg} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                name="is_available" 
                                                checked={item.is_available} 
                                                onChange={(e) => handleItemChange(index, e)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItemRow(index)}
                                                disabled={items.length === 1}
                                                className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        type="submit"
                        disabled={createCategoryMutation.isPending || createBulkItemsMutation.isPending}
                        className="px-6 py-2.5 bg-[#6366f1] text-white rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center shadow-sm shadow-indigo-200 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isNewCategory ? "Save Category & Items" : "Save Items"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCategoryWithItems;
