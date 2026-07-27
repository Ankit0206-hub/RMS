import { useState } from "react";
import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import { ArrowLeft, Search, Star, Plus, Minus, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

import RecentSearch from "../../components/customer/search/RecentSearch";
import TrendingFood from "../../components/customer/search/TrendingFood";
import { useEffect } from "react";
import customerApi from "../../services/customerApi";



export default function SearchPage() {
  const navigate = useNavigate();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [allDishes, setAllDishes] = useState([]);

  useEffect(() => {
    customerApi.getMenu().then(data => {
        const items = [];
        data.forEach(cat => {
            if (cat.items) {
                cat.items.forEach(dish => {
                    items.push({
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
        setAllDishes(items);
    }).catch(console.error);
  }, []);

  const filteredDishes = allDishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">

          {/* Header */}
          <div className="flex items-center gap-3">

            <button onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>

            <div className="flex h-11 flex-1 items-center rounded-xl bg-white dark:bg-slate-900 px-3 shadow-sm border">

              <Search size={18} className="text-gray-400 dark:text-slate-500 dark:text-slate-400" />

              <input
                autoFocus
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-sm"
              />

            </div>

          </div>

          {searchQuery ? (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold">
                Search Results
              </h2>
              {filteredDishes.length > 0 ? (
                <div className="space-y-3">
                  {filteredDishes.map((food) => (
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">{food.name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {food.rating}
                        </div>
                        <p className="mt-1 font-semibold text-orange-500">₹{food.price}</p>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center justify-end">
                        {(() => {
                          const cartItem = cartItems.find((item) => item.id === food.id || item.originalId === food.id || item.name === food.name);
                          if (cartItem) {
                            return (
                              <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-orange-500 px-1 sm:px-2 py-0.5 sm:py-1 text-white shadow-sm">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    decreaseQuantity(cartItem.id || food.id);
                                  }}
                                  className="p-1"
                                >
                                  <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                                </button>
                                <span className="text-xs sm:text-sm font-bold text-center px-1">{cartItem.quantity}</span>
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
              ) : (
                <div className="mt-16 flex flex-col items-center justify-center text-gray-400">
                  <Utensils size={48} className="mb-4 text-gray-300 dark:text-slate-600 drop-shadow-sm" />
                  <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">No items found</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">No food found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <RecentSearch />
              <TrendingFood />
            </>
          )}

        </div>

        <BottomNav />

      </div>
    </PageLayout>
  );
}