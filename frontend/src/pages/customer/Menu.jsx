import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useSettings } from "../../contexts/SettingsContext";
import api from '../../services/api';
import customerApi from '../../services/customerApi';
import { getWsUrl } from "../../services/api";
import { playNotificationSound } from "../../utils/audio";
import { ShoppingCart, Utensils, CheckCircle, Search } from 'lucide-react';
import { Button, Card, Modal } from '../../components/ui';
import { toast, Toaster } from 'react-hot-toast';

const CustomerMenu = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { settings } = useSettings();
    const tableId = location.state?.tableId || searchParams.get('table_id') || searchParams.get('table') || 1;
    
    const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
    const queryClient = useQueryClient();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const [ws, setWs] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [customizingItem, setCustomizingItem] = useState(null);
    const [prepType, setPrepType] = useState('Full Plate');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [selectedAddons, setSelectedAddons] = useState({});

    // 1. Initialize Session
    const startSessionMutation = useMutation({
        mutationFn: () => customerApi.startSession({
            table_id: tableId.toString(),
            guests: 2
        }),
        onSuccess: (res) => {
            setSessionId(res.session_id);
            if (res.token) {
                localStorage.setItem('customer_token', res.token);
            }
        }
    });

    useEffect(() => {
        if (!sessionId) {
            startSessionMutation.mutate();
        }
    }, [tableId, sessionId]);

    // 2. Listen to global order events instead of managing WebSocket locally
    useEffect(() => {
        const handleOrderEvent = () => {
            // Toast will be managed globally, but if we need a specific UI update on Menu, do it here.
        };
        window.addEventListener('orderUpdatedLocally', handleOrderEvent);
        return () => window.removeEventListener('orderUpdatedLocally', handleOrderEvent);
    }, []);

    // 3. Fetch Menu
    const { data: menuData, isLoading } = useQuery({
        queryKey: ['public_menu'],
        queryFn: async () => {
            const res = await customerApi.getMenu();
            // Flatten categories to get items
            const items = [];
            res.forEach(cat => {
                if (cat.items) {
                    items.push(...cat.items);
                }
            });
            return items;
        }
    });

    const handleFirstAdd = (item) => {
        setCustomizingItem(item);
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
        
        const notesParts = [];
        if (prepType && prepType !== 'Full Plate') notesParts.push(prepType);
        if (spiceLevel) notesParts.push(spiceLevel);
        if (customizingItem.variant_groups) {
            customizingItem.variant_groups.forEach(vg => {
                const selectedId = selectedVariants[vg.id];
                if (selectedId) {
                    const variant = vg.variants.find(v => v.id === selectedId);
                    if (variant) notesParts.push(`${vg.name}: ${variant.name}`);
                }
            });
        }
        if (customizingItem.addon_groups) {
            const addons = [];
            customizingItem.addon_groups.forEach(ag => {
                ag.addons.forEach(addon => {
                    if (selectedAddons[addon.id]) addons.push(addon.name);
                });
            });
            if (addons.length > 0) notesParts.push(`Addons: ${addons.join(', ')}`);
        }

        setCart([...cart, { 
            ...customizingItem, 
            cartId: Math.random(),
            price: newPrice,
            notes: notesParts.join(' | ') || undefined,
            prepType,
            spiceLevel,
            selectedVariants,
            selectedAddons
        }]);
        setCustomizingItem(null);
        toast.success(`Added ${customizingItem.name} to cart`);
    };

    const placeOrderMutation = useMutation({
        mutationFn: (orderItems) => api.post('/admin/ordering/orders', {
            session_id: sessionId,
            items: orderItems,
            special_instructions: "Please make it spicy."
        }),
        onSuccess: () => {
            toast.success("Order sent to kitchen!");
            setCart([]);
            setIsCartOpen(false);
        }
    });

    const handlePlaceOrder = () => {
        if (!cart.length) return;
        
        const itemMap = {};
        cart.forEach(item => {
            const key = item.id + (item.notes ? '|' + item.notes : '');
            if (itemMap[key]) itemMap[key].quantity += 1;
            else itemMap[key] = { menu_item_id: item.id, quantity: 1, notes: item.notes || "" };
        });
        
        const items = Object.values(itemMap);
        placeOrderMutation.mutate(items);
    };

    if (isLoading || !sessionId) return <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center text-gray-900 dark:text-white">Loading Menu...</div>;

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price), 0);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white pb-24">
            <Toaster position="top-center" toastOptions={{ style: { background: '#171717', color: '#111827', border: '1px solid #333' }}}/>
            
            <header className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center">
                    <Utensils className="h-6 w-6 text-cyan-600 mr-2" />
                    <h1 className="text-xl font-bold">{settings?.restaurant_name || 'DineOps'} Menu</h1>
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400">Table {tableId}</div>
            </header>

            {orderStatus && (
                <div className="bg-cyan-600/20 border-b border-cyan-500/50 p-3 text-center text-indigo-300 text-sm font-medium flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Current Order Status: {orderStatus}
                </div>
            )}

            <div className="px-4 pt-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                    const filteredItems = (menuData || []).filter(item => 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredItems.length === 0 && !isLoading) {
                        return (
                            <div className="col-span-full flex flex-col items-center justify-center h-48 text-gray-400">
                                <Utensils size={40} className="mb-3 text-gray-300 dark:text-slate-600" />
                                <h2 className="text-lg font-bold text-gray-600 dark:text-slate-400">No items found</h2>
                                <p className="text-sm">Try searching for something else</p>
                            </div>
                        );
                    }

                    return filteredItems.map(item => (
                        <Card key={item.id} className={`p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 ${!item.is_available ? "opacity-50 grayscale" : ""}`}>
                            <div>
                                <h3 className="font-bold">{item.name}{!item.is_available && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">Out of Stock</span>}</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">{item.description}</p>
                                <p className="text-cyan-600 font-medium mt-1">₹{parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <Button onClick={() => handleFirstAdd(item)} size="sm" disabled={!item.is_available}>Add</Button>
                        </Card>
                    ));
                })()}
            </div>

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center z-20">
                    <div>
                        <div className="text-gray-500 dark:text-slate-400 text-sm">{cart.length} items</div>
                        <div className="font-bold text-lg">₹{cartTotal.toFixed(2)}</div>
                    </div>
                    <Button onClick={() => setIsCartOpen(true)} className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
                    </Button>
                </div>
            )}

            <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Your Order">
                <div className="space-y-4">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                            <div>
                                <span>{item.name}</span>
                                {item.notes && <div className="text-[10px] text-gray-500">{item.notes}</div>}
                            </div>
                            <span>₹{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <Button 
                        onClick={handlePlaceOrder} 
                        className="w-full mt-4"
                        disabled={placeOrderMutation.isPending}
                    >
                        {placeOrderMutation.isPending ? 'Sending...' : 'Send to Kitchen'}
                    </Button>
                </div>
            </Modal>

            {/* Customization Modal */}
            <Modal isOpen={!!customizingItem} onClose={() => setCustomizingItem(null)} title={customizingItem?.name || "Customize"}>
                {customizingItem && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {customizingItem.half_price != null && (
                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">Preparation</label>
                                <div className="flex gap-2">
                                    {['Full Plate', 'Half Plate'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setPrepType(type)}
                                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border ${
                                                prepType === type 
                                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm' 
                                                : 'bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(customizingItem.is_spicy_customizable ?? customizingItem.category?.is_spicy_customizable ?? false) && (
                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">Spiciness</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Low Spicy', 'Medium', 'Extra Spicy'].map(level => (
                                        <button 
                                            key={level}
                                            onClick={() => setSpiceLevel(level)}
                                            className={`flex-1 min-w-[30%] py-2 rounded-lg font-bold text-sm transition-all border ${
                                                spiceLevel === level 
                                                ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' 
                                                : 'bg-white text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-gray-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {customizingItem.variant_groups?.map((vg) => (
                            <div key={vg.id}>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">{vg.name}</label>
                                <div className="flex flex-wrap gap-2">
                                    {vg.variants.map(v => (
                                        <button 
                                            key={v.id}
                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [vg.id]: v.id }))}
                                            className={`flex-1 min-w-[30%] py-2 rounded-lg font-bold text-sm transition-all border ${
                                                selectedVariants[vg.id] === v.id 
                                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm' 
                                                : 'bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {v.name} {v.extra_price > 0 && `(+₹${v.extra_price})`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {customizingItem.addon_groups?.map((ag) => (
                            <div key={ag.id}>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                                    {ag.name} {ag.max_selections > 0 && <span className="text-[10px] normal-case text-gray-400">(Max {ag.max_selections})</span>}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {ag.addons.map(addon => (
                                        <button 
                                            key={addon.id}
                                            onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                                            className={`flex-1 min-w-[30%] py-2 px-3 rounded-lg font-bold text-sm transition-all border flex items-center justify-between ${
                                                selectedAddons[addon.id] 
                                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800' 
                                                : 'bg-white text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-gray-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <span>{addon.name}</span>
                                            {addon.price > 0 && <span className="opacity-70 text-[11px] ml-1">+₹{addon.price}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <Button onClick={confirmCustomization} className="w-full mt-6">
                            Add to Order
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CustomerMenu;
