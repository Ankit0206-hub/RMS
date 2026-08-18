import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export default function CustomizationModal({ isOpen, onClose, food }) {
  const { addToCart, editCartItem } = useApp();

  const [portion, setPortion] = useState("Full");
  const [spiceLevel, setSpiceLevel] = useState("Medium Spicy");
  const [instructions, setInstructions] = useState("");
  
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  const isEditing = !!food?.cartItemId;

  useEffect(() => {
    if (isOpen && food) {
      setPortion(food.portion || "Full");
      setSpiceLevel(food.spiceLevel || "Medium Spicy");
      setInstructions(food.instructions || "");
      
      if (food.selectedVariants) {
        setSelectedVariants(food.selectedVariants);
      } else {
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
        setSelectedVariants(defaultVariants);
      }
      
      setSelectedAddons(food.selectedAddons || {});
    }
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  const hasPortions = food.half_price != null;
  const customizableSpice = food.is_spicy_customizable ?? food.category?.is_spicy_customizable ?? false;
  
  const basePrice = food.basePrice || food.price || 0;
  let currentPrice = portion === "Half" ? (food.half_price ?? Math.round(basePrice * 0.6)) : basePrice;

  // Add variant prices
  if (food.variant_groups) {
    food.variant_groups.forEach(vg => {
      const selectedId = selectedVariants[vg.id];
      if (selectedId) {
        const variant = vg.variants.find(v => v.id === selectedId);
        if (variant && variant.extra_price) currentPrice += variant.extra_price;
      }
    });
  }

  // Add addon prices
  if (food.addon_groups) {
    food.addon_groups.forEach(ag => {
      ag.addons.forEach(addon => {
        if (selectedAddons[addon.id] && addon.price) currentPrice += addon.price;
      });
    });
  }

  const handleAdd = () => {
    if (isEditing) {
      editCartItem(food.cartItemId, { 
        ...food, 
        portion,
        spiceLevel,
        instructions,
        selectedVariants,
        selectedAddons,
        price: currentPrice,
        basePrice: basePrice
      }, food.quantity);
    } else {
      addToCart({ 
        ...food, 
        portion,
        spiceLevel,
        instructions,
        selectedVariants,
        selectedAddons,
        price: currentPrice,
        basePrice: basePrice
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{food.name}</h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mt-0.5">Customise as per your taste</p>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:bg-slate-700 active:scale-95 transition"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[60vh] overflow-y-auto px-1 -mx-1 space-y-6 pb-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent">
          
          {/* Customization: Portion */}
          {hasPortions && (
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">Portion</h3>
              <div className="flex flex-col gap-3 rounded-[1.25rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/80 p-4">
                {['Half', 'Full'].map((p) => (
                  <label key={p} onClick={() => setPortion(p)} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${portion === p ? 'border-orange-500 bg-white dark:bg-slate-900' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                        {portion === p && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{p} Plate</span>
                    </div>
                    <span className="text-[14px] font-bold text-gray-700 dark:text-slate-300">₹{p === 'Half' ? (food.half_price ?? Math.round(basePrice * 0.6)) : basePrice}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Customization: Preparation Type */}
          {customizableSpice && (
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">Preparation Type</h3>
              <div className="flex flex-col gap-3 rounded-[1.25rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/80 p-4">
                {['Low Spicy', 'Medium Spicy', 'Extra Spicy'].map((level) => (
                  <label key={level} onClick={() => setSpiceLevel(level)} className="flex items-center gap-3 cursor-pointer">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${spiceLevel === level ? 'border-orange-500 bg-white dark:bg-slate-900' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                      {spiceLevel === level && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Variant Groups */}
          {food?.variant_groups?.map((vg) => (
            <div key={vg.id}>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">{vg.name}</h3>
              <div className="flex flex-col gap-3 rounded-[1.25rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/80 p-4">
                {vg.variants.map((v) => (
                  <label key={v.id} onClick={() => setSelectedVariants(prev => ({ ...prev, [vg.id]: v.id }))} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${selectedVariants[vg.id] === v.id ? 'border-orange-500 bg-white dark:bg-slate-900' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                        {selectedVariants[vg.id] === v.id && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{v.name}</span>
                    </div>
                    {v.extra_price > 0 && (
                      <span className="text-[14px] font-bold text-gray-700 dark:text-slate-300">+₹{v.extra_price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Dynamic Addon Groups */}
          {food?.addon_groups?.map((ag) => (
            <div key={ag.id}>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">
                {ag.name}
                {ag.max_selections > 0 && (
                  <span className="ml-2 text-[11px] font-medium text-gray-500 normal-case bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">
                    Max {ag.max_selections}
                  </span>
                )}
              </h3>
              <div className="flex flex-col gap-3 rounded-[1.25rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/80 p-4">
                {ag.addons.map((addon) => (
                  <label key={addon.id} onClick={() => {
                      if (!selectedAddons[addon.id] && ag.max_selections > 0) {
                        const currentSelections = ag.addons.filter(a => selectedAddons[a.id]).length;
                        if (currentSelections >= ag.max_selections) return;
                      }
                      setSelectedAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }));
                    }} className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${selectedAddons[addon.id] ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                        {selectedAddons[addon.id] && <div className="h-2 w-2 rounded-sm bg-white" />}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{addon.name}</span>
                    </div>
                    {addon.price > 0 && (
                      <span className="text-[14px] font-bold text-gray-700 dark:text-slate-300">+₹{addon.price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">
              Special Instructions (Optional)
            </h3>
            <textarea
              rows={2}
              placeholder="E.g. Make it spicy, less oil, no onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full resize-none rounded-[1.25rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50/80 p-4 text-[14px] font-medium text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-between rounded-xl md:rounded-2xl bg-orange-500 px-5 py-2.5 md:px-6 md:py-3 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-base md:text-lg">₹{currentPrice * (food.quantity || 1)}</span>
            </div>
            <span className="text-[15px] md:text-[16px]">{isEditing ? 'Update Cart' : 'Add Item to cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
