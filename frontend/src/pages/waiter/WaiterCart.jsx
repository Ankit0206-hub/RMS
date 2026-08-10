import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Edit3, ShoppingBag, User, Phone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

export default function WaiterCart() {
    const navigate = useNavigate();
    const location = useLocation();

    const [items, setItems] = useState(location.state?.cartItems || []);
    const tableId = location.state?.tableId || '';
    const sessionId = location.state?.sessionId;
    const [specialInstructions, setSpecialInstructions] = useState('');

    const isDirectOrder = !sessionId;
    const [tables, setTables] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(tableId);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [guests, setGuests] = useState(1);

    useEffect(() => {
        if (isDirectOrder) {
            waiterApi.getTables().then(data => {
                setTables(data.filter(t => t.status === 'Empty' || t.status === 'Reserved'));
            }).catch(err => {
                console.error(err);
                toast.error("Failed to load tables");
            });
        }
    }, [isDirectOrder]);

    const [editingItem, setEditingItem] = useState(null);
    const [prepType, setPrepType] = useState('Full Plate');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({});
    const [selectedAddons, setSelectedAddons] = useState({});

    const saveCustomization = () => {
        setItems(items.map(item => {
            if (item.id === editingItem.id) {
                const basePrice = item.originalPrice || item.price;
                let newPrice = prepType === 'Half Plate' ? (item.half_price != null ? item.half_price : Math.round(basePrice * 0.6)) : basePrice;
                
                // Add variant prices
                if (item.variant_groups) {
                    item.variant_groups.forEach(vg => {
                        const selectedId = selectedVariants[vg.id];
                        if (selectedId) {
                            const variant = vg.variants.find(v => v.id === selectedId);
                            if (variant) newPrice += variant.extra_price;
                        }
                    });
                }

                // Add addon prices
                if (item.addon_groups) {
                    item.addon_groups.forEach(ag => {
                        ag.addons.forEach(addon => {
                            if (selectedAddons[addon.id]) {
                                newPrice += addon.price;
                            }
                        });
                    });
                }

                return { ...item, prepType, spiceLevel, selectedVariants, selectedAddons, price: newPrice, originalPrice: basePrice };
            }
            return item;
        }));
        setEditingItem(null);
        toast.success('Customization updated');
    };

    const updateQty = (id, delta) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">


            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/waiter/menu', { state: { cartItems: items, tableId, sessionId } })} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
                                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Confirm Order <span className="text-gray-500 font-bold">({isDirectOrder ? 'New Table' : tableId})</span></h1>
                        </div>
                        <div className="w-10"></div>
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 w-full space-y-4 pb-32 max-w-4xl mx-auto flex-1">
                    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border border-white/40">
                        {isDirectOrder && (
                            <div className="mb-6 space-y-4 border-b border-white/30 pb-6">
                                <h2 className="font-black text-gray-800 text-lg mb-3 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-rose-500" />
                                    Customer Details
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] md:text-xs font-bold text-gray-700 block mb-1.5">Select Table *</label>
                                        <select 
                                            value={selectedTableId}
                                            onChange={e => setSelectedTableId(e.target.value)}
                                            className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-3.5 py-2.5 md:py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all appearance-none"
                                        >
                                            <option value="" disabled>-- Select Available Table --</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id}>Table {t.table_number}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[11px] md:text-xs font-bold text-gray-700 block mb-1.5">Customer Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="Rahul Sharma"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-3.5 py-2.5 md:py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all placeholder:text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] md:text-xs font-bold text-gray-700 block mb-1.5">Contact Number *</label>
                                        <div className="flex items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-3.5 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-400/20 transition-all">
                                            <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                            <input 
                                                type="tel" 
                                                placeholder="9876543210"
                                                value={customerPhone}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setCustomerPhone(val);
                                                }}
                                                maxLength={10}
                                                className="w-full bg-transparent py-2.5 md:py-3 text-sm font-bold text-gray-800 focus:outline-none placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[11px] md:text-xs font-bold text-gray-700 block mb-1.5">Guests *</label>
                                        <div className="flex items-center max-w-[120px] justify-between border border-white/50 rounded-xl p-1 bg-white/40 backdrop-blur-md">
                                            <button 
                                                type="button"
                                                onClick={() => setGuests(Math.max(1, guests - 1))} 
                                                className={`p-2 rounded-lg transition-all ${guests <= 1 ? 'opacity-50 text-gray-400 cursor-not-allowed' : 'text-gray-600 active:scale-95'}`}
                                            >
                                                <Minus size={16} strokeWidth={2} />
                                            </button>
                                            <span className="font-black text-base w-8 text-center text-gray-800">{guests}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setGuests(guests + 1)} 
                                                className="p-2 rounded-lg transition-all text-gray-600 active:scale-95"
                                            >
                                                <Plus size={16} strokeWidth={2} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center mb-5">
                            <div className="bg-white/30 text-gray-700 p-2 rounded-xl mr-3 border border-white/40 backdrop-blur-md">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <h2 className="font-black text-gray-800 text-lg">Order Items</h2>
                        </div>

                        <div className="space-y-1">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/30 last:border-0 last:pb-0">
                                    <div className="flex items-center flex-1 pr-2">
                                        <img src={item.img} alt={item.name} className="h-14 w-14 rounded-xl object-cover shadow-sm mr-3 border border-white/40" />
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-[15px] leading-tight">{item.name}</h3>
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setPrepType(item.prepType || 'Full Plate');
                                                setSpiceLevel(item.spiceLevel || '');
                                                setSelectedVariants(item.selectedVariants || {});
                                                setSelectedAddons(item.selectedAddons || {});
                                            }} className="flex items-center gap-1.5 mt-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-sm active:scale-95 transition-transform text-left">
                                                <Edit3 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                                <span className="text-[11px] font-bold text-gray-600 line-clamp-1">
                                                    {(item.selectedVariants && Object.keys(item.selectedVariants).length > 0) || (item.selectedAddons && Object.keys(item.selectedAddons).length > 0) || item.prepType || item.spiceLevel ? 'Customized' : 'Customize...'}
                                                </span>
                                            </button>
                                            <p className="text-sm text-gray-500 mt-1 font-bold">₹ {item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-white/30 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/40 shrink-0">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1.5 bg-white/50 rounded-lg shadow-sm active:scale-95 transition-all"><Minus className="h-4 w-4 md:h-5 md:w-5 text-gray-700" /></button>
                                        <span className="w-8 md:w-10 text-center font-black text-sm md:text-base text-gray-800">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1.5 bg-white/50 rounded-lg shadow-sm active:scale-95 transition-all"><Plus className="h-4 w-4 md:h-5 md:w-5 text-gray-700" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => navigate('/waiter/menu', { state: { cartItems: items, tableId, sessionId } })} className="w-full mt-5 py-3.5 bg-white/30 backdrop-blur-md border-2 border-dashed border-rose-300/60 rounded-2xl text-rose-500 font-bold text-[15px] flex items-center justify-center transition-colors">
                            <Plus className="h-5 w-5 mr-2" /> Add More Items
                        </button>
                    </div>

                    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border border-white/40">
                        <div className="flex items-center text-gray-600 mb-3 px-1">
                            <Edit3 className="h-4 w-4 mr-2 text-rose-400" />
                            <span className="text-sm font-bold uppercase tracking-wide">Special Instructions</span>
                        </div>
                        <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="E.g. Make it spicy, less oil..." className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl px-3.5 py-3 md:text-base text-sm font-medium text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all min-h-[85px] md:min-h-[100px] resize-none placeholder:text-gray-500 leading-relaxed"></textarea>
                    </div>
                </div>

                <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 md:p-6 bg-white/10 backdrop-blur-xl z-40 border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex justify-center">
                    <div className="w-full max-w-4xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Total Amount</p>
                            <p className="text-2xl font-black text-gray-900">₹ {cartTotal}</p>
                        </div>
                        <button onClick={async () => {
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
                                        guests: guests,
                                        special_notes: specialInstructions
                                    };
                                    try {
                                        const res = await waiterApi.startSession(selectedTableId, sessionData);
                                        targetSessionId = res.session_id;
                                    } catch (err) {
                                        toast.error(err.response?.data?.detail || "Failed to start session on this table");
                                        return;
                                    }
                                } else if (!targetSessionId) {
                                    toast.error("No active session found for this table.");
                                    return;
                                }

                                const orderData = {
                                    session_id: targetSessionId,
                                    special_instructions: specialInstructions,
                                    items: items.map(item => {
                                        const notesParts = [];
                                        if (item.prepType) notesParts.push(item.prepType);
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
                                const sid = sessionId || 'table_' + (selectedTableId || tableId);
                                sessionStorage.removeItem(`waiter_cart_${sid}`);
                                navigate(isDirectOrder ? `/waiter/tables/${selectedTableId}` : '/waiter/tables');
                            } catch (err) {
                                toast.error("Failed to place order");
                                console.error(err);
                            }
                        }} className="bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-[18px] py-3.5 px-6 md:px-8 font-bold text-[15px] shadow-sm active:scale-95 transition-all border border-rose-300/50">
                            Place Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Customization Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-white/50">
                        <h2 className="text-xl font-black text-gray-800 mb-6 text-center">{editingItem.name}</h2>

                        <div className="space-y-5">
                            {editingItem.half_price != null && (
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">Preparation</label>
                                    <div className="flex gap-2">
                                        {['Full Plate', 'Half Plate'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setPrepType(type)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-[15px] transition-all border ${prepType === type
                                                    ? 'bg-rose-400 text-white border-rose-400 shadow-md'
                                                    : 'bg-white/50 text-gray-700 border-white/60'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(editingItem.is_spicy_customizable ?? editingItem.category?.is_spicy_customizable ?? false) && (
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">Spiciness</label>
                                    <div className="flex gap-2">
                                        {['Low Spicy', 'Medium', 'Extra Spicy'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSpiceLevel(level)}
                                                className={`flex-1 py-3 px-1 rounded-xl font-bold text-[13px] sm:text-sm transition-all border ${spiceLevel === level
                                                    ? 'bg-amber-400 text-white border-amber-400 shadow-md'
                                                    : 'bg-white/50 text-gray-700 border-white/60'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editingItem.variant_groups?.map((vg) => (
                                <div key={vg.id}>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">{vg.name}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {vg.variants.map(v => (
                                            <button 
                                                key={v.id}
                                                onClick={() => setSelectedVariants(prev => ({ ...prev, [vg.id]: v.id }))}
                                                className={`flex-1 min-w-[30%] py-2 rounded-xl font-bold text-sm transition-all border ${
                                                    selectedVariants[vg.id] === v.id 
                                                    ? 'bg-rose-400 text-white border-rose-400 shadow-md' 
                                                    : 'bg-white/50 text-gray-700 border-white/60 hover:bg-white/80'
                                                }`}
                                            >
                                                {v.name} {v.extra_price > 0 && `(+₹${v.extra_price})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {editingItem.addon_groups?.map((ag) => (
                                <div key={ag.id}>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                                        {ag.name} {ag.max_selections > 0 && <span className="text-[10px] lowercase normal-case text-gray-400">(Max {ag.max_selections})</span>}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ag.addons.map(addon => (
                                            <button 
                                                key={addon.id}
                                                onClick={() => setSelectedAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                                                className={`flex-1 min-w-[30%] py-2 px-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-between ${
                                                    selectedAddons[addon.id] 
                                                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                                    : 'bg-white/50 text-gray-600 border-gray-100 hover:border-rose-100'
                                                }`}
                                            >
                                                <span>{addon.name}</span>
                                                {addon.price > 0 && <span className="opacity-70 text-[11px] ml-1">+₹{addon.price}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <button onClick={() => setEditingItem(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-white/50 border border-white/60 transition-all active:scale-95">Cancel</button>
                            <button onClick={saveCustomization} className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-rose-500 shadow-md shadow-rose-500/30 transition-all active:scale-95 border border-rose-400">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
