import { ArrowLeft, Heart, Plus, Minus, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import MobileContainer from "../../components/customer/layout/MobileContainer";
import CustomizationModal from "../../components/customer/common/CustomizationModal";
import RepeatCustomizationModal from "../../components/customer/common/RepeatCustomizationModal";
import customerApi from "../../services/customerApi";
import { useApp } from "../../context/AppContext";

export default function PopularFoods() {
    const navigate = useNavigate();
    const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useApp();
    const [favorites, setFavorites] = useState([]);
    const [foods, setFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [customizationFood, setCustomizationFood] = useState(null);
    const [repeatFoodItem, setRepeatFoodItem] = useState(null);

    useEffect(() => {
        customerApi.getMenu().then(data => {
            const allItems = [];
            data.forEach(cat => {
                if (cat.items) {
                    cat.items.forEach(dish => {
                        allItems.push({
                            id: dish.id,
                            name: dish.name,
                            price: dish.price,
                            rating: dish.avg_rating || 4.8, // Fallback to 4.8 if 0
                            rating_count: dish.rating_count || 0,
                            desc: dish.description,
                            isVeg: dish.is_veg,
                            isSpicy: dish.customizable_spice,
                            hasPortions: dish.has_portions,
                            customizableSpice: dish.customizable_spice,
                            image: dish.image_url || "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80"
                        });
                    });
                }
            });
            // Sort by rating and count to show the most popular foods first
            allItems.sort((a, b) => {
                if (b.rating !== a.rating) return b.rating - a.rating;
                return b.rating_count - a.rating_count;
            });
            setFoods(allItems);
        }).catch(console.error);
    }, []);

    const toggleFavorite = (id) => {
        setFavorites((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    return (
        <MobileContainer>
            <div className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-800/50">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center gap-4 p-5">
                        <button onClick={() => navigate(-1)}>
                            <ArrowLeft size={24} />
                        </button>

                        <h1 className="text-2xl font-bold">
                            Popular Foods
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="px-5 pb-5">
                        <div className="flex items-center rounded-xl bg-gray-100 dark:bg-slate-800 px-4 py-3">
                            <Search size={18} className="text-gray-500 dark:text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search food..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ml-3 w-full bg-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Food Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 p-4 sm:p-5">
                    {foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((food) => (
                        <div
                            key={food.id}
                            onClick={() => navigate("/customer/food-details")}
                            className="cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 transition hover:shadow-md"
                        >
                            <div className="relative">
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="h-32 sm:h-40 w-full object-cover"
                                />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(food.id);
                                    }}
                                    className="absolute right-3 top-3 rounded-full bg-white dark:bg-slate-900 p-2 shadow"
                                >
                                    <Heart
                                        size={16}
                                        className={
                                            favorites.includes(food.id)
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-500 dark:text-slate-400"
                                        }
                                    />
                                </button>

                                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white dark:bg-slate-900 px-2 py-1">
                                    <Star
                                        size={12}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                    <span className="text-xs">
                                        {food.rating}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white leading-tight line-clamp-2 min-h-[40px]">
                                    {food.name}
                                </h3>

                                <div className="mt-auto pt-3 flex items-center justify-between">
                                    <span className="font-black text-orange-500">
                                        ₹{Number(food.price).toFixed(2)}
                                    </span>

                                    {(() => {
                                        const matchingItems = cartItems.filter((item) => (item.originalId || item.id) === food.id || item.name === food.name);
                                        const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
                                        if (totalQty > 0) {
                                            const lastItem = matchingItems[matchingItems.length - 1];
                                            return (
                                                <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-1 text-orange-600 dark:text-orange-500 font-bold border border-orange-200 dark:border-orange-800">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (matchingItems.length > 1) {
                                                                navigate('/customer/cart');
                                                            } else {
                                                                decreaseQuantity(lastItem.id);
                                                            }
                                                        }}
                                                        className="p-1"
                                                    >
                                                        <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                                                    </button>
                                                    <span className="text-xs sm:text-sm font-semibold">{totalQty}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const hasCustomization = food.half_price != null || food.is_spicy_customizable || food.category?.is_spicy_customizable || (food.variant_groups && food.variant_groups.length > 0) || (food.addon_groups && food.addon_groups.length > 0) || food.hasPortions !== false || food.customizableSpice !== false;
                                                            if (hasCustomization) {
                                                                setRepeatFoodItem(lastItem);
                                                            } else {
                                                                increaseQuantity(lastItem.id);
                                                            }
                                                        }}
                                                        className="p-1"
                                                    >
                                                        <Plus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const hasCustomization = food.half_price != null || food.is_spicy_customizable || food.category?.is_spicy_customizable || (food.variant_groups && food.variant_groups.length > 0) || (food.addon_groups && food.addon_groups.length > 0) || food.hasPortions !== false || food.customizableSpice !== false;
                                                    if (hasCustomization) {
                                                        setCustomizationFood(food);
                                                    } else {
                                                        addToCart(food);
                                                    }
                                                }}
                                                className="rounded-xl bg-orange-500 p-2 text-white hover:bg-orange-600 shadow-sm active:scale-95 transition-transform"
                                            >
                                                <Plus size={18} strokeWidth={2.5} />
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CustomizationModal 
                isOpen={!!customizationFood} 
                onClose={() => setCustomizationFood(null)} 
                food={customizationFood} 
            />
            
            <RepeatCustomizationModal
                isOpen={!!repeatFoodItem}
                onClose={() => setRepeatFoodItem(null)}
                cartItem={repeatFoodItem}
                onChooseNew={(item) => {
                    const originalFood = foods.find(f => f.id === item.originalId || f.name === item.name);
                    if (originalFood) {
                        setCustomizationFood(originalFood);
                    }
                }}
            />
        </MobileContainer>
    );
}