import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, Pagination } from '../../components/ui';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
    Plus, Search, Edit2, Eye, MoreVertical, LayoutGrid, 
    Coffee, Pizza, Utensils, IceCream, CupSoda, Sandwich, Soup, Salad,
    AlertCircle, PauseCircle, CheckCircle2, ChevronRight, Upload, X, Trash2
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import EditItemModal from './EditItemModal';

const MenuItems = () => {
    const navigate = useNavigate();
    const isOperator = window.location.pathname.startsWith('/operator');
    const addPath = isOperator ? '/operator/categories' : '/admin/menu/add';
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [kitchenFilter, setKitchenFilter] = useState('Kitchen');
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleAvailabilityMutation = useMutation({
        mutationFn: async ({ id, is_available }) => {
            const res = await api.patch(`/admin/menu/${id}/availability`, { is_available });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['menuItemsList']);
            queryClient.invalidateQueries(['menu', 'kpis']);
            toast.success('Availability updated');
        },
        onError: () => toast.error('Failed to update availability')
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async (item) => {
            const payload = {
                name: item.name,
                price: item.price,
                category_id: item.category_id,
                is_active: !item.is_active,
                is_available: item.is_available,
                is_veg: item.is_veg,
                is_spicy_customizable: item.is_spicy_customizable
            };
            if (item.description) payload.description = item.description;
            if (item.half_price) payload.half_price = item.half_price;
            if (item.kitchen_id) payload.kitchen_id = item.kitchen_id;
            if (item.image_url) payload.image_url = item.image_url;
            const res = await api.put(`/admin/menu/${item.id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['menuItemsList']);
            queryClient.invalidateQueries(['menu', 'kpis']);
            toast.success('Status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const deleteItemMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/admin/menu/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['menuItemsList']);
            queryClient.invalidateQueries(['menu', 'kpis']);
            toast.success('Item deleted successfully');
        },
        onError: () => toast.error('Failed to delete item')
    });

    const { data: kpis } = useQuery({
        queryKey: ['menu', 'kpis'],
        queryFn: async () => {
            const response = await api.get('/admin/menu/kpis');
            return response.data.data;
        }
    });

    const { data: menuItemsData, isLoading: isMenuLoading } = useQuery({
        queryKey: ['menuItemsList'],
        queryFn: async () => {
            const response = await api.get('/admin/menu/');
            return response.data.data;
        }
    });

    const { data: kitchensData } = useQuery({
        queryKey: ['kitchensList'],
        queryFn: async () => {
            const response = await api.get('/admin/kitchen/list');
            return response.data.data;
        }
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categoriesList'],
        queryFn: async () => {
            const response = await api.get('/admin/categories/');
            return response.data.data;
        }
    });

    const columns = [
        { 
            header: "Item Details", 
            cell: (row) => (
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{row.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5 max-w-[200px] truncate">{row.description || 'No description'}</div>
                    </div>
                </div>
            )
        },
        { 
            header: "Category", 
            cell: (row) => {
                const catName = row.category?.name || 'Uncategorized';
                return <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">{catName}</span> 
            }
        },
        { 
            header: "Full Price (₹)", 
            cell: (row) => (
                <span className="font-semibold text-gray-700 dark:text-slate-300 text-sm">₹ {row.price}</span>
            )
        },
        { 
            header: "Half Price (₹)", 
            cell: (row) => (
                <span className={`text-sm font-semibold ${row.half_price ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500 italic'}`}>
                    {row.half_price ? `₹ ${row.half_price}` : 'Not Available'}
                </span>
            )
        },
        { 
            header: "Availability", 
            cell: (row) => {
                const isAvailable = row.is_available !== false;
                const isPending = toggleAvailabilityMutation.isPending && toggleAvailabilityMutation.variables?.id === row.id;
                
                return (
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => toggleAvailabilityMutation.mutate({ id: row.id, is_available: !isAvailable })}
                            disabled={isPending}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isAvailable ? 'bg-indigo-600' : 'bg-gray-200'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Toggle availability</span>
                            <span aria-hidden="true" className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-[10px] font-bold ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                );
            }
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2 relative">
                    <button onClick={() => setEditingItem(row)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setViewingItem(row)} className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === row.id ? null : row.id); }} 
                            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {dropdownOpenId === row.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50 overflow-hidden">
                                <button 
                                    onClick={() => { setDropdownOpenId(null); toggleActiveMutation.mutate(row); }}
                                    className="w-full text-left px-4 py-2 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 mr-2" /> Mark {row.is_active ? 'Inactive' : 'Active'}
                                </button>
                                <button 
                                    onClick={() => { 
                                        setDropdownOpenId(null); 
                                        setDeleteConfirmItem(row);
                                    }}
                                    className="w-full text-left px-4 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Item
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ];

    const totalItems = kpis?.total_items || 0;
    const activeItems = kpis?.active_items || 0;
    const activePercentage = totalItems > 0 ? ((activeItems / totalItems) * 100).toFixed(1) : 0;
    const inactiveItems = kpis?.inactive_items || 0;
    const inactivePercentage = totalItems > 0 ? ((inactiveItems / totalItems) * 100).toFixed(1) : 0;
    const outOfStock = kpis?.out_of_stock || 0;
    const outOfStockPercentage = totalItems > 0 ? ((outOfStock / totalItems) * 100).toFixed(1) : 0;
    const totalCategories = kpis?.total_categories || 0;

    return (
        <div className="space-y-4 pb-10 font-inter">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-indigo-50 rounded-full text-[#6366f1]">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">Total Menu Items</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{totalItems}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 text-center">
                        ↑ {kpis?.new_items_this_month || 0} New <span className="text-gray-400 dark:text-slate-500 font-medium ml-1">this month</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-50 rounded-full text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">Active Items</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{activeItems}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 text-center">
                        {activePercentage}% <span className="text-gray-400 dark:text-slate-500 font-medium ml-1">of total</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-50 rounded-full text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">Out of Stock</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{outOfStock}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 text-center">
                        {outOfStockPercentage}% <span className="text-gray-400 dark:text-slate-500 font-medium ml-1">of total</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-0.5">Total Categories</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{totalCategories}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 text-center">
                        ↑ {kpis?.new_categories_this_month || 0} New <span className="text-gray-400 dark:text-slate-500 font-medium ml-1">this month</span>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Right Side: Data Table (span 3) */}
                <div className="lg:col-span-3 order-2 lg:order-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col rounded-xl">
                    <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-slate-900">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px] whitespace-nowrap">Menu Items</h3>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center w-full xl:w-auto gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search menu items..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full md:w-64 transition-all"
                                />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs font-semibold rounded-lg px-4 py-2 outline-none"
                                >
                                    <option>Category</option>
                                    {categoriesData?.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs font-semibold rounded-lg px-4 py-2 outline-none"
                                >
                                    <option>Status</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                                
                                <select 
                                    value={kitchenFilter}
                                    onChange={(e) => setKitchenFilter(e.target.value)}
                                    className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs font-semibold rounded-lg px-4 py-2 outline-none"
                                >
                                    <option value="Kitchen">Kitchen (All)</option>
                                    <option value="Unassigned">Unassigned Kitchen</option>
                                    {kitchensData?.map(k => (
                                        <option key={k.id} value={k.id}>{k.name}</option>
                                    ))}
                                </select>

                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCategoryFilter('Category');
                                        setStatusFilter('Status');
                                        setKitchenFilter('Kitchen');
                                    }}
                                    className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
                                    title="Clear filters"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {(() => {
                        const filteredItems = menuItemsData?.filter(item => {
                            const matchesSearch = !searchTerm || 
                                item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                item.item_code?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesCategory = categoryFilter === 'Category' || item.category?.name === categoryFilter;
                            const matchesStatus = statusFilter === 'Status' || (statusFilter === 'Active' ? item.is_active : !item.is_active);
                            const matchesKitchen = kitchenFilter === 'Kitchen' || (kitchenFilter === 'Unassigned' ? !item.kitchen_id : item.kitchen_id?.toString() === kitchenFilter.toString());
                            return matchesSearch && matchesCategory && matchesStatus && matchesKitchen;
                        }) || [];

                        const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;
                        const paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

                        return (
                            <>
                                <div className="flex-1" ref={dropdownRef}>
                                    <DataTable 
                                        columns={columns} 
                                        data={paginatedItems} 
                                        isLoading={isMenuLoading} 
                                        emptyMessage="No items found." 
                                    />
                                </div>

                                <Pagination 
                                    currentPage={currentPage}
                                    totalItems={filteredItems.length}
                                    itemsPerPage={rowsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(val) => {
                                        setRowsPerPage(val);
                                        setCurrentPage(1);
                                    }}
                                    itemName="items"
                                />
                            </>
                        );
                    })()}
                </div>

                {/* Left Side: Categories (span 1) */}
                <div className="lg:col-span-1 order-1 lg:order-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 flex flex-col rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Categories</h3>
                        <span onClick={() => navigate(addPath)} className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">Manage Categories</span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1 category-scrollbar">
                        {categoriesData?.map((cat, idx) => {
                            const Icon = Utensils; // fallback icon since it's generic
                            const itemsCount = menuItemsData?.filter(i => i.category_id === cat.id).length || 0;
                            return (
                                <div key={idx} onClick={() => setCategoryFilter(cat.name)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-800 dark:text-slate-200 text-xs">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                                        <span>{itemsCount} Items</span>
                                        <ChevronRight className="w-3.5 h-3.5 ml-1 text-gray-300 group-hover:text-gray-500 dark:text-slate-400" />
                                    </div>
                                </div>
                            );
                        })}
                        {categoriesData?.length === 0 && (
                            <div className="text-center text-xs text-gray-400 dark:text-slate-500 py-4">No categories created yet.</div>
                        )}
                    </div>

                    <button 
                        onClick={() => navigate(addPath)}
                        className="mt-6 w-full py-2.5 border-2 border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Category
                    </button>
                </div>

            </div>


            <style>{`
                /* Override DataTable base styles for this specific page to match design perfectly */
                th {
                    text-transform: none !important;
font-size: 11px !important;
                    font-weight: 700 !important;
                    padding-top: 14px !important;
                    padding-bottom: 14px !important;
                    border-bottom-width: 1px !important;
                    border-bottom-
}
                td {
                    padding-top: 10px !important;
                    padding-bottom: 10px !important;
                    border-bottom-
}
                tr {
                    border-bottom-
}
                .category-scrollbar::-webkit-scrollbar { width: 4px; }
                .category-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .category-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .category-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
            
            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    onClose={() => setEditingItem(null)} 
                />
            )}
            
            {viewingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header Image */}
                        <div className="relative h-48 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                            {viewingItem.image_url ? (
                                <img src={viewingItem.image_url} alt={viewingItem.name} className="w-full h-full object-cover" />
                            ) : (
                                <Utensils className="w-12 h-12 text-gray-300 dark:text-slate-600" />
                            )}
                            <button 
                                onClick={() => setViewingItem(null)}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg backdrop-blur-md border ${viewingItem.is_veg ? 'bg-green-500/20 text-green-100 border-green-500/30' : 'bg-red-500/20 text-red-100 border-red-500/30'}`}>
                                    {viewingItem.is_veg ? '🟢 VEG' : '🔴 NON-VEG'}
                                </span>
                                {!viewingItem.is_active && (
                                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-900/50 text-gray-200 border border-gray-700/50 backdrop-blur-md">
                                        INACTIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{viewingItem.name}</h2>
                                    <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded text-[10px]">
                                        {viewingItem.category?.name || 'Uncategorized'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-gray-900 dark:text-white">₹{viewingItem.price}</div>
                                    {viewingItem.half_price && (
                                        <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Half: ₹{viewingItem.half_price}</div>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-6">
                                {viewingItem.description || 'No description provided.'}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800/60">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-slate-400 font-medium">Availability</span>
                                    <span className={`font-bold ${viewingItem.is_available !== false ? 'text-green-600' : 'text-red-500'}`}>
                                        {viewingItem.is_available !== false ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-slate-400 font-medium">Spicy Customizable</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {viewingItem.is_spicy_customizable === null ? 'Inherit' : (viewingItem.is_spicy_customizable ? 'Yes' : 'No')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setEditingItem(viewingItem);
                                    setViewingItem(null);
                                }}
                                className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center"
                            >
                                <Edit2 className="w-4 h-4 mr-1.5" /> Edit Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {deleteConfirmItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Menu Item?</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
                                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{deleteConfirmItem.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmItem(null)}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        deleteItemMutation.mutate(deleteConfirmItem.id);
                                        setDeleteConfirmItem(null);
                                    }}
                                    disabled={deleteItemMutation.isPending}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {deleteItemMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuItems;
