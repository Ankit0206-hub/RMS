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
    <PageLayout className="bg-gray-50">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 pt-6 pb-4 z-10">
          <button onClick={() => navigate(-1)} className="absolute left-4 p-1">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center rounded-2xl bg-white px-4 py-3.5 shadow-sm border border-gray-100">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
        </div>

        {/* Vertical List Layout */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="flex flex-col gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() =>
                  navigate(`/customer/food-list/${cat.name.toLowerCase().replace(/\s+/g, "-")}`)
                }
                className="flex items-center justify-between rounded-3xl bg-white p-3 shadow-sm border border-gray-100 cursor-pointer transition hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-[72px] w-[96px] overflow-hidden rounded-2xl bg-orange-50 shrink-0">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {cat.name}
                    </h3>
                    <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                      {cat.items}
                    </p>
                  </div>
                </div>
                
                <div className="pr-3">
                  <ChevronRight size={20} className="text-orange-500 stroke-[2.5]" />
                </div>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-10 text-gray-500 font-medium">
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