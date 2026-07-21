import { useState } from "react";
import {
  ArrowLeft,
  GlassWater,
  UtensilsCrossed,
  Receipt,
  MessageSquareMore,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import customerApi from "../../services/customerApi";
import toast from "react-hot-toast";

export default function CallWaiter() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      id: "water",
      title: "Need Water",
      icon: <GlassWater size={28} className="text-blue-500" />,
    },
    {
      id: "cutlery",
      title: "Need Cutlery",
      icon: <UtensilsCrossed size={28} className="text-orange-500" />,
    },
    {
      id: "tissue",
      title: "Need Tissue",
      icon: <Receipt size={28} className="text-gray-500 dark:text-slate-400" />,
    },
    {
      id: "other",
      title: "Other Help",
      icon: <MessageSquareMore size={28} className="text-purple-500" />,
    },
  ];

  const handleSendRequest = async () => {
    const sessionStr = localStorage.getItem('customerSession');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    
    if (!session || !session.sessionId) {
        toast.error("Session not found. Please scan QR code again.");
        return;
    }

    const serviceTitle = services.find(s => s.id === selected)?.title || "Call Waiter";

    try {
        setIsSubmitting(true);
        await customerApi.callWaiter(session.sessionId, serviceTitle, note);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate(-1);
        }, 2500);
    } catch (err) {
        console.error(err);
        toast.error("Failed to send request.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Request Waiter</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          How can we help you?
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 mb-8 font-medium">
          Select an option below to notify the waiter
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelected(service.id)}
              className={`rounded-3xl border-2 p-6 flex flex-col items-center justify-center transition-all ${
                selected === service.id
                  ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-100"
                  : "border-transparent bg-white dark:bg-slate-900 shadow-sm"
              }`}
            >
              <div className="mb-3">{service.icon}</div>
              <span className={`text-sm font-bold ${selected === service.id ? "text-orange-600" : "text-gray-700 dark:text-slate-300"}`}>
                {service.title}
              </span>
            </button>
          ))}
        </div>

        {/* Additional Note */}
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 px-1">
            Additional Note (Optional)
          </h3>
          <textarea
            rows={3}
            placeholder="Type your request here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-none rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500 shadow-sm transition"
          />
        </div>
      </div>

      {/* Bottom Button */}
      <div className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl z-10">
        <button
          disabled={!selected || isSubmitting}
          onClick={handleSendRequest}
          className={`h-14 w-full rounded-2xl font-bold text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center ${
            selected && !isSubmitting
              ? "bg-orange-500 shadow-orange-200 hover:bg-orange-600"
              : "bg-orange-300 shadow-none cursor-not-allowed"
          }`}
        >
          {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Send Request"}
        </button>
      </div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-8 text-center shadow-2xl animate-[fadeIn_.2s_ease-out]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6">
              <CheckCircle2 size={44} strokeWidth={2.5} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Waiter Notified
            </h2>
            <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400 mb-6">
              Your request has been sent successfully.<br />
              A waiter will be with you shortly.
            </p>
            <div className="rounded-2xl bg-gray-50 dark:bg-slate-800/50 py-3.5 text-sm font-bold text-gray-700 dark:text-slate-300">
              Thank you for your patience
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}