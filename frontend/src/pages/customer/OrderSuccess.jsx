import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { cartItems } = useApp();
  
  // Total items quantity
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <PageLayout className="bg-white">
      <div className="flex h-full flex-col items-center px-6 pt-20 pb-8">

        {/* Success Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-200">
              <Check size={40} strokeWidth={3} className="text-white" />
            </div>
            
            {/* Confetti / Sparkle accents could go here */}
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-yellow-400"></div>
            <div className="absolute bottom-4 left-0 h-3 w-3 rounded-full bg-orange-400"></div>
            <div className="absolute top-1/2 -right-4 h-1.5 w-1.5 rounded-full bg-green-400"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Order Placed<br />Successfully
        </h1>

        {/* Order Details Card */}
        <div className="w-full rounded-3xl bg-gray-50 border border-gray-100 p-6 space-y-5">
          <div className="flex justify-between items-center pb-5 border-b border-gray-200 border-dashed">
            <span className="text-sm font-semibold text-gray-500">Order</span>
            <span className="text-base font-bold text-gray-900">#1425</span>
          </div>
          
          <div className="flex justify-between items-center pb-5 border-b border-gray-200 border-dashed">
            <span className="text-sm font-semibold text-gray-500">Table</span>
            <span className="text-base font-bold text-gray-900">07</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-500">Items</span>
            <span className="text-base font-bold text-gray-900">{totalItems || 3} Items</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/customer/order-tracking")}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            Track Order
          </button>

          <button
            onClick={() => navigate("/customer/home")}
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-orange-500 font-bold text-orange-500 transition hover:bg-orange-50 active:scale-[0.98]"
          >
            Continue Ordering
          </button>
        </div>

      </div>
    </PageLayout>
  );
}