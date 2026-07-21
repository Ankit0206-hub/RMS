import {
  Home,
  Briefcase,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import PageLayout from "../../components/customer/layout/PageLayout";

export default function Addresses() {
  const navigate = useNavigate();

  const {
    addresses,
    deleteAddress,
    setEditingAddress, // (we will add this below)
  } = useApp();

  const handleEdit = (item) => {
    setEditingAddress(item);
    navigate("/customer/add-address");
  };

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-6 shadow-sm">
          <h1 className="text-xl font-bold">My Addresses</h1>
        </div>

        {/* Address List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {addresses?.length === 0 && (
            <p className="text-center text-gray-500 dark:text-slate-400">
              No addresses added yet
            </p>
          )}

          {addresses?.map((item) => {
            const Icon = item.type === "Work" ? Briefcase : Home;

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                      <Icon
                        size={22}
                        className="text-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-lg">
                          {item.type}
                        </h2>

                        {item.default && (
                          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
                        {item.address}
                      </p>
                    </div>
                  </div>

                  <MapPin
                    size={18}
                    className="text-orange-500"
                  />
                </div>

                {/* Actions */}
                <div className="mt-5 flex justify-end gap-3">

                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2 text-sm font-medium"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAddress(item.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <div className="border-t bg-white dark:bg-slate-900 p-5">
          <button
            onClick={() => navigate("/customer/add-address")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600"
          >
            <Plus size={20} />
            Add New Address
          </button>
        </div>

      </div>
    </PageLayout>
  );
}