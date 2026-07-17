import { ArrowLeft, Heart, Plus, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import MobileContainer from "../../components/customer/layout/MobileContainer";
import { useEffect } from "react";
import customerApi from "../../services/customerApi";



export default function PopularFoods() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [foods, setFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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
                            rating: 4.8,
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
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white shadow-sm">
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
                        <div className="flex items-center rounded-xl bg-gray-100 px-4 py-3">
                            <Search size={18} className="text-gray-500" />

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
                <div className="grid grid-cols-2 gap-4 p-5">
                    {foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((food) => (
                        <div
                            key={food.id}
                            onClick={() => navigate("/customer/food-details")}
                            className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-xl"
                        >
                            <div className="relative">
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    className="h-40 w-full object-cover"
                                />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(food.id);
                                    }}
                                    className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                                >
                                    <Heart
                                        size={16}
                                        className={
                                            favorites.includes(food.id)
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-500"
                                        }
                                    />
                                </button>

                                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-2 py-1">
                                    <Star
                                        size={12}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                    <span className="text-xs">
                                        {food.rating}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3">
                                <h3 className="font-semibold">
                                    {food.name}
                                </h3>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className="font-bold text-orange-500">
                                        ₹{food.price}
                                    </span>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/customer/food-details", {
                                                state: { food },
                                            });
                                        }}
                                        className="rounded-full bg-orange-500 p-2 text-white transition hover:bg-orange-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MobileContainer>
    );
}