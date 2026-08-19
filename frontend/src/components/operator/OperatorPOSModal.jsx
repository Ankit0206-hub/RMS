import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, ShoppingBag, ShoppingCart, Utensils, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

const OperatorPOSModal = ({ sessionId, tableId, onClose, onOrderPlaced, isDirectOrder = false }) => {
    const [activeCat, setActiveCat] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Direct Order states
    const [tables, setTables] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(tableId || '');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [guests, setGuests] = useState(1);

    // Customization states
    const [customizingItem, setCustomizingItem] = useState(null);
    const [prepType, setPrepType] = useState('Full Plate');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [selectedAddons, setSelectedAddons] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                if (isDirectOrder) {
                    const tablesData = await waiterApi.getTables();
                    setTables(tablesData.filter(t => t.status === 'Empty' || t.status === 'Reserved'));
                }

                const data = await waiterApi.getMenu();
                const cats = ['All', ...data.map(c => c.name)];
                setCategories(cats);
                
                let allItems = [];
                data.forEach(c => {
                    c.items.forEach(i => {
                        let img_url = i.image_url;
                        if (img_url && img_url.startsWith('/')) {
                            img_url = `${img_url}`;
                        }
                        allItems.push({
                            ...i,
                            category: { name: c.name, is_spicy_customizable: c.is_spicy_customizable },
                            qty: 0,
                            img: img_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80'
                        });
                    });
                });
                setItems(allItems);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load POS data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [isDirectOrder]);

    const handleFirstAdd = (item) => {
        if ((item.variant_groups && item.variant_groups.length > 0) || 
            (item.addon_groups && item.addon_groups.length > 0) || 
            item.half_price != null || 
            (item.is_spicy_customizable ?? item.category?.is_spicy_customizable ?? false)) {
            
            setCustomizingItem({ ...item, cartId: Date.now().toString() });
            setPrepType('Full Plate');
            setSpiceLevel('');
            const defaultVars = {};
            if (item.variant_groups) {
                item.variant_groups.forEach(vg => {
                    const defaultVar = vg.variants.find(v => v.is_default);
                    if (defaultVar) defaultVars[vg.id] = defaultVar.id;
                    else if (vg.variants.length > 0) defaultVars[vg.id] = vg.variants[0].id;
                });
            }
            setSelectedVariants(defaultVars);
            setSelectedAddons({});
        } else {
            // Add directly if no customization needed
            updateQty(item.id, 1, null);
        }
    };

    const confirmCustomization = () => {
        const basePrice = customizingItem.originalPrice || customizingItem.price;
        let newPrice = prepType === 'Half Plate' ? (customizingItem.half_price != null ? customizingItem.half_price : Math.round(basePrice * 0.6)) : basePrice;
        
        if (customizingItem.variant_groups) {
            customizingItem.variant_groups.forEach(vg => {
                const selectedId = selectedVariants[vg.id];
                if (selectedId) {
                    const variant = vg.variants.find(v => v.id === selectedId);
                    if (variant) newPrice += variant.extra_price;
                }
            });
        }

        if (customizingItem.addon_groups) {
            customizingItem.addon_groups.forEach(ag => {
                ag.addons.forEach(addon => {
                    if (selectedAddons[addon.id]) newPrice += addon.price;
                });
            });
        }
        
        const cartItem = { 
            ...customizingItem, 
            qty: 1, 
            prepType,
            spiceLevel,
            selectedVariants, 
            selectedAddons, 
            price: newPrice, 
            originalPrice: basePrice 
        };

        // If editing an existing cart item
        if (customizingItem.isEditingCart) {
            setItems(items.map(i => i.cartId === customizingItem.cartId ? cartItem : i));
        } else {
            // Add as new cart item
            setItems([...items, cartItem]);
        }
        
        setCustomizingItem(null);
    };

    const updateQty = (id, delta, cartId) => {
        if (cartId) {
            setItems(items.map(item => {
                if (item.cartId === cartId) {
                    return { ...item, qty: Math.max(0, item.qty + delta) };
                }
                return item;
            }));
        } else {
            // For non-customized simple items added from the menu
            let found = false;
            let newItems = items.map(item => {
                // Check if a simple version of this item already exists in the cart
                const isSimple = item.id === id && item.cartId && 
                                (!item.selectedVariants || Object.keys(item.selectedVariants).length === 0) && 
                                (!item.selectedAddons || Object.keys(item.selectedAddons).length === 0) && 
                                (!item.prepType || item.prepType === 'Full Plate') && 
                                !item.spiceLevel;
                if (isSimple) {
                    found = true;
                    return { ...item, qty: Math.max(0, item.qty + delta) };
                }
                return item;
            });
            
            if (!found && delta > 0) {
                const baseItem = items.find(i => i.id === id && !i.cartId);
                if (baseItem) {
                    newItems.push({ ...baseItem, qty: 1, cartId: Date.now().toString() });
                }
            }
            setItems(newItems);
        }
    };

    const cartItems = items.filter(item => item.qty > 0 && item.cartId);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        try {
            let targetSessionId = sessionId;
            if (isDirectOrder) {
                if (!selectedTableId || !customerName || !customerPhone || !guests) {
                    toast.error("Please fill all customer details and select a table");
                    return;
                }
                if (customerPhone.length !== 10) {
                    toast.error("Please enter a valid 10-digit contact number");
                    return;
                }
                const sessionData = {
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    guests: guests
                };
                const res = await waiterApi.startSession(selectedTableId, sessionData);
                targetSessionId = res.session_id;
            }

            const orderData = {
                session_id: targetSessionId,
                items: cartItems.map(item => {
                    const notesParts = [];
                    if (item.prepType && item.prepType !== 'Full Plate') notesParts.push(item.prepType);
                    if (item.spiceLevel) notesParts.push(item.spiceLevel);
                    if (item.selectedVariants && item.variant_groups) {
                        item.variant_groups.forEach(vg => {
                            const selectedId = item.selectedVariants[vg.id];
                            if (selectedId) {
                                const variant = vg.variants.find(v => v.id === selectedId);
                                if (variant) notesParts.push(`${vg.name}: ${variant.name}`);
                            }
                        });
                    }
                    if (item.selectedAddons && item.addon_groups) {
                        const addons = [];
                        item.addon_groups.forEach(ag => {
                            ag.addons.forEach(addon => {
                                if (item.selectedAddons[addon.id]) addons.push(addon.name);
                            });
                        });
                        if (addons.length > 0) notesParts.push(`Addons: ${addons.join(', ')}`);
                    }
                    return {
                        menu_item_id: item.id,
                        quantity: item.qty,
                        notes: notesParts.join(' | ') || undefined
                    };
                })
            };

            await waiterApi.createOrder(targetSessionId, orderData);
            toast.success('Order placed successfully!');
            onOrderPlaced();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to place order");
            console.error(err);
        }
    };

    const menuItems = items.filter(i => !i.cartId); // Base menu items

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-[1200px] h-[90vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 relative">
                
                {/* LEFT SIDE - MENU */}
                <div className="flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {isDirectOrder ? 'Walk-in Order' : `Add Items to Table ${tableId}`}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select items to add to the order</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors md:hidden">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4 shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                        <div className="relative mb-4">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium text-gray-800 dark:text-white transition-all outline-none"
                            />
                        </div>
                        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide snap-x">
                            {categories.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => setActiveCat(cat)} 
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap snap-start border ${
                                        activeCat === cat 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {menuItems
                                    .filter(item => (activeCat === 'All' || item.category.name === activeCat) && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(item => (
                                    <div key={item.id} className={`bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors ${!item.is_available ? 'opacity-50 grayscale' : ''}`}>
                                        <img src={item.img} alt={item.name} className="h-16 w-16 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-slate-700" />
                                        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate">{item.name}</h3>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">₹ {item.price}</p>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <button 
                                                    onClick={() => handleFirstAdd(item)} 
                                                    disabled={!item.is_available} 
                                                    className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - CART */}
                <div className="w-full md:w-[380px] lg:w-[420px] bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col h-full shrink-0">
                    <div className="p-5 border-b border-gray-200 dark:border-slate-800 shrink-0 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                            <ShoppingBag className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Current Order
                        </h2>
                        <button onClick={onClose} className="hidden md:block p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin">
                        {isDirectOrder && (
                            <div className="mb-6 space-y-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                                <div>
                                    <select value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                                        <option value="" disabled>Select Table</option>
                                        {tables.map(t => <option key={t.id} value={t.id}>Table {t.table_number}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="flex gap-3">
                                    <input type="tel" placeholder="Phone" maxLength={10} value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))} className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                    <div className="flex items-center justify-between border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 shrink-0 w-24 px-1">
                                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">{guests}</span>
                                        <button onClick={() => setGuests(guests + 1)} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
                                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item.cartId} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/50 shadow-sm">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-white pr-2">{item.name}</h4>
                                                <span className="font-bold text-sm text-gray-800 dark:text-white">₹{(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                            
                                            {/* Customizations summary */}
                                            {((item.selectedVariants && Object.keys(item.selectedVariants).length > 0) || (item.selectedAddons && Object.keys(item.selectedAddons).length > 0) || item.prepType || item.spiceLevel) && (
                                                <button 
                                                    onClick={() => setCustomizingItem({ ...item, isEditingCart: true })}
                                                    className="flex items-center text-[11px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mt-1 mb-2"
                                                >
                                                    <Edit3 className="w-3 h-3 mr-1" /> Edit customization
                                                </button>
                                            )}
                                            
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">₹{item.price.toFixed(2)} each</span>
                                                <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-0.5">
                                                    <button onClick={() => updateQty(item.id, -1, item.cartId)} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1, item.cartId)} className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-200 dark:border-slate-800 shrink-0 bg-gray-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</span>
                            <span className="text-2xl font-black text-gray-800 dark:text-white">₹ {cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={cartItems.length === 0}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
                        >
                            Place Order
                        </button>
                    </div>
                </div>

                {/* Customization Modal Layer */}
                {customizingItem && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6 max-h-full overflow-y-auto scrollbar-hide">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">{customizingItem.name}</h3>
                            
                            <div className="space-y-5">
                                {customizingItem.half_price != null && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Preparation</label>
                                        <div className="flex gap-2">
                                            {['Full Plate', 'Half Plate'].map(type => (
                                                <button key={type} onClick={() => setPrepType(type)} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border ${prepType === type ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}>{type}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(customizingItem.is_spicy_customizable ?? customizingItem.category?.is_spicy_customizable ?? false) && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Spiciness</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Low Spicy', 'Medium', 'Extra Spicy'].map(level => (
                                                <button key={level} onClick={() => setSpiceLevel(level)} className={`flex-1 min-w-[30%] py-2 rounded-lg font-bold text-sm transition-all border ${spiceLevel === level ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}>{level}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {customizingItem.variant_groups?.map((vg) => (
                                    <div key={vg.id}>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{vg.name}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {vg.variants.map(v => (
                                                <button key={v.id} onClick={() => setSelectedVariants(prev => ({ ...prev, [vg.id]: v.id }))} className={`flex-1 min-w-[30%] py-2 px-2 rounded-lg font-bold text-xs transition-all border ${selectedVariants[vg.id] === v.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}>
                                                    {v.name} {v.extra_price > 0 && `(+₹${v.extra_price})`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {customizingItem.addon_groups?.map((ag) => (
                                    <div key={ag.id}>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{ag.name}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ag.addons.map(addon => (
                                                <button key={addon.id} onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))} className={`flex-1 min-w-[30%] py-2 px-2 rounded-lg font-bold text-xs transition-all border flex flex-col items-center ${selectedAddons[addon.id] ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}>
                                                    <span>{addon.name}</span>
                                                    {addon.price > 0 && <span className="opacity-70 mt-0.5">+₹{addon.price}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <button onClick={() => setCustomizingItem(null)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button onClick={confirmCustomization} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">{customizingItem.isEditingCart ? 'Save' : 'Add Item'}</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OperatorPOSModal;
