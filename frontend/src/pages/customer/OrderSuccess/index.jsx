import { CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../customer_components/ui/Button";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-10">

      {/* Success Icon */}
      <div className="mt-10">
        <div className="h-28 w-28 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2
            size={70}
            className="text-green-600"
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="mt-8 text-3xl font-bold text-center">
        Order Placed Successfully!
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-center text-gray-500 leading-6 max-w-sm">
        Your order has been placed successfully and is now being prepared.
      </p>

      {/* Order Details */}
      <div className="mt-10 w-full space-y-4">

        {/* Order ID */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">

          <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <ReceiptText className="text-orange-500" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <h3 className="font-semibold text-lg">
              #ORD1256
            </h3>
          </div>

        </div>

        {/* Estimated Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">

          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Clock3 className="text-blue-500" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Estimated Time
            </p>

            <h3 className="font-semibold text-lg">
              18 - 20 min
            </h3>
          </div>

        </div>

      </div>

      {/* Buttons */}
      <div className="mt-auto w-full space-y-3">

        <Button
          onClick={() => navigate("/customer/order-tracking")}
        >
          Track Order
        </Button>

        <button
          onClick={() => navigate("/customer/home")}
          className="h-12 w-full rounded-xl border-2 border-orange-500 text-orange-500 font-semibold transition hover:bg-orange-50"
        >
          Go to Home
        </button>

      </div>

    </div>
  );
}