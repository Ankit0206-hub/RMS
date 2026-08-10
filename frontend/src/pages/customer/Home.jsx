import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/customer/layout/PageLayout";
import Header from "../../components/customer/navigation/Header";
import SearchBar from "../../components/customer/ui/SearchBar";
import BottomNav from "../../components/customer/navigation/BottomNav";
import Categories from "../../components/customer/home/Categories";
import PopularDishes from "../../components/customer/home/PopularDishes";
import BannerCarousel from "../../components/customer/home/BannerCarousel";
import customerApi from "../../services/customerApi";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await customerApi.getMenu();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch menu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const allItems = categories.flatMap(c => c.items);
  const popularDishes = allItems.slice(0, 4);
  const todaysSpecial = allItems.length > 0 ? allItems[0] : null;
  return (
    <PageLayout className="bg-white dark:bg-slate-900 flex flex-col h-full">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">

        <Header />

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar />
          </div>
          <button
            onClick={() => navigate("/customer/cart")}
            className="mt-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-slate-800 text-orange-500 shadow-sm border border-orange-100 dark:border-slate-700 active:scale-95 transition-transform"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Top Hero Banner Carousel */}
        <BannerCarousel />

        <Categories categories={categories} />

        <PopularDishes popularDishes={popularDishes} />

        {/* Today's Special */}
        {todaysSpecial && (
          <section className="mt-8 mb-4">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Today's Special
            </h2>
            <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img 
                  src={todaysSpecial.image_url || "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=200&q=80"} 
                  alt={todaysSpecial.name} 
                  className="h-16 w-16 rounded-full object-cover shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{todaysSpecial.name}</h3>
                  <p className="font-bold text-gray-900 dark:text-white">₹{todaysSpecial.price}</p>
                </div>
              </div>
              <div className="rounded-full bg-orange-50 px-3 py-1">
                <span className="text-xs font-semibold text-orange-500">Bestseller</span>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

    </PageLayout>
  );
}