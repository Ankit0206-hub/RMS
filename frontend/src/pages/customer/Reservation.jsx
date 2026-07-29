import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "../../components/customer/layout/MobileContainer";

export default function Reservation() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex h-full flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 px-5 py-4">
          <button onClick={() => navigate('/customer/home')}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">Reservation</h1>
        </div>

        {/* Form */}
        <div className="flex-1 px-5 pt-6">
          <h2 className="mb-6 text-xl font-semibold">
            Reserve a Table
          </h2>

          {/* Date */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-slate-400">
              Select Date
            </label>

            <select className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-orange-500">
              <option>20 May 2024</option>
              <option>21 May 2024</option>
              <option>22 May 2024</option>
            </select>
          </div>

          {/* Time */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-slate-400">
              Select Time
            </label>

            <select className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-orange-500">
              <option>07:00 PM</option>
              <option>08:00 PM</option>
              <option>09:00 PM</option>
            </select>
          </div>

          {/* Persons */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-slate-400">
              Number of Persons
            </label>

            <select className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-orange-500">
              <option>2 People</option>
              <option>3 People</option>
              <option>4 People</option>
              <option>5 People</option>
            </select>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-5">
          <button className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">
            Book Table
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}