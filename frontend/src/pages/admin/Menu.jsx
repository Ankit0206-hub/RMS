import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../../components/ui';

const menuItemSchema = z.object({
    category_id: z.string().min(1, "Category is required").transform(v => parseInt(v)),
    item_code: z.string().min(2, "Code must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.string().min(1, "Price is required").transform(v => parseFloat(v)),
    description: z.string().optional(),
    is_veg: z.boolean().default(true),
    is_available: z.boolean().default(true)
});

const Menu = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(menuItemSchema),
        defaultValues: { item_code: '', name: '', category_id: '', price: '', description: '', is_veg: true, is_available: true }
    });

    const { data: menuItems, isLoading: isMenuLoading } = useQuery({
        queryKey: ['menuItems'],
        queryFn: async () => {
            const response = await api.get('/admin/menu/');
            return response.data.data;
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newItem) => api.post('/admin/menu/', newItem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            setIsModalOpen(false);
            reset();
        },
        onError: (error) => {
            alert("Failed to create menu item. Ensure the item code is unique.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/menu/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        },
        onError: (error) => {
            console.error("Failed to delete menu item", error);
        }
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: ({ id, is_available }) => api.patch(`/admin/menu/${id}/availability`, { is_available }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        }
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            deleteMutation.mutate(id);
        }
    };

    const toggleAvailability = (id, currentStatus) => {
        toggleAvailabilityMutation.mutate({ id, is_available: !currentStatus });
    };

    const columns = [
        { header: "Item Code", accessorKey: "item_code", cellClassName: "text-gray-700 font-medium" },
        { header: "Name", accessorKey: "name", cellClassName: "text-gray-900 font-medium" },
        { header: "Category", cell: (row) => row.category?.name || '-' },
        { header: "Price", cell: (row) => `₹${row.price.toFixed(2)}` },
        { 
            header: "Type", 
            cell: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.is_veg ? 'bg-emerald-50 text-emerald-600' : 'bg-red-500/10 text-red-400'}`}>
                    {row.is_veg ? 'Veg' : 'Non-Veg'}
                </span>
            )
        },
        { 
            header: "Availability", 
            cell: (row) => (
                <button 
                    onClick={() => toggleAvailability(row.id, row.is_available)}
                    disabled={toggleAvailabilityMutation.isPending}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${row.is_available ? 'border-green-500 text-emerald-600 hover:bg-emerald-50' : 'border-neutral-600 text-gray-400 hover:bg-white'}`}
                >
                    {row.is_available ? 'Available' : 'Out of Stock'}
                </button>
            )
        },
        { 
            header: "Actions", 
            className: "text-right",
            cellClassName: "text-right",
            cell: (row) => (
                <>
                    <button className="text-cyan-600 hover:text-indigo-300 mr-3 transition-colors"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage food and beverage items</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={menuItems} 
                isLoading={isMenuLoading} 
                emptyMessage="No items found." 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Menu Item">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            {...register("category_id")}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="" disabled>Select a category</option>
                            {categories?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Item Code" 
                            {...register("item_code")} 
                            error={errors.item_code}
                            placeholder="e.g. BVR-01"
                        />
                        <Input 
                            label="Price" 
                            type="number" 
                            step="0.01" 
                            min="0"
                            {...register("price")} 
                            error={errors.price}
                        />
                    </div>
                    <Input 
                        label="Name" 
                        {...register("name")} 
                        error={errors.name}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            rows={2}
                            {...register("description")}
                            className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-6 pt-2">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                {...register("is_veg")} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded bg-white"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Vegetarian</label>
                        </div>
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                {...register("is_available")} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded bg-white"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Available</label>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Menu;
