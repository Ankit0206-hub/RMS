import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../../components/ui';

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
    is_spicy_customizable: z.boolean().default(false)
});

const Categories = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', description: '', is_active: true, is_spicy_customizable: false }
    });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newCategory) => api.post('/admin/categories/', newCategory),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            reset();
        },
        onError: (error) => {
            alert("Failed to create category. Ensure the name is unique.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            alert("Cannot delete category. It may have associated menu items.");
        }
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        { header: "Name", accessorKey: "name", cellClassName: "text-gray-900 font-medium" },
        { header: "Description", cell: (row) => row.description || '-' },
        { 
            header: "Spicy Config", 
            cell: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.is_spicy_customizable ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {row.is_spicy_customizable ? 'Spicy Allowed' : 'Disabled'}
                </span>
            )
        },
        { 
            header: "Status", 
            cell: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-500/10 text-red-400'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
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
                    <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage menu categories (e.g. Starters, Mains)</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={categories} 
                isLoading={isLoading} 
                emptyMessage="No categories found." 
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Category">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input 
                        label="Name" 
                        {...register("name")} 
                        error={errors.name}
                        placeholder="e.g. Beverages"
                    />
                    <Input 
                        label="Description" 
                        {...register("description")} 
                        error={errors.description}
                        placeholder="e.g. Cold and hot drinks"
                    />
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                {...register("is_active")} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded bg-white"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Active</label>
                        </div>
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                {...register("is_spicy_customizable")} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded bg-white"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Spicy Customization Allowed</label>
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

export default Categories;
