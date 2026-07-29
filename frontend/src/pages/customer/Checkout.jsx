import React, { useState } from "react";
import {
    ArrowLeft,
    Ticket,
    Wallet,
    CreditCard,
    Landmark,
    Smartphone,
    CircleDollarSign,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/customer/ui/Button";
import { useApp } from "../../context/AppContext";

export default function Checkout() {
    const navigate = useNavigate();

    const { cartItems } = useApp();

    const [paymentMethod, setPaymentMethod] = useState("");
    const [coupon, setCoupon] = useState("");

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const gst = Math.round(subtotal * 0.05);
    const serviceCharge = cartItems.length ? 30 : 0;

    let discount = 0;

    if (coupon.toUpperCase() === "WELCOME50") {
        discount = 50;
    }

    const total = subtotal + gst + serviceCharge - discount;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-800/50 flex flex-col">

            {/* Header */}

            <div className="bg-white dark:bg-slate-900 shadow-sm flex items-center px-5 py-4">

                <button onClick={() => navigate('/customer/cart')}>
                    <ArrowLeft size={22} />
                </button>

                <h1 className="flex-1 text-center text-lg font-semibold mr-6">
                    Checkout
                </h1>

            </div>

            {/* Content */}

            <div className="flex-1 overflow-y-auto px-5 py-5">

                {/* Table */}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4">

                    <p className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-400">
                        Table Number
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        12
                    </h2>

                </div>

                {/* Customer */}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 mt-4">

                    <p className="font-semibold">
                        Customer
                    </p>

                    <div className="mt-3">

                        <p className="font-medium">
                            John Doe
                        </p>

                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            +91 98765 43210
                        </p>

                    </div>

                </div>

                {/* Coupon */}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 mt-4">

                    <p className="font-semibold mb-3">
                        Coupons
                    </p>

                    <div className="flex gap-2">

                        <div className="flex-1 relative">

                            <Ticket
                                size={18}
                                className="absolute left-3 top-3.5 text-orange-500"
                            />

                            <input
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon code"
                                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 py-3 pl-10 pr-3 outline-none"
                            />

                        </div>

                        <button
                            className="px-5 rounded-xl bg-orange-500 text-white font-medium"
                        >
                            Apply
                        </button>

                    </div>

                </div>
                {/* Bill Summary */}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 mt-4">

                    <h2 className="text-lg font-semibold mb-4">
                        Bill Summary
                    </h2>

                    <div className="space-y-3 text-sm">

                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">
                                Subtotal
                            </span>

                            <span>
                                ₹{subtotal}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">
                                GST (5%)
                            </span>

                            <span>
                                ₹{gst}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">
                                Service Charge
                            </span>

                            <span>
                                ₹{serviceCharge}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-slate-400">
                                Discount
                            </span>

                            <span className="text-green-600">
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

            </div>

            {/* Bottom Button */}

            <div className="bg-white dark:bg-slate-900 border-t px-5 py-4">

                <Button
                   
                    onClick={() => navigate("/customer/payment")}
                >
                    Proceed To Pay ₹{total}
                </Button>

            </div>

        </div>
    );
}