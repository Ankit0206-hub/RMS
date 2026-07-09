import {
  Leaf,
  Drumstick,
  Pizza,
  Sandwich,
  IceCreamCone,
  Coffee,
  Soup,
  Grid2x2,
} from "lucide-react";
import CategoryCard from "../../../customer_components/cards/CategoryCard";
import { useNavigate } from "react-router-dom";

const categories = [
{
  title: "Dessert",
  icon: IceCreamCone,
  color: "bg-pink-100",
},
{
  title: "Drinks",
  icon: Coffee,
  color: "bg-blue-100",
},
{
  title: "Chinese",
  icon: Soup,
  color: "bg-purple-100",
},
{
  title: "More",
  icon: Grid2x2,
  color: "bg-gray-100",
},
];


export default function Categories() {
  const navigate = useNavigate();
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-gray-900">
          Categories
        </h2>

        <button onClick={() => navigate("/customer/categories")} className="text-sm font-medium text-orange-500">
          See All
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {categories.map((item) => (
          <CategoryCard
            key={item.title}
            title={item.title}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>
    </section>
  );
}