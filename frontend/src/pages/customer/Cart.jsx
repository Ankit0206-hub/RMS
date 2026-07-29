import React, { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import CustomizationModal from "../../components/customer/common/CustomizationModal";
import customerApi from "../../services/customerApi";
import toast from "react-hot-toast";

export default function Cart() {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const {
    user,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    customerSession,
    setCartItems
  } = useApp();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = cartItems.length ? 30 : 0;
  const total = subtotal + tax + serviceCharge;

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/customer/home")} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 active:scale-95 transition-transform z-20"
          >
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cart</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-gray-200 dark:border-slate-700 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold tracking-wide text-gray-700 dark:text-slate-300">
              {customerSession?.tableId 
                ? (customerSession.tableId.toLowerCase().includes('table') 
                    ? customerSession.tableId 
                    : `Table ${customerSession.tableId}`) 
                : "No Table"}
            </span>
          </div>
          <img
            src={user.image || "https://i.pravatar.cc/150?img=12"}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-6 mx-auto w-full">

        {cartItems.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart is Empty</h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400 text-center">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate("/customer/home")}
              className="mt-6 rounded-2xl bg-orange-500 px-8 py-3 font-bold text-white shadow-lg"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center mb-5">
                <div className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 p-2 rounded-xl mr-3 border border-gray-100 dark:border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <h2 className="font-black text-gray-800 dark:text-white text-lg">Order Items</h2>
              </div>
              
              <div className="space-y-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center flex-1 pr-2">
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover shadow-sm mr-3 border border-gray-100 dark:border-slate-800"/>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-[15px] leading-tight">{item.name}</h3>
                        
                        {(item.portion || item.spiceLevel || item.instructions || item.half_price != null || item.is_spicy_customizable || item.category?.is_spicy_customizable) && (
                          <button onClick={() => setEditingItem(item)} className="flex items-center gap-1.5 mt-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-lg shadow-sm active:scale-95 transition-transform text-left">
                            <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 shrink-0" />
                            <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300 line-clamp-1">
                                {item.portion || item.spiceLevel ? [item.portion ? `${item.portion} Plate` : '', item.spiceLevel].filter(Boolean).join(', ') : 'Customize...'}
                            </span>
                          </button>
                        )}
                        
                        {item.instructions && (
                          <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                            Note: {item.instructions}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-bold">₹ {item.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl p-1 shadow-inner border border-gray-100 dark:border-slate-700 shrink-0">
                      <button onClick={() => {
                        if (item.quantity === 1) removeFromCart(item.id);
                        else decreaseQuantity(item.id);
                      }} className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm active:scale-95 transition-all">
                        <Minus className="h-4 w-4 md:h-5 md:w-5 text-gray-700 dark:text-slate-300"/>
                      </button>
                      <span className="w-8 md:w-10 text-center font-black text-sm md:text-base text-gray-800 dark:text-white">{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)} className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm active:scale-95 transition-all">
                        <Plus className="h-4 w-4 md:h-5 md:w-5 text-gray-700 dark:text-slate-300"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate("/customer/categories")} className="w-full mt-5 py-3.5 bg-rose-50 dark:bg-rose-900/10 border-2 border-dashed border-rose-300/60 rounded-2xl text-rose-500 font-bold text-[15px] flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors">
                  <Plus className="h-5 w-5 mr-2" /> Add More Items
              </button>
            </div>

            {/* Bill Summary */}
            <div className="bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800 mt-2">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Bill Summary
              </h2>
              <div className="space-y-3 text-sm font-medium text-gray-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-gray-900 dark:text-white">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="text-gray-900 dark:text-white">₹{serviceCharge}</span>
                </div>
                <div className="my-3 border-t border-gray-100 dark:border-slate-800 border-dashed" />
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-orange-500 text-xl font-black">₹{total}</span>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={async () => {
                  if (!customerSession) {
                    toast.error("No active session found. Please start a session first.");
                    return;
                  }
                  
                  setIsPlacingOrder(true);
                  try {
                    const itemsForApi = cartItems.map(item => ({
                      menu_item_id: item.originalId || item.id,
                      quantity: item.quantity,
                      notes: [item.portion ? `Portion: ${item.portion}` : "", item.spiceLevel ? `Spice: ${item.spiceLevel}` : "", item.instructions || ""].filter(Boolean).join(" | ")
                    }));
                    
                    const res = await customerApi.createOrder(customerSession.sessionId, {
                      items: itemsForApi,
                      special_instructions: ""
                    });
                    
                    setCartItems([]);
                    toast.success("Order placed successfully!");
                    navigate("/customer/order-success", { 
                      state: { 
                        orderId: res.order_id,
                        itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
                      } 
                    });
                  } catch (err) {
                    toast.error(err.response?.data?.detail || "Failed to place order");
                  } finally {
                    setIsPlacingOrder(false);
                  }
                }}
                disabled={isPlacingOrder}
                className="mt-6 w-full flex items-center justify-center gap-2 h-14 sm:h-16 rounded-2xl bg-orange-500 text-white font-bold text-lg shadow-[0_8px_25px_rgba(249,115,22,0.3)] active:scale-[0.98] transition-transform disabled:opacity-70"
              >
                {isPlacingOrder ? "Placing..." : "Place Order"}
                {!isPlacingOrder && <ArrowRight size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </>
        )}
      </div>



      <CustomizationModal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        food={editingItem} 
      />
    </PageLayout>
  );
}