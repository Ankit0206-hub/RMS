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
import { useNavigate } from "react-router-dom";
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

      const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/customer?session_id=${customerSession.sessionId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              if (data.event === "order.updated" || data.event === "order.created") {
                  fetchDetails();
              }
          } catch (err) {}
      };
      
      return () => ws.close();
    }
  }, [customerSession]);

  const cartItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  return (
    <div className="flex flex-col w-full z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
      
      {/* Active Order Banner */}
      {activeOrder && (
        <div 
          onClick={() => navigate("/customer/order-tracking")}
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