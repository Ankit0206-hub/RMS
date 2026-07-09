import { useState } from "react";
import {
    ArrowLeft,
    Phone,
    GlassWater,
    UtensilsCrossed,
    Receipt,
    Smile,
    CookingPot,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../customer_components/ui/Button";

export default function CallWaiter() {
    const navigate = useNavigate();

    const [selected, setSelected] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const services = [
        {
            id: "water",
            title: "Need Water",
            icon: <GlassWater size={28} className="text-sky-500" />,
        },
        {
            id: "tissue",
            title: "Need Tissue",
            icon: <CookingPot size={28} className="text-gray-600" />,
        },
        {
            id: "plate",
            title: "Extra Plate",
            icon: <UtensilsCrossed size={28} className="text-orange-500" />,
        },
        {
            id: "spoon",
            title: "Extra Spoon",
            icon: <UtensilsCrossed size={28} className="text-yellow-600" />,
        },
        {
            id: "bill",
            title: "Need Bill",
            icon: <Receipt size={28} className="text-green-600" />,
        },
        {
            id: "other",
            title: "Other Assistance",
            icon: <Smile size={28} className="text-amber-500" />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Header */}

            <div className="bg-white shadow-sm px-5 py-4 flex items-center">

                <button onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>

                <h1 className="flex-1 text-center text-lg font-semibold mr-6">
                    Call Waiter
                </h1>

            </div>

            <div className="flex-1 px-5 py-6">

                <h2 className="text-2xl font-bold">
                    How can we help you?
                </h2>

                <p className="text-gray-500 mt-2 mb-6">
                    Let us know what you need
                </p>

                <div className="grid grid-cols-2 gap-4">

                    {services.map((service) => (

                        <button
                            key={service.id}
                            onClick={() => setSelected(service.id)}
                            className={`rounded-2xl border p-6 flex flex-col items-center justify-center transition-all
                ${selected === service.id
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white"
                                }`}
                        >

                            {service.icon}

                            <span className="mt-4 text-sm font-semibold text-center">
                                {service.title}
                            </span>

                        </button>

                    ))}
                </div>

            </div>

            {/* Bottom Button */}

            <div className="bg-white border-t px-5 py-4">

                <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!selected}
                    onClick={() => {
                        setShowSuccess(true);

                        setTimeout(() => {
                            setShowSuccess(false);
                            navigate("/customer/home");
                        }, 2500);
                    }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Phone size={18} />
                        <span>Call Waiter</span>
                    </div>
                </Button>

            </div>
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">

                    <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-[fadeIn_.25s_ease]">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">

                            <CheckCircle2
                                size={52}
                                className="text-green-600"
                            />

                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Waiter Notified
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Your request has been sent successfully.
                            <br />
                            A waiter will be with you shortly.
                        </p>

                        <div className="mt-6 rounded-xl bg-green-50 py-3 text-sm font-medium text-green-700">
                            Thank you for your patience 😊
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}