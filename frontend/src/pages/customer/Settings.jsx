import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Moon,
  Bell,
  Globe,
  ShieldCheck,
  FileText,
  CircleHelp,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";

export default function Settings() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menu = [
    {
      title: "Language",
      icon: Globe,
      action: () => navigate("/customer/language"),
    },
    {
      title: "Privacy Policy",
      icon: ShieldCheck,
      action: () => navigate("/customer/privacy"),
    },
    {
      title: "Terms & Conditions",
      icon: FileText,
      action: () => navigate("/customer/terms"),
    },
    {
      title: "Help & Support",
      icon: CircleHelp,
      action: () => navigate("/customer/help"),
    },
    {
      title: "About Us",
      icon: Info,
      action: () => navigate("/customer/about"),
    },
  ];

  return (
    <PageLayout className="bg-gray-50">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="bg-white px-5 py-5 shadow-sm flex items-center justify-between relative z-10">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Dark Mode */}

          <div className="bg-white rounded-2xl p-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Moon className="text-orange-500" />

              <span className="font-medium">
                Dark Mode
              </span>

            </div>

            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="w-5 h-5"
            />

          </div>

          {/* Notifications */}

          <div className="bg-white rounded-2xl p-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Bell className="text-orange-500" />

              <span className="font-medium">
                Notifications
              </span>

            </div>

            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-5 h-5"
            />

          </div>

          {/* Other Options */}

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={item.action}
                className="w-full bg-white rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">

                  <Icon className="text-orange-500" />

                  <span className="font-medium">
                    {item.title}
                  </span>

                </div>

                <ChevronRight
                  className="text-gray-400"
                  size={20}
                />

              </button>
            );
          })}

          {/* Logout */}

          <button
            onClick={() => navigate("/customer/landing")}
            className="w-full bg-red-50 rounded-2xl p-4 flex items-center justify-between"
          >

            <div className="flex items-center gap-3">

              <LogOut className="text-red-500" />

              <span className="font-medium text-red-500">
                Logout
              </span>

            </div>

          </button>

        </div>

      </div>
      <BottomNav active="settings" />
    </PageLayout>
  );
}