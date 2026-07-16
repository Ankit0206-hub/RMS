import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaiterMenu() {
    const navigate = useNavigate();
    const [activeCat, setActiveCat] = useState('Main Course');
    const categories = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
    
    const [items, setItems] = useState([
        { id: 1, name: 'Paneer Butter Masala', price: 240, qty: 2, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80' },
        { id: 2, name: 'Garlic Naan', price: 40, qty: 0, img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=100&q=80' },
        { id: 3, name: 'Dal Makhani', price: 220, qty: 0, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80' }
    ]);
    
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
        <div className="flex flex-col h-full bg-white font-inter">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 text-gray-900 rounded-full hover:bg-gray-100 mr-2">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Menu (Table T01)</h1>
                </div>
                <button onClick={() => toast('Search clicked!')} className="p-2 text-gray-900 rounded-full hover:bg-gray-100">
                    <Search className="h-5 w-5" />
                </button>
            </div>

            <div className="px-4 mt-4">
                <div className="flex space-x-2 overflow-x-auto hide-scrollbar py-1">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCat(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeCat === cat ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 py-6 w-full space-y-4 pb-32">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <img src={item.img} alt="Food" className="h-16 w-16 rounded-xl object-cover" />
                            <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">₹ {item.price}</p>
                            </div>
                        </div>
                        {item.qty > 0 ? (
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button onClick={() => updateQty(item.id, -1)} className="p-1.5 bg-white rounded-md shadow-sm active:scale-95"><Minus className="h-4 w-4" /></button>
                                <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="p-1.5 bg-white rounded-md shadow-sm active:scale-95"><Plus className="h-4 w-4" /></button>
                            </div>
                        ) : (
                            <button onClick={() => updateQty(item.id, 1)} className="bg-orange-50 text-orange-500 p-2 rounded-xl font-bold border border-orange-100 active:scale-95">
                                <Plus className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {cartCount > 0 && (
                <div className="absolute bottom-[4rem] left-0 right-0 p-4 bg-transparent z-40 pointer-events-none">
                    <div className="w-full">
                        <button onClick={() => navigate('/waiter/cart')} className="w-full pointer-events-auto bg-[#ff5722] text-white rounded-2xl py-4 px-6 flex items-center justify-between font-bold shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform">
                            <div className="flex items-center">
                                <div className="bg-white/20 px-3 py-1 rounded-lg mr-3">{cartCount} Items</div>
                                <span>View Cart</span>
                            </div>
                            <span>₹ {cartTotal} <ArrowLeft className="h-5 w-5 inline ml-2 rotate-180" /></span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
