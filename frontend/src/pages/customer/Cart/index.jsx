import React, { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Ticket,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../customer_components/ui/Button";
import BottomNav from "../../../customer_components/navigation/BottomNav";
import { useApp } from "../../../context/AppContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useApp();

  const [showCoupon, setShowCoupon] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const coupons = [
    {
      code: "WELCOME50",
      title: "Flat ₹50 OFF",
      discount: 50,
      type: "flat",
    },
    {
      code: "SAVE100",
      title: "Flat ₹100 OFF on orders above ₹500",
      discount: 100,
      type: "flat",
      minOrder: 500,
    },
    {
      code: "FLAT20",
      title: "20% OFF (Max ₹150)",
      discount: 20,
      type: "percent",
      maxDiscount: 150,
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gst = Math.round(subtotal * 0.05);

  const serviceCharge = cartItems.length ? 30 : 0;

  let discount = 0;

  if (selectedCoupon) {
    if (selectedCoupon.type === "flat") {
      if (
        !selectedCoupon.minOrder ||
        subtotal >= selectedCoupon.minOrder
      ) {
        discount = selectedCoupon.discount;
      }
    } else {
      discount = Math.round(
        (subtotal * selectedCoupon.discount) / 100
      );

      if (selectedCoupon.maxDiscount) {
        discount = Math.min(
          discount,
          selectedCoupon.maxDiscount
        );
      }
    }
  }

  const total = subtotal + gst + serviceCharge - discount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}

      <div className="bg-white px-5 py-4 shadow-sm flex items-center">

        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>

        <h1 className="flex-1 text-center text-lg font-semibold mr-6">
          Cart
        </h1>

      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto px-5 py-5">

        {cartItems.length === 0 ? (

          <div className="h-full flex flex-col items-center justify-center">

            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt=""
              className="w-40"
            />

            <h2 className="mt-6 text-2xl font-bold">
              Your Cart is Empty
            </h2>

            <p className="mt-2 text-gray-500 text-center">
              Looks like you haven't added anything yet.
            </p>

            <button
              onClick={() => navigate("/customer/home")}
              className="mt-8 rounded-xl bg-orange-500 px-6 py-3 text-white"
            >
              Browse Food
            </button>

          </div>

        ) : (

          <>

            {/* Cart Items */}

            <div className="space-y-4">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-4 shadow-sm flex gap-4"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />

                  <div className="flex-1">

                    <div className="flex justify-between">

                      <div>

                        <h2 className="font-semibold text-lg">
                          {item.name}
                        </h2>

                        <p className="mt-2 font-bold text-orange-500">
                          ₹{item.price}
                        </p>

                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2
                          size={18}
                          className="text-red-500"
                        />
                      </button>

                    </div>

                    <div className="mt-4 flex items-center gap-3">

                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="h-8 w-8 rounded-full border flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* Coupon */}

            <div
              onClick={() => setShowCoupon(true)}
              className="mt-6 rounded-2xl bg-white p-4 shadow-sm flex items-center justify-between cursor-pointer"
            >

              <div className="flex items-center gap-3">

                <Ticket className="text-orange-500" />

                <div>

                  <p className="font-semibold">
                    {selectedCoupon
                      ? selectedCoupon.code
                      : "Apply Coupon"}
                  </p>

                  {selectedCoupon && (
                    <p className="text-xs text-green-600">
                      Coupon Applied Successfully
                    </p>
                  )}

                </div>

              </div>

              <span className="font-semibold text-orange-500">
                {selectedCoupon ? "Change" : "Apply"}
              </span>

            </div>
                        {/* Bill Summary */}

            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">
                Bill Summary
              </h2>

              <div className="space-y-3 text-sm">

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
                    Discount
                  </span>

                  <span className="text-green-600 font-semibold">
                    -₹{discount}
                  </span>
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

          </>
        )}

      </div>

      {/* Bottom */}

      <div className="border-t bg-white px-5 pt-4 pb-3">

        <Button
          disabled={cartItems.length === 0}
          onClick={() => navigate("/customer/checkout")}
        >
          Checkout
        </Button>

        <div className="mt-4">
          <BottomNav active="cart" />
        </div>

      </div>

      {/* Coupon Modal */}

      {showCoupon && (

        <div className="fixed inset-0 z-50 flex items-end bg-black/40">

          <div className="w-full rounded-t-3xl bg-white p-6">

            <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-gray-300" />

            <h2 className="mb-5 text-xl font-bold">
              Available Coupons
            </h2>

            <div className="space-y-4">

              {coupons.map((coupon) => (

                <div
                  key={coupon.code}
                  onClick={() => {
                    setSelectedCoupon(coupon);
                    setShowCoupon(false);
                  }}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 transition ${
                    selectedCoupon?.code === coupon.code
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-orange-500">
                        {coupon.code}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {coupon.title}
                      </p>

                      {coupon.minOrder && (
                        <p className="mt-2 text-xs text-gray-400">
                          Minimum order ₹{coupon.minOrder}
                        </p>
                      )}

                    </div>

                    {selectedCoupon?.code === coupon.code && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                        <Check size={16} />
                      </div>
                    )}

                  </div>

                </div>

              ))}

            </div>

            <button
              onClick={() => setShowCoupon(false)}
              className="mt-6 h-12 w-full rounded-xl bg-gray-100 font-semibold"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}