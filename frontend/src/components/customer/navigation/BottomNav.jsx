import {
  Home,
  Grid2x2,
  ShoppingCart,
  ClipboardList,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function BottomNav({ active = "home" }) {
  const navigate = useNavigate();
  return (
    <div className="h-16 border-t border-black/5 bg-white flex items-center">
      {/* Home */}
      <button 
         onClick={() => navigate("/customer/Home")}
      className="flex flex-1 flex-col items-center  text-gray-400 justify-center">
        <Home size={18} />
        <span className="mt-1 text-xs font-medium">
          Home
        </span>
      </button>

      {/* Categories */}
      <button
        onClick={() => navigate("/customer/categories")}
        className={`flex flex-col items-center text-xs ${active === "categories"
          ? "text-orange-500"
          : "text-gray-400"
          }`}
      >
        <Grid2x2 size={18} />
        <span className="mt-1 text-xs font-medium">
          Categories
        </span>

      </button>
      {/* Cart */}
      <button
        onClick={() => navigate("/customer/cart")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "cart" ? "text-orange-500" : "text-gray-400"
          }`}
      >
        <ShoppingCart size={18} />
        <span className="mt-1 text-xs font-medium">
          Cart
        </span>
      </button>

      {/* Orders */}
      <button
        onClick={() => navigate("/customer/orders")}
        className={`flex flex-1 flex-col items-center justify-center ${active === "orders"
            ? "text-orange-500"
            : "text-gray-400"
          }`}
      >
        <ClipboardList size={18} />
        <span className="mt-1 text-xs font-medium">
          Orders
        </span>
      </button>
      {/* Profile */}
      <button    onClick={() => navigate("/customer/Profile")}
       className="flex flex-1 flex-col items-center  text-gray-400 justify-center">
        <User size={18} />
        <span className="mt-1 text-xs font-medium">Profile</span>
      </button>

    </div>
  );
}