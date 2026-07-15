import { useState, useEffect } from "react";
import bannerFood from "../../../assets/images/banners/hero-food.png";

const banners = [
  {
    id: 1,
    title: "Delicious\nFood Awaits!",
    subtitle: "Fresh • Hygienic • Tasty",
    bgClass: "bg-amber-900",
    textClass: "text-amber-200",
    image: bannerFood,
  },
  {
    id: 2,
    title: "Flat 20% Off\nToday Only!",
    subtitle: "Use Code: DINE20",
    bgClass: "bg-orange-600",
    textClass: "text-orange-100",
    image: bannerFood, 
  },
  {
    id: 3,
    title: "New Desserts\nJust Arrived",
    subtitle: "Sweeten your day",
    bgClass: "bg-emerald-800",
    textClass: "text-emerald-200",
    image: bannerFood,
  }
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-6 h-32 w-full overflow-hidden rounded-3xl shadow-md bg-gray-100">
      <div 
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`relative flex h-full w-full flex-shrink-0 ${banner.bgClass}`}
          >
            {/* Image Section (Right side with fade into background) */}
            <div className="absolute inset-y-0 right-0 w-3/5 md:w-1/2 overflow-hidden">
              <img
                src={banner.image}
                alt="Banner Image"
                className="h-full w-full object-cover opacity-90"
                style={{ 
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)', 
                  maskImage: 'linear-gradient(to right, transparent 0%, black 40%)' 
                }}
              />
            </div>
            
            {/* Text Section (Left side) */}
            <div className="relative z-10 flex w-2/3 md:w-1/2 flex-col justify-center pl-6 md:pl-10 h-full">
              <h2 className="text-lg md:text-2xl font-bold text-white leading-tight whitespace-pre-line">
                {banner.title}
              </h2>
              <p className={`mt-1.5 text-[11px] md:text-sm font-bold tracking-wide ${banner.textClass}`}>
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Dots */}
      <div className="absolute bottom-2.5 left-0 w-full flex justify-center gap-1.5 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-white w-4" : "bg-white/50 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
