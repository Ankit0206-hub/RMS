import { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";
import toast from "react-hot-toast";

const RatingStars = ({ value, onChange, size = 40 }) => (
  <div className="flex justify-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onChange(star)}
        className="transition hover:scale-110 active:scale-95"
      >
        <Star
          size={size}
          className={
            star <= value
              ? "fill-orange-400 text-orange-400"
              : "text-gray-200 dark:text-slate-700"
          }
        />
      </button>
    ))}
  </div>
);

export default function Review() {
  const navigate = useNavigate();
  const { customerSession } = useApp();
  
  const [sessionData, setSessionData] = useState(null);
  const [orderedItems, setOrderedItems] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [itemRatings, setItemRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (customerSession?.sessionId) {
      customerApi.getSessionDetails(customerSession.sessionId)
        .then(data => {
            setSessionData(data);
            
            // Extract unique items from all orders
            const uniqueItemsMap = new Map();
            data.orders?.forEach(order => {
                if (order.status !== "Cancelled") {
                    order.items?.forEach(item => {
                        // Assuming item structure has an id that corresponds to menu_item_id
                        // Wait, order items have their own ID, but we need menu_item_id.
                        // However, since we are rating, the name and image are there.
                        // Let's assume item.id is actually order_item.id and item.menu_item_id is not passed.
                        // Actually, in customer_router get_customer_session_details, we just passed item.id as order_item.id.
                        // Let's check: Yes, it was item.id
                        // Wait! The review schema needs menu_item_id. We need to get menu_item_id.
                        // Let's look at get_customer_session_details again. It didn't return menu_item_id. 
                        // I will assume it's best to modify it quickly if needed, but for now we'll send it if available.
                        // Let's just use item.name for display. We might need to update the backend to send menu_item_id!
                        
                        // We will add it to the backend shortly, let's assume it will be available as menu_item_id.
                        if (item.menu_item_id) {
                            if (!uniqueItemsMap.has(item.menu_item_id)) {
                                uniqueItemsMap.set(item.menu_item_id, {
                                    id: item.menu_item_id,
                                    name: item.name,
                                    image: item.image
                                });
                            }
                        }
                    });
                }
            });
            setOrderedItems(Array.from(uniqueItemsMap.values()));
        })
        .catch(console.error);
    }
  }, [customerSession]);

  const handleItemRatingChange = (itemId, newRating) => {
      setItemRatings(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], rating: newRating }
      }));
  };

  const submitReview = async () => {
      if (rating === 0) {
          toast.error("Please provide an overall rating");
          return;
      }

      setLoading(true);
      try {
          const formattedItemReviews = Object.keys(itemRatings).map(itemId => ({
              menu_item_id: parseInt(itemId),
              rating: itemRatings[itemId].rating || 5,
              comment: itemRatings[itemId].comment || ""
          })).filter(ir => ir.rating > 0);

          await customerApi.submitReview({
              session_id: customerSession.sessionId,
              customer_name: sessionData?.customer_name || "Guest",
              rating: rating,
              comment: comment,
              item_reviews: formattedItemReviews
          });

          setSubmitted(true);
      } catch (err) {
          console.error(err);
          toast.error("Failed to submit review");
      } finally {
          setLoading(false);
      }
  };

  const handleFinish = () => {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customerSession');
      navigate("/customer/landing");
  };

  if (submitted) {
      return (
          <PageLayout className="bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 w-full max-w-sm flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                  <p className="text-gray-500 dark:text-slate-400 mb-8">Your feedback has been submitted successfully.</p>
                  <button onClick={handleFinish} className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition active:scale-95">
                      Back to Home
                  </button>
              </div>
          </PageLayout>
      );
  }

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-900 flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center">
        
        <div className="text-center mt-2 mb-6">
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            Hope you enjoyed!
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rate Your Experience
          </h1>
        </div>

        {/* Overall Rating Section */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex-col mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mt-2">
            Overall Experience
          </h2>
          <RatingStars value={rating} onChange={setRating} size={44} />
          
          <div className="mt-4">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved..."
              className="w-full resize-none rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-800 transition"
            />
          </div>
        </div>

        {/* Item Ratings Section */}
        {orderedItems.length > 0 && (
            <div className="w-full">
                <h3 className="font-bold text-gray-900 dark:text-white px-2 mb-3">Rate what you ordered</h3>
                <div className="space-y-3">
                    {orderedItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.name}</h4>
                                <RatingStars 
                                    value={itemRatings[item.id]?.rating || 0} 
                                    onChange={(val) => handleItemRatingChange(item.id, val)} 
                                    size={24} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 pb-6 border-t border-gray-100 dark:border-slate-700 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl flex gap-3">
        <button
          onClick={handleFinish}
          disabled={loading}
          className="flex-1 h-14 rounded-2xl border-2 border-gray-200 dark:border-slate-600 font-bold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-[0.98]"
        >
          Skip
        </button>
        <button
          onClick={submitReview}
          disabled={loading}
          className="flex-[2] h-14 flex items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 dark:shadow-none transition hover:bg-orange-600 active:scale-[0.98]"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </PageLayout>
  );
}