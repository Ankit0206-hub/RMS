import {
  Home,
  Grid2x2,
  ShoppingCart,
  ClipboardList,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

export default function BottomNav({ active = "home" }) {
  const navigate = useNavigate();
  const { cartItems } = useApp();

  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  return (
    <div className="h-16 border-t border-black/5 bg-white dark:bg-slate-900 flex items-center">
      {/* Home */}
      <button 
        onClick={() => navigate("/customer/home")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "home" ? "text-orange-500" : "text-gray-400 dark:text-slate-500 dark:text-slate-400"}`}
      >
        <Home size={18} />
        <span className="mt-1 text-xs font-medium">
          Home
        </span>
      </button>

      {/* Categories */}
      <button
        onClick={() => navigate("/customer/categories")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "categories" ? "text-orange-500" : "text-gray-400 dark:text-slate-500 dark:text-slate-400"}`}
      >
        <Grid2x2 size={18} />
        <span className="mt-1 text-xs font-medium">
          Categories
        </span>
      </button>
      {/* Cart */}
      <button
        onClick={() => navigate("/customer/cart")}
        className={`relative flex flex-1 flex-col items-center justify-center ${active === "cart" ? "text-orange-500" : "text-gray-400 dark:text-slate-500 dark:text-slate-400"
          }`}
      >
        <div className="relative">
          <ShoppingCart size={18} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="mt-1 text-xs font-medium">
          Cart
        </span>
      </button>

      {/* Orders */}
      <button
        onClick={() => navigate("/customer/orders")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "orders"
            ? "text-orange-500"
            : "text-gray-400 dark:text-slate-500 dark:text-slate-400"
          }`}
      >
        <ClipboardList size={18} />
        <span className="mt-1 text-xs font-medium">
          Orders
        </span>
      </button>
      {/* Settings */}
      <button
        onClick={() => navigate("/customer/settings")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "settings" ? "text-orange-500" : "text-gray-400 dark:text-slate-500 dark:text-slate-400"}`}
      >
        <SettingsIcon size={18} />
        <span className="mt-1 text-xs font-medium">Settings</span>
      </button>

    </div>
  );
}