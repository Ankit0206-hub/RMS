import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Pagination } from '../../components/ui';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
    Plus, Search, Edit2, Eye, MoreVertical, LayoutGrid, 
    Coffee, Pizza, Utensils, IceCream, CupSoda, Sandwich, Soup, Salad,
    AlertCircle, PauseCircle, CheckCircle2, ChevronRight, Upload
} from 'lucide-react';
import EditItemModal from './EditItemModal';

const MenuItems = () => {
    const navigate = useNavigate();
    const isOperator = window.location.pathname.startsWith('/operator');
    const addPath = isOperator ? '/operator/categories' : '/admin/menu/add';
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState(null);

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
                return <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${isAvailable ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>;
            }
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => setEditingItem(row)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400 transition-colors"><MoreVertical className="h-4 w-4" /></button>
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
                
                {/* Left Side: Data Table (span 3) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white dark:bg-slate-900">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">Menu Items</h3>
                        
                        <div className="flex flex-col md:flex-row items-stretch md:items-center w-full lg:w-auto gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search menu items..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full md:w-64 transition-all"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
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
                            return matchesSearch && matchesCategory && matchesStatus;
                        }) || [];

                        const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;
                        const paginatedItems = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

                        return (
                            <>
                                <div className="flex-1">
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

                {/* Right Side: Categories (span 1) */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 flex flex-col">
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
        </div>
    );
};

export default MenuItems;
