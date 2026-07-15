import { useNavigate } from "react-router-dom";
import { ChefHat, Leaf, Clock, HeartHandshake } from "lucide-react";

import PageLayout from "../../components/customer/layout/PageLayout";
import heroFood from "../../assets/images/banners/hero-food.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageLayout className="relative bg-black overflow-hidden h-screen w-full">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroFood}
          alt="Background Food"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-orange-50/95 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/95 via-white/80 to-transparent opacity-90" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Branding */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <ChefHat size={56} strokeWidth={2} className="text-orange-500 mb-2" />
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-[#0f172a]">Dine</span>
              <span className="text-orange-500">Ops</span>
            </h1>
            <p className="mt-1 text-[13px] font-semibold text-[#334155]">
              Restaurant Experience
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="mt-16 text-center">
          <h2 className="text-4xl font-extrabold text-[#0f172a] leading-tight">
            Order. Enjoy.<br />Repeat.
          </h2>
          <p className="mt-4 text-[#475569] font-medium tracking-wide">
            Scan &bull; Order &bull; Relax
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 flex justify-between px-2 max-w-sm mx-auto w-full">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-green-50 text-green-500 mb-3">
              <Leaf size={24} />
            </div>
            <span className="text-[11px] font-bold text-[#0f172a] text-center leading-tight">Fresh<br/>Food</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-orange-50 text-orange-500 mb-3">
              <Clock size={24} />
            </div>
            <span className="text-[11px] font-bold text-[#0f172a] text-center leading-tight">Quick<br/>Service</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-blue-50 text-blue-500 mb-3">
              <HeartHandshake size={24} />
            </div>
            <span className="text-[11px] font-bold text-[#0f172a] text-center leading-tight">Seamless<br/>Experience</span>
          </div>
        </div>

        <div className="flex-1"></div>

        {/* Action Button */}
        <div className="pb-8 pt-4 w-full max-w-sm mx-auto">
          <button
            onClick={() => navigate("/customer/customer")}
            className="w-full rounded-2xl bg-orange-500 py-4 text-[17px] font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            Get Started &rarr;
          </button>
        </div>
      </div>
    </PageLayout>
  );
}