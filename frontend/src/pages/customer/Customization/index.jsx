import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../customer_components/layout/PageLayout";

export default function Customization() {
  const navigate = useNavigate();

  const basePrice = 219;

  const [spice, setSpice] = useState("Medium");
  const [cheese, setCheese] = useState(false);
  const [paneer, setPaneer] = useState(false);
  const [note, setNote] = useState("");

  const total =
    basePrice +
    (cheese ? 30 : 0) +
    (paneer ? 40 : 0);

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-white px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">
            Customize your dish
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-32">

          {/* Spice */}
          <div>
            <h2 className="mb-4 font-semibold text-gray-900">
              Choose Spice Level
            </h2>

            {["Mild", "Medium", "Hot"].map((level) => (
              <button
                key={level}
                onClick={() => setSpice(level)}
                className={`mb-3 flex w-full items-center rounded-xl border p-4 transition ${
                  spice === level
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                    spice === level
                      ? "border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {spice === level && (
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  )}
                </div>

                <span>{level}</span>
              </button>
            ))}
          </div>

          {/* Toppings */}
          <div className="mt-8">

            <h2 className="mb-4 font-semibold">
              Extra Toppings
            </h2>

            <label className="mb-4 flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={cheese}
                  onChange={() => setCheese(!cheese)}
                  className="h-4 w-4 accent-orange-500"
                />

                <span>Extra Cheese</span>

              </div>

              <span className="text-gray-500">
                +₹30
              </span>
            </label>

            <label className="flex cursor-pointer items-center justify-between">

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={paneer}
                  onChange={() => setPaneer(!paneer)}
                  className="h-4 w-4 accent-orange-500"
                />

                <span>Extra Paneer</span>

              </div>

              <span className="text-gray-500">
                +₹40
              </span>

            </label>

          </div>

          {/* Instructions */}
          <div className="mt-8">

            <h2 className="mb-3 font-semibold">
              Special Instructions
            </h2>

            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="No onion, less spicy..."
              className="w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-orange-500 resize-none"
            />

          </div>

        </div>

        {/* Bottom */}
        <div className="border-t bg-white p-5">

          <button
            onClick={() => navigate("/customer/cart")}
            className="h-12 w-full rounded-xl bg-orange-500 text-white font-semibold shadow-sm transition active:scale-95"
          >
            Add to Cart ₹{total}
          </button>

        </div>

      </div>
    </PageLayout>
  );
}