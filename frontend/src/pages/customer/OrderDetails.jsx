import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import Button from "../../components/customer/ui/Button";

export default function OrderDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="flex h-full items-center justify-center">
          <Button onClick={() => navigate("/customer/orders")}>
            Back to Orders
          </Button>
        </div>
      </PageLayout>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gst = Math.round(subtotal * 0.05);
  const serviceCharge = 30;
  const total = subtotal + gst + serviceCharge;

  return (
    <PageLayout className="bg-gray-50">
      <div className="flex h-full flex-col">
        {/* Header */}

        <div className="flex items-center bg-white px-5 py-4 shadow-sm">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Order Details
          </h1>
        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Order Info */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  #{order.id}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {order.date}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Ordered Items */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Ordered Items
            </h2>

            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-3 last:border-none"
              >
                <div>
                  <h3 className="font-medium">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <span className="font-semibold">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Bill Summary */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Bill Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  GST (5%)
                </span>

                <span>₹{gst}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Service Charge
                </span>

                <span>₹{serviceCharge}</span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-orange-500">
                  ₹{total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Button */}

        <div className="border-t bg-white p-5">
          <Button
            onClick={() =>
              navigate("/customer/invoice", {
                state: { order },
              })
            }
          >
            Download Invoice
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}