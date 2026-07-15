import React from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useApp();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = cartItems.length ? 30 : 0;
  const total = subtotal + tax + serviceCharge;

  return (
    <PageLayout className="bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Cart</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm border border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Table 07</span>
          </div>
          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {cartItems.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
            <p className="mt-2 text-gray-500 text-center">
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
                  className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100 flex gap-4 relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="font-bold text-gray-900 leading-tight pr-8">
                      {item.name}
                    </h2>
                    
                    {item.instructions && (
                      <p className="text-xs font-medium text-orange-500 mt-0.5 line-clamp-1">
                        {item.instructions}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold text-gray-900">
                        ₹{item.price}
                      </p>

                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-1 bg-gray-50">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) removeFromCart(item.id);
                            else decreaseQuantity(item.id);
                          }}
                          className="text-gray-500 hover:text-orange-500 transition p-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-gray-900 text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="text-gray-500 hover:text-orange-500 transition p-1"
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
              onClick={() => navigate("/customer/home")}
              className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 flex items-center justify-center gap-2 hover:border-orange-500 transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 group-hover:bg-orange-50 group-hover:text-orange-500 transition">
                <Plus size={16} className="text-gray-500 group-hover:text-orange-500 transition" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-500 transition">Add More Items</span>
            </button>

            {/* Bill Summary */}
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 mt-2">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Bill Summary
              </h2>
              <div className="space-y-3 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-gray-900">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="text-gray-900">₹{serviceCharge}</span>
                </div>
                <div className="my-3 border-t border-gray-100 border-dashed" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-orange-500">₹{total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Floating CTA */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-100 bg-white p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10">
          <button
            onClick={() => navigate("/customer/order-success")}
            className="flex h-14 w-full items-center justify-between rounded-2xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            <span>Place Order</span>
            <span>₹{total}</span>
          </button>
        </div>
      )}
    </PageLayout>
  );
}