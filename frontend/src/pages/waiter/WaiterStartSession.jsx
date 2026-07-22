import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, Users, Minus, Plus, FileText, Info, UserPlus, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import waiterApi from '../../services/waiterApi';

const TableIcon = ({className}) => (
 <svg className={className} viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round">
 <rect x="3"y="8"width="18"height="4"rx="1"/>
 <path d="M5 12v6"/>
 <path d="M19 12v6"/>
 <path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3"/>
 </svg>
);

export default function WaiterStartSession() {
 const navigate = useNavigate();
    const {tableId} = useParams();
    
    // Dummy tables data to fetch capacity
    const tables = [
        {id:'T01', capacity: 4},
        {id:'T02', capacity: 2},
        {id:'T03', capacity: 4},
        {id:'T04', capacity: 4},
        {id:'T05', capacity: 6},
    ];
    const currentTable = tables.find(t => t.id === tableId) || { capacity: 4 };
    const tableCapacity = currentTable.capacity;
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(Math.min(2, tableCapacity));
    const [notes, setNotes] = useState('');

  const handleStartSession = async (e) => {
      e.preventDefault();
      try {
          // The backend currently only needs 'guests'. 
          // We can expand the backend to accept name/phone if needed later.
          const res = await waiterApi.startSession(tableId, { guests });
          toast.success(`Session created for ${name || 'Customer'}!`);
          navigate(`/waiter/tables/${tableId}`, {
              state: {
                  customerName: name,
                  guests: guests,
                  sessionId: res.session_id,
                  isNewSession: true
              }
          });
      } catch (err) {
          toast.error('Failed to create session');
          console.error(err);
      }
  };

 return (
 <div className="flex flex-col w-full h-full relative font-inter">


 <div className="relative z-10 flex flex-col h-full w-full">
 {/* Header */}
 <div className="bg-white/10 backdrop-blur-xl px-4 md:px-6 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-white/20 shrink-0 w-full">
 <div className="max-w-4xl mx-auto w-full flex items-center">
 <button onClick={() => navigate(-1)} className="p-2 text-gray-700 bg-white/20 rounded-full border border-white/40 transition-colors mr-3 shadow-sm">
 <ArrowLeft className="h-5 w-5"strokeWidth={2.5} />
 </button>
 <div className="flex-1">
 <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight leading-tight">Create Session</h1>
 <p className="text-xs md:text-sm text-gray-500 font-medium">Add details to start ordering</p>
 </div>
 <button className="p-2 text-rose-500 rounded-xl bg-rose-100/30 transition-colors hidden sm:block border border-rose-200/50">
 <HelpCircle className="h-5 w-5"strokeWidth={2} />
 </button>
 </div>
 </div>

 {/* Scrollable Content */}
 <div className="w-full pb-8 md:pb-12">
 <div className=" mx-auto w-full px-4 md:px-6 mb-16">
 
 {/* Selected Table Card */}
 <div className="bg-white/20 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-4 md:p-6 flex items-center justify-between mt-5 md:mt-8">
 <div className="flex items-center space-x-4 md:space-x-5">
 <div className="bg-rose-400/90 backdrop-blur-md text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-rose-300">
 <TableIcon className="h-6 w-6 md:h-8 md:w-8"/>
 </div>
 <div>
 <p className="text-[11px] md:text-xs font-bold text-gray-500 mb-0.5 uppercase tracking-wider">Selected Table</p>
 <p className="text-xl md:text-3xl font-black text-gray-800 leading-none">{tableId}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="inline-flex items-center bg-teal-500/10 text-teal-600 px-2 md:px-3 py-1 rounded-xl md:rounded-xl text-[10px] md:text-xs font-bold mb-1.5 border border-teal-200/60 backdrop-blur-md">
 <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-teal-500 rounded-full mr-1.5 md:mr-2"></div>
 Vacant
 </div>
 <p className="text-[10px] md:text-xs text-gray-500 font-medium hidden sm:block">Available since 09:15 AM</p>
 </div>
 </div>

 <h2 className="text-[14px] md:text-base font-black text-gray-800 mt-8 mb-4 md:mb-5 pl-2">Customer Details</h2>

 {/* Form Section */}
 <div className="bg-white/20 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-5 md:p-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
 
 {/* Name Row */}
 <div className="flex items-start space-x-4">
 <div className="bg-white/30 text-rose-500 p-2.5 md:p-3 rounded-2xl shrink-strokeWidth0 mt-1 border border-white/50 backdrop-blur-md">
 <User className="h-5 w-5 md:h-6 md:w-6"strokeWidth={2} />
 </div>
 <div className="flex-1">
 <label className="text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 block">Customer Name <span className="text-rose-500">*</span></label>
 <input 
 type="text"
 placeholder="Rahul Sharma"
 value={name} 
 onChange={e => setName(e.target.value)} 
 className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl px-3.5 py-2.5 md:py-3 md:text-base text-sm font-medium text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all placeholder:text-gray-500"
 />
 </div>
 </div>

 {/* Phone Row */}
 <div className="flex items-start space-x-4">
 <div className="bg-white/30 text-rose-500 p-2.5 md:p-3 rounded-2xl shrink-0 mt-1 border border-white/50 backdrop-blur-md">
 <Phone className="h-5 w-5 md:h-6 md:w-6"strokeWidth={2} />
 </div>
 <div className="flex-1">
 <label className="text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 block">Contact Number <span className="text-rose-500">*</span></label>
 <input 
 type="tel"
 placeholder="+91 98765 43210"
 value={phone} 
 onChange={e => setPhone(e.target.value)} 
 className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl px-3.5 py-2.5 md:py-3 md:text-base text-sm font-medium text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all placeholder:text-gray-500"
 />
 </div>
 </div>

 {/* Guests Row */}
 <div className="flex items-start space-x-4">
 <div className="bg-white/30 text-rose-500 p-2.5 md:p-3 rounded-2xl shrink-0 mt-1 border border-white/50 backdrop-blur-md">
 <Users className="h-5 w-5 md:h-6 md:w-6"strokeWidth={2} />
 </div>
 <div className="flex-1">
 <label className="text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 block">Number of People <span className="text-rose-500">*</span></label>
 <div className="flex items-center max-w-25 max-h-8 rounded-md justify-between border border-gray-300 rounded-2xl p-1 bg-gray-100 backdrop-blur-md">
 <button 
 type="button"
 onClick={() => setGuests(Math.max(1, guests - 1))} 
 className={`p-2 md:p-3  rounded-xl transition-all  ${guests <= 1 ? 'opacity-50 cursor-not-allowed text-gray-400' : 'active:scale-95 text-gray-600'}`}
 disabled={guests <= 1}
 >
 <Minus className="" size={18} strokeWidth={1.5} />
 </button>
 <span className="font-black text-[17px] md:text-xl w-12 text-center text-gray-800">{guests}</span>
 <button 
 type="button"
 onClick={() => setGuests(Math.min(tableCapacity, guests + 1))} 
 className={`p-2 md:p-3  rounded-xl transition-all  ${guests >= tableCapacity ? 'opacity-50 cursor-not-allowed text-gray-400' : 'active:scale-95 text-gray-600'}`}
 disabled={guests >= tableCapacity}
 >
 <Plus className="" size={18} strokeWidth={1.5} />
 </button>
 </div>
 <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 font-medium">Number of adults / guests</p>
 </div>
 </div>

 {/* Special Notes Row */}
 <div className="flex items-start space-x-4">
 <div className="bg-white/30 text-rose-500 p-2.5 md:p-3 rounded-2xl shrink-0 mt-1 border border-white/50 backdrop-blur-md">
 <FileText className="h-5 w-5 md:h-6 md:w-6"strokeWidth={2} />
 </div>
 <div className="flex-1">
 <label className="text-[11px] md:text-xs font-bold text-gray-700 mb-1.5 block">Special Notes (Optional)</label>
 <textarea 
 maxLength={100} 
 value={notes} 
 onChange={e => setNotes(e.target.value)} 
 placeholder="e.g. Birthday celebration, Kids included..."
 className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl px-3.5 py-3 md:text-base text-sm font-medium text-gray-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all min-h-[85px] md:min-h-[100px] resize-none placeholder:text-gray-500 leading-relaxed"
 ></textarea>
 <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium text-right">{notes.length}/100</p>
 </div>
 </div>

 </div>
 </div>

 {/* Session Preview Card */}
 <div className="mt-6 md:mt-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-4 md:p-6 shadow-sm">
 <div className="flex items-center text-gray-600 font-bold text-xs md:text-sm mb-4 md:mb-6 px-1 md:px-2 uppercase tracking-wider">
 <FileText className="h-3.5 w-3.5 md:h-5 md:w-5 mr-1.5 md:mr-2 text-rose-400"/> Preview
 </div>
 <div className="grid grid-cols-4 gap-1 md:gap-4 divide-x divide-white/40">
 <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
 <User className="h-4 w-4 md:h-6 md:w-6 text-rose-400 mb-1.5 md:mb-2.5"strokeWidth={2} />
 <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Customer</span>
 <span className="text-[10px] md:text-sm font-bold text-gray-800 truncate w-full px-1">{name ||'-'}</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
 <Phone className="h-4 w-4 md:h-6 md:w-6 text-rose-400 mb-1.5 md:mb-2.5"strokeWidth={2} />
 <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Phone</span>
 <span className="text-[10px] md:text-sm font-bold text-gray-800 truncate w-full px-1">{phone ||'-'}</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
 <Users className="h-4 w-4 md:h-6 md:w-6 text-rose-400 mb-1.5 md:mb-2.5"strokeWidth={2} />
 <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Guests</span>
 <span className="text-[10px] md:text-sm font-bold text-gray-800">{guests}</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center px-1 md:px-4">
 <TableIcon className="h-4 w-4 md:h-6 md:w-6 text-rose-400 mb-1.5 md:mb-2.5"/>
 <span className="text-[9px] md:text-xs text-gray-500 font-bold mb-0.5 md:mb-1">Table</span>
 <span className="text-[10px] md:text-sm font-bold text-gray-800 truncate w-full px-1">{tableId}</span>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="mt-8 md:mt-10">
 <div className="bg-sky-500/10 text-sky-700 backdrop-blur-md rounded-[12px] p-3 md:p-4 flex items-center mb-4 text-[11px] md:text-sm font-medium border border-sky-200/50">
 <Info className="h-4 w-4 md:h-5 md:w-5 mr-2.5 md:mr-3 shrink-0 text-sky-500"/>
 A new session will be created for this table.
 </div>
 <button 
 onClick={handleStartSession} 
 className="w-full bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-[14px] md:rounded-2xl py-3.5 md:py-4 md:text-lg font-bold text-[15px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center border border-rose-300/50"
 >
 <UserPlus className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3"strokeWidth={2.5} /> Create Session
 </button>
 </div>

 </div>
 </div>
 </div>
 </div>
 );
}
