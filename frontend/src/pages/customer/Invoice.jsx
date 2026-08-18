import React, { useState } from 'react';
import { ArrowLeft, ReceiptText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import ThermalReceipt from "../../components/ThermalReceipt";

export default function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, customerSession } = useApp();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // For UI mockup purposes, fallback to cartItems if no order is passed
  const orderItems = location.state?.order?.items || cartItems;
  const orderId = location.state?.order?.id || "1425";
  const orderDate = location.state?.order?.date || "12 May, 2024";

  if (!orderItems || orderItems.length === 0) {
    return (
      <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500 dark:text-slate-400 mb-6">No active invoice found.</p>
          <button
            onClick={() => navigate("/customer/home")}
            className="rounded-2xl bg-orange-500 px-8 py-3 font-bold text-white shadow-lg"
          >
            Go Home
          </button>
        </div>
      </PageLayout>
    );
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = 30;
  // Apply any mock discount if needed
  const discount = 0; 
  const total = Number(subtotal + tax + serviceCharge - discount).toFixed(2);
  const formattedSubtotal = Number(subtotal).toFixed(2);
  const formattedTax = Number(tax).toFixed(2);
  const formattedServiceCharge = Number(serviceCharge).toFixed(2);
  const formattedDiscount = Number(discount).toFixed(2);

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Invoice Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          
          <div className="flex flex-col items-center pb-6 border-b border-gray-100 dark:border-slate-800 border-dashed">
            <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <ReceiptText size={28} strokeWidth={2} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DineOps</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Food Invoice</p>
          </div>

          {/* Invoice Info */}
          <div className="py-6 grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-slate-800 border-dashed">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Invoice No.</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">INV-{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Date</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{orderDate}</p>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="py-6 border-b border-gray-100 dark:border-slate-800 border-dashed">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Ordered Items</h3>
            <div className="space-y-4">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h4>
                    {item.instructions && (
                      <p className="text-xs font-medium text-orange-500 mt-0.5 line-clamp-1">{item.instructions}</p>
                    )}
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    ₹{Number(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Bill Summary</h3>
            <div className="space-y-3 text-sm font-medium text-gray-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 dark:text-white">₹{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="text-gray-900 dark:text-white">₹{formattedTax}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span className="text-gray-900 dark:text-white">₹{formattedServiceCharge}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-₹{formattedDiscount}</span>
                </div>
              )}
              
              <div className="my-4 border-t border-gray-100 dark:border-slate-800 border-dashed" />
              
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-orange-500 text-xl">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Thank You */}
          <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-center border border-orange-100">
            <h3 className="font-bold text-orange-600">Thank You!</h3>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-slate-400 leading-relaxed">
              Thank you for dining with DineOps. We hope to serve you again soon!
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Sticky Button */}
      <div className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10">
        <button
          onClick={() => setIsReceiptOpen(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
        >
          <ReceiptText size={20} />
          <span>Download Invoice</span>
        </button>
      </div>

      <ThermalReceipt 
          isOpen={isReceiptOpen} 
          onClose={() => setIsReceiptOpen(false)} 
          data={{
              bill_number: `INV-${orderId}`,
              table: customerSession?.tableId || 'Walk-in',
              subtotal: Number(subtotal),
              service_charge: Number(serviceCharge),
              cgst: Number(tax) / 2,
              sgst: Number(tax) / 2,
              grand_total: Number(total)
          }}
          items={orderItems.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price
          }))}
      />

    </PageLayout>
  );
}