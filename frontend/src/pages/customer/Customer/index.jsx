import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../../customer_components/layout/PageLayout";
import BottomNav from "../../../customer_components/navigation/BottomNav";

export default function Customer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "John Doe",
    phone: "+91 98765 43210",
    persons: "2",
    note: "No onions, please",
  });

  return (
    <PageLayout className="bg-white flex flex-col">

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-8">

        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about you
        </h2>

        <p className="mt-1 mb-7 text-sm text-gray-500">
          Please enter your details
        </p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">
            Full Name
          </label>

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="h-11 w-full rounded-lg border border-gray-200 px-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">
            Phone Number
          </label>

          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="h-11 w-full rounded-lg border border-gray-200 px-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* Persons */}
        <div className="mb-4">
          <label className="mb-2 block text-xs text-gray-500">
            Number of Persons
          </label>

          <select
            value={form.persons}
            onChange={(e) =>
              setForm({ ...form, persons: e.target.value })
            }
            className="h-11 w-full rounded-lg border border-gray-200 px-4 outline-none focus:border-orange-500"
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <label className="mb-2 block text-xs text-gray-500">
            Special Instructions (Optional)
          </label>

          <textarea
            rows={3}
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
            className="h-20 w-full resize-none rounded-lg border border-gray-200 p-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* Continue */}
        <button
          onClick={() => navigate("/customer/home")}
          className="mb-3 h-11 w-full rounded-xl bg-orange-500 font-medium text-white transition hover:bg-orange-600"
        >
          Continue
        </button>

      </div>

      <BottomNav />

    </PageLayout>
  );
}