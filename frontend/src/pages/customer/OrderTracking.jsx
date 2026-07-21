import { ArrowLeft, Check, ChefHat, Clock3, Utensils, Coffee, Bell, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useEffect, useState } from "react";
import customerApi from "../../services/customerApi";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { customerSession } = useApp();
  const [sessionData, setSessionData] = useState(null);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  useEffect(() => {
    if (customerSession?.sessionId) {
      const fetchDetails = () => {
        customerApi.getSessionDetails(customerSession.sessionId)
          .then(data => setSessionData(data))
          .catch(console.error);
      };
      
      fetchDetails();

      // Connect WebSocket for real-time order tracking
      const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/customer?session_id=${customerSession.sessionId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => console.log("Customer WebSocket connected");
      ws.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              if (data.event === "order.updated" || data.event === "order.created") {
                  fetchDetails(); // Re-fetch to get latest status and updated times
              }
          } catch (err) {
              console.error("WS parse error", err);
          }
      };
      
      return () => ws.close();
    }
  }, [customerSession]);

  // Determine overall status based on latest order
  let currentStatus = "Verification Pending";
  if (sessionData?.orders?.length > 0) {
      const latestOrder = sessionData.orders[sessionData.orders.length - 1];
      currentStatus = latestOrder.status;
  }

  const getStepStatus = (stepName) => {
      const statusMap = {
          "Order Placed": ["Verification Pending", "Preparing", "Cooked", "Served", "Completed"],
          "Confirmed": ["Preparing", "Cooked", "Served", "Completed"],
          "Preparing": ["Preparing", "Cooked", "Served", "Completed"],
          "Ready to Serve": ["Cooked", "Served", "Completed"],
          "Served": ["Served", "Completed"]
      };

      const activeMap = {
          "Order Placed": "Verification Pending",
          "Confirmed": "",
          "Preparing": "Preparing",
          "Ready to Serve": "Cooked",
          "Served": "Served"
      };

      if (activeMap[stepName] === currentStatus) return "active";
      if (statusMap[stepName].includes(currentStatus)) return "completed";
      return "pending";
  };

  const steps = [
    {
      title: "Order Placed",
      time: "Pending",
      status: getStepStatus("Order Placed"),
    },
    {
      title: "Confirmed",
      time: "Pending",
      status: getStepStatus("Confirmed"),
    },
    {
      title: "Preparing",
      time: "Pending",
      status: getStepStatus("Preparing"),
    },
    {
      title: "Ready to Serve",
      time: "Pending",
      status: getStepStatus("Ready to Serve"),
    },
    {
      title: "Served",
      time: "Pending",
      status: getStepStatus("Served"),
    },
  ];

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Track Order</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Top Info row */}
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-orange-500">
                Order #{sessionData?.orders?.length > 0 ? sessionData.orders[sessionData.orders.length - 1].id : "..."}
            </span>
          </div>
          <div className="rounded-full bg-red-50 border border-red-100 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-red-500">
                {customerSession?.tableId ? (customerSession.tableId.toLowerCase().includes('table') ? customerSession.tableId : `Table ${customerSession.tableId}`) : "No Table"}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
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
                        isCompleted ? "bg-orange-500" : "bg-gray-100 dark:bg-slate-800"
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
                          ? "bg-white dark:bg-slate-900 border-orange-500 text-orange-500"
                          : "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-300"
                      }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                      {isActive && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${isPending ? "opacity-50" : ""}`}>
                    <h3 className={`font-bold text-base ${isActive ? "text-orange-500" : "text-gray-900 dark:text-white"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-0.5">
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
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1">Need Help?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsWaiterModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] transition"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Bell size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Request Waiter</span>
            </button>

            <button
              onClick={() => navigate("/customer/request-final-bill")}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] transition"
            >
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <ReceiptText size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Request Bill</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Floating CTA */}
      <div className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex gap-3">
        <button
          onClick={() => navigate("/customer/current-bill")}
          className="flex-1 flex h-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 font-bold text-gray-700 dark:text-slate-300 transition hover:bg-gray-200 dark:bg-slate-700 active:scale-[0.98]"
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

      {/* Waiter Modal */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 pb-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Request Assistance</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['water', 'tissue', 'waiter'].map(type => (
                  <button
                    key={type}
                    onClick={async () => {
                      if (!customerSession?.sessionId) return;
                      try {
                        await customerApi.callWaiter(customerSession.sessionId, type);
                        toast.success(`Requested ${type}`);
                        setIsWaiterModalOpen(false);
                      } catch (e) {
                        toast.error('Failed to send request');
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 dark:bg-slate-800/50 p-4 border border-gray-100 dark:border-slate-800 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition"
                  >
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300 capitalize">{type}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsWaiterModalOpen(false)}
                className="w-full h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 font-bold text-gray-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

