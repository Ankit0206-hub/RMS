import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api, { uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Save, Image as ImageIcon, X, Clock } from 'lucide-react';

const EditItemModal = ({ item, onClose }) => {
    const queryClient = useQueryClient();

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

    const { data: kitchens } = useQuery({
        queryKey: ['kitchensList'],
        queryFn: async () => {
            const response = await api.get('/admin/kitchen/list');
            return response.data.data || [];
        }
    });

    useEffect(() => {
        if (item) {
            setItemForm({
                item_code: item.item_code || '',
                name: item.name || '',
                description: item.description || '',
                item_type: item.item_type || 'veg',
                kitchen_id: item.kitchen_id ? item.kitchen_id.toString() : '',
                price: item.price || '',
                half_price: item.half_price || '',
                image_file: null,
                image_preview: item.images && item.images.length > 0 ? item.images[0].image_url : null,
                variant_groups: item.variant_groups || [],
                addon_groups: item.addon_groups || []
            });
        }
    }, [item]);

    const updateItemMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put(`/admin/menu/${item.id}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Item updated successfully!");
            queryClient.invalidateQueries(['menuItemsList']);
            queryClient.invalidateQueries(['menuItems']);
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.detail || "Failed to update item");
        }
    });

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
            item_code: itemForm.item_code,
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            half_price: itemForm.half_price ? parseFloat(itemForm.half_price) : null,
            item_type: itemForm.item_type,
            kitchen_id: itemForm.kitchen_id ? parseInt(itemForm.kitchen_id) : null,
            is_active: item.is_active,
            is_available: item.is_available,
            variant_groups: itemForm.variant_groups,
            addon_groups: itemForm.addon_groups
        };
        
        if (imageUrl) {
            payload.image_url = imageUrl;
        }

        updateItemMutation.mutate(payload);
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center bg-black/60 font-inter py-8 px-4 overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center">
                        <button onClick={onClose} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Item</h2>
                            <p className="text-sm text-gray-500">{item.name}</p>
                        </div>
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
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-end sticky bottom-0 z-20">
                    <button 
                        onClick={handleSaveItem}
                        disabled={updateItemMutation.isPending}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {updateItemMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditItemModal;
