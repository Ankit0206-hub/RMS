import { ChevronDown, ChefHat, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between pb-2">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <ChefHat size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          DineOps
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Table Selector */}
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm border border-gray-100 cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">Table 07</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>

        {/* User Profile */}
        <button
          onClick={() => navigate("/customer/settings")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-sm overflow-hidden"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}