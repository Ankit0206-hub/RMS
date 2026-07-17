import { useState } from "react";
import { ArrowLeft, Search, Star, Minus, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import CustomizationModal from "../../components/customer/common/CustomizationModal";
import { useEffect } from "react";
import customerApi from "../../services/customerApi";



export default function FoodList() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useApp();
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'veg', 'non-veg', 'spicy'
  const [searchQuery, setSearchQuery] = useState("");
  const [customizationFood, setCustomizationFood] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = category ? category.replace("-", " ") : "Main Course";

  useEffect(() => {
    customerApi.getMenu().then(data => {
      const catData = data.find(c => c.name.toLowerCase().replace(/\s+/g, "-") === category);
      if (catData) {
        const mappedItems = catData.items.map(dish => ({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          rating: 4.8,
          desc: dish.description,
          isVeg: dish.is_veg,
          isSpicy: dish.customizable_spice,
          hasPortions: dish.has_portions,
          customizableSpice: dish.customizable_spice,
          image: dish.image_url || "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800"
        }));
        setCurrentData(mappedItems);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [category]);

  const toggleFilter = (filterName) => {
    setActiveFilter(activeFilter === filterName ? "all" : filterName);
  };

  const filteredData = currentData.filter((food) => {
    // Text search
    if (searchQuery && !food.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Tag filter
    if (activeFilter === "veg") return food.isVeg === true;
    if (activeFilter === "non-veg") return food.isVeg === false;
    if (activeFilter === "spicy") return food.isSpicy === true;
    return true;
  });

  return (
    <PageLayout className="bg-white">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center justify-center relative px-4 pt-6 pb-2">
          <button onClick={() => navigate("/customer/categories")} className="absolute left-4 p-2 z-10 active:scale-95 transition-transform">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${title}...`}
              className="ml-3 flex-1 bg-transparent text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-3 px-4 mt-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => toggleFilter("veg")}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 whitespace-nowrap transition-colors ${
              activeFilter === "veg" ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <span className="h-3 w-3 rounded-full border-2 border-green-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            <span className={`text-sm font-semibold ${activeFilter === "veg" ? "text-orange-500" : "text-gray-600"}`}>Veg</span>
          </button>

          <button
            onClick={() => toggleFilter("non-veg")}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 whitespace-nowrap transition-colors ${
              activeFilter === "non-veg" ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <span className="h-3 w-3 rounded-full border-2 border-red-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
            <span className={`text-sm font-semibold ${activeFilter === "non-veg" ? "text-orange-500" : "text-gray-600"}`}>Non-Veg</span>
          </button>

          <button
            onClick={() => toggleFilter("spicy")}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 whitespace-nowrap transition-colors ${
              activeFilter === "spicy" ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <span className="text-lg leading-none">🌶️</span>
            <span className={`text-sm font-semibold ${activeFilter === "spicy" ? "text-orange-500" : "text-gray-600"}`}>Spicy</span>
          </button>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto px-4 mt-6 pb-6 space-y-5">
          {filteredData.map((food) => (
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
                  <span className={`h-3 w-3 rounded-sm border flex items-center justify-center ${food.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${food.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
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
                  {food.isSpicy && <span className="text-xs ml-1">🌶️</span>}
                </div>

                <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                  {food.desc}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="font-bold text-gray-900">
                    ₹{food.price}
                  </p>
                  
                  {(() => {
                    const cartItem = cartItems.find((item) => item.id === food.id || item.name === food.name);
                    if (cartItem) {
                      return (
                        <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-orange-500 px-1 sm:px-2 py-0.5 sm:py-1 text-white shadow-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseQuantity(cartItem.id || food.id || food.name);
                            }}
                            className="p-1"
                          >
                            <Minus className="w-3 h-3 sm:w-[14px] sm:h-[14px]" />
                          </button>
                          <span className="text-xs sm:text-sm font-bold text-center px-1">{cartItem.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              increaseQuantity(cartItem.id || food.id || food.name);
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
                          if (food.hasPortions || food.customizableSpice) {
                            setCustomizationFood(food);
                          } else {
                            addToCart(food);
                          }
                        }}
                        className="rounded-lg bg-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
                      >
                        Add
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No items available.
            </div>
          )}
        </div>

      </div>

      <CustomizationModal 
        isOpen={!!customizationFood} 
        onClose={() => setCustomizationFood(null)} 
        food={customizationFood} 
      />
    </PageLayout>
  );
}