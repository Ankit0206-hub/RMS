import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


import heroFood from "../../assets/images/banners/hero-food.png";
// import logo from "../../assets/images/logo.png";

export default function Splash() {
  const navigate = useNavigate();

 useEffect(() => {
  document.body.style.overflow = "hidden";

  const timer = setTimeout(() => {
    document.body.style.overflow = "auto";
    navigate("/customer/landing");
  }, 2500);

  return () => {
    document.body.style.overflow = "auto";
    clearTimeout(timer);
  };
}, [navigate]);

  return (
    <div className="h-screen overflow-hidden bg-linear-to-b from-black via-[#111111] to-[#1b1b1b]">
    <div className="mx-auto flex h-full w-full max-w-107.5 flex-col px-6">

      {/* Logo */}
      <div className="pt-14 flex flex-col items-center">
        <div className="text-5xl">🍲</div>

        <h1 className="mt-3 text-5xl font-bold italic text-orange-500">
          TastyBites
        </h1>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-px w-12 bg-gray-500" />

          <span className="text-xs tracking-[6px] text-gray-300">
            RESTAURANT
          </span>

          <div className="h-px w-12 bg-gray-500" />
        </div>
      </div>

      {/* Tagline */}
      <div className="flex flex-1 items-center justify-center">
        <h2 className="text-center text-4xl font-semibold leading-tight text-white">
          Good Food
          <br />
          Good Mood
        </h2>
      </div>

      {/* Food Image */}
      <div className="flex justify-center">
        <img
          src={heroFood}
          alt="Food"
          className="max-h-70 w-auto object-contain"
        />
      </div>

      {/* Progress */}
      <div className="pb-8 pt-6">
        <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-gray-700">
          <div className="h-full animate-progress rounded-full bg-orange-500" />
        </div>
      </div>

    </div>
  </div>
  );
}