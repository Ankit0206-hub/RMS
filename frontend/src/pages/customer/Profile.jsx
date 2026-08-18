import { useState } from "react";
import { User, Mail, Phone, Edit2, Check, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import PageLayout from "../../components/customer/layout/PageLayout";
import ImageCropModal from "../../components/customer/common/ImageCropModal";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const { user, updateUser, customerSession } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    
    const [formData, setFormData] = useState({
        name: customerSession?.customerName || user.name || "",
        email: user.email || "",
        phone: customerSession?.customerPhone || user.phone || "",
        image: user.image || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
        // Reset the input value so the same file can be selected again if needed
        e.target.value = null;
    };

    const handleCropComplete = (croppedBase64) => {
        setFormData(prev => ({ ...prev, image: croppedBase64 }));
        setCropImageSrc(null);
        setIsEditing(true);
    };

    const handleSave = () => {
        updateUser(formData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const handleCancel = () => {
        setFormData({
            name: customerSession?.customerName || user.name || "",
            email: user.email || "",
            phone: customerSession?.customerPhone || user.phone || "",
            image: user.image || "",
        });
        setIsEditing(false);
    };

    return (
        <PageLayout className="bg-gray-50 dark:bg-slate-800/50">
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 px-5 py-4 shadow-sm flex items-center justify-between relative z-10">
                    <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Profile</h1>
                    <div className="flex items-center gap-2">
                        {formData.email !== user.email && !isEditing && (
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-bold shadow-sm active:scale-95 transition"
                            >
                                <Check size={14} /> Save
                            </button>
                        )}
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-bold active:scale-95 transition"
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        ) : (
                            <div className="w-[72px]"></div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 pb-32">
                    <div className=" mx-auto w-full">
                        {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <img
                                src={(isEditing ? formData.image : user.image) || "https://i.pravatar.cc/150?img=12"}
                                alt="Profile"
                                className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-sm"
                            />
                            <label className="absolute bottom-0 right-0 p-2.5 bg-orange-500 rounded-full text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageChange} 
                                />
                                <Edit2 size={16} strokeWidth={2.5} />
                            </label>
                        </div>
                    </div>

                    {/* Details Form / View */}
                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 space-y-5">
                        
                        {/* Name */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                            {isEditing ? (
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl text-[15px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-orange-500" />
                                    <p className="text-[15px] font-bold text-gray-900 dark:text-white">{customerSession?.customerName || user.name}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-50 dark:border-slate-800/50"></div>

                        {/* Email */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Add Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl text-[15px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition placeholder:text-gray-400 dark:text-slate-500 dark:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-50 dark:border-slate-800/50"></div>

                        {/* Phone */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl text-[15px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:bg-white dark:bg-slate-900 transition"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-orange-500" />
                                    <p className="text-[15px] font-bold text-gray-900 dark:text-white">{customerSession?.customerPhone || user.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center gap-4 mt-10">
                            <button 
                                onClick={handleCancel}
                                className="flex-1 h-14 sm:h-16 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-bold text-[16px] sm:text-[17px] rounded-2xl active:scale-97 transition-transform flex items-center justify-center gap-2"
                            >
                                <X size={20} strokeWidth={2.5} /> Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-[1.5] sm:flex-[2] h-14 sm:h-16 bg-orange-500 text-white font-bold text-[16px] sm:text-[17px] rounded-2xl shadow-[0_8px_25px_rgba(249,115,22,0.3)] active:scale-97 transition-transform flex items-center justify-center gap-2"
                            >
                                <Check size={20} strokeWidth={2.5} /> Save Changes
                            </button>
                        </div>
                    )}

                    </div>
                </div>
            </div>

            {/* Cropper Modal */}
            <ImageCropModal 
                isOpen={!!cropImageSrc}
                imageSrc={cropImageSrc}
                onClose={() => setCropImageSrc(null)}
                onCropComplete={handleCropComplete}
            />
        </PageLayout>
    );
}