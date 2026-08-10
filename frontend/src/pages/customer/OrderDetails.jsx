import { ArrowLeft, Clock, CheckCircle2, ChefHat, FileText, Download, Star, Utensils, ReceiptText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";

export default function OrderDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center">
        <button 
          onClick={() => navigate("/customer/orders")}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold"
        >
          Back to Orders
        </button>
      </PageLayout>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const serviceCharge = order.items.length > 0 ? 30 : 0;
  const total = subtotal + gst + serviceCharge;

  // Status mapping for the progress tracker
  const getStatusStep = () => {
    if (order.status === "Cancelled") return -1;
    const s = order.rawStatus || order.status;
    if (s === "Verification Pending" || s === "Pending") return 1;
    if (s === "Preparing" || s === "Cooked") return 2;
    if (s === "Served") return 3;
    if (s === "Completed" || s === "Delivered") return 4;
    return 4; // Default to completed if unknown but not cancelled
  };
  const step = getStatusStep();

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900/80 backdrop-blur-md px-5 py-4 shadow-sm flex items-center">
        <button onClick={() => navigate('/customer/orders')} className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-95">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white mr-8">
          Order #{order.id}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Status Tracker Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-6">Order Status</h2>
          
          {order.status === "Cancelled" ? (
            <div className="flex items-center gap-4 text-red-500 bg-red-50 p-4 rounded-2xl">
              <CheckCircle2 size={32} />
              <div>
                <h3 className="font-bold text-lg">Order Cancelled</h3>
                <p className="text-sm font-medium text-red-400">This order has been cancelled.</p>
              </div>
            </div>
          ) : (
            <div className="relative flex justify-between items-center z-10">
              {/* Connecting Line Container */}
              <div className="absolute left-5 right-5 top-5 h-1 bg-gray-100 dark:bg-slate-800 -z-10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                  style={{ width: step <= 1 ? '0%' : step === 2 ? '33.33%' : step === 3 ? '66.66%' : '100%' }}
                ></div>
              </div>

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Placed</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 2 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <ChefHat size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Preparing</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <Utensils size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${step >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Served</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step >= 4 ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${step >= 4 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>Delivered</span>
              </div>
            </div>
          )}
        </div>

        {/* Ordered Items List */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Ordered Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[20px] p-3 shadow-sm border border-gray-100 dark:border-slate-800 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex-shrink-0 overflow-hidden shadow-sm">
                  {item.image ? (
                    <img 
                      src={item.image.startsWith('/') ? `${item.image}` : item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">🍽️</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Qty: {item.quantity}</p>
                    <span className="font-bold text-gray-900 dark:text-white">₹{Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Section */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Order Summary</h2>
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-slate-800 relative">
            
            {/* Scalloped edge effect at the top */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-2 -mt-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-50 dark:bg-slate-800/50 rounded-full"></div>
              ))}
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Sub Total</span>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-400 dark:text-slate-500 mt-0.5">Exclusive of charges & taxes</span>
                </div>
                <span className="text-2xl font-black text-orange-500">₹{Number(subtotal).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 justify-center text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              <FileText size={14} />
              <span>Paid via Cash/Card</span>
            </div>
          </div>
        </div>
        
        {/* Extra spacing at bottom for the floating button */}
        <div className="h-36 md:h-40"></div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-gray-50 dark:via-slate-950 to-transparent flex flex-col gap-3 pt-12 pointer-events-none">
        <div className={`pointer-events-auto flex ${step >= 4 ? 'flex-row flex-wrap' : 'flex-col'} gap-2 sm:gap-3 justify-center`}>
          {step >= 4 && (
            <button
              onClick={() => navigate("/customer/review")}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-3 sm:py-4 font-bold shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform text-[13px] sm:text-base"
            >
              <Star size={16} className="fill-white" />
              Rate Order
            </button>
          )}
          {step >= 4 && (
            <button
              onClick={() => navigate("/customer/request-final-bill")}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-indigo-500 text-white rounded-2xl py-3 sm:py-4 font-bold shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-transform text-[13px] sm:text-base"
            >
              <ReceiptText size={16} />
              Request Bill
            </button>
          )}
          <button
            onClick={() => navigate("/customer/invoice", { state: { order } })}
            className={`${step >= 4 ? 'w-full' : 'w-full'} flex items-center justify-center gap-2 rounded-2xl py-3 sm:py-4 font-bold active:scale-[0.98] transition-transform ${step >= 4 ? "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 shadow-sm" : "bg-gray-900 dark:bg-slate-800 text-white shadow-xl shadow-gray-200 dark:shadow-slate-900/50"} text-[13px] sm:text-base`}
          >
            <Download size={16} />
            Download Invoice
          </button>
        </div>
      </div>

    </PageLayout>
  );
}