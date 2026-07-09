import {
    Home,
    Briefcase,
    MapPin,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import PageLayout from "../../../customer_components/layout/PageLayout";
import { ArrowLeft } from "lucide-react";

export default function Addresses() {
    const navigate = useNavigate();

    const { addresses, addAddress, updateAddress, deleteAddress } =
        useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [form, setForm] = useState({
        type: "Home",
        address: "",
        landmark: "",
        name: "",
        phone: "",
        instructions: "",
        default: false,
    });

    // OPEN ADD
    const openAddModal = () => {
        setEditItem(null);
        setForm({
            type: "Home",
            address: "",
            landmark: "",
            name: "",
            phone: "",
            instructions: "",
            default: false,
        });
        setIsModalOpen(true);
    };

    // OPEN EDIT
    const openEditModal = (item) => {
        setEditItem(item);
        setForm({
            type: item.type || "Home",
            address: item.address || "",
            landmark: item.landmark || "",
            name: item.name || "",
            phone: item.phone || "",
            instructions: item.instructions || "",
            default: item.default || false,
        });
        setIsModalOpen(true);
    };

    // SAVE
    const handleSave = () => {
        if (!form.address) return;

        if (editItem) {
            updateAddress(editItem.id, form);
        } else {
            addAddress(form);
        }

        setIsModalOpen(false);
    };

    return (
        <PageLayout className="bg-gray-50">
            <div className="flex h-full flex-col">

                {/* HEADER */}
                <div className="bg-white px-5 py-6 shadow-sm flex items-center gap-3">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/customer/profile")}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <ArrowLeft size={22} className="text-gray-800 font-bold" />
                    </button>

                    <h1 className="text-xl font-bold">My Addresses</h1>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {addresses?.length === 0 && (
                        <p className="text-center text-gray-500">
                            No addresses added yet
                        </p>
                    )}

                    {addresses?.map((item) => {
                        const Icon =
                            item.type === "Work" ? Briefcase : Home;

                        return (
                            <div
                                key={item.id}
                                className="rounded-3xl bg-white p-5 shadow-sm hover:shadow-md transition"
                            >
                                {/* TOP */}
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
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-sm text-gray-600 leading-6">
                                                {item.address}
                                            </p>

                                            {item.landmark && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Landmark: {item.landmark}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <MapPin
                                        size={18}
                                        className="text-orange-500"
                                    />
                                </div>

                                {/* ACTIONS */}
                                <div className="mt-5 flex justify-end gap-3">

                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteAddress(item.id)}
                                        className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-100 transition"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ADD BUTTON */}
                <div className="border-t bg-white p-5">
                    <button
                        onClick={openAddModal}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-semibold text-white shadow-lg hover:bg-orange-600 transition"
                    >
                        <Plus size={20} />
                        Add New Address
                    </button>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">

                        <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl animate-slideUp">

                            {/* HEADER */}
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    {editItem ? "Edit Address" : "Add Address"}
                                </h2>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* TYPE */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                {["Home", "Work", "Friend", "Hotel", "Other"].map(
                                    (type) => (
                                        <button
                                            key={type}
                                            onClick={() =>
                                                setForm({ ...form, type })
                                            }
                                            className={`px-3 py-1 rounded-full text-sm border transition ${form.type === type
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-white text-gray-600 border-gray-300"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    )
                                )}
                            </div>

                            {/* ADDRESS */}
                            <textarea
                                value={form.address}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        address: e.target.value,
                                    })
                                }
                                placeholder="Full Address"
                                className="mb-3 w-full rounded-2xl border p-3"
                            />

                            {/* LANDMARK */}
                            <input
                                value={form.landmark}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        landmark: e.target.value,
                                    })
                                }
                                placeholder="Nearby Landmark"
                                className="mb-3 w-full rounded-2xl border p-3"
                            />

                            {/* NAME + PHONE */}
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Name"
                                    className="w-1/2 rounded-2xl border p-3"
                                />

                                <input
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="Phone"
                                    className="w-1/2 rounded-2xl border p-3"
                                />
                            </div>

                            {/* INSTRUCTIONS */}
                            <input
                                value={form.instructions}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        instructions: e.target.value,
                                    })
                                }
                                placeholder="Delivery Instructions"
                                className="mb-3 w-full rounded-2xl border p-3"
                            />

                            {/* DEFAULT */}
                            <label className="flex items-center gap-2 text-sm mb-4">
                                <input
                                    type="checkbox"
                                    checked={form.default}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            default: e.target.checked,
                                        })
                                    }
                                />
                                Set as default address
                            </label>

                            {/* SAVE */}
                            <button
                                onClick={handleSave}
                                className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white shadow-md hover:bg-orange-600 transition"
                            >
                                {editItem ? "Update Address" : "Save Address"}
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </PageLayout>
    );
}