import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api, { uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    ArrowLeft, Plus, Trash2, Save, Image as ImageIcon, Info, ChevronRight, X, Clock, Edit2
} from 'lucide-react';

const AddCategoryWithItems = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isOperator = window.location.pathname.startsWith('/operator');
    const returnPath = isOperator ? '/operator/menu-items' : '/admin/menu';

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [editingCategoryImage, setEditingCategoryImage] = useState(null);
    
    // Add Item Form State
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [itemForm, setItemForm] = useState({
        item_code: '',
        name: '',
        description: '',
        item_type: 'veg',
        kitchen_id: '',
        price: '',
        half_price: '',
        image_file: null,
        image_preview: null,
        variant_groups: [],
        addon_groups: []
    });

    const { data: categories, isLoading: isCatLoading } = useQuery({
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

    const defaultKitchenId = React.useMemo(() => {
        if (!kitchens) return '';
        const main = kitchens.find(k => k.name.toLowerCase().includes('main'));
        if (main) return main.id.toString();
        return kitchens.length > 0 ? kitchens[0].id.toString() : '';
    }, [kitchens]);

    const { data: menuItemsData } = useQuery({
        queryKey: ['menuItemsList'],
        queryFn: async () => {
            const response = await api.get('/admin/menu/');
            return response.data.data;
        }
    });

    const existingItems = menuItemsData?.filter(item => item.category_id === selectedCategoryId) || [];

    React.useEffect(() => {
        if (defaultKitchenId && !itemForm.kitchen_id) {
            setItemForm(prev => ({ ...prev, kitchen_id: defaultKitchenId }));
        }
    }, [defaultKitchenId]);

    const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

    const createCategoryMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/admin/categories/', data);
            return res.data.data;
        },
        onSuccess: (newCat) => {
            queryClient.invalidateQueries(['categoriesList']);
            setNewCategoryName('');
            setNewCategoryImage(null);
            setIsAddingCategory(false);
            setSelectedCategoryId(newCat.id);
            toast.success("Category created!");
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.put(`/admin/categories/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categoriesList']);
            setIsEditingCategory(false);
            setEditingCategoryName('');
            setEditingCategoryImage(null);
            toast.success("Category updated!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Failed to update category");
        }
    });

    const createItemMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/admin/menu/', data);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("Item added successfully!");
            queryClient.invalidateQueries(['menuItemsList']);
            resetItemForm();
            setIsAddingItem(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Failed to create item");
        }
    });

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        
        let imageUrl = null;
        if (newCategoryImage) {
            imageUrl = await uploadImage(newCategoryImage);
        }

        createCategoryMutation.mutate({ name: newCategoryName, is_active: true, image_url: imageUrl });
    };

    const handleUpdateCategory = async () => {
        if (!editingCategoryName.trim()) return;
        
        let imageUrl = selectedCategory?.image_url;
        if (editingCategoryImage) {
            imageUrl = await uploadImage(editingCategoryImage);
        }

        updateCategoryMutation.mutate({ 
            id: selectedCategoryId, 
            data: { name: editingCategoryName, image_url: imageUrl } 
        });
    };

    const resetItemForm = () => {
        setItemForm({
            item_code: '',
            name: '',
            description: '',
            item_type: 'veg',
            kitchen_id: defaultKitchenId,
            price: '',
            half_price: '',
            image_file: null,
            image_preview: null,
            variant_groups: [],
            addon_groups: []
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setItemForm(prev => ({
                ...prev,
                image_file: file,
                image_preview: URL.createObjectURL(file)
            }));
        }
    };

    // Variant Handlers
    const addVariantGroup = () => {
        setItemForm(prev => ({
            ...prev,
            variant_groups: [...prev.variant_groups, { name: '', variants: [{ name: '', extra_price: 0 }] }]
        }));
    };
    const updateVariantGroup = (gIndex, field, value) => {
        const updated = [...itemForm.variant_groups];
        updated[gIndex][field] = value;
        setItemForm({ ...itemForm, variant_groups: updated });
    };
    const addVariant = (gIndex) => {
        const updated = [...itemForm.variant_groups];
        updated[gIndex].variants.push({ name: '', extra_price: 0 });
        setItemForm({ ...itemForm, variant_groups: updated });
    };
    const updateVariant = (gIndex, vIndex, field, value) => {
        const updated = [...itemForm.variant_groups];
        updated[gIndex].variants[vIndex][field] = value;
        setItemForm({ ...itemForm, variant_groups: updated });
    };
    const removeVariantGroup = (gIndex) => {
        const updated = itemForm.variant_groups.filter((_, i) => i !== gIndex);
        setItemForm({ ...itemForm, variant_groups: updated });
    };
    const removeVariant = (gIndex, vIndex) => {
        const updated = [...itemForm.variant_groups];
        updated[gIndex].variants = updated[gIndex].variants.filter((_, i) => i !== vIndex);
        setItemForm({ ...itemForm, variant_groups: updated });
    };

    // Addon Handlers
    const addAddonGroup = () => {
        setItemForm(prev => ({
            ...prev,
            addon_groups: [...prev.addon_groups, { name: '', min_selections: 0, max_selections: 10, addons: [{ name: '', price: 0, item_type: 'veg' }] }]
        }));
    };
    const updateAddonGroup = (gIndex, field, value) => {
        const updated = [...itemForm.addon_groups];
        updated[gIndex][field] = value;
        setItemForm({ ...itemForm, addon_groups: updated });
    };
    const addAddon = (gIndex) => {
        const updated = [...itemForm.addon_groups];
        updated[gIndex].addons.push({ name: '', price: 0, item_type: 'veg' });
        setItemForm({ ...itemForm, addon_groups: updated });
    };
    const updateAddon = (gIndex, aIndex, field, value) => {
        const updated = [...itemForm.addon_groups];
        updated[gIndex].addons[aIndex][field] = value;
        setItemForm({ ...itemForm, addon_groups: updated });
    };
    const removeAddonGroup = (gIndex) => {
        const updated = itemForm.addon_groups.filter((_, i) => i !== gIndex);
        setItemForm({ ...itemForm, addon_groups: updated });
    };
    const removeAddon = (gIndex, aIndex) => {
        const updated = [...itemForm.addon_groups];
        updated[gIndex].addons = updated[gIndex].addons.filter((_, i) => i !== aIndex);
        setItemForm({ ...itemForm, addon_groups: updated });
    };

    const handleSaveItem = async () => {
        if (!itemForm.name || !itemForm.price || !itemForm.item_code) {
            toast.error("Please fill required fields (Code, Name, Price)");
            return;
        }

        let imageUrl = null;
        if (itemForm.image_file) {
            imageUrl = await uploadImage(itemForm.image_file);
        }

        const payload = {
            category_id: selectedCategoryId,
            item_code: itemForm.item_code,
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            half_price: itemForm.half_price ? parseFloat(itemForm.half_price) : null,
            item_type: itemForm.item_type,
            kitchen_id: itemForm.kitchen_id ? parseInt(itemForm.kitchen_id) : null,
            is_active: true,
            is_available: true,
            image_url: imageUrl,
            variant_groups: itemForm.variant_groups,
            addon_groups: itemForm.addon_groups
        };

        createItemMutation.mutate(payload);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900/50">
            {/* Left Sidebar - Categories */}
            <div className="w-80 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <button onClick={() => navigate(returnPath)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu Builder</h2>
                    <div className="w-9" />
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    {isAddingCategory ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Category Name"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <button 
                                    onClick={handleAddCategory}
                                    disabled={createCategoryMutation.isPending}
                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center shrink-0"
                                >
                                    {createCategoryMutation.isPending ? '...' : <Save className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setNewCategoryImage(null); }}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center justify-center shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file"
                                    accept="image/*"
                                    id="categoryImageInput"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setNewCategoryImage(e.target.files[0]);
                                        }
                                    }}
                                />
                                <label 
                                    htmlFor="categoryImageInput"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    {newCategoryImage ? newCategoryImage.name : 'Upload Category Image'}
                                </label>
                                {newCategoryImage && (
                                    <button 
                                        onClick={() => setNewCategoryImage(null)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAddingCategory(true)}
                            className="w-full py-2.5 px-4 text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors flex items-center justify-center border border-dashed border-indigo-200 dark:border-indigo-500/30"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isCatLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading categories...</div>
                    ) : categories?.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategoryId(cat.id); setIsAddingItem(false); }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${selectedCategoryId === cat.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                            <span>{cat.name}</span>
                            <ChevronRight className={`w-4 h-4 ${selectedCategoryId === cat.id ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 h-full overflow-hidden flex flex-col relative bg-gray-50 dark:bg-slate-900/50">
                {!selectedCategoryId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                        <Plus className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No Category Selected</h3>
                        <p>Select a category from the left to start adding items.</p>
                    </div>
                ) : !isAddingItem ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        {isEditingCategory ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 w-full max-w-md">
                                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Category</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Category Name</label>
                                        <input
                                            type="text"
                                            value={editingCategoryName}
                                            onChange={e => setEditingCategoryName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Category Image</label>
                                        <div className="flex items-center gap-2">
                                            {selectedCategory?.image_url && !editingCategoryImage && (
                                                <img src={selectedCategory.image_url} alt="Current" className="w-10 h-10 rounded-lg object-cover" />
                                            )}
                                            <input 
                                                type="file"
                                                accept="image/*"
                                                id="editCategoryImageInput"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setEditingCategoryImage(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <label 
                                                htmlFor="editCategoryImageInput"
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                {editingCategoryImage ? editingCategoryImage.name : 'Update Image'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <button 
                                            onClick={() => setIsEditingCategory(false)}
                                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleUpdateCategory}
                                            disabled={updateCategoryMutation.isPending}
                                            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            {updateCategoryMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedCategory?.image_url && (
                                    <img src={selectedCategory.image_url} alt={selectedCategory.name} className="w-24 h-24 rounded-2xl object-cover mb-4 shadow-sm" />
                                )}
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedCategory?.name}</h3>
                                    <button 
                                        onClick={() => {
                                            setEditingCategoryName(selectedCategory?.name);
                                            setEditingCategoryImage(null);
                                            setIsEditingCategory(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit Category"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-500 mb-6">You can now add items to this category.</p>
                                <button 
                                    onClick={() => setIsAddingItem(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center"
                                >
                                    <Plus className="w-5 h-5 mr-2" /> Add an Item
                                </button>
                                
                                {existingItems.length > 0 && (
                                    <div className="mt-10 w-full max-w-3xl">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Existing Items</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            {existingItems.map(item => (
                                                <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h5>
                                                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">₹{item.price}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            {item.is_veg ? (
                                                                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded border border-green-200 dark:border-green-500/20 font-medium">Veg</span>
                                                            ) : (
                                                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded border border-red-200 dark:border-red-500/20 font-medium">Non-Veg</span>
                                                            )}
                                                            {!item.is_active && (
                                                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 rounded font-medium">Inactive</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-slate-900/50">
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center sticky top-0 z-20 shadow-sm">
                            <button onClick={() => setIsAddingItem(false)} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Add an Item</h2>
                                <p className="text-sm text-gray-500">In {selectedCategory?.name}</p>
                            </div>
                        </div>

                        {/* Scrollable Form Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            
                            {/* Basic Details Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Details</h3>
                                
                                <div className="flex gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Item Code*</label>
                                            <input type="text" placeholder="e.g. R01" value={itemForm.item_code} onChange={e => setItemForm({...itemForm, item_code: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Type Item name*</label>
                                            <input type="text" placeholder="Item Name" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2">Item type*</label>
                                            <div className="flex gap-3">
                                                {['veg', 'non-veg', 'egg'].map(type => (
                                                    <label key={type} className={`flex items-center px-4 py-2 rounded-xl cursor-pointer border transition-colors ${itemForm.item_type === type ? (type === 'veg' ? 'border-green-500 bg-green-50 text-green-700' : type === 'non-veg' ? 'border-red-500 bg-red-50 text-red-700' : 'border-yellow-500 bg-yellow-50 text-yellow-700') : 'border-gray-200 bg-white'}`}>
                                                        <input type="radio" name="item_type" value={type} checked={itemForm.item_type === type} onChange={e => setItemForm({...itemForm, item_type: e.target.value})} className="sr-only" />
                                                        <span className="capitalize font-bold text-sm">{type === 'veg' ? '🟢 Veg' : type === 'non-veg' ? '🔴 Non-veg' : '🟡 Egg'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Kitchen (Optional)</label>
                                            <select 
                                                value={itemForm.kitchen_id} 
                                                onChange={e => setItemForm({...itemForm, kitchen_id: e.target.value})} 
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">No Kitchen Assigned</option>
                                                {kitchens?.map(k => (
                                                    <option key={k.id} value={k.id}>{k.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">+ Add a description</label>
                                            <textarea placeholder="Items with clear descriptions are twice as likely to be ordered" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="w-40 flex-shrink-0">
                                        <label className="cursor-pointer block w-full h-40 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl overflow-hidden relative group hover:border-indigo-500 transition-colors">
                                            {itemForm.image_preview ? (
                                                <img src={itemForm.image_preview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-800">
                                                    <ImageIcon className="w-8 h-8 mb-2" />
                                                    <span className="text-xs font-bold text-center">ADD<br/>PHOTO</span>
                                                    <div className="absolute bottom-[-10px] bg-white rounded-full p-1 shadow">
                                                        <Plus className="w-4 h-4 text-green-600" />
                                                    </div>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Item Pricing Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Item Pricing</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Full Price*</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-gray-500 font-bold">₹</span>
                                            <input type="number" placeholder="Item Price" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Half Price (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-gray-500 font-bold">₹</span>
                                            <input type="number" placeholder="Half Price" value={itemForm.half_price} onChange={e => setItemForm({...itemForm, half_price: e.target.value})} className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customisations Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customisations</h3>
                                    <p className="text-sm text-gray-500">Include variants (e.g. Size, Preparation type)</p>
                                </div>
                                
                                {itemForm.variant_groups.map((vg, gIndex) => (
                                    <div key={gIndex} className="mb-6 p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <input type="text" placeholder="Variant Group Name (e.g. Size)" value={vg.name} onChange={e => updateVariantGroup(gIndex, 'name', e.target.value)} className="font-bold bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 py-1" />
                                            <button onClick={() => removeVariantGroup(gIndex)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-3">
                                            {vg.variants.map((v, vIndex) => (
                                                <div key={vIndex} className="flex gap-3 items-center">
                                                    <input type="text" placeholder="Option (e.g. Small)" value={v.name} onChange={e => updateVariant(gIndex, vIndex, 'name', e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm" />
                                                    <div className="relative w-32">
                                                        <span className="absolute left-3 top-2 text-gray-500 font-bold text-sm">+₹</span>
                                                        <input type="number" placeholder="Extra Price" value={v.extra_price} onChange={e => updateVariant(gIndex, vIndex, 'extra_price', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm" />
                                                    </div>
                                                    <button onClick={() => removeVariant(gIndex, vIndex)} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addVariant(gIndex)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add Option</button>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addVariantGroup} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center">
                                    + Create my own variant
                                </button>
                            </div>

                            {/* Add-ons Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Include add-ons</h3>
                                    <p className="text-sm text-gray-500">Additional items that customers can buy with this dish</p>
                                </div>

                                {itemForm.addon_groups.map((ag, gIndex) => (
                                    <div key={gIndex} className="mb-6 p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <input type="text" placeholder="Add-on Group Name (e.g. Toppings)" value={ag.name} onChange={e => updateAddonGroup(gIndex, 'name', e.target.value)} className="font-bold bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 py-1" />
                                            <button onClick={() => removeAddonGroup(gIndex)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-3">
                                            {ag.addons.map((a, aIndex) => (
                                                <div key={aIndex} className="flex gap-3 items-center">
                                                    <input type="text" placeholder="Item Name (e.g. Extra Cheese)" value={a.name} onChange={e => updateAddon(gIndex, aIndex, 'name', e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm" />
                                                    <div className="relative w-28">
                                                        <span className="absolute left-3 top-2 text-gray-500 font-bold text-sm">₹</span>
                                                        <input type="number" placeholder="Price" value={a.price} onChange={e => updateAddon(gIndex, aIndex, 'price', e.target.value)} className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm" />
                                                    </div>
                                                    <select value={a.item_type} onChange={e => updateAddon(gIndex, aIndex, 'item_type', e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                                                        <option value="veg">Veg</option>
                                                        <option value="non-veg">Non-veg</option>
                                                        <option value="egg">Egg</option>
                                                    </select>
                                                    <button onClick={() => removeAddon(gIndex, aIndex)} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addAddon(gIndex)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add Item</button>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={addAddonGroup} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center">
                                    + Create my own add-on
                                </button>
                            </div>

                            {/* Item Timings Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Item Timings</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center text-sm font-medium text-gray-700 dark:text-slate-300">
                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                        Item is available at all times when restaurant is open
                                    </div>
                                    <button className="text-sm font-bold text-orange-600">Change</button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-end sticky bottom-0 z-20">
                            <button 
                                onClick={handleSaveItem}
                                disabled={createItemMutation.isPending}
                                className="w-full sm:w-auto px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {createItemMutation.isPending ? 'Saving...' : 'Save & Submit for review'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddCategoryWithItems;
