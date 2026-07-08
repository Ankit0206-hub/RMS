import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Modal } from '../../components/ui';

const InvoiceModal = ({ isOpen, onClose, bill }) => {
    if (!bill) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" className="max-w-3xl no-print">
            {/* The standard view for the screen */}
            <div className="p-6 bg-white no-print">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">DINE OPS</h2>
                        <p className="text-sm text-gray-500 mt-1">123 Culinary Avenue, Food City</p>
                        <p className="text-sm text-gray-500">Phone: +91 98765 43210</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-gray-200">INVOICE</h1>
                        <p className="text-sm font-semibold text-gray-900 mt-2">{bill.bill_number}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(bill.generated_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="border-t border-b border-gray-100 py-4 mb-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {bill.session?.customer_name || 'Walk-in Customer'}
                            </p>
                            {bill.session?.customer_phone && (
                                <p className="text-sm text-gray-600">{bill.session.customer_phone}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                bill.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                                bill.payment_status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {bill.payment_status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase">Item</th>
                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase text-center">Qty</th>
                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase text-right">Price</th>
                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bill.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 text-sm text-gray-900 font-medium">{item.item_name}</td>
                                    <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                                    <td className="py-3 text-sm text-gray-600 text-right">₹ {item.price.toFixed(2)}</td>
                                    <td className="py-3 text-sm text-gray-900 font-bold text-right">₹ {item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-6">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-900">₹ {bill.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax</span>
                            <span className="font-semibold text-gray-900">₹ {bill.total_tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Service Charge</span>
                            <span className="font-semibold text-gray-900">₹ {bill.service_charge?.toFixed(2)}</span>
                        </div>
                        {bill.total_discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">- ₹ {bill.total_discount?.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-200">
                            <span>Grand Total</span>
                            <span>₹ {bill.grand_total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Bill
                    </button>
                </div>
            </div>

            {/* The Print Only View */}
            <div className="print-only hidden">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black">DINE OPS</h2>
                    <p className="text-xs text-gray-600">123 Culinary Avenue, Food City</p>
                    <p className="text-xs text-gray-600">Phone: +91 98765 43210</p>
                </div>
                
                <div className="border-b pb-4 mb-4 flex justify-between items-end">
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500">Bill To:</p>
                        <p className="text-sm font-bold">{bill.session?.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-xs">{bill.session?.customer_phone || ''}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold">{bill.bill_number}</p>
                        <p className="text-xs text-gray-500">{new Date(bill.generated_at).toLocaleString()}</p>
                    </div>
                </div>

                <table className="w-full text-left mb-6">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 text-xs uppercase text-gray-600">Item</th>
                            <th className="py-2 text-xs uppercase text-gray-600 text-center">Qty</th>
                            <th className="py-2 text-xs uppercase text-gray-600 text-right">Price</th>
                            <th className="py-2 text-xs uppercase text-gray-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bill.items?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-2 text-sm font-medium">{item.item_name}</td>
                                <td className="py-2 text-sm text-center">{item.quantity}</td>
                                <td className="py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                                <td className="py-2 text-sm font-bold text-right">₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-8">
                    <div className="w-1/2">
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Subtotal</span>
                            <span>₹{bill.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Tax</span>
                            <span>₹{bill.total_tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b pb-2">
                            <span className="text-gray-600">Service Charge</span>
                            <span>₹{bill.service_charge?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black py-2">
                            <span>Total</span>
                            <span>₹{bill.grand_total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500 border-t pt-4">
                    <p>Thank you for dining with us!</p>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceModal;
