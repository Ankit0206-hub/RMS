import { ArrowLeft, Clock, CheckCircle2, ChefHat, FileText, Download, Star, Utensils, ReceiptText, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWsUrl } from "../../services/api";
import customerApi from "../../services/customerApi";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";

import PageLayout from "../../components/customer/layout/PageLayout";
import ThermalReceipt from "../../components/ThermalReceipt";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { customerSession } = useApp();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);
  const [sessionData, setSessionData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (!order || !customerSession?.sessionId) return;
    
    const fetchOrder = async () => {
        try {
            const data = await customerApi.getSessionDetails(customerSession.sessionId);
            setSessionData(data);
            const updatedOrder = data.orders?.find(o => o.id === order.id);
            if (updatedOrder) {
                // Keep the items from location state if the API doesn't return full items
                setOrder({
                    ...updatedOrder,
                    items: updatedOrder.items || order.items,
                    rawStatus: updatedOrder.status
                });
            }
        } catch (e) {
            console.error(e);
        }
    };
    
    fetchOrder();

    const handleOrderUpdate = () => fetchOrder();
    window.addEventListener('orderUpdatedLocally', handleOrderUpdate);
    
    return () => {
        window.removeEventListener('orderUpdatedLocally', handleOrderUpdate);
    };
  }, [customerSession]);

  if (!order) {
    return (
      <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-500 dark:text-slate-400 mb-6">Order details not found.</p>
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

  const hasRequestedBill = localStorage.getItem("billRequested_" + customerSession?.sessionId) === "true";
  const canRequestBill = !sessionData?.bill_data && !hasRequestedBill && sessionData?.orders?.every(o => ["Served", "Completed", "Delivered", "Cancelled", "Paid"].includes(o.status));


  const getStatusStep = () => {
    if (order.status === "Cancelled") return -1;
    const s = order.rawStatus || order.status;
    if (s === "Verification Pending" || s === "Placed" || s === "Pending") return 1;
    if (s === "Confirmed") return 2;
    if (s === "Preparing") return 3;
    if (s === "Cooked" || s === "Ready to Serve" || s === "Ready") return 4;
    if (s === "Served" || s === "Completed" || s === "Delivered") return 5;
    return 1;
  };

  const step = getStatusStep();

  const subtotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
  const total = subtotal;

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 transition active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white mr-8">
          Order #{order.id || order.order_number}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Status Tracker Card */}
        {step >= 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide text-xs">Order Status</h3>
            
            <div className="relative flex justify-between items-center z-10 w-full mb-2">
              
              {/* Connecting Line Container */}
              <div className="absolute left-5 right-5 top-5 h-1 bg-gray-100 dark:bg-slate-800 -z-10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                  style={{ width: step <= 1 ? '0%' : step === 2 ? '25%' : step === 3 ? '50%' : step === 4 ? '75%' : '100%' }}
                ></div>
              </div>

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 relative bg-white dark:bg-slate-900 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <Clock size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Placed</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 relative bg-white dark:bg-slate-900 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 2 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <CheckCircle2 size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Confirmed</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 relative bg-white dark:bg-slate-900 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <ChefHat size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold ${step >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Preparing</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-2 relative bg-white dark:bg-slate-900 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 4 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <Bell size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold ${step >= 4 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Ready</span>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center gap-2 relative bg-white dark:bg-slate-900 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 5 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <Utensils size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold ${step >= 5 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Served</span>
              </div>
            </div>
            
            <div className="mt-8 text-center bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3">
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {step === 1 && "Waiting for restaurant to confirm"}
                {step === 2 && "Kitchen is reviewing your order"}
                {step === 3 && "Chefs are preparing your meal"}
                {step === 4 && "Order is ready and will be brought to your table"}
                {step >= 5 && "Enjoy your meal!"}
              </span>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide text-xs">Order Summary</h3>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                  <div className="flex gap-2 items-center mt-0.5">
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Qty: {item.quantity}</span>
                    <span className="text-gray-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">₹{parseFloat(item.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 border-dashed space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-slate-400">
              <span>Item Total</span>
              <span className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-800">
              <span>Grand Total</span>
              <span className="text-orange-500 font-black">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 px-1">Need Help?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/customer/call-waiter")}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] transition"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Bell size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Request Waiter</span>
            </button>

            {canRequestBill && (
              <button
                onClick={() => navigate("/customer/request-final-bill")}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] transition"
              >
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <ReceiptText size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Request Bill</span>
              </button>
            )}

            {!sessionData?.bill_data && hasRequestedBill && sessionData?.orders?.every(o => ["Served", "Completed", "Delivered", "Cancelled", "Paid"].includes(o.status)) && (
              <button
                disabled
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-100 dark:bg-slate-800 p-4 shadow-sm border border-gray-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400">
                  <ReceiptText size={20} />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">Bill Requested</span>
              </button>
            )}

            {!sessionData?.bill_data && sessionData?.orders?.some(o => !["Served", "Completed", "Delivered", "Cancelled", "Paid"].includes(o.status)) && (
              <button
                disabled
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-100 dark:bg-slate-800 p-4 shadow-sm border border-gray-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400">
                  <ReceiptText size={20} />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">Awaiting Service</span>
              </button>
            )}
          </div>
        </div>

        {sessionData?.bill_data && (
            <button 
              onClick={() => setIsReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 text-orange-500 font-bold active:scale-[0.98] transition"
            >
              <Download size={20} />
              Download Invoice
            </button>
        )}
      </div>

      <ThermalReceipt 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        isA4Format={true}
        data={{
            table: customerSession?.tableId || "Unknown",
            bill_number: sessionData?.bill_data?.bill_number || "N/A",
            date: sessionData?.bill_data?.generated_at ? new Date(sessionData.bill_data.generated_at).toLocaleString() : new Date().toLocaleString(),
            subtotal: sessionData?.bill_data?.subtotal || 0,
            cgst: (sessionData?.bill_data?.total_tax || 0) / 2,
            sgst: (sessionData?.bill_data?.total_tax || 0) / 2,
            service_charge: sessionData?.bill_data?.service_charge || 0,
            grand_total: sessionData?.bill_data?.grand_total || 0,
            customer_name: sessionData?.customer_name,
            discount_percentage: sessionData?.bill_data?.discount_percentage,
            discount_amount: sessionData?.bill_data?.discount_amount
        }}
        items={sessionData?.bill_data?.items || []}
      />
    </PageLayout>
  );
}
