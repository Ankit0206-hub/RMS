import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Phone, Users, Utensils, Minus, Plus, ChefHat } from "lucide-react";
import toast from "react-hot-toast";

import PageLayout from "../../components/customer/layout/PageLayout";
import { useApp } from "../../context/AppContext";
import customerApi from "../../services/customerApi";

export default function Customer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrTableId = searchParams.get("table_id");
  const isTableLocked = !!qrTableId;
  const { setCustomerSession } = useApp();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    persons: 1,
    table: "",
  });
  const [requirePin, setRequirePin] = useState(false);
  const [hostName, setHostName] = useState("");
  const [pin, setPin] = useState("");
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await customerApi.getTables();
        setTables(data);
        if (qrTableId) {
          setForm(prev => ({ ...prev, table: qrTableId }));
        } else if (data.length > 0) {
          setForm(prev => ({ ...prev, table: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch tables", err);
      }
    };
    fetchTables();
  }, [qrTableId]);

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
    
    if (requirePin && !pin) {
      toast.error("Please enter the PIN to join the session");
      return;
    }
    
    setLoading(true);
    try {
      const res = await customerApi.startSession({
        table_id: form.table,
        customer_name: form.name,
        customer_phone: form.phone,
        guests: form.persons,
        pin: requirePin ? pin : undefined
      });
      
      if (res.requires_pin) {
        setRequirePin(true);
        setHostName(res.host_name);
        toast.error(`Table is occupied. Please ask ${res.host_name} for the PIN.`);
        setLoading(false);
        return;
      }
      
      // Store session
      if (res.token) {
        localStorage.setItem('customer_token', res.token);
      }
      
      setCustomerSession({
        sessionId: res.session_id,
        tableId: form.table,
        customerName: form.name,
        customerPhone: form.phone,
        sessionPin: res.session_pin
      });
      navigate("/customer/home");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="relative h-[100dvh] w-full overflow-hidden bg-white dark:bg-slate-900">
      {/* Background Image & Glass Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
          alt="Restaurant Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/95 backdrop-blur-[6px] md:backdrop-blur-md" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-6 pt-8 pb-6 md:px-12 md:pt-16 md:pb-8 overflow-hidden">
        
        {/* Top Header / Cancel */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20 flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => navigate("/customer")}
            className="text-[14px] md:text-lg font-bold text-gray-500 dark:text-slate-400 hover:text-red-500 transition"
          >
            Cancel
          </button>
        </div>

        {/* Branding */}
        <div className="flex flex-col items-center justify-center mt-6 md:mt-0 mb-4 md:mb-8">
          <ChefHat className="text-orange-500 mb-1 w-8 h-8 md:w-16 md:h-16" strokeWidth={2.5} />
          <h1 className="text-[24px] md:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0f172a]">Dine</span>
            <span className="text-orange-500">Ops</span>
          </h1>
          <p className="text-[12px] md:text-base font-semibold text-[#334155] tracking-wide">
            Restaurant Experience
          </p>
        </div>

        {/* Header Section */}
        <div className="text-center mb-4 md:mb-10">
          <h2 className="text-[24px] md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">
            Let's Get You Started
          </h2>
          <p className="mt-1 text-[13px] md:text-lg font-medium text-[#475569]">
            Please share a few details to begin
          </p>
        </div>

        {!qrTableId ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-sm md:max-w-lg mx-auto w-full text-center">
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl md:rounded-[1.5rem] p-6 md:p-8 shadow-sm border border-white/50 w-full flex flex-col items-center">
                <div className="bg-orange-100 dark:bg-slate-800 text-orange-500 rounded-full p-4 mb-4">
                  <Utensils className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-[20px] md:text-2xl font-bold text-[#0f172a] mb-2">Scan QR Code</h3>
                <p className="text-[14px] md:text-base text-[#475569]">
                  Please scan the QR code located on your table to view the menu and place your order.
                </p>
             </div>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-5 max-w-sm md:max-w-lg mx-auto w-full">
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
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setForm({ ...form, phone: val });
                    }}
                    maxLength={10}
                    pattern="[0-9]*"
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
                <label className="text-[11px] md:text-[13px] text-gray-500 dark:text-slate-400 font-bold ml-8 md:ml-10 uppercase tracking-wider">Assigned Table</label>
                <div className="flex items-center mt-0.5 md:mt-1.5">
                  <Utensils className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
                  <select
                    value={form.table}
                    onChange={(e) => setForm({ ...form, table: e.target.value })}
                    disabled={true}
                    className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] md:text-lg outline-none appearance-none disabled:opacity-80"
                  >
                    <option value={qrTableId}>{qrTableId} (Scanned Table)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {requirePin && (
              <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-5 max-w-sm md:max-w-lg mx-auto w-full mt-4">
                <div className="rounded-2xl md:rounded-[1.5rem] border-2 border-orange-500 bg-orange-50 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 md:px-6 md:py-4 shadow-sm flex flex-col transition-all">
                  <label className="text-[11px] md:text-[13px] text-orange-600 font-bold ml-8 md:ml-10 uppercase tracking-wider">Session PIN Required</label>
                  <p className="text-[12px] text-gray-600 ml-8 md:ml-10 mb-2">Table is occupied by {hostName}. Ask them for the 4-digit PIN.</p>
                  <div className="flex items-center mt-0.5 md:mt-1.5">
                    <User className="text-[#0f172a] mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      className="w-full bg-transparent font-bold text-[#0f172a] text-[15px] md:text-lg outline-none tracking-[0.5em]"
                    />
                  </div>
                </div>
              </div>
            )}


            <div className="flex-1 min-h-[16px] md:min-h-[32px]"></div>

            {/* Continue Button */}
            <div className="pb-2 pt-4 md:pt-8 mt-auto max-w-sm md:max-w-lg mx-auto w-full">
              <button
                onClick={handleContinue}
                disabled={loading}
                className="w-full rounded-2xl md:rounded-3xl bg-orange-500 py-4 md:py-5 text-[17px] md:text-xl font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Starting..." : "Continue"}
              </button>
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
}