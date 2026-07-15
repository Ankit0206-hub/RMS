import { useState } from "react";
import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import { ArrowLeft, Search, Star, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

import RecentSearch from "../../components/customer/search/RecentSearch";
import TrendingFood from "../../components/customer/search/TrendingFood";

const allDishes = [
    {
        id: 1,
        name: "Paneer Butter Masala",
        price: 239,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
    },
    {
        id: 2,
        name: "Veg Biryani",
        price: 199,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80",
    },
    {
        id: 3,
        name: "Margherita Pizza",
        price: 249,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80",
    },
    {
        id: 4,
        name: "Veg Burger",
        price: 179,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    },
    {
        id: 5,
        name: "Butter Chicken",
        price: 299,
        rating: 4.8,
        image: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
        id: 6,
        name: "Cheese Burger",
        price: 199,
        rating: 4.6,
        image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
        id: 7,
        name: "Pasta Alfredo",
        price: 249,
        rating: 4.9,
        image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
        id: 8,
        name: "Cheese Pizza",
        price: 320,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=200&q=80"
    }
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

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

            <div className="flex h-11 flex-1 items-center rounded-xl bg-white px-3 shadow-sm border">

              <Search size={18} className="text-gray-400" />

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
                      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm active:scale-[0.99] transition cursor-pointer"
                    >
                      {/* Image */}
                      <img
                        src={food.image}
                        alt={food.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{food.name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {food.rating}
                        </div>
                        <p className="mt-1 font-semibold text-orange-500">₹{food.price}</p>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center justify-end">
                        {(() => {
                          const cartItem = cartItems.find((item) => item.id === food.id);
                          if (cartItem) {
                            return (
                              <div className="flex items-center gap-2 rounded-full bg-orange-500 px-2 py-1 text-white">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    decreaseQuantity(food.id);
                                  }}
                                  className="p-1"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-semibold w-3 text-center">{cartItem.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    increaseQuantity(food.id);
                                  }}
                                  className="p-1"
                                >
                                  <Plus size={14} />
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
                <div className="mt-10 text-center text-gray-500">
                  <p>No food found matching "{searchQuery}"</p>
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