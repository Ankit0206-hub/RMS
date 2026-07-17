import React, { useEffect, useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";

export default function CurrentBill() {
  const navigate = useNavigate();
  const { user, customerSession } = useApp();
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (customerSession?.sessionId) {
      customerApi.getSessionDetails(customerSession.sessionId)
        .then(data => setSessionData(data))
        .catch(console.error);
    }
  }, [customerSession]);

  const allOrderedItems = sessionData?.orders?.flatMap(order => order.items) || [];
  
  const subtotal = sessionData?.subtotal || 0;
  const tax = sessionData?.tax || 0;
  const serviceCharge = allOrderedItems.length > 0 ? 30 : 0;
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
            <span className="text-sm font-bold text-red-500">
                {customerSession?.tableId ? (customerSession.tableId.toLowerCase().includes('table') ? customerSession.tableId : `Table ${customerSession.tableId}`) : "No Table"}
            </span>
          </div>
        </div>

        {allOrderedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <p className="text-gray-500 text-center">
              No items ordered yet.
            </p>
          </div>
        ) : (
          <>
            {/* Ordered Items */}
            <div className="space-y-4">
              {allOrderedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    {/* Placeholder for item image if not provided by backend */}
                    🍽️
                  </div>
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
