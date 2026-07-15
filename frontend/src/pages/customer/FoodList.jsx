import { ArrowLeft, Search, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

// Updated data structure to include rating, description, and veg status for the design
const foodData = {
  "main-course": [
    { name: "Paneer Butter Masala", price: 280, rating: "4.8", desc: "Rich creamy tomato gravy", isVeg: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800" },
    { name: "Kadai Paneer", price: 260, rating: "4.6", desc: "Spicy & delicious", isVeg: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
    { name: "Dal Tadka", price: 180, rating: "4.5", desc: "Yellow dal with tadka", isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800" },
    { name: "Veg Biryani", price: 240, rating: "4.7", desc: "Aromatic basmati rice", isVeg: true, image: "https://images.unsplash.com/photo-1701579231349-d7459c40919b?w=800" },
  ],
  starters: [
    { name: "Spring Rolls", price: 169, rating: "4.4", desc: "Crispy fried rolls", isVeg: true, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800" },
  ]
};

export default function FoodList() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { addToCart } = useApp();

  // If we don't have the specific category mocked, fallback to main-course
  const currentData = foodData[category] || foodData["main-course"];
  const title = category ? category.replace("-", " ") : "Main Course";

  return (
    <PageLayout className="bg-white">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center justify-center relative px-4 pt-6 pb-2">
          <button onClick={() => navigate(-1)} className="absolute left-4 p-2">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 capitalize">
            {title}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 mt-2">
          <div className="flex items-center rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder={`Search in ${title}...`}
              className="ml-3 flex-1 bg-transparent text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-3 px-4 mt-4 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 rounded-full border border-orange-500 bg-orange-50 px-4 py-1.5 whitespace-nowrap">
            <span className="h-3 w-3 rounded-full border-2 border-green-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-orange-500">Veg</span>
          </button>

          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 whitespace-nowrap">
            <span className="h-3 w-3 rounded-full border-2 border-red-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-600">Non-Veg</span>
          </button>

          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 whitespace-nowrap">
            <span className="text-lg leading-none">🌶️</span>
            <span className="text-sm font-semibold text-gray-600">Spicy</span>
          </button>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto px-4 mt-6 pb-6 space-y-5">
          {currentData.map((food) => (
            <div
              key={food.name}
              onClick={() =>
                navigate("/customer/food-details", {
                  state: { food },
                })
              }
              className="flex items-start gap-4 cursor-pointer"
            >
              <img
                src={food.image}
                alt={food.name}
                className="h-28 w-28 rounded-2xl object-cover shadow-sm"
              />

              <div className="flex flex-1 flex-col py-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-green-500 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  </span>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {food.name}
                  </h3>
                </div>

                <div className="mt-1 flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-600">
                    {food.rating}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                  {food.desc}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="font-bold text-gray-900">
                    ₹{food.price}
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(food);
                    }}
                    className="rounded-lg bg-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}

          {currentData.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No items available.
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
}