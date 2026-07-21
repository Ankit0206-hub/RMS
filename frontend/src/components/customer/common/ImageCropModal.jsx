import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check } from "lucide-react";
import getCroppedImg from "../../../utils/cropImage";

export default function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            setIsProcessing(true);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error("Error cropping image:", e);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 text-white">
                <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full active:scale-95 transition">
                    <X size={24} />
                </button>
                <span className="font-bold text-lg drop-shadow-md">Move and Scale</span>
                <button 
                    onClick={handleSave} 
                    disabled={isProcessing}
                    className="p-2 bg-orange-500 rounded-full text-white font-bold active:scale-95 transition disabled:opacity-50"
                >
                    <Check size={24} />
                </button>
            </div>
            
            {/* Cropper Area */}
            <div className="relative flex-1 bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={setZoom}
                    restrictPosition={true}
                />
            </div>
            
            {/* Footer / Zoom Controls */}
            <div className="p-8 pb-12 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent z-10 flex flex-col items-center">
                <label className="text-white text-xs font-bold uppercase tracking-widest mb-4 opacity-80">Zoom</label>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full max-w-sm accent-orange-500 h-1.5 bg-white dark:bg-slate-900/20 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}
