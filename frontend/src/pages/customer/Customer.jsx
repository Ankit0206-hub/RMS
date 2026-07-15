import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Users, Utensils, Minus, Plus, ChefHat } from "lucide-react";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";

export default function Customer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    persons: 4,
    table: "Table 07",
  });

  const handleDecreasePersons = () => {
    if (form.persons > 1) {
      setForm({ ...form, persons: form.persons - 1 });
    }
  };

  const handleIncreasePersons = () => {
    setForm({ ...form, persons: form.persons + 1 });
  };

  return (
    <PageLayout className="relative h-screen w-full overflow-hidden bg-white">
      {/* Background Image & Glass Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
          alt="Restaurant Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/95 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-6 pt-12 pb-6 overflow-y-auto">
        
        {/* Top Header / Skip */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={() => navigate("/customer/home")}
            className="text-[14px] font-bold text-[#0f172a] hover:text-orange-600 transition"
          >
            Skip
          </button>
        </div>

        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-5">
          <ChefHat size={40} strokeWidth={2.5} className="text-orange-500 mb-1" />
          <h1 className="text-[28px] font-extrabold tracking-tight leading-tight">
            <span className="text-[#0f172a]">Dine</span>
            <span className="text-orange-500">Ops</span>
          </h1>
          <p className="text-[12px] font-semibold text-[#334155]">
            Restaurant Experience
          </p>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight leading-tight">
            Let's Get You Started
          </h2>
          <p className="mt-1 text-[13px] font-medium text-[#475569]">
            Please share a few details to begin
          </p>
        </div>

        <div className="flex-1 space-y-3 max-w-sm mx-auto w-full">
          {/* Your Name */}
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md px-4 py-2.5 shadow-sm focus-within:border-orange-500 focus-within:bg-white flex flex-col transition-all">
            <label className="text-[11px] text-gray-500 font-bold ml-8 uppercase tracking-wider">Your Name</label>
            <div className="flex items-center mt-0.5">
              <User size={20} className="text-[#0f172a] mr-3" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] outline-none"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md px-4 py-2.5 shadow-sm focus-within:border-orange-500 focus-within:bg-white flex flex-col transition-all">
            <label className="text-[11px] text-gray-500 font-bold ml-8 uppercase tracking-wider">Contact Number</label>
            <div className="flex items-center mt-0.5">
              <Phone size={20} className="text-[#0f172a] mr-3" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] outline-none"
              />
            </div>
          </div>

          {/* Number of People */}
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-[11px] text-gray-500 font-bold ml-8 uppercase tracking-wider">Number of People</label>
              <div className="flex items-center mt-0.5">
                <Users size={20} className="text-[#0f172a] mr-3" />
                <span className="font-bold text-[#0f172a] text-[15px]">{form.persons}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-100/50 rounded-full px-2 py-1">
              <button onClick={handleDecreasePersons} className="p-1 rounded-full hover:bg-white transition">
                <Minus size={16} className="text-[#0f172a]" strokeWidth={3} />
              </button>
              <span className="font-extrabold w-4 text-center text-[#0f172a]">{form.persons}</span>
              <button onClick={handleIncreasePersons} className="p-1 rounded-full hover:bg-white transition">
                <Plus size={16} className="text-[#0f172a]" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Select Table */}
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md px-4 py-2.5 shadow-sm focus-within:border-orange-500 focus-within:bg-white flex flex-col relative transition-all">
            <label className="text-[11px] text-gray-500 font-bold ml-8 uppercase tracking-wider">Select Table</label>
            <div className="flex items-center mt-0.5">
              <Utensils size={20} className="text-[#0f172a] mr-3" />
              <select
                value={form.table}
                onChange={(e) => setForm({ ...form, table: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] outline-none appearance-none"
              >
                <option>Table 01</option>
                <option>Table 02</option>
                <option>Table 07</option>
                <option>Table 12</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[16px]"></div>

        {/* Continue Button */}
        <div className="pb-2 pt-4 max-w-sm mx-auto w-full">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-full rounded-2xl bg-orange-500 py-4 text-[17px] font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>

      </div>
    </PageLayout>
  );
}