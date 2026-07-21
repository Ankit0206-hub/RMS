import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Users, Utensils, Minus, Plus, ChefHat } from "lucide-react";
import toast from "react-hot-toast";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";

export default function Customer() {
  const navigate = useNavigate();
  const { setCustomerSession } = useApp();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    persons: 4,
    table: "",
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await customerApi.getTables();
        setTables(data);
        if (data.length > 0) {
          setForm(prev => ({ ...prev, table: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch tables", err);
      }
    };
    fetchTables();
  }, []);

  const handleDecreasePersons = () => {
    if (form.persons > 1) {
      setForm({ ...form, persons: form.persons - 1 });
    }
  };

  const handleIncreasePersons = () => {
    setForm({ ...form, persons: form.persons + 1 });
  };

  const handleContinue = async () => {
    if (!form.table) {
      toast.error("Please select a table");
      return;
    }
    
    setLoading(true);
    try {
      const res = await customerApi.startSession({
        table_id: form.table,
        customer_name: form.name,
        customer_phone: form.phone,
        guests: form.persons
      });
      // Store session
      if (res.token) {
        localStorage.setItem('customer_token', res.token);
      }
      
      setCustomerSession({
        sessionId: res.session_id,
        tableId: form.table,
        customerName: form.name,
        customerPhone: form.phone
      });
      navigate("/customer/home");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="relative h-screen w-full overflow-hidden bg-white dark:bg-slate-900">
      {/* Background Image & Glass Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
          alt="Restaurant Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/95 backdrop-blur-[6px] md:backdrop-blur-md" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-6 pt-12 pb-6 md:px-12 md:pt-20 md:pb-12 overflow-y-auto">
        
        {/* Top Header / Cancel & Skip */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20 flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => navigate("/customer")}
            className="text-[14px] md:text-lg font-bold text-gray-500 dark:text-slate-400 hover:text-red-500 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate("/customer/home")}
            className="text-[14px] md:text-lg font-bold text-[#0f172a] hover:text-orange-600 transition"
          >
            Skip
          </button>
        </div>

        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-5 md:mb-10">
          <ChefHat className="text-orange-500 mb-1 w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />
          <h1 className="text-[28px] md:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0f172a]">Dine</span>
            <span className="text-orange-500">Ops</span>
          </h1>
          <p className="text-[12px] md:text-base font-semibold text-[#334155] tracking-wide">
            Restaurant Experience
          </p>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-[24px] md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">
            Let's Get You Started
          </h2>
          <p className="mt-1 text-[13px] md:text-lg font-medium text-[#475569]">
            Please share a few details to begin
          </p>
        </div>

        <div className="flex-1 space-y-3 md:space-y-5 max-w-sm md:max-w-lg mx-auto w-full">
          {/* Your Name */}
          <div className="rounded-2xl md:rounded-[1.5rem] border border-white/50 bg-white dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 md:px-6 md:py-4 shadow-sm focus-within:border-orange-500 focus-within:bg-white dark:bg-slate-900 flex flex-col transition-all">
            <label className="text-[11px] md:text-[13px] text-gray-500 dark:text-slate-400 font-bold ml-8 md:ml-10 uppercase tracking-wider">Your Name</label>
            <div className="flex items-center mt-0.5 md:mt-1.5">
              <User className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] md:text-lg outline-none"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="rounded-2xl md:rounded-[1.5rem] border border-white/50 bg-white dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 md:px-6 md:py-4 shadow-sm focus-within:border-orange-500 focus-within:bg-white dark:bg-slate-900 flex flex-col transition-all">
            <label className="text-[11px] md:text-[13px] text-gray-500 dark:text-slate-400 font-bold ml-8 md:ml-10 uppercase tracking-wider">Contact Number</label>
            <div className="flex items-center mt-0.5 md:mt-1.5">
              <Phone className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] md:text-lg outline-none"
              />
            </div>
          </div>

          {/* Number of People */}
          <div className="rounded-2xl md:rounded-[1.5rem] border border-white/50 bg-white dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 md:px-6 md:py-5 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-[11px] md:text-[13px] text-gray-500 dark:text-slate-400 font-bold ml-8 md:ml-10 uppercase tracking-wider">Number of People</label>
              <div className="flex items-center mt-0.5 md:mt-1.5">
                <Users className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-[#0f172a] text-[15px] md:text-lg">{form.persons}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6 bg-gray-100 dark:bg-slate-800/50 md:bg-gray-100 dark:bg-slate-800/70 rounded-full px-2 py-1 md:px-3 md:py-2">
              <button onClick={handleDecreasePersons} className="p-1 md:p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:bg-slate-900 transition">
                <Minus className="text-[#0f172a] w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
              </button>
              <span className="font-extrabold w-4 md:w-6 text-center text-[#0f172a] md:text-lg">{form.persons}</span>
              <button onClick={handleIncreasePersons} className="p-1 md:p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:bg-slate-900 transition">
                <Plus className="text-[#0f172a] w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Select Table */}
          <div className="rounded-2xl md:rounded-[1.5rem] border border-white/50 bg-white dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 md:px-6 md:py-4 shadow-sm focus-within:border-orange-500 focus-within:bg-white dark:bg-slate-900 flex flex-col relative transition-all">
            <label className="text-[11px] md:text-[13px] text-gray-500 dark:text-slate-400 font-bold ml-8 md:ml-10 uppercase tracking-wider">Select Table</label>
            <div className="flex items-center mt-0.5 md:mt-1.5">
              <Utensils className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
              <select
                value={form.table}
                onChange={(e) => setForm({ ...form, table: e.target.value })}
                className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] md:text-lg outline-none appearance-none cursor-pointer"
              >
                {tables.length === 0 && <option value="">No vacant tables</option>}
                {tables.map(t => (
                  <option key={t.id} value={t.id}>{t.id} ({t.capacity} Seats)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[16px] md:min-h-[32px]"></div>

        {/* Continue Button */}
        <div className="pb-2 pt-4 md:pt-8 max-w-sm md:max-w-lg mx-auto w-full">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full rounded-2xl md:rounded-3xl bg-orange-500 py-4 md:py-5 text-[17px] md:text-xl font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Starting..." : "Continue"}
          </button>
        </div>

      </div>
    </PageLayout>
  );
}