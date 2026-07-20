import { ChefHat, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

export default function Header() {
  const navigate = useNavigate();
  const { customerSession } = useApp();

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
        {/* Table Indicator */}
        <div className="flex items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-1.5 shadow-md shadow-orange-200/50">
          <span className="text-sm font-bold tracking-wide text-white">
            {customerSession?.tableId 
              ? (customerSession.tableId.toLowerCase().includes('table') 
                  ? customerSession.tableId 
                  : `Table ${customerSession.tableId}`) 
              : "No Table"}
          </span>
        </div>

        <button
          onClick={() => navigate("/customer/profile")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-sm overflow-hidden"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}