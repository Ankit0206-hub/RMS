import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/customer/search")}
      className="mt-4 flex h-11 cursor-pointer items-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 shadow-sm"
    >
      <Search size={18} className="text-gray-400 dark:text-slate-500 dark:text-slate-400" />

      <span className="ml-3 text-sm text-gray-400 dark:text-slate-500 dark:text-slate-400">
        Search for food...
      </span>
    </div>
  );
}