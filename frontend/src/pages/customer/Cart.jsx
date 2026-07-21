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
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-32 sm:pb-40 space-y-6 max-w-4xl mx-auto w-full">

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
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-3 shadow-sm border border-gray-100 dark:border-slate-800 flex gap-4 relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="font-bold text-gray-900 dark:text-white leading-tight pr-8">
                      {item.name}
                    </h2>

                    {(item.portion || item.spiceLevel || item.instructions) && (
                      <div className="mt-2">
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 transition"
                        >
                          Customization
                          <ChevronDown size={12} className={`transition-transform duration-200 ${expandedItems[item.id] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {expandedItems[item.id] && (
                          <div className="mt-2 pl-5 p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-gray-600 dark:text-slate-400 leading-snug">
                                  {item.portion && `• ${item.portion} Plate`}
                                </p>
                                <p className="text-[11px] font-semibold text-gray-600 dark:text-slate-400 leading-snug">
                                  {item.spiceLevel && `• ${item.spiceLevel}`}
                                  {(!item.portion && !item.spiceLevel) && "• Customise"}
                                </p>
                              </div>
                              <button 
                                onClick={() => setEditingItem(item)}
                                className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded flex-shrink-0"
                              >
                                <Edit2 size={10} /> Edit
                              </button>
                            </div>
                            
                            {item.instructions && (
                              <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-2 italic border-l-2 border-orange-200 pl-2 leading-relaxed">
                                {item.instructions}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold text-gray-900 dark:text-white">
                        ₹{item.price}
                      </p>

                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-1 bg-gray-50 dark:bg-slate-800/50">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) removeFromCart(item.id);
                            else decreaseQuantity(item.id);
                          }}
                          className="text-gray-500 dark:text-slate-400 hover:text-orange-500 transition p-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-gray-900 dark:text-white text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="text-gray-500 dark:text-slate-400 hover:text-orange-500 transition p-1"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button Top Right */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-red-50 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add More Items Button */}
            <button
              onClick={() => navigate("/customer/categories")}
              className="w-full border-2 border-dashed border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-4 flex items-center justify-center gap-2 hover:border-orange-500 transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-orange-50 group-hover:text-orange-500 transition">
                <Plus size={16} className="text-gray-500 dark:text-slate-400 group-hover:text-orange-500 transition" />
              </div>
              <span className="font-bold text-gray-700 dark:text-slate-300 group-hover:text-orange-500 transition">Add More Items</span>
            </button>

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
                  <span className="text-orange-500">₹{total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Fixed Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900/85 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto w-full px-5 sm:px-8 py-5 pb-8 sm:pb-10 flex items-center justify-between gap-6">
            
            {/* Price Info */}
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Total Pay</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">₹{total}</span>
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
                    menu_item_id: item.originalId || item.id, // Ensure we send the backend ID
                    quantity: item.quantity,
                    notes: [item.portion ? `Portion: ${item.portion}` : "", item.spiceLevel ? `Spice: ${item.spiceLevel}` : "", item.instructions || ""].filter(Boolean).join(" | ")
                  }));
                  
                  const res = await customerApi.createOrder(customerSession.sessionId, {
                    items: itemsForApi,
                    special_instructions: "" // Or add a field for it
                  });
                  
                  // Handle success
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
              className="flex-1 max-w-[220px] sm:max-w-[300px] flex items-center justify-center gap-2 h-14 sm:h-16 rounded-2xl bg-orange-500 text-white font-bold text-lg shadow-[0_8px_25px_rgba(249,115,22,0.3)] active:scale-[0.97] transition-transform disabled:opacity-70"
            >
              {isPlacingOrder ? "Placing..." : "Place Order"}
              {!isPlacingOrder && <ArrowRight size={20} strokeWidth={2.5} />}
            </button>
            
          </div>
        </div>
      )}

      <CustomizationModal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        food={editingItem} 
      />
    </PageLayout>
  );
}