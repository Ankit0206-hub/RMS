import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const searches = [
  "Chicken Biryani",
  "Paneer Tikka",
  "Veg Pizza",
  "Cold Coffee",
];

export default function RecentSearch() {
  const navigate = useNavigate();

  return (
    <div className="mt-6">

      <h2 className="mb-4 text-lg font-semibold">
        Recent Searches
      </h2>

      <div className="space-y-3">

        {searches.map((item) => (
          <div
            key={item}
            onClick={() => navigate("/customer/search")} 
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800"
          >
            <History size={16} />
            <span>{item}</span>
          </div>
        ))}

      </div>

    </div>
  );
}