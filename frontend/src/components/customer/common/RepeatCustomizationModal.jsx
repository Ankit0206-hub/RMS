import { X } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export default function RepeatCustomizationModal({ isOpen, onClose, cartItem, onChooseNew }) {
  const { addToCart } = useApp();

  if (!isOpen || !cartItem) return null;

  const handleRepeat = () => {
    addToCart(cartItem, 1);
    onClose();
  };

  const handleChooseNew = () => {
    onClose();
    onChooseNew(cartItem);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Repeat previous customization?</h2>
            {cartItem.notes && (
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">{cartItem.notes}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:bg-slate-700 active:scale-95 transition"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRepeat}
            className="w-full rounded-2xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            Repeat Last
          </button>
          
          <button
            onClick={handleChooseNew}
            className="w-full rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 px-6 py-3.5 font-bold text-orange-600 dark:text-orange-400 transition hover:bg-orange-100 dark:hover:bg-slate-700 active:scale-[0.98]"
          >
            I'll choose differently
          </button>
        </div>
      </div>
    </div>
  );
}
