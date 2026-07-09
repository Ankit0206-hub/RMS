import PageLayout from "../../../customer_components/layout/PageLayout";
import Header from "../../../customer_components/navigation/Header";
import SearchBar from "../../../customer_components/ui/SearchBar";
import BottomNav from "../../../customer_components/navigation/BottomNav";
import Banner from "../../../customer_components/cards/Banner";
import Categories from "./categories";
import PopularDishes from "./PopularDishes";

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