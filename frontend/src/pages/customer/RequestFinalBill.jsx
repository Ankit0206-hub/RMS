import { ArrowLeft, ReceiptText, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";
import toast from "react-hot-toast";

export default function RequestFinalBill() {
  const navigate = useNavigate();
  const { customerSession } = useApp();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    if (!customerSession?.sessionId) {
      toast.error("No active session found.");
      return;
    }
    
    setLoading(true);
    try {
      await customerApi.requestBill(customerSession.sessionId);
      setRequested(true);
      toast.success("Bill requested successfully.");
      navigate("/customer/review");
    } catch (error) {
      console.error(error);
      toast.error("Failed to request bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Request Bill</h1>
        </div>
      </div>

      <div className="flex h-[calc(100%-70px)] flex-col items-center justify-center px-6 pb-20">
        {/* Receipt Icon */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-green-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-100/50">
              <ReceiptText size={40} strokeWidth={2} className="text-green-600" />
            </div>
            
            {/* Accents */}
            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-yellow-400"></div>
            <div className="absolute bottom-6 left-2 h-3 w-3 rounded-full bg-green-400"></div>
            <div className="absolute top-1/2 -right-2 h-1.5 w-1.5 rounded-full bg-orange-400"></div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3 leading-snug">
          Request Final Bill
        </h2>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 text-center mb-10 max-w-[280px] leading-relaxed">
          Once you request, our operator will generate the final bill for your table.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={requested ? () => navigate("/customer/home") : handleRequest}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Requesting..." : requested ? "Back to Home" : "Request Bill"}
          </button>

          {!requested && (
            <button
              onClick={() => navigate('/customer/home')}
              className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-gray-200 dark:border-slate-700 font-bold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 active:scale-[0.98]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
