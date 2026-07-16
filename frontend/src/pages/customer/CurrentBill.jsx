import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function CurrentBill() {
  const navigate = useNavigate();

  // For this mock screen, we will just display cartItems as if they were ordered
  // In a real app, this would come from an "active orders" endpoint.
  const { user, cartItems } = useApp();

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
          <h1 className="text-xl font-bold text-gray-900">Current Bill</h1>
        </div>
        <img
          src={user?.image || "https://i.pravatar.cc/100"}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-100"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        
        {/* Table Pill */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 border border-red-100 px-6 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-red-500">Table 07</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <p className="text-gray-500 text-center">
              No items ordered yet.
            </p>
          </div>
        ) : (
          <>
            {/* Ordered Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <h2 className="font-bold text-gray-900 leading-tight pr-4">
                        {item.name}
                      </h2>
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                    
                    {item.instructions && (
                      <p className="text-xs font-medium text-orange-500 mt-0.5 line-clamp-1">
                        {item.instructions}
                      </p>
                    )}

                    <div className="mt-2 text-sm font-medium text-gray-500">
                      Qty: {item.quantity} x ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Estimated Bill Summary
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
                  <span>Estimated Total</span>
                  <span className="text-orange-500">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Note Alert */}
            <div className="flex items-start gap-3 rounded-2xl bg-gray-100 p-4 border border-gray-200">
              <Info size={20} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-600 leading-snug">
                This is an estimated running tally. The final bill will be generated by the operator at the counter.
              </p>
            </div>
          </>
        )}
      </div>

    </PageLayout>
  );
}
