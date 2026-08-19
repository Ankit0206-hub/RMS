import React, { useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { X, Printer } from 'lucide-react';

const ThermalReceipt = ({ isOpen, onClose, data, items, isA4Format = false }) => {
    const printRef = useRef();
    const { settings } = useSettings();

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const restaurantInfo = {
        name: settings?.restaurant_name || "DineOps Restaurant",
        address: settings?.address || "123 Culinary Street, Food City",
        phone: settings?.contact_phone || "+91 9876543210",
        gst: "GSTIN29ABCDE1234F1Z5"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 bg-black/60 backdrop-blur-sm modal-print-wrapper">
            {/* Modal Controls (Hidden during print) */}
            <div className="absolute top-4 right-4 flex space-x-3 print:hidden">
                <button 
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors"
                >
                    <Printer className="w-5 h-5 mr-2" />
                    Print Receipt
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-md"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div 
                className={`bg-white text-black p-6 shadow-2xl relative print:shadow-none print:p-0 receipt-print-container ${isA4Format ? 'a4-format' : 'thermal-format'}`}
                style={{ 
                    width: isA4Format ? '800px' : '320px', 
                    maxWidth: '100%',
                    fontFamily: isA4Format ? '"Inter", sans-serif' : '"Courier New", Courier, monospace' 
                }}
                ref={printRef}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase mb-1">{restaurantInfo.name}</h2>
                    <p className="text-xs mb-1 whitespace-pre-wrap">{restaurantInfo.address}</p>
                    <p className="text-xs mb-1">Tel: {restaurantInfo.phone}</p>
                    <p className="text-xs mb-1">GSTIN: {restaurantInfo.gst}</p>
                </div>

                <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4 space-y-1">
                    <div className="flex justify-between text-xs">
                        <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                        <span>Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span>Bill No: {data?.bill_number || `SESSION-${data?.session_id || 'TEMP'}`}</span>
                        <span>Table: {data?.table || 'Walk-in'}</span>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-4 text-xs">
                    <thead>
                        <tr className="border-b border-dashed border-gray-400">
                            <th className="text-left pb-1 w-1/2">Item</th>
                            <th className="text-center pb-1 w-1/6">Qty</th>
                            <th className="text-right pb-1 w-1/3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-1.5 align-top pr-2">{item.name}</td>
                                <td className="py-1.5 align-top text-center">{item.qty}</td>
                                <td className="py-1.5 align-top text-right">{(item.price * item.qty).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-dashed border-gray-400 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{data?.subtotal?.toFixed(2)}</span>
                    </div>
                    {data?.service_charge > 0 && (
                        <div className="flex justify-between">
                            <span>Service Chg</span>
                            <span>{data?.service_charge?.toFixed(2)}</span>
                        </div>
                    )}
                    {data?.cgst > 0 && (
                        <div className="flex justify-between">
                            <span>CGST</span>
                            <span>{data?.cgst?.toFixed(2)}</span>
                        </div>
                    )}
                    {data?.sgst > 0 && (
                        <div className="flex justify-between">
                            <span>SGST</span>
                            <span>{data?.sgst?.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-black mt-3 pt-3 mb-6">
                    <div className="flex justify-between font-bold text-sm">
                        <span>GRAND TOTAL</span>
                        <span>Rs. {data?.grand_total?.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs space-y-1">
                    <p className="font-bold">Thank you for dining with us!</p>
                    <p>Have a great day</p>
                    <p className="mt-4 text-[10px] text-gray-500">Powered by {settings?.restaurant_name || 'DineOps'}</p>
                </div>
            </div>

            {/* Print Styles injected locally */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    /* Override modal wrapper to break out of fixed positioning */
                    .modal-print-wrapper {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: auto !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        backdrop-filter: none !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Show only the receipt container and its children */
                    .receipt-print-container, 
                    .receipt-print-container * {
                        visibility: visible;
                    }
                    .thermal-format {
                        position: static !important;
                        width: 80mm !important; /* Thermal printer standard width */
                        margin: 0 auto !important;
                        padding: 0 4mm !important; /* Margin from edges to prevent cut off */
                        box-shadow: none !important;
                    }
                    .a4-format {
                        position: static !important;
                        width: 100% !important;
                        max-width: 210mm !important;
                        margin: 0 auto !important;
                        padding: 10mm 15mm !important; /* Standard A4 padding */
                        box-shadow: none !important;
                    }
                    @page {
                        margin: 0;
                    }
                    @media print and (max-width: 80mm) {
                        @page { size: 80mm auto; }
                    }
                }
            `}} />
        </div>
    );
};

export default ThermalReceipt;
