import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaiterMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCat, setActiveCat] = useState('All');
    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
    
    const [items, setItems] = useState(() => {
        const defaultItems = [
            { id: 1, name: 'Paneer Butter Masala', category: 'Main Course', price: 240, qty: 0, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80' },
            { id: 2, name: 'Garlic Naan', category: 'Breads', price: 40, qty: 0, img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=100&q=80' },
            { id: 3, name: 'Dal Makhani', category: 'Main Course', price: 220, qty: 0, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80' }
        ];
        
        if (location.state?.cartItems) {
            return defaultItems.map(item => {
                const existing = location.state.cartItems.find(i => i.id === item.id);
                if (existing) return { ...item, ...existing };
                return item;
            });
        }
        return defaultItems;
    });
    
    const [customizingItem, setCustomizingItem] = useState(null);
    const [prepType, setPrepType] = useState('Full Plate');
    const [spiceLevel, setSpiceLevel] = useState('Medium');
    
    const handleFirstAdd = (item) => {
        setCustomizingItem(item);
        setPrepType('Full Plate');
        setSpiceLevel('Medium');
    };

    const confirmCustomization = () => {
        setItems(items.map(item => {
            if (item.id === customizingItem.id) {
                const basePrice = item.originalPrice || item.price;
                const newPrice = prepType === 'Half Plate' ? Math.round(basePrice * 0.6) : basePrice;
                return { ...item, qty: 1, prepType, spiceLevel, price: newPrice, originalPrice: basePrice };
            }
            return item;
        }));
        setCustomizingItem(null);
        toast.success('Added to order');
    };

    const updateQty = (id, delta) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">
            {/* Decorative Glassmorphism Blobs Container */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
                                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Menu <span className="text-gray-500 font-bold">(Table T01)</span></h1>
                        </div>
                        <button onClick={() => toast('Search clicked!')} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors shadow-sm">
                            <Search className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 max-w-7xl mx-auto w-full">
                    <div className="flex flex-wrap gap-2 py-1 justify-center md:justify-start">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setActiveCat(cat)} 
                                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors border flex-auto whitespace-nowrap text-center ${
                                    activeCat === cat 
                                    ? 'bg-rose-400/90 backdrop-blur-md text-white border-rose-400 shadow-md' 
                                    : 'bg-white/20 backdrop-blur-md text-gray-600 border-white/40'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 w-full pb-32 max-w-7xl mx-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.filter(item => activeCat === 'All' || item.category === activeCat).map(item => (
                            <div key={item.id} className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-white/40 flex justify-between items-center transition-colors">
                                <div className="flex items-center space-x-4">
                                    <img src={item.img} alt="Food" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover shadow-sm" />
                                    <div>
                                        <h3 className="font-bold text-gray-800 md:text-lg leading-tight">{item.name}</h3>
                                        {(item.prepType || item.spiceLevel) && (
                                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                {item.prepType && <span className="text-[10px] font-bold text-gray-600 bg-white/40 px-2 py-0.5 rounded-md border border-white/50 shadow-sm">{item.prepType}</span>}
                                                {item.spiceLevel && <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200/50 shadow-sm">{item.spiceLevel}</span>}
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-600 font-bold mt-1">₹ {item.price}</p>
                                    </div>
                                </div>
                                {item.qty > 0 ? (
                                    <div className="flex items-center bg-white/30 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/40">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1.5 bg-white/50 rounded-lg shadow-sm active:scale-95 transition-all"><Minus className="h-4 w-4 md:h-5 md:w-5 text-gray-700" /></button>
                                        <span className="w-8 md:w-10 text-center font-black text-sm md:text-base text-gray-800">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1.5 bg-white/50 rounded-lg shadow-sm active:scale-95 transition-all"><Plus className="h-4 w-4 md:h-5 md:w-5 text-gray-700" /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleFirstAdd(item)} className="bg-rose-100/50 text-rose-500 p-2.5 rounded-xl font-bold border border-rose-200/50 active:scale-95 transition-all">
                                        <Plus className="h-5 w-5 md:h-6 md:w-6" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {cartCount > 0 && (
                    <div className="fixed bottom-20 md:bottom-24 left-0 right-0 p-4 md:p-6 bg-transparent z-40 pointer-events-none flex justify-center">
                        <div className="w-full max-w-md">
                            <button onClick={() => navigate('/waiter/cart', { state: { cartItems: items.filter(i => i.qty > 0) } })} className="w-full pointer-events-auto relative overflow-hidden rounded-[24px] p-[2px] active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(244,63,94,0.4)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 opacity-90 transition-opacity"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative bg-white/20 backdrop-blur-md flex items-center justify-between px-3 md:px-5 py-3 md:py-4 rounded-[22px] border border-white/40 transition-all">
                                    <div className="flex items-center min-w-0">
                                        <div className="bg-white/30 px-2.5 md:px-4 py-1.5 rounded-xl border border-white/40 backdrop-blur-md text-white font-black shadow-sm text-[11px] md:text-sm whitespace-nowrap shrink-0">
                                            {cartCount} Items
                                        </div>
                                        <span className="font-black text-white text-[13px] sm:text-[15px] md:text-[17px] tracking-wide ml-2 drop-shadow-md whitespace-nowrap truncate">View Cart</span>
                                    </div>
                                    <div className="flex items-center shrink-0 ml-1">
                                        <span className="font-black text-white text-[14px] sm:text-[15px] md:text-[17px] drop-shadow-md whitespace-nowrap">₹ {cartTotal}</span>
                                        <div className="bg-white/30 p-1 md:p-1.5 rounded-xl ml-2 md:ml-3 border border-white/40 backdrop-blur-md shadow-sm shrink-0">
                                            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-white rotate-180 drop-shadow-sm" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Customization Modal */}
                {customizingItem && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-white/50">
                            <h2 className="text-xl font-black text-gray-800 mb-6 text-center">{customizingItem.name}</h2>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">Preparation</label>
                                    <div className="flex gap-2">
                                        {['Full Plate', 'Half Plate'].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => setPrepType(type)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-[15px] transition-all border ${
                                                    prepType === type 
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
                                                className={`flex-1 py-3 px-1 rounded-xl font-bold text-[13px] sm:text-sm transition-all border ${
                                                    spiceLevel === level 
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

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setCustomizingItem(null)} 
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-white/40 border border-white/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmCustomization} 
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-400 to-rose-500 shadow-lg shadow-rose-500/30 border border-rose-300 transition-all active:scale-95"
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
