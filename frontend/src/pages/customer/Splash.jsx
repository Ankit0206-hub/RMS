import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Leaf, Timer, Heart } from "lucide-react";

import heroFood from "../../assets/images/banners/hero-food.png";
import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function Splash() {
  const navigate = useNavigate();
  const { customerSession } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSession && customerSession.sessionId) {
        navigate("/customer/home");
      } else {
        navigate("/customer/landing");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, customerSession]);

  return (
    <PageLayout className="relative bg-black overflow-hidden h-screen w-full">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroFood}
          alt="Background Food"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlays to match the design's glowing center and darker edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-orange-50/95 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/95 via-white/80 to-transparent opacity-90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <ChefHat size={64} strokeWidth={2} className="text-orange-500 mb-2" />
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-[#0f172a]">Dine</span>
            <span className="text-orange-500">Ops</span>
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-[#334155]">
            Restaurant Experience
          </p>
        </div>

        {/* Tagline Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-[#0f172a]">
            Order. Enjoy. Repeat.
          </h2>
          <p className="mt-2 text-[15px] font-medium text-[#475569]">
            Scan &bull; Order &bull; Relax
          </p>
        </div>

        {/* Features Row */}
        <div className="mt-12 flex w-full max-w-sm justify-between px-4">
          <div className="flex flex-col items-center">
            <Leaf size={32} strokeWidth={2} className="text-green-600 mb-3" />
            <span className="text-[13px] font-bold text-[#0f172a] leading-tight">
              Fresh<br />Food
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Timer size={32} strokeWidth={2} className="text-orange-500 mb-3" />
            <span className="text-[13px] font-bold text-[#0f172a] leading-tight">
              Quick<br />Service
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Heart size={32} strokeWidth={2} className="text-orange-500 mb-3" />
            <span className="text-[13px] font-bold text-[#0f172a] leading-tight">
              Seamless<br />Experience
            </span>
          </div>
        </div>

        {/* Bottom U-shape Indicator */}
        <div className="mt-14">
          <svg width="40" height="20" viewBox="0 0 40 20" className="text-orange-500 animate-pulse">
            <path
              d="M 4 2 A 16 16 0 0 0 36 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

      </div>
    </PageLayout>
  );
}