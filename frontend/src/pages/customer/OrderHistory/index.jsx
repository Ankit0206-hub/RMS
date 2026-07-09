import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNav from "../../../customer_components/navigation/BottomNav";
import PageLayout from "../../../customer_components/layout/PageLayout";
import { useApp } from "../../../context/AppContext";

export default function OrderHistory() {
  const navigate = useNavigate();

  const { orders } = useApp();

  const [activeTab, setActiveTab] = useState("All");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All") return true;
    return order.status === activeTab;
  });

  return (
    <PageLayout className="bg-gray-50">

      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="flex items-center bg-white px-5 py-4 shadow-sm">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Order History
          </h1>

        </div>

        {/* Tabs */}

        <div className="bg-white px-5 pt-4">

          <div className="flex gap-6">

            {["All", "Delivered", "Cancelled"].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

        </div>

        {/* Orders */}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {filteredOrders.length === 0 ? (

            <div className="text-center mt-20">

              <h2 className="text-lg font-semibold">
                No Orders Found
              </h2>

              <p className="text-gray-500 mt-2">
                Your placed orders will appear here.
              </p>

            </div>

          ) : (

            filteredOrders.map((order) => (

              <div
                key={order.id}
                onClick={() =>
                  navigate("/order-details", {
                    state: { order },
                  })
                }
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-semibold">
                      #{order.id}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {order.date}
                    </p>

                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {order.status}
                  </span>

                </div>

                <div className="mt-3 space-y-1">

                  {order.items.slice(0, 2).map((item) => (

                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <span>
                        ₹{item.price * item.quantity}
                      </span>

                    </div>

                  ))}

                  {order.items.length > 2 && (

                    <p className="text-xs text-gray-500">
                      +{order.items.length - 2} more items
                    </p>

                  )}

                </div>

                <div className="mt-4 flex justify-between items-center border-t pt-3">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="font-bold text-orange-500">
                    ₹{order.total}
                  </span>

                </div>

              </div>

            ))

          )}

        </div>

        <BottomNav active="orders" />

      </div>

    </PageLayout>
  );
}