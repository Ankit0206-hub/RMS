import { ArrowLeft, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useApp } from "../../context/AppContext";
import PageLayout from "../../components/customer/layout/PageLayout";

export default function FoodDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useApp();

  // Initialize food from location state or try to get it from sessionStorage
  const [food, setFood] = useState(() => {
    if (location.state?.food) {
      sessionStorage.setItem("currentFoodDetails", JSON.stringify(location.state.food));
      return location.state.food;
    }
    const savedFood = sessionStorage.getItem("currentFoodDetails");
    return savedFood ? JSON.parse(savedFood) : null;
  });

  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [instructions, setInstructions] = useState("");

  if (!food) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center bg-gray-50">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white"
          >
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-white">
      <div className="relative flex h-full flex-col">
        {/* Hero Image */}
        <div className="relative h-[35%] w-full">
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover"
          />

          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Bottom Sheet */}
        <div className="relative -mt-6 flex-1 rounded-t-[32px] bg-white px-6 pt-6 pb-32 overflow-y-auto">
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gray-200"></div>

          {/* Title & Price */}
          <div className="flex items-start justify-between mt-2">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-4 w-4 rounded-sm border border-green-500 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {food.name}
              </h1>

              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5">
                  <span className="text-[11px] font-bold text-white">
                    {food.rating || "4.8"}
                  </span>
                  <Star size={10} className="fill-white text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-500 border-b border-orange-500 border-dashed pb-0.5">
                  124 Reviews
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ₹{food.price}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-5 text-sm leading-relaxed text-gray-500">
            {food.desc || food.description ||
              `A rich and creamy dish of paneer (cottage cheese) in a tomato, butter and cashew sauce (known as makhani gravy).`}
          </p>

          {/* Special Instructions */}
          <div className="mt-8">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Special Instructions (Optional)
            </h3>
            <textarea
              rows={3}
              placeholder="E.g. Make it spicy, less oil, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-orange-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Floating Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex items-center gap-4">
          {!showQuantity ? (
            <div className="flex w-full items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-bold text-gray-900">₹{food.price}</p>
              </div>
              <button
                onClick={() => setShowQuantity(true)}
                className="flex h-14 items-center justify-center rounded-2xl bg-orange-500 px-8 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
              >
                Add Item
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-4">
              {/* Quantity Selector */}
              <div className="flex h-14 items-center gap-4 rounded-2xl border border-gray-200 px-4 bg-white">
                <button 
                  onClick={() => {
                    if (quantity === 1) {
                      setShowQuantity(false);
                      setQuantity(1);
                    } else {
                      setQuantity(quantity - 1);
                    }
                  }}
                  className="text-gray-400 active:text-orange-500 transition"
                >
                  <Minus size={20} />
                </button>
                <span className="w-4 text-center font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-400 active:text-orange-500 transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => {
                  // Add multiple items based on quantity
                  for (let i = 0; i < quantity; i++) {
                    addToCart({ ...food, instructions });
                  }
                  navigate("/customer/cart");
                }}
                className="flex h-14 items-center gap-2 rounded-2xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
              >
                <span>Add Item</span>
                <span>(₹{food.price * quantity})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}