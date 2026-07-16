import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, Users, Minus, Plus, FileText, Info, UserPlus, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TableIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M5 12v6" />
        <path d="M19 12v6" />
        <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
    </svg>
);

export default function WaiterStartSession() {
    const navigate = useNavigate();
    const { tableId } = useParams();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(4);
    const [notes, setNotes] = useState('');

    const handleStartSession = (e) => {
        e.preventDefault();
        if(!name) {
            toast.error('Please enter customer name');
            return;
        }
        toast.success(`Session created for ${name}!`);
        navigate(`/waiter/tables/${tableId}`, {
            state: {
                customerName: name,
                guests: guests,
                isNewSession: true
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafc] font-inter overflow-hidden">
            
            {/* Header */}
            <div className="bg-white px-4 md:px-6 py-4 flex items-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] z-20 shrink-0 w-full">
                <div className="max-w-4xl mx-auto w-full flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 rounded-full hover:bg-gray-50 mr-2 md:mr-4 transition-colors">
                        <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-tight">Create Customer Session</h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Add customer details to start ordering</p>
                    </div>
                    <button className="p-2 text-orange-500 rounded-xl hover:bg-orange-50 transition-colors hidden sm:block">
                        <HelpCircle className="h-5 w-5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full hide-scrollbar pb-16 md:pb-24 relative">
                <div className="max-w-4xl mx-auto w-full px-4 md:px-6">
                    
                    {/* Selected Table Card */}
                    <div className="bg-[#fff7f2] border border-[#ffe4d6] rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center justify-between mt-5 md:mt-8">
                        <div className="flex items-center space-x-4 md:space-x-5">
                            <div className="bg-[#ff5722] text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm shadow-orange-500/20">
                                <TableIcon className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <div>
                                <p className="text-[11px] md:text-xs font-bold text-gray-600 mb-0.5">Selected Table</p>
                                <p className="text-xl md:text-3xl font-black text-[#ff5722] leading-none">{tableId}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center bg-green-50 text-green-600 px-2 md:px-3 py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold mb-1.5 border border-green-200/60">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-1.5 md:mr-2"></div>
                                Vacant
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium hidden sm:block">Available since 09:15 AM</p>
                        </div>
                    </div>

                    <h2 className="text-[14px] md:text-base font-bold text-gray-900 mt-8 mb-4 md:mb-5">Customer Details</h2>

                    {/* Form Section */}
                    <div className="bg-white border border-gray-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] rounded-2xl md:rounded-3xl p-5 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            
                            {/* Name Row */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#fff7f2] text-[#ff5722] p-2.5 md:p-3 rounded-[12px] md:rounded-2xl shrink-0 mt-1">
                                    <User className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] md:text-xs font-bold text-gray-800 mb-1.5 block">Customer Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Rahul Sharma" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-[12px] md:rounded-xl px-3.5 py-2.5 md:py-3 md:text-base text-sm font-medium text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all placeholder:text-gray-400" 
                                    />
                                </div>
                            </div>

                            {/* Phone Row */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#fff7f2] text-[#ff5722] p-2.5 md:p-3 rounded-[12px] md:rounded-2xl shrink-0 mt-1">
                                    <Phone className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] md:text-xs font-bold text-gray-800 mb-1.5 block">Contact Number <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        placeholder="+91 98765 43210" 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-[12px] md:rounded-xl px-3.5 py-2.5 md:py-3 md:text-base text-sm font-medium text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all placeholder:text-gray-400" 
                                    />
                                </div>
                            </div>

                            {/* Guests Row */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#fff7f2] text-[#ff5722] p-2.5 md:p-3 rounded-[12px] md:rounded-2xl shrink-0 mt-1">
                                    <Users className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] md:text-xs font-bold text-gray-800 mb-1.5 block">Number of People <span className="text-red-500">*</span></label>
                                    <div className="flex items-center justify-between border border-gray-200 rounded-[12px] md:rounded-xl p-1 bg-white">
                                        <button 
                                            type="button" 
                                            onClick={() => setGuests(Math.max(1, guests - 1))} 
                                            className="p-2 md:p-3 bg-gray-50 rounded-[9px] md:rounded-lg hover:bg-gray-100 active:scale-95 text-gray-600 transition-all"
                                        >
                                            <Minus className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
                                        </button>
                                        <span className="font-bold text-[17px] md:text-xl w-12 text-center text-gray-900">{guests}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setGuests(guests + 1)} 
                                            className="p-2 md:p-3 bg-gray-50 rounded-[9px] md:rounded-lg hover:bg-gray-100 active:scale-95 text-gray-600 transition-all"
                                        >
                                            <Plus className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 font-medium">Number of adults / guests</p>
                                </div>
                            </div>

                            {/* Special Notes Row */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#fff7f2] text-[#ff5722] p-2.5 md:p-3 rounded-[12px] md:rounded-2xl shrink-0 mt-1">
                                    <FileText className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] md:text-xs font-bold text-gray-800 mb-1.5 block">Special Notes (Optional)</label>
                                    <textarea 
                                        maxLength={100} 
                                        value={notes} 
                                        onChange={e => setNotes(e.target.value)} 
                                        placeholder="e.g. Birthday celebration, Kids included..." 
                                        className="w-full border border-gray-200 rounded-[12px] md:rounded-xl px-3.5 py-3 md:text-base text-sm font-medium text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all min-h-[85px] md:min-h-[100px] resize-none placeholder:text-gray-400 leading-relaxed"
                                    ></textarea>
                                    <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-medium text-right">{notes.length}/100</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Session Preview Card */}
                    <div className="mt-6 md:mt-8 bg-[#fffcfb] border border-[#ffe4d6] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm shadow-orange-500/5">
                        <div className="flex items-center text-[#ff5722] font-bold text-xs md:text-sm mb-4 md:mb-6 px-1 md:px-2">
                            <FileText className="h-3.5 w-3.5 md:h-5 md:w-5 mr-1.5 md:mr-2" /> Session Preview
                        </div>
                        <div className="grid grid-cols-4 gap-1 md:gap-4 divide-x divide-[#ffedd6]">
                            <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
                                <User className="h-4 w-4 md:h-6 md:w-6 text-[#ff5722] mb-1.5 md:mb-2.5" strokeWidth={2} />
                                <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Customer</span>
                                <span className="text-[10px] md:text-sm font-bold text-gray-900 truncate w-full px-1">{name || '-'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
                                <Phone className="h-4 w-4 md:h-6 md:w-6 text-[#ff5722] mb-1.5 md:mb-2.5" strokeWidth={2} />
                                <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Phone</span>
                                <span className="text-[10px] md:text-sm font-bold text-gray-900 truncate w-full px-1">{phone || '-'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
                                <Users className="h-4 w-4 md:h-6 md:w-6 text-[#ff5722] mb-1.5 md:mb-2.5" strokeWidth={2} />
                                <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Guests</span>
                                <span className="text-[10px] md:text-sm font-bold text-gray-900">{guests}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
                                <TableIcon className="h-4 w-4 md:h-6 md:w-6 text-[#ff5722] mb-1.5 md:mb-2.5" />
                                <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Table</span>
                                <span className="text-[10px] md:text-sm font-bold text-gray-900 truncate w-full px-1">{tableId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 md:mt-10">
                        <div className="bg-[#f0f7ff] text-[#2563eb] rounded-[12px] p-3 md:p-4 flex items-center mb-4 text-[11px] md:text-sm font-medium border border-[#dbeafe]">
                            <Info className="h-4 w-4 md:h-5 md:w-5 mr-2.5 md:mr-3 shrink-0 text-[#3b82f6]" />
                            A new session will be created for this table.
                        </div>
                        <button 
                            onClick={handleStartSession} 
                            className="w-full bg-[#ff5722] text-white rounded-[14px] md:rounded-2xl py-3.5 md:py-4 md:text-lg font-bold text-[15px] shadow-md shadow-orange-500/20 hover:bg-[#f4511e] hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98] flex items-center justify-center"
                        >
                            <UserPlus className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" strokeWidth={2.5} /> Create Session
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
