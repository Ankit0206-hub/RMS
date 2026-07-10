import { useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Notifications() {
    const navigate = useNavigate();

    const [todayNotifications, setTodayNotifications] = useState([
        {
            id: 1,
            title: "Order Confirmed",
            message: "Your order #ORD1256 has been confirmed.",
            time: "2 min ago",
            unread: true,
        },
        {
            id: 2,
            title: "Food is Being Prepared",
            message: "Our chef has started preparing your meal.",
            time: "10 min ago",
            unread: true,
        },
    ]);

    const earlierNotifications = [
        {
            id: 3,
            title: "Order Served",
            message: "Your order was successfully served.",
            time: "Yesterday",
        },
        {
            id: 4,
            title: "Coupon Applied",
            message: "FLAT20 coupon applied successfully.",
            time: "Yesterday",
        },
        {
            id: 5,
            title: "Payment Successful",
            message: "Your payment of ₹393 has been received.",
            time: "2 days ago",
        },
    ];

    const NotificationCard = ({ item }) => (
        <div
            className={`rounded-2xl p-4 mb-4 flex gap-4 shadow-sm ${item.unread
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-white"
                }`}
        >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                {item.title.includes("Payment") ? (
                    <CheckCircle2 className="text-green-600" size={22} />
                ) : item.title.includes("Coupon") ? (
                    <Bell className="text-orange-500" size={22} />
                ) : (
                    <Clock3 className="text-orange-500" size={22} />
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">
                        {item.title}
                    </h3>

                    <span className="text-xs text-gray-400">
                        {item.time}
                    </span>
                </div>

                <p className="text-sm text-gray-500 mt-1 leading-5">
                    {item.message}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <div className="bg-white shadow-sm px-5 py-4 flex items-center">

                <button onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>

                <h1 className="flex-1 text-center text-lg font-semibold mr-6">
                    Notifications
                </h1>

            </div>

            <div className="p-5">

                {/* Today */}

                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold">
                        Today
                    </h2>

                    <button
                        onClick={() =>
                            setTodayNotifications((prev) =>
                                prev.map((item) => ({
                                    ...item,
                                    unread: false,
                                }))
                            )
                        }
                        className="text-orange-500 text-sm font-medium"
                    >
                        Mark all as read
                    </button>
                </div>

                {todayNotifications.map((item) => (
                    <NotificationCard
                        key={item.id}
                        item={item}
                    />
                ))}

                {/* Earlier */}

                <h2 className="text-lg font-semibold mt-8 mb-4">
                    Earlier
                </h2>

                {earlierNotifications.map((item) => (
                    <NotificationCard
                        key={item.id}
                        item={item}
                    />
                ))}
            </div>

        </div>
    );
}