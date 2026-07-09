import PageLayout from "../../components/customer/layout/PageLayout";
import Header from "../../components/customer/navigation/Header";
import SearchBar from "../../components/customer/ui/SearchBar";
import BottomNav from "../../components/customer/navigation/BottomNav";
import Banner from "../../components/customer/cards/Banner";
import Categories from "../../components/customer/home/Categories";
import PopularDishes from "../../components/customer/home/PopularDishes";

export default function Home() {
  return (
    <PageLayout className="bg-[#fafafa] flex flex-col h-full">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">

        <Header />

        <div className="mt-4">
          <SearchBar />
        </div>

        <Banner />

        <Categories />

        <PopularDishes />

      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

    </PageLayout>
  );
}