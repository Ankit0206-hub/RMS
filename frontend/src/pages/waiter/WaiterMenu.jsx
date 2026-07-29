import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

export default function WaiterMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // We need tableId and sessionId for ordering
    const tableId = location.state?.tableId || 'T01';
    const sessionId = location.state?.sessionId;
    
    const [activeCat, setActiveCat] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await waiterApi.getMenu();
                
                const cats = ['All', ...data.map(c => c.name)];
                setCategories(cats);
                
                let allItems = [];
                data.forEach(c => {
                    c.items.forEach(i => {
                        let img_url = i.image_url;
                        if (img_url && img_url.startsWith('/')) {
                            img_url = `http://localhost:8000${img_url}`;
                        }
                        allItems.push({
                            ...i,
                            category: { name: c.name, is_spicy_customizable: c.is_spicy_customizable },
                            qty: 0,
                            img: img_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80'
                        });
                    });
                });
                
                if (location.state?.cartItems) {
                    allItems = allItems.map(item => {
                        const existing = location.state.cartItems.find(i => i.id === item.id);
                        if (existing) return { ...item, ...existing };
                        return item;
                    });
                }
                setItems(allItems);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load menu");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [location.state]);
    
    const [searchQuery, setSearchQuery] = useState('');
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
                const newPrice = prepType === 'Half Plate' ? (item.half_price != null ? item.half_price : Math.round(basePrice * 0.6)) : basePrice;
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

    const cartCount = items.filter(item => item.qty > 0).length;
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter relative">


            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/10 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
                    <div className="flex items-center w-full max-w-7xl mx-auto justify-between relative">
                        <button onClick={() => navigate('/waiter/tables')} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm z-10">
                            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight absolute left-1/2 -translate-x-1/2">
                            Menu <span className="text-gray-500 font-bold">(Table {tableId})</span>
                        </h1>
                        <div className="w-9 h-9"></div> {/* Spacer for flex balance */}
                    </div>
                </div>

                <div className="px-4 md:px-8 mt-4 max-w-7xl mx-auto w-full">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by food name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 text-sm md:text-base font-bold rounded-2xl pl-12 pr-4 py-3 md:py-4 shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-300/20 focus:border-rose-300 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex overflow-x-auto gap-2 py-2 px-1 snap-x">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setActiveCat(cat)} 
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0 snap-start ${
                                    activeCat === cat 
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                                    : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white/80'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 md:px-8 py-6 w-full pb-32 max-w-7xl mx-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                        </div>
                    ) : (
                        (() => {
                            const filteredItems = items.filter(item => {
                                const matchesCat = activeCat === 'All' || item.category.name === activeCat;
                                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                                return matchesCat && matchesSearch;
                            });

                            if (filteredItems.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <Utensils size={48} className="mb-4 text-gray-300 drop-shadow-sm" />
                                        <h2 className="text-xl font-bold text-gray-600">No items found</h2>
                                        <p className="text-sm mt-1">Try searching for something else</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredItems.map(item => (
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
                            );
                        })()
                    )}
                </div>

                {cartCount > 0 && (
                    <div className="fixed bottom-20 md:bottom-24 left-0 right-0 p-4 md:p-6 bg-transparent z-40 pointer-events-none flex justify-center">
                        <div className="w-full max-w-md">
                            <button onClick={() => navigate('/waiter/cart', { state: { cartItems: items.filter(i => i.qty > 0), tableId, sessionId } })} className="w-full pointer-events-auto relative overflow-hidden rounded-[24px] p-[2px] active:scale-[0.98] transition-all shadow-[0_8px_32px_rgba(244,63,94,0.4)]">
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
                                {customizingItem.half_price != null && (
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
                                )}
                                {(customizingItem.is_spicy_customizable ?? customizingItem.category?.is_spicy_customizable ?? false) && (
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 block">Spiciness</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Low Spicy', 'Medium', 'Extra Spicy'].map(level => (
                                                <button 
                                                    key={level}
                                                    onClick={() => setSpiceLevel(level)}
                                                    className={`flex-1 min-w-[30%] py-2 rounded-xl font-bold text-sm transition-all border ${
                                                        spiceLevel === level 
                                                        ? 'bg-orange-50 text-orange-600 border-orange-200' 
                                                        : 'bg-white/50 text-gray-600 border-gray-100 hover:border-orange-100'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
