import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import PageLayout from "../../components/customer/layout/PageLayout";
import Button from "../../components/customer/ui/Button";

export default function EditProfile() {
    const navigate = useNavigate();

    const { user, updateUser } = useApp();

    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [email, setEmail] = useState(user.email);

    return (
        <PageLayout className="bg-gray-50 dark:bg-slate-800/50">
            <div className="flex h-full flex-col">

                {/* Header */}
                <div className="flex items-center bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={22} />
                    </button>

                    <h1 className="flex-1 text-center text-lg font-semibold mr-6">
                        Edit Profile
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6">

                    {/* Avatar */}

                    <div className="flex flex-col items-center">

                        <div className="relative">

                            <img
                                src="https://i.pravatar.cc/200?img=12"
                                alt="Profile"
                                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
                            />

                            <button className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                                <Camera size={18} />
                            </button>

                        </div>

                        <p className="mt-4 text-gray-500 dark:text-slate-400 text-sm">
                            Tap camera to change profile photo
                        </p>

                    </div>

                    {/* Form */}

                    <div className="mt-8 space-y-5">

                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 dark:border-slate-700 px-4 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 dark:border-slate-700 px-4 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 rounded-xl border border-gray-200 dark:border-slate-700 px-4 outline-none focus:border-orange-500"
                            />
                        </div>

                    </div>

                </div>

                {/* Bottom Button */}

                <div className="border-t bg-white dark:bg-slate-900 p-5">

                    <Button
                        onClick={() => {
                            updateUser({
                                name,
                                phone,
                                email,
                            });

                            navigate("/customer/profile");
                        }}
                    >
                        Save Changes
                    </Button>

                </div>

            </div>
        </PageLayout>
    );
}