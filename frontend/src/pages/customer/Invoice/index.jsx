import { ArrowLeft, Receipt } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import PageLayout from "../../../customer_components/layout/PageLayout";
import Button from "../../../customer_components/ui/Button";

export default function Invoice() {
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

        <div className="bg-white shadow-sm px-5 py-4 flex items-center">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Invoice
          </h1>

        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Invoice Card */}

          <div className="bg-white rounded-3xl shadow-sm p-6">

            <div className="flex flex-col items-center">

              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">

                <Receipt
                  size={30}
                  className="text-orange-500"
                />

              </div>

              <h2 className="mt-4 text-2xl font-bold">
                TastyBites
              </h2>

              <p className="text-gray-500 text-sm">
                Food Invoice
              </p>

            </div>

            {/* Invoice Info */}

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">

              <div>

                <p className="text-gray-400">
                  Invoice No.
                </p>

                <p className="font-semibold">
                  INV-{order.id}
                </p>

              </div>

              <div className="text-right">

                <p className="text-gray-400">
                  Date
                </p>

                <p className="font-semibold">
                  {order.date}
                </p>

              </div>

            </div>

            {/* Ordered Items */}

            <div className="mt-8">

              <h3 className="font-semibold text-lg mb-4">
                Ordered Items
              </h3>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-3 border-b"
                >
                  <div>
                    <h4 className="font-medium">
                      {item.name}
                    </h4>

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

            <div className="mt-8 border-t pt-6">

              <h3 className="mb-4 text-lg font-semibold">
                Bill Summary
              </h3>

              <div className="space-y-3">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    GST (5%)
                  </span>

                  <span>
                    ₹{gst}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Service Charge
                  </span>

                  <span>
                    ₹{serviceCharge}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Payment Method
                  </span>

                  <span className="capitalize">
                    {order.paymentMethod}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-xl font-bold">

                  <span>
                    Total
                  </span>

                  <span className="text-orange-500">
                    ₹{total}
                  </span>

                </div>

              </div>

            </div>

            {/* Thank You */}

            <div className="mt-8 rounded-2xl bg-orange-50 p-4 text-center">

              <h3 className="font-semibold text-orange-600">
                Thank You!
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Thank you for dining with TastyBites.
                We hope to serve you again soon!
              </p>

            </div>

          </div>

        </div>

        {/* Bottom Buttons */}

        <div className="border-t bg-white p-5 space-y-3">

          <Button
            onClick={() => window.print()}
          >
            Download Invoice
          </Button>

          <button
            onClick={() => navigate("/customer/review")}
            className="w-full rounded-xl border border-orange-500 py-3 font-medium text-orange-500 transition hover:bg-orange-50"
          >
            Review
          </button>

        </div>

      </div>

    </PageLayout>
  );
}