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
  const [portion, setPortion] = useState("Full");
  const [spiceLevel, setSpiceLevel] = useState("Medium Spicy");

  // Determine if legacy portions/spiciness are available
  const hasPortions = food?.half_price != null;
  const customizableSpice = food?.is_spicy_customizable ?? food?.category?.is_spicy_customizable ?? false;
  
  // State for dynamic customizations
  // selectedVariants: { [groupId]: variantId }
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const defaultVariants = {};
    if (food?.variant_groups) {
      food.variant_groups.forEach(vg => {
        const defaultVar = vg.variants.find(v => v.is_default);
        if (defaultVar) {
          defaultVariants[vg.id] = defaultVar.id;
        } else if (vg.variants.length > 0) {
          defaultVariants[vg.id] = vg.variants[0].id;
        }
      });
    }
    return defaultVariants;
  });

  // selectedAddons: { [addonId]: boolean }
  const [selectedAddons, setSelectedAddons] = useState({});

  // Calculate dynamic price
  const basePrice = food?.price || 0;
  const halfPrice = food?.half_price || Math.round(basePrice * 0.6);
  
  const calculateTotalPrice = () => {
    let total = portion === "Half" ? halfPrice : basePrice;
    
    // Add variant prices
    if (food?.variant_groups) {
      food.variant_groups.forEach(vg => {
        const selectedId = selectedVariants[vg.id];
        if (selectedId) {
          const variant = vg.variants.find(v => v.id === selectedId);
          if (variant) total += variant.extra_price;
        }
      });
    }

    // Add addon prices
    if (food?.addon_groups) {
      food.addon_groups.forEach(ag => {
        ag.addons.forEach(addon => {
          if (selectedAddons[addon.id]) {
            total += addon.price;
          }
        });
      });
    }

    return total;
  };

  const currentPrice = calculateTotalPrice();

  const handleVariantChange = (groupId, variantId) => {
    setSelectedVariants(prev => ({ ...prev, [groupId]: variantId }));
  };

  const handleAddonChange = (addonId) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  if (!food) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-slate-800/50">
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
    <PageLayout className="bg-white dark:bg-slate-900">
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
            className="absolute left-4 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Bottom Sheet */}
        <div className="relative -mt-6 flex-1 rounded-t-[32px] bg-white dark:bg-slate-900 px-6 pt-6 pb-32 overflow-y-auto">
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gray-200 dark:bg-slate-700"></div>

          {/* Title & Price */}
          <div className="flex items-start justify-between mt-2">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-4 w-4 rounded-sm border border-green-500 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{currentPrice}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-5 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
            {food.desc || food.description || "No description available."}
          </p>

          {/* Legacy Customization: Portion */}
          {hasPortions && (
            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Portion</h3>
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
                {['Half', 'Full'].map((p) => (
                  <label key={p} onClick={() => setPortion(p)} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${portion === p ? 'border-orange-500' : 'border-gray-300 dark:border-slate-600'}`}>
                        {portion === p && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{p} Plate</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300">₹{p === 'Half' ? halfPrice : basePrice}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Customization: Preparation Type */}
          {customizableSpice && (
            <div className="mt-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Preparation Type</h3>
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
                {['Low Spicy', 'Medium Spicy', 'Extra Spicy'].map((level) => (
                  <label key={level} onClick={() => setSpiceLevel(level)} className="flex items-center gap-3 cursor-pointer">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${spiceLevel === level ? 'border-orange-500' : 'border-gray-300 dark:border-slate-600'}`}>
                      {spiceLevel === level && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Variant Groups */}
          {food?.variant_groups?.map((vg) => (
            <div key={vg.id} className="mt-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{vg.name}</h3>
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
                {vg.variants.map((v) => (
                  <label key={v.id} onClick={() => handleVariantChange(vg.id, v.id)} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${selectedVariants[vg.id] === v.id ? 'border-orange-500' : 'border-gray-300 dark:border-slate-600'}`}>
                        {selectedVariants[vg.id] === v.id && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{v.name}</span>
                    </div>
                    {v.extra_price > 0 && (
                      <span className="text-sm font-bold text-gray-700 dark:text-slate-300">+₹{v.extra_price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Dynamic Addon Groups */}
          {food?.addon_groups?.map((ag) => (
            <div key={ag.id} className="mt-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{ag.name}</h3>
              {ag.max_selections > 0 && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Choose up to {ag.max_selections}</p>
              )}
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4">
                {ag.addons.map((addon) => (
                  <label key={addon.id} onClick={() => handleAddonChange(addon.id)} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${selectedAddons[addon.id] ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-slate-600 bg-transparent'}`}>
                        {selectedAddons[addon.id] && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{addon.name}</span>
                    </div>
                    {addon.price > 0 && (
                      <span className="text-sm font-bold text-gray-700 dark:text-slate-300">+₹{addon.price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Special Instructions (Optional)
            </h3>
            <textarea
              rows={3}
              placeholder="E.g. Make it spicy, less oil, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full resize-none rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition"
            />
          </div>

        </div>

        {/* Floating Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex items-center gap-4">
          {!showQuantity ? (
            <div className="flex w-full items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Price</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{currentPrice}</p>
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
              <div className="flex h-14 items-center gap-4 rounded-2xl border border-gray-200 dark:border-slate-700 px-4 bg-white dark:bg-slate-900">
                <button disabled={food.is_available === false} 
                  onClick={() => {
                    if (quantity === 1) {
                      setShowQuantity(false);
                      setQuantity(1);
                    } else {
                      setQuantity(quantity - 1);
                    }
                  }}
                  className="text-gray-400 dark:text-slate-500 dark:text-slate-400 active:text-orange-500 transition"
                >
                  <Minus size={20} />
                </button>
                <span className="w-4 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-400 dark:text-slate-500 dark:text-slate-400 active:text-orange-500 transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => {
                  addToCart({ 
                    ...food, 
                    instructions,
                    portion: hasPortions ? portion : undefined,
                    spiceLevel: customizableSpice ? spiceLevel : undefined,
                    selectedVariants,
                    selectedAddons,
                    price: currentPrice,
                    basePrice: basePrice
                  }, quantity);
                  navigate("/customer/cart");
                }}
                className="flex h-14 flex-1 items-center justify-between rounded-2xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none" disabled={food.is_available === false}
              >
                <span>Add Item</span>
                <span>(₹{currentPrice * quantity})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}