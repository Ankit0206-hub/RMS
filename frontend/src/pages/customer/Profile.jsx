import { useNavigate } from "react-router-dom";
import {
    User,
    MapPin,
    CreditCard,
    Heart,
    TicketPercent,
    Award,
    ChevronRight,
} from "lucide-react";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import { useApp } from "../../context/AppContext";
export default function Profile() {
    const navigate = useNavigate();
    const { user } = useApp();

    const menu = [
        {
            title: "Personal Information",
            icon: User,
            path: "/edit-profile",
        },
        {
            title: "Addresses",
            icon: MapPin,
            path: "/addresses",
        },
        {
            title: "Payment Methods",
            icon: CreditCard,
            path: "/payment",
        },
        {
            title: "My Favourite Foods",
            icon: Heart,
            path: "/favorites",
        },
        {
            title: "Coupons & Offers",
            icon: TicketPercent,
            path: "/offers",
        },
        {
            title: "Loyalty Points",
            icon: Award,
            path: "/loyalty",
        },
    ];

    return (
        <PageLayout className="bg-gray-50">
            <div className="flex h-full flex-col">

                {/* Header */}

                <div className="bg-white px-5 py-8 shadow-sm">

                    <div className="flex items-center gap-4">

                        <img
                            src="https://i.pravatar.cc/150?img=12"
                            alt="Profile"
                            className="h-20 w-20 rounded-full object-cover"
                        />

                        <div>

                            <h2>{user.name}</h2>

                            <p>{user.email}</p>

                            <p>{user.phone}</p>

                        </div>

                    </div>

                </div>

                {/* Menu */}

                <div className="flex-1 overflow-y-auto p-5 space-y-3">

                    {menu.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.title}
                                onClick={() => navigate(item.path)}
                                className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">

                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Icon
                                            size={20}
                                            className="text-orange-500"
                                        />
                                    </div>

                                    <span className="font-medium">
                                        {item.title}
                                    </span>

                                </div>

                                <ChevronRight
                                    size={20}
                                    className="text-gray-400"
                                />

                            </button>
                        );
                    })}

                </div>

                <BottomNav />

            </div>
        </PageLayout>
    );
}