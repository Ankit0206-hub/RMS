import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const foods = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 299,
    rating: 4.8,
    image:
      "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Veg Biryani",
    price: 229,
    rating: 4.7,
    image:
      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Cheese Burger",
    price: 199,
    rating: 4.6,
    image:
      "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    name: "Pasta Alfredo",
    price: 249,
    rating: 4.9,
    image:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function TrendingFood() {
  const navigate = useNavigate();

  return (
    <div className="mt-6">

      {/* Title */}
      <h2 className="mb-4 text-lg font-semibold">
        Trending Now
      </h2>

      {/* List */}
      <div className="space-y-3">

        {foods.map((food) => (
          <div
            key={food.id}
            onClick={() => navigate("/customer/food-details")}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm active:scale-[0.99] transition"
          >

            {/* Image */}
            <img
              src={food.image}
              alt={food.name}
              className="h-16 w-16 rounded-xl object-cover"
            />

            {/* Info */}
            <div className="flex-1">

              <h3 className="font-semibold text-gray-900">
                {food.name}
              </h3>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {food.rating}
              </div>

            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-semibold text-orange-500">
                ₹{food.price}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}