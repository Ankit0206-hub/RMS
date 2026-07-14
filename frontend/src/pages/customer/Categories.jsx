import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";

import {
  Leaf,
  Drumstick,
  Pizza,
  Sandwich,
  CakeSlice,
  CupSoda,
  Soup,
  Grid2x2Plus,
} from "lucide-react";

const categories = [
  {
    name: "Veg",
    items: "25 Items",
    icon: Leaf,
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    name: "Non Veg",
    items: "40 Items",
    icon: Drumstick,
    color: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    name: "Pizza",
    items: "18 Items",
    icon: Pizza,
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    name: "Burger",
    items: "15 Items",
    icon: Sandwich,
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    name: "Chinese",
    items: "20 Items",
    icon: Soup,
    color: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    name: "Dessert",
    items: "30 Items",
    icon: CakeSlice,
    color: "bg-pink-100",
    iconColor: "text-pink-500",
  },
  {
    name: "Drinks",
    items: "25 Items",
    icon: CupSoda,
    color: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    name: "Beverages",
    items: "15 Items",
    icon: Grid2x2Plus,
    color: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export default function Categories() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">
            Categories
          </h1>

          <Search size={20} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 pt-5 flex-1">

          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.name}
                onClick={() =>
                  navigate(`/customer/food-list/${cat.name.toLowerCase().replace(/\s+/g, "-")}`)
                }
                className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 active:scale-95 transition cursor-pointer"
              >
                <div
                  className={`h-14 w-14 rounded-full ${cat.color} flex items-center justify-center`}
                >
                  <Icon className={cat.iconColor} size={28} />
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  {cat.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {cat.items}
                </p>
              </div>
            );
          })}
        </div>

        <BottomNav active="categories" />

      </div>
    </PageLayout>
  );
}