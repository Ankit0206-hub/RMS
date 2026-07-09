import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RecentSearch from "../../components/customer/search/RecentSearch";
import TrendingFood from "../../components/customer/search/TrendingFood";

export default function SearchPage() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        <div className="flex-1 px-4 pt-4">

          {/* Header */}
          <div className="flex items-center gap-3">

            <button onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>

            <div className="flex h-11 flex-1 items-center rounded-xl bg-white px-3 shadow-sm border">

              <Search size={18} className="text-gray-400" />

              <input
                autoFocus
                placeholder="Search for food..."
                className="ml-3 w-full bg-transparent outline-none text-sm"
              />

            </div>

          </div>

          <RecentSearch />

         <TrendingFood />

        </div>

        <BottomNav />

      </div>
    </PageLayout>
  );
}