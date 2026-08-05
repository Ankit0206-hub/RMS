import { useNavigate, useSearchParams } from "react-router-dom";
import { ChefHat, Leaf, Clock, HeartHandshake } from "lucide-react";

import PageLayout from "../../components/customer/layout/PageLayout";
import heroFood from "../../assets/images/banners/hero-food.png";

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return (
    <PageLayout className="relative bg-black overflow-hidden h-screen w-full">
      {/* Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroFood}
          alt="Background Food"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white/95 md:from-white/50 md:via-white/70 md:to-white/90" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-6 md:p-12 overflow-y-auto">
        
        {/* Branding */}
        <div className="mt-8 md:mt-16 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/60 mb-4 animate-[bounce_3s_ease-in-out_infinite]">
              <ChefHat className="text-orange-500 w-12 h-12 md:w-20 md:h-20" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-sm">
              <span className="text-slate-900 dark:text-white">Dine</span>
              <span className="text-orange-500">Ops</span>
            </h1>
            <p className="mt-2 text-sm md:text-lg font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] drop-shadow-sm">
              Restaurant Experience
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="mt-12 md:mt-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight drop-shadow-md">
            Order. Enjoy.<br className="md:hidden" /> Repeat.
          </h2>
          <p className="mt-4 md:mt-8 text-[15px] md:text-xl text-slate-700 dark:text-slate-300 font-bold tracking-widest uppercase">
            Scan <span className="mx-2 text-orange-500">•</span> Order <span className="mx-2 text-orange-500">•</span> Relax
          </p>
        </div>

        <div className="flex-1 min-h-[2rem]"></div>

        {/* Features */}
        <div className="mt-4 md:mt-12 flex justify-between px-2 max-w-sm md:max-w-3xl mx-auto w-full gap-4 md:gap-12">
          
          <div className="flex flex-col items-center flex-1">
            <div className="flex h-16 w-16 md:h-28 md:w-28 items-center justify-center rounded-[1.25rem] md:rounded-[2rem] bg-white dark:bg-slate-900/70 backdrop-blur-md shadow-xl border border-white/60 text-green-600 mb-3 md:mb-5">
              <Leaf className="w-7 h-7 md:w-12 md:h-12" />
            </div>
            <span className="text-[12px] md:text-lg font-bold text-slate-900 dark:text-white text-center leading-tight drop-shadow-sm">Fresh<br/>Food</span>
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <div className="flex h-16 w-16 md:h-28 md:w-28 items-center justify-center rounded-[1.25rem] md:rounded-[2rem] bg-white dark:bg-slate-900/70 backdrop-blur-md shadow-xl border border-white/60 text-orange-600 mb-3 md:mb-5">
              <Clock className="w-7 h-7 md:w-12 md:h-12" />
            </div>
            <span className="text-[12px] md:text-lg font-bold text-slate-900 dark:text-white text-center leading-tight drop-shadow-sm">Quick<br/>Service</span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="flex h-16 w-16 md:h-28 md:w-28 items-center justify-center rounded-[1.25rem] md:rounded-[2rem] bg-white dark:bg-slate-900/70 backdrop-blur-md shadow-xl border border-white/60 text-blue-600 mb-3 md:mb-5">
              <HeartHandshake className="w-7 h-7 md:w-12 md:h-12" />
            </div>
            <span className="text-[12px] md:text-lg font-bold text-slate-900 dark:text-white text-center leading-tight drop-shadow-sm">Seamless<br/>Experience</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="pb-8 pt-10 md:pt-16 w-full max-w-sm md:max-w-md mx-auto">
          <button
            onClick={() => navigate(`/customer/customer${queryString}`)}
            className="w-full rounded-[1.25rem] md:rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 py-4 md:py-6 text-[18px] md:text-2xl font-extrabold text-white shadow-2xl shadow-orange-500/40 active:scale-[0.98] transition-transform"
          >
            Get Started &rarr;
          </button>
        </div>
        
      </div>
    </PageLayout>
  );
}