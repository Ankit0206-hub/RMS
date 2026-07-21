import { Star, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useEffect, useState } from "react";
import customerApi from "../../../services/customerApi";



export default function TrendingFood() {
  const navigate = useNavigate();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();
  const [foods, setFoods] = useState([]);

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
      // Just take a few random/first items as trending
      setFoods(allItems.slice(0, 4));
    }).catch(console.error);
  }, []);

  return (
    <div className="mt-6">

      {/* Title */}
      <h2 className="mb-4 text-lg font-semibold">
        Trending Now
      </h2>

      {/* List */}
      <div className="space-y-3">

        {foods.map((food) => (
          <div
            key={food.id}
            onClick={() => navigate("/customer/food-details", { state: { food } })}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm active:scale-[0.99] transition cursor-pointer"
          >

            {/* Image */}
            <img
              src={food.image}
              alt={food.name}
              className="h-16 w-16 rounded-xl object-cover"
            />

            {/* Info */}
            <div className="flex-1">

              <h3 className="font-semibold text-gray-900 dark:text-white">
                {food.name}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {food.rating}
              </div>
              
              <p className="mt-1 font-semibold text-orange-500">
                ₹{food.price}
              </p>

            </div>

            {/* Action */}
            <div className="flex items-center justify-end">
              {(() => {
                const cartItem = cartItems.find((item) => item.id === food.id || item.originalId === food.id || item.name === food.name);
                if (cartItem) {
                  return (
                    <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-orange-500 px-1 sm:px-2 py-0.5 sm:py-1 text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseQuantity(cartItem.id || food.id);
                        }}
                        className="p-1"
                      >
                        <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                      </button>
                      <span className="text-xs sm:text-sm font-semibold text-center">{cartItem.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseQuantity(cartItem.id || food.id);
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
                      addToCart(food);
                    }}
                    className="rounded-full bg-orange-500 p-2 text-white shadow-sm hover:bg-orange-600 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                );
              })()}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}