import { ArrowLeft, ShoppingBasket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";

export default function AddMoreItems() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Add More Items</h1>
        </div>
      </div>

      <div className="flex h-[calc(100%-70px)] flex-col items-center justify-center px-6 pb-20">
        {/* Basket Icon */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-orange-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 shadow-lg shadow-orange-100/50">
              <ShoppingBasket size={48} strokeWidth={1.5} className="text-orange-500" />
            </div>
            
            {/* Sparkle accents */}
            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-yellow-400"></div>
            <div className="absolute bottom-6 left-2 h-3 w-3 rounded-full bg-orange-400"></div>
            <div className="absolute top-1/2 -right-2 h-1.5 w-1.5 rounded-full bg-green-400"></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 max-w-[250px] leading-snug">
          Would you like to add more items to your order?
        </h2>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/customer/home")}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            Yes, Continue Ordering
          </button>

          <button
            onClick={() => navigate("/customer/order-tracking")}
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-orange-500 font-bold text-orange-500 transition hover:bg-orange-50 active:scale-[0.98]"
          >
            No, I'm Done for Now
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
