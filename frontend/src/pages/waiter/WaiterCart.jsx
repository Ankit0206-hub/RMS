import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Edit3, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

export default function WaiterCart() {
    const navigate = useNavigate();
    const location = useLocation();

    const [items, setItems] = useState(location.state?.cartItems || []);
    const tableId = location.state?.tableId || 'T01';
    const sessionId = location.state?.sessionId;
    const [specialInstructions, setSpecialInstructions] = useState('');

    const [editingItem, setEditingItem] = useState(null);
    const [prepType, setPrepType] = useState('Full Plate');
    const [spiceLevel, setSpiceLevel] = useState('Medium');

    const saveCustomization = () => {
        setItems(items.map(item => {
            if (item.id === editingItem.id) {
                const basePrice = item.originalPrice || item.price;
                const newPrice = prepType === 'Half Plate' ? Math.round(basePrice * 0.6) : basePrice;
                return { ...item, prepType, spiceLevel, price: newPrice, originalPrice: basePrice };
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
                            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Confirm Order <span className="text-gray-500 font-bold">({tableId})</span></h1>
                        </div>
                        <div className="w-10"></div>
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 w-full space-y-4 pb-32 max-w-4xl mx-auto flex-1">
                    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-5 shadow-sm border border-white/40">
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
                                                setSpiceLevel(item.spiceLevel || 'Medium');
                                            }} className="flex items-center gap-1.5 mt-1.5 bg-white/40 border border-white/50 px-2.5 py-1 rounded-lg shadow-sm active:scale-95 transition-transform text-left">
                                                <Edit3 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                                <span className="text-[11px] font-bold text-gray-600 line-clamp-1">
                                                    {item.prepType || item.spiceLevel ? [item.prepType, item.spiceLevel].filter(Boolean).join(', ') : 'Customize...'}
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
                                if (!sessionId) {
                                    toast.error("No active session found for this table.");
                                    return;
                                }
                                const orderData = {
                                    session_id: sessionId,
                                    special_instructions: specialInstructions,
                                    items: items.map(item => ({
                                        menu_item_id: item.id,
                                        quantity: item.qty,
                                        notes: [item.prepType, item.spiceLevel].filter(Boolean).join(', ') || undefined
                                    }))
                                };
                                await waiterApi.createOrder(sessionId, orderData);
                                toast.success('Order placed successfully!');
                                navigate('/waiter/tables');
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
