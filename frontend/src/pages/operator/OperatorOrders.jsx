import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Download,
  ClipboardList,
  Clock,
  CheckCircle2,
  IndianRupee,
  RotateCcw,
  Eye,
  MoreVertical,
} from "lucide-react";
import { DataTable, Pagination } from "../../components/ui";
import { useNavigate, useLocation } from "react-router-dom";

const OperatorOrders = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.searchCustomer || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterTable, setFilterTable] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/admin/ordering/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/admin/ordering/orders", {
        params: { page: 1, page_size: 1000 },
      });
      return response.data;
    },
    refetchInterval: 30000, // auto-refresh every 30 seconds for operator dashboard
  });

  const ordersData = useMemo(() => {
    if (!ordersResponse?.data) return [];
    return ordersResponse.data.map((order) => {
      const dateObj = new Date(order.created_at);
      return {
        id: `#ORD${order.id}`,
        rawId: order.id,
        date: dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        rawDate: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: order.customer_name || "Walk-in Customer",
        customerPhone: order.customer_phone || "-",
        table: order.table_number || "-",
        type: order.order_type || "Take Away",
        amount: order.total_amount || 0.0,
        status: order.status,
        waiterName: order.waiter_name || "-",
        items: order.items ? order.items.map(i => ({
            id: i.id,
            name: i.menu_item_name || "Unknown Item",
            qty: i.quantity,
            price: i.price_at_order,
            amount: i.quantity * i.price_at_order,
            img: i.menu_item_image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
        })) : null,
      };
    });
  }, [ordersResponse]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(ordersData.map(o => o.type));
    return ["All", ...Array.from(types)];
  }, [ordersData]);

  const uniqueTables = useMemo(() => {
    const tables = new Set(ordersData.map(o => o.table).filter(t => t !== "-"));
    return ["All", ...Array.from(tables).sort()];
  }, [ordersData]);

    const getStatusPill = (status) => {
    switch (status) {
      case "Verification Pending":
        return "text-purple-600 bg-purple-50";
      case "Completed":
      case "Served":
        return "text-green-600 bg-green-50";
      case "Confirmed":
        return "text-[#5e5ce6] bg-indigo-50";
      case "Pending":
        return "text-orange-500 bg-orange-50";
      case "Cancelled":
        return "text-red-500 bg-red-50";
      case "Cooked":
        return "text-[#5e5ce6] bg-indigo-50";
      default:
        return "text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50";
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/operator/orders/${order.rawId}`);
  };

  const columns = [
    {
      header: "Order ID",
      cell: (row) => (
        <div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${row.status === "Verification Pending" ? "bg-purple-500" : row.status === "Pending" ? "bg-orange-500" : row.status === "Confirmed" ? "bg-[#5e5ce6]" : row.status === "Completed" || row.status === "Served" ? "bg-green-500" : row.status === "Cooked" ? "bg-[#5e5ce6]" : "bg-red-500"}`}
            ></div>
            <span className="font-bold text-gray-900 dark:text-white text-[11px]">
              {row.id}
            </span>
            {row.status === "Verification Pending" && (
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 font-bold text-[8px] rounded">
                Verify
              </span>
            )}
            {row.status === "Pending" && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 font-bold text-[8px] rounded">
                New
              </span>
            )}
          </div>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">
            {row.type}
          </div>
        </div>
      ),
    },
    {
      header: "Table",
      cell: (row) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white text-[11px]">
            {row.table}
          </span>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">
            4 Seats
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
              <svg
                className="w-2.5 h-2.5 text-gray-400 dark:text-slate-500 dark:text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="font-bold text-gray-900 dark:text-white text-[11px]">
              {row.customerName}
            </div>
          </div>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1 ml-5.5">
            {row.customerPhone}
          </div>
        </div>
      ),
    },
    {
      header: "Waiter",
      cell: (row) => (
        <span className="font-bold text-gray-900 dark:text-white text-[11px]">
          {row.waiterName}
        </span>
      ),
    },
    {
      header: "Time",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white text-[11px]">
            {row.time}
          </div>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mt-1">
            Today
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-[9px] font-bold ${getStatusPill(row.status)}`}
        >
          {row.status === "Verification Pending" ? "To Verify" : row.status === "Pending" ? "New" : row.status === "Confirmed" ? "Preparing" : row.status === "Cooked" ? "Ready" : row.status}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (row) => (
        <span className="font-bold text-gray-900 dark:text-white text-[11px]">
          ₹ {row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      cellClassName: "text-center overflow-visible",
      cell: (row) => (
        <div className="flex items-center justify-center space-x-2 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewOrder(row);
            }}
            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === row.rawId ? null : row.rawId);
              }}
              className="p-1.5 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:text-slate-400 transition-colors"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {activeDropdown === row.rawId && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(null);
                  }}
                ></div>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-1 text-[9px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/50">Update Status</div>
                  {row.status === 'Verification Pending' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        statusMutation.mutate({ id: row.rawId, status: 'Pending' });
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-500"
                    >
                      Verify Order
                    </button>
                  )}
                  {row.status === 'Pending' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        statusMutation.mutate({ id: row.rawId, status: 'Confirmed' });
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-[#5e5ce6]"
                    >
                      Preparing
                    </button>
                  )}
                  {(row.status === 'Pending' || row.status === 'Confirmed') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        statusMutation.mutate({ id: row.rawId, status: 'Cooked' });
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-[#5e5ce6]"
                    >
                      Ready (Cooked)
                    </button>
                  )}
                  {(row.status === 'Pending' || row.status === 'Confirmed' || row.status === 'Cooked') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        statusMutation.mutate({ id: row.rawId, status: 'Served' });
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-green-50 hover:text-green-600"
                    >
                      Served
                    </button>
                  )}
                  {row.status !== 'Completed' && row.status !== 'Cancelled' && row.status !== 'Served' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        statusMutation.mutate({ id: row.rawId, status: 'Cancelled' });
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ),
    },
  ];

  const totalOrders = ordersData.length;
  const newOrders = ordersData.filter((o) => o.status === "Pending" || o.status === "Verification Pending").length;
  const preparingOrders = ordersData.filter((o) => o.status === "Confirmed").length;
  const readyOrders = ordersData.filter((o) => o.status === "Cooked").length;
  const servedOrders = ordersData.filter(
    (o) => o.status === "Completed" || o.status === "Served",
  ).length;
  const cancelledOrders = ordersData.filter(
    (o) => o.status === "Cancelled",
  ).length;

  const filteredData = ordersData.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.table.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !filterDate || o.rawDate === filterDate;
    const matchesType = filterType === "All" || o.type === filterType;
    const matchesTable = filterTable === "All" || o.table === filterTable;
    const matchesStatusDropdown = filterStatus === "All" || o.status === filterStatus;

    return matchesSearch && matchesDate && matchesType && matchesTable && matchesStatusDropdown;
  });

  const hasActiveFilters = filterDate !== "" || filterType !== "All" || filterTable !== "All" || filterStatus !== "All";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterType("All");
    setFilterTable("All");
    setFilterStatus("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 pb-10 font-inter mx-auto">
      {/* Header Title if not handled by layout */}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-indigo-50 rounded-xl text-[#5e5ce6]">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">
              Total Orders
            </p>
            <div className="flex items-end space-x-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {totalOrders}
              </p>
              <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">
                Today
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-orange-100 shadow-sm flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-orange-50 rounded-xl text-orange-500">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">
              New Orders
            </p>
            <div className="flex items-end space-x-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {newOrders}
              </p>
            </div>
            <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-1 truncate">
              Need Confirmation
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-500">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">
              Preparing
            </p>
            <div className="flex items-end space-x-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {preparingOrders}
              </p>
            </div>
            <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-1 truncate">
              In Kitchen
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-purple-100 shadow-sm flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-purple-50 rounded-xl text-purple-500">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">
              Ready to Serve
            </p>
            <div className="flex items-end space-x-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {readyOrders}
              </p>
            </div>
            <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-1 truncate">
              Ready for Waiter
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-green-100 shadow-sm flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-green-50 rounded-xl text-green-500">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-0.5">
              Served
            </p>
            <div className="flex items-end space-x-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                {servedOrders}
              </p>
            </div>
            <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 dark:text-slate-400 mt-1 truncate">
              Completed Orders
            </p>
          </div>
        </div>
      </div>

      {/* Main Data Table Area */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-3 items-end bg-white dark:bg-slate-900">
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Table or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full transition-all font-medium h-[38px]"
            />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center shrink-0 border px-3 h-[38px] rounded-lg text-[11px] font-bold transition-colors ${showFilters ? 'bg-indigo-50 border-[#5e5ce6] text-[#5e5ce6]' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'}`}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filters
            {hasActiveFilters && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-red-500"></span>}
          </button>

          <div 
            className="transition-all duration-500 ease-in-out overflow-hidden"
            style={{ maxWidth: showFilters ? '800px' : '0', opacity: showFilters ? 1 : 0 }}
          >
            <div className="flex items-end gap-3 w-max">
              <div className="flex flex-col space-y-1 shrink-0">
                <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">
                  Date
                </label>
                <input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 h-[38px] outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]"
                />
              </div>

              <div className="flex flex-col space-y-1 shrink-0">
                <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">
                  Order Type
                </label>
                <select 
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 h-[38px] outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]"
                >
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1 shrink-0">
                <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">
                  Table
                </label>
                <select 
                  value={filterTable}
                  onChange={(e) => { setFilterTable(e.target.value); setCurrentPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 h-[38px] outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]"
                >
                  {uniqueTables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1 shrink-0">
                <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 dark:text-slate-400">
                  Status
                </label>
                <select 
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold rounded-lg px-3 h-[38px] outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6]"
                >
                  <option value="All">All</option>
                  <option value="Verification Pending">To Verify</option>
                  <option value="Pending">New</option>
                  <option value="Confirmed">Preparing</option>
                  <option value="Cooked">Ready</option>
                  <option value="Completed">Served</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end shrink-0">
                  <button 
                    onClick={handleResetFilters}
                    className="flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 w-[38px] h-[38px] rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                    title="Reset Filters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={columns}
            data={filteredData.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage,
            )}
            isLoading={isLoading}
            emptyMessage="No orders found."
            onRowClick={(row) => handleViewOrder(row)}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          itemName="orders"
        />
      </div>

      <style>{`
                /* Override DataTable base styles for this specific page to match design */
                th {
                    text-transform: none !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    padding-top: 14px !important;
                    padding-bottom: 14px !important;
                    border-bottom-width: 2px !important;
                    border-bottom-color: #f1f5f9 !important;
                }
                td {
                    padding-top: 16px !important;
                    padding-bottom: 16px !important;
                    border-bottom-color: #f8fafc !important;
                }
                tr {
                    border-bottom-color: #f8fafc !important;
                }
                tr:hover {
                    background-color: #f8fafc !important;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
    </div>
  );
};

export default OperatorOrders;
