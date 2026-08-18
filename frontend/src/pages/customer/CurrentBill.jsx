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
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Current Bill</h1>
        </div>
        <img
          src={user?.image || "https://i.pravatar.cc/100"}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800"
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
            <p className="text-gray-500 dark:text-slate-400 text-center">
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
                  className="rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm border border-gray-100 dark:border-slate-800 flex gap-4"
                >
                  <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 dark:text-slate-400 overflow-hidden shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith('/') ? `${item.image}` : item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <h2 className="font-bold text-gray-900 dark:text-white leading-tight pr-4">
                        {item.name}
                      </h2>
                      <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                    
                    {item.instructions && (
                      <p className="text-xs font-medium text-orange-500 mt-0.5 line-clamp-1">
                        {item.instructions}
                      </p>
                    )}

                    <div className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      Qty: {item.quantity} x ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-100 dark:border-slate-800">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Estimated Bill Summary
              </h2>
              <div className="space-y-3 text-sm font-medium text-gray-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge</span>
                  <span className="text-gray-900 dark:text-white">₹{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="my-3 border-t border-gray-100 dark:border-slate-800 border-dashed" />
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Estimated Total</span>
                  <span className="text-orange-500">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Note Alert */}
            <div className="flex items-start gap-3 rounded-2xl bg-gray-100 dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700">
              <Info size={20} className="text-gray-500 dark:text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400 leading-snug">
                This is an estimated running tally. The final bill will be generated by the operator at the counter.
              </p>
            </div>

            {/* Add More Items Button */}
            <button
              onClick={() => navigate("/customer/home")}
              className="mt-6 flex w-full items-center justify-center rounded-2xl border-2 border-orange-500 bg-orange-50 py-4 font-bold text-orange-500 transition hover:bg-orange-100 active:scale-[0.98]"
            >
              + Add More Items
            </button>
          </>
        )}
      </div>

    </PageLayout>
  );
}
