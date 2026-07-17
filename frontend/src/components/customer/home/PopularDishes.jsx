import { useState } from "react";
import { Heart, Plus, Minus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import CustomizationModal from "../../customer/common/CustomizationModal";

export default function PopularDishes({ popularDishes = [] }) {
    const navigate = useNavigate();
    const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();

    const [favorites, setFavorites] = useState([]);
    const [customizationFood, setCustomizationFood] = useState(null);

    // Map the backend items to the expected format
    const featuredDishes = popularDishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        rating: 4.8, // Mock rating as backend doesn't have it
        image: dish.image_url || "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
        hasPortions: dish.has_portions,
        customizableSpice: dish.customizable_spice
    }));

    const toggleFavorite = (id) => {
        setFavorites((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    return (
        <section className="mt-8">
            {/* Heading */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                    Popular Dishes
                </h2>

                <button
                    onClick={() => navigate("/customer/popular-foods")}
                    className="text-sm font-semibold text-orange-500"
                >
                    See All
                </button>
            </div>

            {/* Responsive grid for tablet/desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredDishes.map((dish) => (
                    <div
                        key={dish.id}
                        onClick={() => navigate("/customer/food-details", { state: { food: dish } })}
                        className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg"
                    >
                        <div className="relative">
                            <img
                                src={dish.image}
                                alt={dish.name}
                                className="h-36 w-full object-cover"
                            />

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(dish.id);
                                }}
                                className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                            >
                                <Heart
                                    size={16}
                                    className={
                                        favorites.includes(dish.id)
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-500"
                                    }
                                />
                            </button>

                            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow">
                                <Star
                                    size={12}
                                    className="fill-yellow-400 text-yellow-400"
                                />
                                <span className="text-xs font-medium">
                                    {dish.rating}
                                </span>
                            </div>
                        </div>

                        <div className="p-3">
                            <h3 className="truncate font-semibold">
                                {dish.name}
                            </h3>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="font-bold text-orange-500">
                                    ₹{dish.price}
                                </span>

                                {(() => {
                                    const cartItem = cartItems.find((item) => item.id === dish.id);
                                    if (cartItem) {
                                        return (
                                            <div className="flex items-center gap-1 sm:gap-3 rounded-full bg-orange-500 px-1 sm:px-2 py-0.5 sm:py-1 text-white">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        decreaseQuantity(dish.id);
                                                    }}
                                                    className="p-1"
                                                >
                                                    <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                                                </button>
                                                <span className="text-xs sm:text-sm font-semibold">{cartItem.quantity}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        increaseQuantity(dish.id);
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
                                                // Assuming all items might have customizations, default is true in modal
                                                if (dish.hasPortions !== false || dish.customizableSpice !== false) {
                                                    setCustomizationFood(dish);
                                                } else {
                                                    addToCart(dish);
                                                }
                                            }}
                                            className="rounded-full bg-orange-500 p-2 text-white hover:bg-orange-600"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CustomizationModal 
                isOpen={!!customizationFood} 
                onClose={() => setCustomizationFood(null)} 
                food={customizationFood} 
            />
        </section>
    );
}