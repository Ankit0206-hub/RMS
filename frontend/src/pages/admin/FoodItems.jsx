import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../../components/ui';

const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    is_active: z.boolean().default(true)
});

const FoodItems = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/operator') ? '/operator' : '/admin';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', description: '', is_active: true }
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

    const handleDelete = (e, id) => {
        e.stopPropagation(); // prevent row click
        if (window.confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        // future edit implementation
    }

    const columns = [
        { header: "Name", accessorKey: "name", cellClassName: "text-gray-900 font-medium" },
        { header: "Description", cell: (row) => row.description || '-' },
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
                <div className="flex justify-end items-center space-x-4">
                    <button onClick={(e) => handleEdit(e, row.id)} className="text-cyan-600 hover:text-indigo-300 transition-colors"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={(e) => handleDelete(e, row.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    <button 
                        onClick={() => navigate(`${basePath}/food-items/${row.id}/menu`)}
                        className="flex items-center text-sm font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        View Items <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Food Items</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage categories and their respective menu items.</p>
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
                        label="Category Name" 
                        {...register("name")} 
                        error={errors.name}
                        placeholder="e.g. Starters"
                    />
                    <Input 
                        label="Description" 
                        {...register("description")} 
                        error={errors.description}
                        placeholder="e.g. Appetizers and small bites"
                    />
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            {...register("is_active")} 
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded bg-white"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Active Category</label>
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

export default FoodItems;
