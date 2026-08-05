import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, table }) => {
    if (!isOpen || !table) return null;

    // Generate the URL that customers will scan
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/customer?table_id=${encodeURIComponent(table.table_number)}`;

    const handleDownload = () => {
        const svg = document.getElementById('qr-code-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `Table_${table.table_number}_QR.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const svg = document.getElementById('qr-code-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - Table ${table.table_number}</title>
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            font-family: sans-serif;
                            text-align: center;
                        }
                        .qr-container {
                            border: 2px solid #000;
                            padding: 2rem;
                            border-radius: 1rem;
                        }
                        h1 {
                            font-size: 2.5rem;
                            margin-bottom: 0.5rem;
                        }
                        p {
                            font-size: 1.2rem;
                            color: #666;
                            margin-bottom: 2rem;
                        }
                        svg {
                            width: 300px;
                            height: 300px;
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h1>Table ${table.table_number}</h1>
                        <p>${table.name ? table.name : 'Dine-in'}</p>
                        ${svgData}
                        <p style="margin-top: 1rem; font-size: 0.9rem;">Scan to Order</p>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
                
                {/* Header */}
                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Table QR Code</h2>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Table {table.table_number}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <QRCodeSVG 
                            id="qr-code-svg"
                            value={qrUrl} 
                            size={200}
                            level="H"
                            includeMargin={true}
                            fgColor="#0f172a"
                            bgColor="#ffffff"
                        />
                    </div>
                    <p className="mt-4 text-xs font-semibold text-gray-500 dark:text-slate-400 text-center max-w-[250px]">
                        Customers can scan this code to instantly open the menu for Table {table.table_number}.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-row gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
