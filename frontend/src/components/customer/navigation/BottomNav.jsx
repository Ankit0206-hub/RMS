import {
  Home,
  Grid2x2,
  ShoppingCart,
  ClipboardList,
  User,
  Settings as SettingsIcon,
  ChevronRight,
  Clock,
  ChefHat
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getWsUrl } from '../../../services/api';
import { useApp } from "../../../context/AppContext";
import { useEffect, useState } from "react";
import customerApi from "../../../services/customerApi";

export default function BottomNav({ active = "home" }) {
  const navigate = useNavigate();
  const { cartItems, customerSession } = useApp();
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (customerSession?.sessionId) {
      const fetchDetails = () => {
        customerApi.getSessionDetails(customerSession.sessionId)
          .then(data => {
            if (data?.orders?.length > 0) {
              const latestOrder = data.orders[data.orders.length - 1];
              if (["Verification Pending", "Pending", "Confirmed", "Preparing", "Cooked"].includes(latestOrder.status)) {
                setActiveOrder(latestOrder);
              } else {
                setActiveOrder(null);
              }
            }
          })
          .catch(console.error);
      };
      
      fetchDetails();

      const handleOrderUpdate = () => fetchDetails();
      window.addEventListener('orderUpdatedLocally', handleOrderUpdate);
      return () => window.removeEventListener('orderUpdatedLocally', handleOrderUpdate);
    }
  }, [customerSession]);

  const cartItemCount = cartItems.length;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  return (
    <div className="flex flex-col w-full z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 relative">
      
      {/* Floating Cart Summary (Swiggy/Zomato style) */}
      {cartItemCount > 0 && active !== "cart" && (
        <div className="absolute top-0 left-0 w-full -translate-y-full px-4 pb-3 pt-1 pointer-events-none">
          <div 
            onClick={() => navigate("/customer/cart")}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-between p-3.5 shadow-[0_8px_25px_rgba(34,197,94,0.35)] cursor-pointer pointer-events-auto transition-transform active:scale-95"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-100 mb-0.5">
                {totalItemCount} Item{totalItemCount > 1 ? 's' : ''} added
              </span>
              <span className="text-base font-black">
                ₹{cartSubtotal.toFixed(2)}
                <span className="text-xs font-normal text-green-100 ml-1">plus taxes</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm font-bold bg-white/20 px-3 py-1.5 rounded-xl">
              View Cart <ChevronRight size={16} strokeWidth={3} className="mt-0.5" />
            </div>
          </div>
        </div>
      )}
      
      {/* Active Order Banner */}
      {activeOrder && (
        <div 
          onClick={() => navigate("/customer/order-details", { state: { order: activeOrder } })}
          className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 flex items-center justify-between cursor-pointer border-b border-orange-100 dark:border-orange-900/30"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              {activeOrder.status === "Preparing" || activeOrder.status === "Cooked" ? (
                <ChefHat className="text-orange-500 w-5 h-5 animate-pulse" />
              ) : (
                <Clock className="text-orange-500 w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                {activeOrder.status === "Cooked" ? "Ready to Serve" : activeOrder.status}
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">
                Order #{activeOrder.id} is {activeOrder.status.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm text-orange-500">
            <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Navigation Icons */}
      <div className="h-16 flex items-center px-2">
        <button 
          onClick={() => navigate("/customer/home")}
          className={`flex flex-1 flex-col items-center justify-center ${active === "home" ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`}
        >
          <Home size={22} strokeWidth={active === "home" ? 2.5 : 2} />
          <span className="mt-1 text-[10px] font-bold tracking-wide">Home</span>
        </button>

        <button
          onClick={() => navigate("/customer/categories")}
          className={`flex flex-1 flex-col items-center justify-center ${active === "categories" ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`}
        >
          <Grid2x2 size={22} strokeWidth={active === "categories" ? 2.5 : 2} />
          <span className="mt-1 text-[10px] font-bold tracking-wide">Menu</span>
        </button>
        
        <button
          onClick={() => navigate("/customer/cart")}
          className={`relative flex flex-1 flex-col items-center justify-center ${active === "cart" ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`}
        >
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={active === "cart" ? 2.5 : 2} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] font-bold tracking-wide">Cart</span>
        </button>

        <button
          onClick={() => navigate("/customer/orders")}
          className={`flex flex-1 flex-col items-center justify-center ${active === "orders" ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`}
        >
          <ClipboardList size={22} strokeWidth={active === "orders" ? 2.5 : 2} />
          <span className="mt-1 text-[10px] font-bold tracking-wide">Orders</span>
        </button>
        
        <button
          onClick={() => navigate("/customer/settings")}
          className={`flex flex-1 flex-col items-center justify-center ${active === "settings" ? "text-orange-500" : "text-gray-400 dark:text-slate-500"}`}
        >
          <SettingsIcon size={22} strokeWidth={active === "settings" ? 2.5 : 2} />
          <span className="mt-1 text-[10px] font-bold tracking-wide">Settings</span>
        </button>
      </div>
    </div>
  );
}