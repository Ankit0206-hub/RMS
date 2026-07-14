import { useState } from "react";
import { Heart, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const popularDishes = [
    {
        id: 1,
        name: "Paneer Butter Masala",
        price: 239,
        rating: 4.8,
        image:
            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
    },
    {
        id: 2,
        name: "Veg Biryani",
        price: 199,
        rating: 4.7,
        image:
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
    },
    {
        id: 3,
        name: "Margherita Pizza",
        price: 249,
        rating: 4.9,
        image:
            "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80",
    },
    {
        id: 4,
        name: "Veg Burger",
        price: 179,
        rating: 4.6,
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    },
];

export default function PopularDishes() {
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([]);

    // On desktop we might as well show all 4, on mobile it wraps anyway
    const featuredDishes = popularDishes;

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
                        onClick={() => navigate("/customer/food-details")}
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

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/customer/food-details");
                                    }}
                                    className="rounded-full bg-orange-500 p-2 text-white hover:bg-orange-600"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}