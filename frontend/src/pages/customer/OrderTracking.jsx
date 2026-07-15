import { ArrowLeft, Check, ChefHat, Clock3, Utensils, Coffee, Bell, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";

export default function OrderTracking() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Order Placed",
      time: "02:30 PM",
      status: "completed",
    },
    {
      title: "Confirmed",
      time: "02:31 PM",
      status: "completed",
    },
    {
      title: "Preparing",
      time: "15 - 20 min",
      status: "active",
    },
    {
      title: "Ready to Serve",
      time: "Pending",
      status: "pending",
    },
    {
      title: "Served",
      time: "Pending",
      status: "pending",
    },
  ];

  return (
    <PageLayout className="bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Top Info row */}
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-orange-500">Order #1425</span>
          </div>
          <div className="rounded-full bg-red-50 border border-red-100 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-red-500">Table 07</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="relative">
            {steps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";
              const isPending = step.status === "pending";
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="flex gap-4 relative">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div 
                      className={`absolute left-[15px] top-[30px] bottom-[-10px] w-[2px] ${
                        isCompleted ? "bg-orange-500" : "bg-gray-100"
                      }`}
                    />
                  )}

                  {/* Icon Node */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-[3px] shadow-sm ${
                        isCompleted
                          ? "bg-orange-500 border-orange-500 text-white"
                          : isActive
                          ? "bg-white border-orange-500 text-orange-500"
                          : "bg-gray-50 border-gray-200 text-gray-300"
                      }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                      {isActive && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${isPending ? "opacity-50" : ""}`}>
                    <h3 className={`font-bold text-base ${isActive ? "text-orange-500" : "text-gray-900"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {step.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Need Help */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">Need Help?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/customer/call-waiter")}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Bell size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700">Request Waiter</span>
            </button>

            <button
              onClick={() => navigate("/customer/request-final-bill")}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition"
            >
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <ReceiptText size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700">Request Bill</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Floating CTA */}
      <div className="border-t border-gray-100 bg-white p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex gap-3">
        <button
          onClick={() => navigate("/customer/current-bill")}
          className="flex-1 flex h-14 items-center justify-center rounded-2xl bg-gray-100 font-bold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]"
        >
          View Bill
        </button>
        <button
          onClick={() => navigate("/customer/home")}
          className="flex-[2] flex h-14 items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
        >
          Add More Items
        </button>
      </div>
    </PageLayout>
  );
}
