import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
    Plus, Search, Edit2, Trash2, Users, UserCheck, 
    Briefcase, UserX, UserPlus, ChevronRight, Download, Filter, Eye, MoreVertical, X, FileText
} from 'lucide-react';
import { Button, DataTable, Pagination } from '../../components/ui';

const Employees = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Role');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const response = await api.get('/admin/employees/');
            return response.data.data;
        }
    });

    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await api.get('/admin/roles/');
            return response.data.data;
        }
    });

    const { data: kpis } = useQuery({
        queryKey: ['employees', 'kpis'],
        queryFn: async () => {
            const response = await api.get('/admin/employees/kpis');
            return response.data.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/employees/${id}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Employee deleted successfully');
            queryClient.invalidateQueries(['employees']);
            queryClient.invalidateQueries(['employees', 'kpis']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        }
    });

    const totalEmployees = kpis?.total_employees || 0;
    const activeEmployees = kpis?.active_employees || 0;
    const inactiveEmployees = kpis?.inactive_employees || 0;
    const onLeave = kpis?.on_leave || 0; 
    const newThisMonth = kpis?.new_this_month || 0;

    const getRoleName = (roleId) => {
        const role = roles?.find(r => r.id === roleId);
        return role ? role.name : `Role ${roleId}`;
    };

    const getDepartment = (roleId) => {
        if (roleId === 1) return 'Operations';
        if (roleId === 2) return 'Service';
        if (roleId === 3) return 'Kitchen';
        return 'Staff';
    };

    const getRolePillColor = (roleId) => {
        if (roleId === 1) return 'bg-purple-50 text-purple-600'; // Operator
        if (roleId === 2) return 'bg-blue-50 text-blue-600';     // Waiter
        if (roleId === 3) return 'bg-orange-50 text-orange-600'; // Kitchen Staff
        return 'bg-gray-50 text-gray-600';
    };

    const columns = [
        { 
            header: "ID", 
            accessorKey: "employee_code",
            cellClassName: "text-gray-500 font-medium text-xs py-3"
        },
        { 
            header: "Employee", 
            cell: (row) => (
                <div className="flex items-center">
                    <img 
                        src={row.image_url || `https://ui-avatars.com/api/?name=${row.first_name}+${row.last_name}&background=f3f4f6&color=4b5563&rounded=true`} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full mr-3 border border-gray-200 object-cover" 
                    />
                    <div>
                        <div className="font-semibold text-gray-900 text-xs">{row.first_name} {row.last_name}</div>
                        <div className="text-[10px] text-gray-500">{getRoleName(row.role_id)}</div>
                    </div>
                </div>
            )
        },
        { 
            header: "Role", 
            cell: (row) => (
                <span className={`px-3 py-1 rounded text-[10px] font-bold ${getRolePillColor(row.role_id)}`}>
                    {getRoleName(row.role_id)}
                </span>
            )
        },
        { 
            header: "Department", 
            cell: (row) => <span className="text-gray-600 text-xs font-medium">{getDepartment(row.role_id)}</span> 
        },
        { 
            header: "Phone", 
            cell: (row) => <span className="text-gray-600 text-xs font-medium">{row.phone || '+91 98765 43210'}</span> 
        },
        { 
            header: "Email", 
            cell: (row) => <span className="text-gray-600 text-xs font-medium">{row.email}</span> 
        },
        { 
            header: "Status", 
            cell: (row) => (
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${row.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { 
            header: "Join Date", 
            cell: (row) => {
                const date = new Date(row.created_at);
                const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                return <span className="text-gray-600 text-xs font-medium">{formatted}</span>;
            }
        },
        { 
            header: "Actions", 
            className: "text-center",
            cellClassName: "text-center",
            cell: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => setSelectedEmployee(row)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => navigate(`/admin/employees/edit/${row.id}`)} className="p-1.5 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this employee?')) {
                                deleteMutation.mutate(row.id);
                            }
                        }}
                        className="p-1.5 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    const filteredEmployees = employees?.filter(e => {
        const matchesSearch = !searchTerm || 
            (e.first_name + ' ' + e.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'Role' || getRoleName(e.role_id) === roleFilter;
        const matchesStatus = statusFilter === 'Status' || (statusFilter === 'Active' ? e.is_active : !e.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    }) || [];

    const handleExport = () => {
        if (filteredEmployees.length === 0) {
            toast.error('No employees to export');
            return;
        }

        const exportData = filteredEmployees.map(e => ({
            'Employee ID': e.employee_code || '',
            'First Name': e.first_name || '',
            'Last Name': e.last_name || '',
            'Email Address': e.email || '',
            'Phone Number': e.phone || 'Not provided',
            'Role': getRoleName(e.role_id),
            'Department': getDepartment(e.role_id),
            'Status': e.is_active ? 'Active' : 'Inactive',
            'Join Date': new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            'Profile Picture': e.image_url ? 'Yes' : 'No',
            'Aadhar Card': e.aadhar_url ? 'Uploaded' : 'Not uploaded',
            'PAN Card': e.pan_url ? 'Uploaded' : 'Not uploaded',
            'Bank Passbook': e.passbook_url ? 'Uploaded' : 'Not uploaded'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // Auto-size columns based on content
        const wscols = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(
                key.length,
                ...exportData.map(row => (row[key] ? row[key].toString().length : 0))
            ) + 2
        }));
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

        XLSX.writeFile(workbook, 'Employees_Export.xlsx');
    };

    return (
        <div className="space-y-4 pb-10 font-inter">
            {/* Header Section */}
            <div className="flex justify-end items-start">
                <button 
                    onClick={() => navigate('/admin/employees/add')}
                    className="bg-[#5e5ce6] hover:bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500">Total Employees</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-3">
                        ↑ 8.9% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-green-50 rounded-full text-green-500">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500">Active Employees</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{activeEmployees}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-3">
                        ↑ 9.1% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-orange-50 rounded-full text-orange-500">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500">On Leave</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{onLeave}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-3">
                        ↓ 1.1% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-purple-50 rounded-full text-purple-500">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500">Inactive Employees</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveEmployees}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 mt-3">
                        ↓ 0.5% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-semibold text-gray-500">New This Month</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{newThisMonth}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-green-500 mt-3">
                        ↑ 14.3% <span className="text-gray-400 font-medium ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Main Data Table Card */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                    <h3 className="font-bold text-gray-900 text-sm">Employee List</h3>
                    
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name, role or phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
                            />
                        </div>
                        
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2 pr-8 outline-none"
                        >
                            <option value="Role">Role</option>
                            {roles?.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                        
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2 pr-8 outline-none"
                        >
                            <option>Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>

                        <button 
                            onClick={handleExport}
                            className="flex items-center bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5 mr-2" /> Export
                        </button>
                    </div>
                </div>
                
                {(() => {
                    const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage) || 1;
                    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

                    return (
                        <>
                            <DataTable 
                                columns={columns} 
                                data={paginatedEmployees} 
                                isLoading={isLoading} 
                                emptyMessage="No employees found." 
                            />

                            {/* Footer Pagination */}
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={filteredEmployees.length}
                                itemsPerPage={rowsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(val) => {
                                    setRowsPerPage(val);
                                    setCurrentPage(1);
                                }}
                                itemName="employees"
                            />
                        </>
                    );
                })()}
            </div>
            
            {/* Employee Details Side Panel */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedEmployee(null)}
                    ></div>
                    
                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
                        <div className="p-6 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Employee Details</h2>
                            <button 
                                onClick={() => setSelectedEmployee(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center">
                                <img 
                                    src={selectedEmployee.image_url || `https://ui-avatars.com/api/?name=${selectedEmployee.first_name}+${selectedEmployee.last_name}&background=f3f4f6&color=4b5563&rounded=true`}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm object-cover mb-4"
                                />
                                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                                <p className="text-sm font-semibold text-gray-500 mt-1">{selectedEmployee.employee_code}</p>
                                <div className="mt-3">
                                    <span className={`px-3 py-1 rounded text-xs font-bold ${getRolePillColor(selectedEmployee.role_id)}`}>
                                        {getRoleName(selectedEmployee.role_id)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${selectedEmployee.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        <span className="text-sm font-semibold text-gray-900">{selectedEmployee.is_active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-sm font-semibold text-gray-900">{selectedEmployee.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                                    <p className="text-sm font-semibold text-gray-900">{getDepartment(selectedEmployee.role_id)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Join Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedEmployee.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-cyan-600" />
                                    Employee Documents
                                </h4>
                                <div className="space-y-3">
                                    {/* Aadhar */}
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded bg-cyan-50 flex items-center justify-center mr-3 text-cyan-600 font-bold text-xs">
                                                ID
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Aadhar Card</p>
                                                <p className="text-[10px] font-medium text-gray-500">{selectedEmployee.aadhar_url ? 'Uploaded' : 'Not uploaded'}</p>
                                            </div>
                                        </div>
                                        {selectedEmployee.aadhar_url ? (
                                            <a href={selectedEmployee.aadhar_url} target="_blank" rel="noreferrer" className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-gray-400">N/A</span>
                                        )}
                                    </div>

                                    {/* PAN */}
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded bg-cyan-50 flex items-center justify-center mr-3 text-cyan-600 font-bold text-xs">
                                                ID
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">PAN Card</p>
                                                <p className="text-[10px] font-medium text-gray-500">{selectedEmployee.pan_url ? 'Uploaded' : 'Not uploaded'}</p>
                                            </div>
                                        </div>
                                        {selectedEmployee.pan_url ? (
                                            <a href={selectedEmployee.pan_url} target="_blank" rel="noreferrer" className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-gray-400">N/A</span>
                                        )}
                                    </div>

                                    {/* Passbook */}
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded bg-cyan-50 flex items-center justify-center mr-3 text-cyan-600 font-bold text-xs">
                                                ID
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Bank Passbook</p>
                                                <p className="text-[10px] font-medium text-gray-500">{selectedEmployee.passbook_url ? 'Uploaded' : 'Not uploaded'}</p>
                                            </div>
                                        </div>
                                        {selectedEmployee.passbook_url ? (
                                            <a href={selectedEmployee.passbook_url} target="_blank" rel="noreferrer" className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-gray-400">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => navigate(`/admin/employees/edit/${selectedEmployee.id}`)}
                                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                /* Override DataTable base styles for this specific page to match design perfectly */
                th {
                    text-transform: none !important;
font-size: 11px !important;
                    padding-top: 16px !important;
                    padding-bottom: 16px !important;
                    border-bottom-width: 2px !important;
                    border-bottom-
}
                td {
                    padding-top: 12px !important;
                    padding-bottom: 12px !important;
                }
                tr {
                    border-bottom-
}
            `}</style>
        </div>
    );
};

export default Employees;
