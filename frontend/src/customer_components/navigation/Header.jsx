import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Hi, John <span>👋</span>
        </h1>

        <p className="text-xs text-gray-500 mt-0.5">
          Good Afternoon!
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/customer/notifications")}
          className="relative"
        >
          <Bell size={20} className="text-gray-700" />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
        </button>

        <img  onClick={() => navigate("/customer/settings")}
          src="https://i.pravatar.cc/100"
          alt="profile"
          className="w-9 h-9 rounded-full object-cover border"
        />
      </div>
    </div>
  );
}