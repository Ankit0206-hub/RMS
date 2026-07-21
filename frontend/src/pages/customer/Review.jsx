import { useState } from "react";
import { Star, Clock, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function Review() {
  const navigate = useNavigate();
  const { cartItems } = useApp();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Assuming total is calculated from cart items for the mock
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = cartItems.length ? 30 : 0;
  const total = subtotal > 0 ? subtotal + tax + serviceCharge : 1580;

  const Rating = ({ value, onChange }) => (
    <div className="flex justify-center gap-3 my-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="transition hover:scale-110 active:scale-95"
        >
          <Star
            size={40}
            className={
              star <= value
                ? "fill-orange-400 text-orange-400"
                : "text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-10 flex flex-col items-center">
        
        {/* Welcome Header */}
        <div className="text-center mt-6 mb-8">
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            Thank you, John!
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Session Complete
          </h1>
        </div>

        {/* Stats Card */}
        <div className="w-full rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex gap-4 mb-10">
          <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-100 dark:border-slate-800">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Clock size={24} className="text-blue-500" />
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Visit Duration
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              1h 45m
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <IndianRupee size={24} className="text-green-500" />
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Total Bill
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{total}
            </p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mt-2">
            How was your experience?
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 text-center mt-2 mb-2">
            Your feedback helps us improve.
          </p>

          <Rating value={rating} onChange={setRating} />

          <div className="mt-6">
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full resize-none rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition"
            />
          </div>
        </div>
      </div>

      {/* Submit / Back Home */}
      <div className="bg-white dark:bg-slate-900 p-4 pb-6 border-t border-gray-100 dark:border-slate-800 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl">
        <button
          onClick={() => {
            // Logic to clear cart and session
            navigate("/customer/landing");
          }}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
        >
          Back to Home
        </button>
      </div>
    </PageLayout>
  );
}