import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';

const Menu = () => {
    const [activeTab, setActiveTab] = useState('All');
    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts'];

    const menuItems = [
        { id: 1, name: 'Paneer Butter Masala', prepTime: '15-20 min', category: 'Main Course' },
        { id: 2, name: 'Veg Biryani', prepTime: '20-25 min', category: 'Main Course' },
        { id: 3, name: 'Garlic Naan', prepTime: '5-7 min', category: 'Breads' },
        { id: 4, name: 'Jeera Rice', prepTime: '10-12 min', category: 'Main Course' },
        { id: 5, name: 'Cold Drink', prepTime: '2-3 min', category: 'Starters' },
    ];

    const displayItems = activeTab === 'All' ? menuItems : menuItems.filter(item => item.category === activeTab);

    return (
        <div className="flex flex-col min-h-screen bg-[#0f172a] text-zinc-100 font-sans w-full">
            {/* Tabs & Search */}
            <div className="bg-zinc-900/80 p-4 border-b border-zinc-800 flex items-center justify-between shadow-md sticky top-0 z-10 backdrop-blur-md">
                <div className="flex gap-3 overflow-x-auto no-scrollbar w-full pr-4 pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-colors tracking-wide ${
                                activeTab === cat ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/50' : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 ml-4 shrink-0 transition-colors border border-zinc-700 shadow-sm">
                    <Search size={20} />
                </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-24">
                    {displayItems.map(item => (
                        <div key={item.id} className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-2xl shadow-lg border border-zinc-700/50 flex items-center gap-5 hover:border-emerald-500/50 transition-all group">
                            <div className="w-20 h-20 bg-zinc-700/50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-zinc-600/50">
                                {/* Placeholder for image */}
                                <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Image</div>
                            </div>
                            <div className="flex flex-col flex-1">
                                <h3 className="font-black text-white text-xl leading-tight mb-2 group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800 w-fit">
                                    <Clock size={14} className="text-zinc-500" />
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                        <span className="text-zinc-300">{item.prepTime}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Menu;
