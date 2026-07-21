import { ArrowLeft, Search, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import customerApi from "../../services/customerApi";

const defaultImages = [
  "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=400&q=80",
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
  "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80"
];

export default function Categories() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    customerApi.getMenu()
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    const handleScroll = (e) => {
      setIsScrolled(e.target.scrollTop > 20);
    };
    
    const container = document.getElementById("categories-container");
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container && container.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout className="bg-[#f8fafc] dark:bg-slate-950">
      <div id="categories-container" className="flex h-full flex-col overflow-y-auto">
        {/* Sleek Header */}
        <div className={`sticky top-0 z-20 transition-all duration-300 ${isScrolled ? "bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-sm pb-3 pt-12" : "bg-transparent pb-2 pt-4"} px-6 md:px-10`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/customer/home")} 
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight absolute left-1/2 -translate-x-1/2">
              Menu
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="px-6 md:px-10 mt-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="What are you craving?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm md:text-base font-semibold rounded-2xl pl-12 pr-4 py-4 md:py-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 px-6 md:px-10 mt-8 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredCategories.map((cat, index) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/customer/food-list/${cat.name.toLowerCase().replace(/\s+/g, "-")}`)}
                className="group relative h-48 md:h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={defaultImages[index % defaultImages.length]}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 flex flex-col justify-end">
                  <h3 className="text-white/80 text-lg md:text-xl font-bold tracking-wide drop-shadow-md">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <UtensilsCrossed size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-semibold">No categories found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        <BottomNav active="categories" />
      </div>
    </PageLayout>
  );
}