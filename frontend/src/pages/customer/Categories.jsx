import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";

const categories = [
  {
    name: "Starters",
    items: "12 items",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=200&q=80",
  },
  {
    name: "Main Course",
    items: "28 items",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80",
  },
  {
    name: "Breads",
    items: "8 items",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&q=80",
  },
  {
    name: "Rice & Biryani",
    items: "10 items",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&q=80",
  },
  {
    name: "Desserts",
    items: "6 items",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80",
  },
  {
    name: "Beverages",
    items: "12 items",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80",
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout className="bg-slate-50">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 md:px-8 pt-6 pb-4 z-10 max-w-4xl mx-auto w-full">
          <button onClick={() => navigate("/customer/home")} className="absolute left-4 md:left-8 p-2 rounded-full bg-white shadow-sm border border-slate-100 active:scale-95 transition-transform">
            <ArrowLeft size={22} className="text-slate-800" />
          </button>
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-8 pb-5 max-w-4xl mx-auto w-full">
          <div className="flex items-center rounded-2xl md:rounded-3xl bg-white px-5 py-3.5 md:py-4 shadow-sm border border-slate-100 focus-within:border-orange-500 focus-within:shadow-md transition-all">
            <Search size={22} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 font-semibold md:text-lg"
            />
          </div>
        </div>

        {/* List / Grid Layout */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filteredCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() =>
                  navigate(`/customer/food-list/${cat.name.toLowerCase().replace(/\s+/g, "-")}`)
                }
                className="flex items-center justify-between rounded-[1.75rem] md:rounded-[2rem] bg-white p-3 md:p-4 shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="h-[72px] w-[96px] md:h-[90px] md:w-[120px] overflow-hidden rounded-2xl md:rounded-3xl bg-orange-50 shrink-0 shadow-inner">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">
                      {cat.name}
                    </h3>
                    <p className="text-[13px] md:text-sm font-semibold text-slate-500 mt-1">
                      {cat.items}
                    </p>
                  </div>
                </div>
                
                <div className="pr-2 md:pr-4">
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 text-orange-500">
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-semibold text-lg md:col-span-2">
                No categories found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav active="categories" />
      </div>
    </PageLayout>
  );
}