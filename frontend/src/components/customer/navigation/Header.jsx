import { ChefHat, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

export default function Header() {
  const navigate = useNavigate();
  const { customerSession } = useApp();

  return (
    <div className="flex items-center justify-between pb-2 gap-2">
      {/* Brand Logo */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 shrink-0">
          <ChefHat size={20} className="md:w-[24px] md:h-[24px]" />
        </div>
        <span className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white shrink-0">
          DineOps
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Table Indicator */}
        <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-2.5 py-1 md:px-4 md:py-1.5 shadow-md shadow-orange-200/50 min-w-0">
          <span className="text-[11px] md:text-sm font-bold tracking-wide text-white truncate">
            {customerSession?.tableId 
              ? (customerSession.tableId.toLowerCase().includes('table') 
                  ? customerSession.tableId 
                  : `Table ${customerSession.tableId}`) 
              : "No Table"}
          </span>
        </div>

        <button
          onClick={() => navigate("/customer/profile")}
          className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-sm overflow-hidden shrink-0"
        >
          <User size={18} className="md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}