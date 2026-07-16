import { Star, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

const foods = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 299,
    rating: 4.8,
    image:
      "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Veg Biryani",
    price: 229,
    rating: 4.7,
    image:
      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Cheese Burger",
    price: 199,
    rating: 4.6,
    image:
      "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 7,
    name: "Pasta Alfredo",
    price: 249,
    rating: 4.9,
    image:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function TrendingFood() {
  const navigate = useNavigate();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();

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

              <h3 className="font-semibold text-gray-900">
                {food.name}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
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
                const cartItem = cartItems.find((item) => item.id === food.id);
                if (cartItem) {
                  return (
                    <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-orange-500 px-1 sm:px-2 py-0.5 sm:py-1 text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseQuantity(food.id);
                        }}
                        className="p-1"
                      >
                        <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                      </button>
                      <span className="text-xs sm:text-sm font-semibold text-center">{cartItem.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseQuantity(food.id);
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