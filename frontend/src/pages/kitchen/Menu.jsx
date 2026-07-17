import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Tabs & Search */}
            <div className="bg-white p-3 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full pr-4 pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                                activeTab === cat ? 'bg-[#0f5132] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="p-2 bg-gray-100 rounded-full text-gray-600 ml-2 shrink-0">
                    <Search size={18} />
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col gap-3 pb-24">
                    {displayItems.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {/* Placeholder for image */}
                                <div className="text-gray-400 text-xs">Img</div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Prep Time: <span className="text-gray-700">{item.prepTime}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Menu;
