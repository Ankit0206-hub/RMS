import { Heart, Plus, Star } from "lucide-react";

export default function FoodCard({
  image,
  name,
  price,
  rating,
}) {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
      {/* Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="h-24 w-full rounded-xl object-cover"
        />

        <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
          <Heart size={14} className="text-gray-500" />
        </button>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow">
          <Star size={11} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-medium">{rating}</span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-semibold">{name}</h3>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-bold text-orange-500">₹{price}</p>

          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}