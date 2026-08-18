import { useState } from "react";
import {
  ArrowLeft,
  Circle,
  CheckCircle2,
  Wallet,
  CreditCard,
  Landmark,
  Banknote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

import Button from "../../components/customer/ui/Button";

export default function Payment() {
  const navigate = useNavigate();
  const { placeOrder } = useApp();
  const [selected, setSelected] = useState("cash");

  const methods = [
    {
      id: "cash",
      title: "Cash",
      subtitle: "Pay at restaurant",
      icon: <Banknote size={24} className="text-green-600" />,
    },
    {
      id: "upi",
      title: "UPI",
      subtitle: "Google Pay, PhonePe, Paytm",
      icon: <Wallet size={24} className="text-blue-500" />,
    },
    {
      id: "card",
      title: "Card",
      subtitle: "Credit / Debit Card",
      icon: <CreditCard size={24} className="text-purple-500" />,
    },
    {
      id: "netbanking",
      title: "Net Banking",
      subtitle: "All major banks",
      icon: <Landmark size={24} className="text-orange-500" />,
    },
    {
      id: "wallet",
      title: "Wallet",
      subtitle: "Paytm, Amazon Pay etc.",
      icon: <Wallet size={24} className="text-pink-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800/50 flex flex-col">

      {/* Header */}

      <div className="bg-white dark:bg-slate-900 shadow-sm px-5 py-4 flex items-center">

        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>

        <h1 className="flex-1 text-center text-lg font-semibold mr-6">
          Select Payment Method
        </h1>

      </div>

      {/* Payment Options */}

      <div className="flex-1 px-5 py-5 space-y-4">

        {methods.map((method) => (

          <button
            key={method.id}
            onClick={() => setSelected(method.id)}
            className={`w-full rounded-2xl border p-4 flex items-center justify-between transition ${selected === method.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              }`}
          >

            <div className="flex items-center gap-4">

              {method.icon}

              <div className="text-left">

                <h3 className="font-semibold">
                  {method.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {method.subtitle}
                </p>

              </div>

            </div>

            {selected === method.id ? (
              <CheckCircle2
                className="text-orange-500"
                size={22}
              />
            ) : (
              <Circle
                className="text-gray-300"
                size={22}
              />
            )}

          </button>

        ))}
      </div>

      {/* Bottom Button */}

      <div className="border-t bg-white dark:bg-slate-900 px-5 py-4">

        <Button
          onClick={() => {
            placeOrder(selected);
            navigate("/customer/order-success");
          }}
        >
          Pay Now
        </Button>

      </div>

    </div>
  );
}