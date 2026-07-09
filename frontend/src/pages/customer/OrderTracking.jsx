import { ArrowLeft, Check, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderTracking() {
    const navigate = useNavigate();

    const steps = [
        {
            title: "Order Confirmed",
            time: "02:30 PM",
            completed: true,
        },
        {
            title: "Preparing",
            time: "02:32 PM",
            completed: true,
        },
        {
            title: "Cooking",
            time: "02:45 PM",
            completed: true,
        },
        {
            title: "Ready to Serve",
            time: "03:00 PM",
            completed: true,
        },
        {
            title: "Served",
            time: "--------",
            completed: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <div className="bg-white shadow-sm px-5 py-4 flex items-center">

                <button onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>

                <h1 className="flex-1 text-center text-lg font-semibold mr-6">
                    Live Order Tracking
                </h1>

            </div>

            <div className="p-5">

                {/* Order Card */}

                <div className="bg-white rounded-2xl p-5 shadow-sm">

                    <h2 className="font-semibold text-lg">
                        Order ID : #ORD1256
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        12 May, 04:30 PM
                    </p>

                </div>

                {/* Timeline */}

                <div className="bg-white rounded-2xl p-5 shadow-sm mt-5">

                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex gap-4"
                        >

                            {/* Left Timeline */}

                            <div className="flex flex-col items-center">

                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${step.completed
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                        }`}
                                >
                                    {step.completed ? (
                                        <Check
                                            size={16}
                                            className="text-white"
                                        />
                                    ) : null}
                                </div>

                                {index !== steps.length - 1 && (
                                    <div
                                        className={`w-1 flex-1 min-h-12
                    ${step.completed
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                            }`}
                                    />
                                )}

                            </div>

                            {/* Right Content */}

                            <div className="pb-8">

                                <h3 className="font-semibold text-gray-800">
                                    {step.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {step.time}
                                </p>

                            </div>

                        </div>
                    ))}
                    {/* Estimated Time */}

                    <div className="mt-2 rounded-2xl border border-orange-100 bg-orange-50 p-4">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <Clock3
                                    size={22}
                                    className="text-orange-500"
                                />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Estimated Time
                                </p>

                                <h2 className="text-xl font-bold text-orange-500">
                                    15 - 20 min
                                </h2>
                            </div>

                        </div>

                    </div>

                </div>
                {/* Call Waiter Button */}

                <div className="mt-6">
                    <button
                        onClick={() => navigate("/customer/call-waiter")}
                        className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                    >
                        Call Waiter
                    </button>
                </div>

            </div>

        </div>
    );
}