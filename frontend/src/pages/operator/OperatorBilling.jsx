import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getWsUrl } from "../../services/api";
import {
  Search,
  ChevronDown,
  User,
  Users,
  Clock,
  Trash2,
  Info,
  CheckCircle2,
  Circle,
  Banknote,
  CreditCard,
  Smartphone,
  SplitSquareHorizontal,
  Receipt,
  Plus,
  ArrowRight,
  Check,
  Calendar,
  Coffee,
  FileText,
  Printer,
  PauseCircle,
  Download,
} from "lucide-react";
import ThermalReceipt from "../../components/ThermalReceipt";

const OperatorBilling = () => {
  const queryClient = useQueryClient();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mainTab, setMainTab] = useState("Active"); // 'Active' or 'Recent'
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Active Sessions
  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery({
    queryKey: ["operator-sessions"],
    queryFn: async () => {
      const res = await api.get("/admin/ordering/sessions?page_size=100");
      return res.data.data;
    },
  });

  // Fetch Pending Bills (Generated but not paid)
  const { data: pendingBillsResponse } = useQuery({
    queryKey: ["operator-pending-bills"],
    queryFn: async () => {
      const res = await api.get(
        "/admin/billing/bills?payment_status=Pending&page_size=100",
      );
      return res.data.data;
    },
  });

  // Fetch Paid Bills (Recent)
  const { data: paidBillsResponse, isLoading: paidBillsLoading } = useQuery({
    queryKey: ["operator-paid-bills"],
    queryFn: async () => {
      const res = await api.get(
        "/admin/billing/bills?payment_status=Paid&page_size=100",
      );
      return res.data.data;
    },
  });

  // Process Active Items
  const activeItems = useMemo(() => {
    return (sessionsResponse || [])
      .filter((s) => s.status !== "Completed")
      .map((session) => {
        const startedAtDate = new Date(session.created_at.replace('Z', ''));
        const startedAt = startedAtDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const diffMs = new Date() - startedAtDate;
        let diffMins = Math.floor(diffMs / 60000);
        // Fallback in case of timezone issues where DB stores UTC but we parse as local
        if (diffMins < 0 && diffMins < -300) {
            // It might be stored as UTC but parsed as local without 'Z', meaning diffMs is large negative
            diffMins = diffMins + 330; 
        }
        diffMins = Math.max(0, diffMins);

        const matchingBill = (pendingBillsResponse || []).find(
          (b) => b.session_id === session.id,
        );
        const status = matchingBill
          ? "Pending Billing"
          : session.bill_requested
            ? "Bill Requested"
            : session.status === "Active"
              ? "Active"
              : "Preparing";

        let total = 0;
        if (matchingBill) {
          total = matchingBill.grand_total;
        } else {
          session.orders.forEach((o) => {
            if (o.status !== "Cancelled") {
              o.items.forEach(
                (i) => (total += parseFloat(i.price_at_order) * i.quantity),
              );
            }
          });
          total = total * 1.1; // approx tax
        }

        return {
          id: session.id,
          type: "session",
          status,
          customer: session.customer_name 
            ? `${session.customer_name} (${session.table_name || 'Table ' + session.table_id})` 
            : (session.table_name || `Table ${session.table_id || 'Walk-in'}`),
          pax: session.number_of_people || 1,
          time: `${diffMins} min`,
          orderType: session.table_id ? "Dine In" : "Takeaway",
          table_id: session.table_id,
          startedAt,
          originalData: session,
          matchingBill,
          displayTotal: total,
        };
      })
      .filter(
        (item) =>
          item.id.toString().includes(searchQuery) ||
          item.customer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        if (a.status === "Bill Requested" && b.status !== "Bill Requested") return -1;
        if (b.status === "Bill Requested" && a.status !== "Bill Requested") return 1;
        return 0;
      });
  }, [sessionsResponse, pendingBillsResponse, searchQuery]);

  // Process Recent Items
  const recentItems = useMemo(() => {
    return (paidBillsResponse || [])
      .map((bill) => {
        const lastPayment =
          bill.payments && bill.payments.length > 0
            ? bill.payments[bill.payments.length - 1]
            : null;
        const completedDate = lastPayment
          ? new Date(lastPayment.created_at)
          : new Date(bill.generated_at || bill.created_at);
        const generatedAt = completedDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          id: bill.id,
          type: "bill",
          status: "Billed",
          bill_number: bill.bill_number,
          customer: bill.session?.customer_name
            ? `${bill.session.customer_name} (${bill.session.table_name || 'Table ' + bill.session.table_id})`
            : (bill.session?.table_name || `Table ${bill.session?.table_id || 'Walk-in'}`),
          pax: bill.session?.number_of_people || "-",
          time: generatedAt,
          orderType: "Completed",
          startedAt: generatedAt,
          originalData: bill,
          displayTotal: bill.grand_total,
          completedTimestamp: completedDate.getTime(),
        };
      })
      .filter(
        (item) =>
          item.id.toString().includes(searchQuery) ||
          (item.bill_number &&
            item.bill_number.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => b.completedTimestamp - a.completedTimestamp);
  }, [paidBillsResponse, searchQuery]);

  // WebSocket Listener
  useEffect(() => {
    const token = localStorage.getItem("token");
    const wsUrl = `${getWsUrl()}/ws/operator?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.event === "CUSTOMER_REQUESTED_BILL" ||
          data.event === "WAITER_REQUESTED_BILL" ||
          data.event === "NEW_ORDER"
        ) {
          queryClient.invalidateQueries({ queryKey: ["operator-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["operator-pending-bills"] });
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [queryClient]);

  const displayedList = mainTab === "Active" ? activeItems : recentItems;

  useEffect(() => {
    if (!selectedId && displayedList.length > 0) {
      setSelectedId(displayedList[0].id);
    }
  }, [displayedList, selectedId, mainTab]);

  const selectedItem = displayedList.find((i) => i.id === selectedId);

  // Aggregate items for selected session/bill
  const currentOrderItems = useMemo(() => {
    const items = [];
    if (!selectedItem) return items;

    if (selectedItem.type === "session") {
      selectedItem.originalData.orders.forEach((order) => {
        if (order.status !== "Cancelled") {
          order.items.forEach((item) => {
            const existing = items.find((i) => i.id === item.menu_item_id);
            if (existing) existing.qty += item.quantity;
            else {
              items.push({
                id: item.menu_item_id,
                name: item.menu_item_name,
                qty: item.quantity,
                price: parseFloat(item.price_at_order),
                img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
              });
            }
          });
        }
      });
    } else if (selectedItem.type === "bill") {
      (selectedItem.originalData.items || []).forEach((item, idx) => {
        items.push({
          id: item.menu_item_id || `bill-item-${item.id || idx}`,
          name: item.item_name || 'Unknown Item',
          qty: item.quantity || 1,
          price: parseFloat(item.price || 0),
          img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
        });
      });
    }
    return items;
  }, [selectedItem]);

  // Calculations
  const matchingBill =
    selectedItem?.matchingBill ||
    (selectedItem?.type === "bill" ? selectedItem.originalData : null);
  const subtotal = matchingBill
    ? matchingBill.subtotal
    : currentOrderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const serviceCharge = matchingBill
    ? matchingBill.service_charge
    : subtotal * 0.05;
  const cgst = matchingBill ? matchingBill.total_tax / 2 : subtotal * 0.025;
  const sgst = matchingBill ? matchingBill.total_tax / 2 : subtotal * 0.025;
  const totalAmount = matchingBill
    ? matchingBill.subtotal +
      matchingBill.service_charge +
      matchingBill.total_tax
    : subtotal + serviceCharge + cgst + sgst;

  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isRoundOff, setIsRoundOff] = useState(false);

  const discountAmount = matchingBill 
    ? matchingBill.total_discount 
    : totalAmount * (discountPercentage / 100);
    
  const totalAfterDiscount = totalAmount - discountAmount;
  
  const grandTotal = matchingBill
    ? matchingBill.grand_total
    : Math.ceil(totalAfterDiscount);
    
  const roundOffDiff = matchingBill 
    ? 0 
    : grandTotal - totalAfterDiscount;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [paymentReceived, setPaymentReceived] = useState(grandTotal);

  useEffect(() => {
    setPaymentReceived(grandTotal);
  }, [grandTotal, selectedItem]);

  // Mutations
  const generateBillMutation = useMutation({
    mutationFn: async ({ sessionId, discount }) =>
      (await api.post("/admin/billing/bills", { session_id: sessionId, discount_percentage: discount })).data,
    onSuccess: () => {
      toast.success("Bill generated successfully!", { icon: "🧾" });
      queryClient.invalidateQueries({ queryKey: ["operator-pending-bills"] });
      queryClient.invalidateQueries({ queryKey: ["operator-sessions"] });
      setIsReceiptOpen(true);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error generating bill"),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ billId, amount, method }) =>
      (
        await api.post(`/admin/billing/bills/${billId}/payments`, {
          amount,
          payment_method: method,
        })
      ).data,
    onSuccess: () => {
      toast.success("Payment recorded successfully!", { icon: "🎉" });
      queryClient.invalidateQueries({ queryKey: ["operator-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["operator-pending-bills"] });
      queryClient.invalidateQueries({ queryKey: ["operator-paid-bills"] });
      if (mainTab === "Active") setSelectedId(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error recording payment"),
  });

  const [splitAmounts, setSplitAmounts] = useState({ Cash: "", UPI: "", Card: "" });

  const handleGenerateBill = () => {
    if (!selectedItem || selectedItem.type !== "session") return;
    generateBillMutation.mutate({ sessionId: selectedItem.id, discount: discountPercentage });
  };

  const handleProceedToBill = async () => {
    if (!selectedItem) return;
    const billId = selectedItem.matchingBill?.id;
    if (!billId) {
      toast.error("Please generate the bill first!");
      return;
    }
    
    if (selectedPaymentMethod === "Split") {
      const payments = Object.entries(splitAmounts)
        .map(([method, amount]) => ({ method, amount: parseFloat(amount) || 0 }))
        .filter((p) => p.amount > 0);
        
      const totalSplit = payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalSplit - grandTotal) > 0.01) {
        toast.error(`Split amounts (₹${totalSplit.toFixed(2)}) must equal Grand Total (₹${grandTotal.toFixed(2)})`);
        return;
      }
      
      try {
        const loadingToast = toast.loading("Recording split payments...");
        await Promise.all(
          payments.map((p) =>
            api.post(`/admin/billing/bills/${billId}/payments`, {
              amount: p.amount,
              payment_method: p.method,
            })
          )
        );
        toast.dismiss(loadingToast);
        toast.success("Split payments recorded successfully!", { icon: "🎉" });
        queryClient.invalidateQueries({ queryKey: ["operator-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["operator-pending-bills"] });
        queryClient.invalidateQueries({ queryKey: ["operator-paid-bills"] });
        if (mainTab === "Active") setSelectedId(null);
      } catch (err) {
        toast.error("Error recording split payments");
      }
    } else {
      recordPaymentMutation.mutate({
        billId,
        amount: paymentReceived,
        method: selectedPaymentMethod,
      });
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-500/20";
      case "Preparing":
        return "bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-500/20";
      case "Pending Billing":
        return "bg-orange-500/10 text-orange-600 border-orange-200/50 dark:border-orange-500/20";
      case "Bill Requested":
        return "bg-rose-500/10 text-rose-600 border-rose-200/50 dark:border-rose-500/20 font-black";
      case "Billed":
        return "bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700/50 dark:border-gray-500/20";
    }
  };

  return (
    <div className="font-inter h-full bg-slate-50/50 dark:bg-[#0B1120]">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "backdrop-blur-xl bg-white dark:bg-slate-900/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700 shadow-xl rounded-2xl",
          style: { color: "inherit" },
        }}
      />

      {/* Header & Tabs */}
      <div className="flex items-end justify-between mb-1">
        <div className="flex-1">{/* Header text removed */}</div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
        {/* ----------------- LEFT COLUMN: List ----------------- */}
        <div className="w-full lg:w-[320px] flex flex-col space-y-4 shrink-0">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 dark:text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mainTab === "Active"
                  ? "Search table or session..."
                  : "Search bill number..."
              }
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-slate-900 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center">
                <SplitSquareHorizontal className="w-4 h-4 mr-2" />{" "}
                {mainTab === "Active" ? "ACTIVE BILLS" : "RECENT BILLS"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 dark:text-slate-500 dark:text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setMainTab("Active");
                    setIsDropdownOpen(false);
                    setSelectedId(null);
                  }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors ${mainTab === "Active" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" : "text-gray-600 dark:text-slate-400 dark:text-slate-300"}`}
                >
                  ACTIVE BILLS
                </button>
                <button
                  onClick={() => {
                    setMainTab("Recent");
                    setIsDropdownOpen(false);
                    setSelectedId(null);
                  }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-colors ${mainTab === "Recent" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" : "text-gray-600 dark:text-slate-400 dark:text-slate-300"}`}
                >
                  RECENT BILLS
                </button>
              </div>
            )}
          </div>

          {/* Bills List */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 custom-scrollbar pr-2">
            {displayedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 dark:text-slate-300">
                  No {mainTab.toLowerCase()} items found
                </p>
              </div>
            ) : (
              displayedList.map((item) => {
                const isSelected = item.id === selectedId;
                const displayTotal =
                  item.displayTotal > 0 ? item.displayTotal.toFixed(2) : "0.00";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`relative overflow-hidden rounded-2xl p-4 border-l-4 transition-all duration-300 cursor-pointer ${
                      item.status === 'Bill Requested'
                        ? (isSelected ? "bg-rose-100 dark:bg-rose-900/40 border-rose-600 shadow-sm" : "bg-rose-50 dark:bg-rose-900/20 border-rose-500 shadow-sm animate-[pulse_2s_ease-in-out_infinite]")
                        : isSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-l-transparent border-gray-200 dark:border-slate-700 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-extrabold text-sm ${isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}>
                          {item.type === "bill"
                            ? item.bill_number || `Bill #${item.id}`
                            : `Session #${item.id}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className={`font-bold text-sm tracking-tight ${isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}>
                        ₹{displayTotal}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1.5 text-[11px] font-semibold mb-2 ${isSelected ? "text-indigo-800 dark:text-indigo-300" : "text-gray-500 dark:text-slate-400"}`}>
                      <User className="w-3.5 h-3.5" />
                      <span>{item.customer}</span>
                    </div>
                    <div className={`flex items-center space-x-4 text-[11px] font-semibold ${isSelected ? "text-indigo-800 dark:text-indigo-300" : "text-gray-500 dark:text-slate-400"}`}>
                      {item.type === "session" && (
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{item.pax} Pax</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {mainTab === "Active" && (
              <button
                onClick={() =>
                  toast("Please start a new session from Floor Plan")
                }
                className="w-full mt-4 py-3.5 bg-white dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-600 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Walk-in Order
              </button>
            )}
          </div>
        </div>

        {/* ----------------- MIDDLE COLUMN: Order Details ----------------- */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedItem ? (
            <div className="bg-white dark:bg-slate-900/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-indigo-100/20 dark:shadow-none flex flex-col h-full overflow-hidden">
              {/* Middle Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800/80 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-500/20">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                        Order Details
                      </h2>
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                        {selectedItem.orderType}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      {selectedItem.type === "session"
                        ? `Table ${selectedItem.table_id || "N/A"}`
                        : `Ref: ${selectedItem.bill_number}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (
                        selectedItem?.status === "Active" ||
                        selectedItem?.status === "Preparing"
                      ) {
                        toast.error("Generate the bill first to print it.");
                      } else {
                        setIsReceiptOpen(true);
                      }
                    }}
                    className="p-2.5 bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 dark:text-slate-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    title="Print Bill"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Customer Info Meta */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800/80 grid grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-800/50/50 dark:bg-slate-900/30">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Customer
                  </p>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-xs">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>{selectedItem.customer}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Pax
                  </p>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-xs">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{selectedItem.pax}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Time
                  </p>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-xs">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{selectedItem.startedAt}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Status
                  </p>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>{selectedItem.status}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                    Order Items ({currentOrderItems.length})
                  </h3>
                  {selectedItem.type === "session" && (
                    <button
                      onClick={() =>
                        toast("Point of Sale (Add Item) coming soon", {
                          icon: "🛒",
                        })
                      }
                      className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-200 active:scale-95 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg shrink-0 ml-2"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Item
                    </button>
                  )}
                </div>

                {/* List Header */}
                <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                  <div className="col-span-6">Item Name</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  {currentOrderItems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                      <Coffee className="w-8 h-8 text-gray-300 dark:text-slate-600 dark:text-slate-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-slate-400 font-semibold text-sm">
                        No items ordered yet.
                      </p>
                    </div>
                  ) : (
                    currentOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 group"
                      >
                        <div className="col-span-6 flex items-center space-x-4">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-slate-800 dark:border-slate-700 shadow-sm"
                          />
                          <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 dark:bg-slate-800 rounded-lg px-2 py-1 font-mono">
                            <span className="px-3 text-xs font-bold text-gray-900 dark:text-white">
                              {item.qty}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
                          ₹{item.price.toFixed(2)}
                        </div>
                        <div className="col-span-2 text-right text-sm font-black text-gray-900 dark:text-white">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white dark:bg-slate-900/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 shadow-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Receipt className="w-10 h-10 text-indigo-300 dark:text-indigo-500/50" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-black text-xl mb-3 tracking-tight">
                Select a Session
              </h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
                Choose an active session or a recent bill from the list to view
                detailed order information and process payments.
              </p>
            </div>
          )}
        </div>

        {/* ----------------- RIGHT COLUMN: Bill Summary ----------------- */}
        <div className="w-full lg:w-[380px] flex flex-col shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none flex flex-col h-full overflow-hidden relative">

            <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <h2 className="font-black text-gray-900 dark:text-white text-lg mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Payment Summary
              </h2>

              {/* Summary List */}
              <div className="space-y-4 mb-8 text-sm font-bold border-b border-gray-100 dark:border-slate-800 pb-8">
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Subtotal ({currentOrderItems.length} items)</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    ₹ {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Service Charge (5%)</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    ₹ {serviceCharge.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>CGST (2.5%)</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    ₹ {cgst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>SGST (2.5%)</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    ₹ {sgst.toFixed(2)}
                  </span>
                </div>
                {(!matchingBill || discountAmount > 0) && (
                  <div className="flex justify-between items-center text-rose-500 dark:text-rose-400 pt-2">
                    <span className="flex items-center space-x-2">
                      <span>Discount</span>
                      {!matchingBill && (
                        <div className="relative flex items-center">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={discountPercentage || ''}
                            onChange={e => {
                              if (e.target.value === '') {
                                setDiscountPercentage(0);
                                return;
                              }
                              let val = parseFloat(e.target.value);
                              if (isNaN(val)) val = 0;
                              if (val > 100) {
                                toast.error("Discount cannot exceed 100%", { id: 'discount-error' });
                                return;
                              }
                              setDiscountPercentage(val);
                            }}
                            placeholder="0"
                            className="w-14 pl-2 pr-4 py-0.5 text-xs text-right bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded outline-none text-rose-600 font-bold"
                          />
                          <span className="absolute right-1.5 text-[10px] font-bold">%</span>
                        </div>
                      )}
                      {matchingBill && discountAmount > 0 && (
                         <span className="text-xs bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded text-rose-600">{(discountAmount / matchingBill.subtotal * 100).toFixed(0)}%</span>
                      )}
                    </span>
                    <span className="font-mono">
                      - ₹ {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 dark:text-white pt-4 mt-2 border-t border-gray-100 dark:border-slate-800 font-black text-base">
                  <span>Total Amount</span>
                  <span className="font-mono">₹ {totalAfterDiscount.toFixed(2)}</span>
                </div>
                {roundOffDiff > 0 && (
                  <div className="flex justify-between text-gray-500 dark:text-slate-400 mt-2 text-xs">
                    <span>Round Off</span>
                    <span className="font-mono text-gray-700 dark:text-slate-300">
                      + ₹ {roundOffDiff.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              {selectedItem?.status !== "Billed" && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "Cash", icon: Banknote },
                      { id: "UPI", icon: Smartphone },
                      { id: "Card", icon: CreditCard },
                      { id: "Split", icon: SplitSquareHorizontal },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPaymentMethod === method.id ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm" : "border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}
                      >
                        <method.icon className="w-4 h-4 mr-3" />
                        <span className="text-sm font-bold">{method.id}</span>
                        {selectedPaymentMethod === method.id && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedPaymentMethod === "Split" && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-3">
                      <h4 className="font-bold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Split Amounts</h4>
                      {Object.keys(splitAmounts).map(method => (
                        <div key={method} className="flex items-center justify-between">
                          <label className="text-sm font-bold text-gray-700 dark:text-slate-300 w-20">{method}</label>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={splitAmounts[method]}
                              onChange={(e) => setSplitAmounts(prev => ({ ...prev, [method]: e.target.value }))}
                              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Total Entered:</span>
                        <span className={`text-sm font-mono font-bold ${Math.abs(Object.values(splitAmounts).reduce((a, b) => a + (parseFloat(b) || 0), 0) - grandTotal) < 0.01 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          ₹{Object.values(splitAmounts).reduce((a, b) => a + (parseFloat(b) || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grand Total Banner */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 flex justify-between items-center mb-auto shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-slate-900/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <span className="block text-gray-400 dark:text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    To Pay
                  </span>
                  <span className="font-black text-white text-3xl tracking-tighter font-mono">
                    ₹ {grandTotal.toFixed(2)}
                  </span>
                </div>
                {selectedItem?.status === "Billed" && (
                  <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col space-y-3">
                {selectedItem?.status === "Billed" ? (
                  <button 
                    onClick={() => setIsReceiptOpen(true)}
                    className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Invoice
                  </button>
                ) : selectedItem?.status === "Pending Billing" ? (
                  <button
                    onClick={handleProceedToBill}
                    disabled={recordPaymentMutation.isPending}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {recordPaymentMutation.isPending
                      ? "Processing..."
                      : "Complete Payment"}
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateBill}
                    disabled={generateBillMutation.isPending}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Receipt className="w-5 h-5 mr-2" />
                    {generateBillMutation.isPending
                      ? "Generating Bill..."
                      : "Generate Bill"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <ThermalReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={{
          bill_number: matchingBill?.bill_number,
          session_id: selectedItem?.id,
          table: selectedItem?.table_id ? `T-${selectedItem.table_id}` : null,
          subtotal: subtotal,
          service_charge: serviceCharge,
          cgst: cgst,
          sgst: sgst,
          grand_total: totalAmount,
        }}
        items={currentOrderItems}
      />
    </div>
  );
};

export default OperatorBilling;
