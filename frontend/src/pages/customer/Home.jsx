import PageLayout from "../../components/customer/layout/PageLayout";
import Header from "../../components/customer/navigation/Header";
import SearchBar from "../../components/customer/ui/SearchBar";
import BottomNav from "../../components/customer/navigation/BottomNav";
import Categories from "../../components/customer/home/Categories";
import PopularDishes from "../../components/customer/home/PopularDishes";
import BannerCarousel from "../../components/customer/home/BannerCarousel";

export default function Home() {
  return (
    <PageLayout className="bg-white flex flex-col h-full">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">

        <Header />

        <div className="mt-4">
          <SearchBar />
        </div>

        {/* Top Hero Banner Carousel */}
        <BannerCarousel />

        <Categories />

        <PopularDishes />

        {/* Today's Special */}
        <section className="mt-8 mb-4">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Today's Special
          </h2>
          <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=200&q=80" 
                alt="Cheese Pizza" 
                className="h-16 w-16 rounded-full object-cover shadow-sm"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Cheese Pizza</h3>
                <p className="font-bold text-gray-900">₹320</p>
              </div>
            </div>
            <div className="rounded-full bg-orange-50 px-3 py-1">
              <span className="text-xs font-semibold text-orange-500">Bestseller</span>
            </div>
          </div>
        </section>

      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

    </PageLayout>
  );
}