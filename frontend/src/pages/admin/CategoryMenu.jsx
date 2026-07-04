import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../../components/ui';

const menuItemSchema = z.object({
    item_code: z.string().min(2, "Code must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.string().min(1, "Price is required").transform(v => parseFloat(v)),
    description: z.string().optional(),
    is_veg: z.boolean().default(true),
    is_available: z.boolean().default(true)
});

const CategoryMenu = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/operator') ? '/operator' : '/admin';
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(menuItemSchema),
        defaultValues: { item_code: '', name: '', price: '', description: '', is_veg: true, is_available: true }
    });

    // Fetch the specific category to display its name
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });
    
    const currentCategory = categories?.find(c => c.id === parseInt(categoryId));

    const { data: menuItems, isLoading: isMenuLoading } = useQuery({
        queryKey: ['menuItems', categoryId],
        queryFn: async () => {
            const response = await api.get(`/admin/menu/?category_id=${categoryId}`);
            return response.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newItem) => api.post('/admin/menu/', { ...newItem, category_id: parseInt(categoryId) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems', categoryId] });
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
            queryClient.invalidateQueries({ queryKey: ['menuItems', categoryId] });
        },
        onError: (error) => {
            console.error("Failed to delete menu item", error);
        }
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: ({ id, is_available }) => api.patch(`/admin/menu/${id}/availability`, { is_available }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems', categoryId] });
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
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(`${basePath}/food-items`)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {currentCategory ? currentCategory.name : 'Category'} Menu
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage food items for this category</p>
                    </div>
                </div>
                <Button onClick={() => navigate(`${basePath}/food-items/${categoryId}/menu/add`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item to Category
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={menuItems} 
                isLoading={isMenuLoading} 
                emptyMessage="No items found in this category." 
            />
        </div>
    );
};

export default CategoryMenu;
