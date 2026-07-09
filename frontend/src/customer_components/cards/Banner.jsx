import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const banners = [
  {
    title: "Get 20% OFF",
    subtitle: "On All Orders",
    image:
      "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Buy 1 Get 1",
    subtitle: "Every Wednesday",
    image:
      "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Free Delivery",
    subtitle: "Above ₹499",
    image:
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-3xl">

      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          width: `${banners.length * 100}%`,
          transform: `translateX(-${current * (100 / banners.length)}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className="relative h-32 w-full shrink-0 bg-linear-to-r from-[#111] via-[#1b1b1b] to-black"
            style={{ width: `${100 / banners.length}%` }}
          >
            {/* Text */}
            <div className="absolute left-4 top-4 z-10">

              <p className="text-xs text-white font-medium">
                Today's Special
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-orange-500">
                {banner.title}
              </h2>

              <p className="text-sm text-white font-semibold">
                {banner.subtitle}
              </p>

              <button className="mt-3 flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white">
                ORDER NOW
                <ArrowRight size={14} />
              </button>

            </div>

            {/* Image */}
            <img
              src={banner.image}
              alt=""
              className="absolute right-0 top-0 h-full w-[45%] object-cover"
            />

            <div className="absolute inset-y-0 right-[40%] w-16 bg-linear-to-r from-transparent to-black"></div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 ${
              current === i
                ? "h-2 w-6 rounded-full bg-orange-500"
                : "h-2 w-2 rounded-full bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}