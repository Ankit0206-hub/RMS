import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
    Users, UserCheck, Shield, ClipboardList, 
    ChevronRight, Plus, Search, Filter, Edit, Trash2, 
    MoreVertical, X, Phone, Mail, MapPin, Clock, Calendar, ShieldAlert,
    ChevronLeft, ChevronDown
} from 'lucide-react';
import { Modal, Input, Button } from '../../components/ui';

const OperatorUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [selectedStatus, setSelectedStatus] = useState('All Status');

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        employee_code: '',
        password: '',
        role_id: 2, // Default Waiter
        is_active: true
    });
    
    const [editingUserId, setEditingUserId] = useState(null);

    const queryClient = useQueryClient();

    const { data: employeesData, isLoading: employeesLoading } = useQuery({
        queryKey: ['adminEmployees'],
        queryFn: async () => {
            const res = await api.get('/admin/employees', { params: { page: 1, page_size: 100 } });
            return res.data.data || [];
        }
    });

    const { data: nextCodeResponse } = useQuery({
        queryKey: ['nextEmployeeCode', formData.role_id],
        queryFn: async () => {
            const res = await api.get('/admin/employees/next-code', { params: { role_id: formData.role_id } });
            return res.data;
        },
        enabled: isAddUserModalOpen
    });
    const nextCode = nextCodeResponse?.data || '';

    useEffect(() => {
        if (isAddUserModalOpen && nextCode && !formData.employee_code) {
            setFormData(prev => ({ ...prev, employee_code: nextCode }));
        }
    }, [nextCode, isAddUserModalOpen, formData.employee_code]);

    const addUserMutation = useMutation({
        mutationFn: async (newUser) => {
            const response = await api.post('/admin/employees/', newUser);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User added successfully');
            queryClient.invalidateQueries(['adminEmployees']);
            closeModals();
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to add user';
            toast.error(message);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/admin/employees/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User updated successfully');
            queryClient.invalidateQueries(['adminEmployees']);
            closeModals();
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update user';
            toast.error(message);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/employees/${id}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries(['adminEmployees']);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
        }
    });

    const closeModals = () => {
        setIsAddUserModalOpen(false);
        setIsEditUserModalOpen(false);
        setEditingUserId(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            employee_code: '',
            password: '',
            role_id: 2,
            is_active: true
        });
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (name === 'role_id' ? parseInt(value) : value) 
        }));
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addUserMutation.mutate(formData);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
            delete dataToUpdate.password;
        }
        updateUserMutation.mutate({ id: editingUserId, data: dataToUpdate });
    };

    const openEditModal = (user) => {
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            employee_code: user.employee_code || '',
            password: '', // blank for edit
            role_id: user.role_id || 2,
            is_active: user.is_active
        });
        setEditingUserId(user.id);
        setIsEditUserModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    // Process Users Data
    const users = useMemo(() => {
        if (!employeesData) return [];
        return employeesData.map(e => ({
            ...e,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((e.first_name || '') + ' ' + (e.last_name || ''))}&background=random`,
            status: e.is_active ? 'Active' : 'Inactive',
            joinedOn: e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
        }));
    }, [employeesData]);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (u.employee_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = selectedRole === 'All Roles' || (u.role_name && u.role_name.toLowerCase() === selectedRole.toLowerCase());
            const matchesStatus = selectedStatus === 'All Status' || u.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, selectedRole, selectedStatus]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
        if (currentPage > maxPage) {
            setCurrentPage(1);
        }
    }, [filteredUsers.length, rowsPerPage, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredUsers.length);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // KPIs
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const waitStaff = users.filter(u => u.role_name?.toLowerCase() === 'waiter').length;
    const kitchenStaff = users.filter(u => u.role_name?.toLowerCase() === 'kitchen').length;

    const getRoleColor = (roleName) => {
        const name = (roleName || '').toLowerCase();
        if (name === 'admin' || name === 'operator') return 'bg-purple-100 text-purple-700 border-purple-200';
        if (name === 'kitchen') return 'bg-orange-100 text-orange-700 border-orange-200';
        if (name === 'waiter') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (employeesLoading) {
        return <div className="p-8 text-center text-gray-500 font-inter">Loading Users...</div>;
    }

    return (
        <div className="font-inter min-h-[calc(100vh-64px)] pb-12">
            <div className="flex-1 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Staff Directory</h1>
                        <p className="text-[13px] md:text-sm font-semibold text-gray-500 dark:text-slate-400 mt-1">Manage restaurant personnel and roles.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm flex items-center justify-center transition-all"
                    >
                        <Plus size={16} strokeWidth={2.5} className="mr-2" />
                        Add New Staff
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 mr-4"><Users size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total Staff</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalUsers}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 mr-4"><UserCheck size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Active</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{activeUsers}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500 mr-4"><ClipboardList size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Wait Staff</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{waitStaff}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-500 mr-4"><Shield size={20}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Kitchen Staff</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{kitchenStaff}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-[13px] font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                    
                    <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-[13px] font-semibold text-gray-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shrink-0 min-w-[120px]"
                        >
                            <option>All Roles</option>
                            <option>Admin</option>
                            <option>Operator</option>
                            <option>Waiter</option>
                            <option>Kitchen</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-[13px] font-semibold text-gray-700 dark:text-slate-200 outline-none cursor-pointer appearance-none shrink-0 min-w-[120px]"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-5 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-12 text-center">
                                            <ShieldAlert size={32} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                                            <p className="text-[13px] font-semibold text-gray-500 dark:text-slate-400">No staff members found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                                                    <div>
                                                        <p className="text-[13px] font-bold text-gray-900 dark:text-white capitalize">{user.first_name} {user.last_name}</p>
                                                        <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Code: {user.employee_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getRoleColor(user.role_name)}`}>
                                                    {user.role_name || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-semibold text-gray-600 dark:text-slate-300 flex items-center">
                                                        <Phone size={12} className="mr-1.5 text-gray-400" /> {user.phone || 'N/A'}
                                                    </span>
                                                    <span className="text-[12px] font-semibold text-gray-600 dark:text-slate-300 flex items-center">
                                                        <Mail size={12} className="mr-1.5 text-gray-400" /> {user.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`flex items-center gap-1.5 text-[12px] font-bold ${user.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] font-semibold text-gray-600 dark:text-slate-300">
                                                {user.joinedOn}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/20">
                            <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">
                                Showing {startIndex + 1} to {endIndex} of {filteredUsers.length}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit */}
            <Modal
                isOpen={isAddUserModalOpen || isEditUserModalOpen}
                onClose={closeModals}
                title={isEditUserModalOpen ? "Edit Staff Member" : "Add New Staff"}
            >
                <form onSubmit={isEditUserModalOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">First Name</label>
                            <Input name="first_name" value={formData.first_name} onChange={handleFormChange} required />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Last Name</label>
                            <Input name="last_name" value={formData.last_name} onChange={handleFormChange} required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Email</label>
                            <Input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Phone</label>
                            <Input name="phone" value={formData.phone} onChange={handleFormChange} required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Employee Code</label>
                            <Input name="employee_code" value={formData.employee_code} onChange={handleFormChange} required readOnly={isEditUserModalOpen} className={isEditUserModalOpen ? 'bg-gray-100 dark:bg-slate-800' : ''} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Role</label>
                            <select 
                                name="role_id" 
                                value={formData.role_id} 
                                onChange={handleFormChange} 
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[13px] font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value={1}>Admin</option>
                                <option value={2}>Waiter</option>
                                <option value={3}>Kitchen</option>
                                <option value={4}>Operator</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            Password {isEditUserModalOpen && "(Leave blank to keep unchanged)"}
                        </label>
                        <Input type="password" name="password" value={formData.password} onChange={handleFormChange} required={!isEditUserModalOpen} />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="is_active" 
                            name="is_active" 
                            checked={formData.is_active} 
                            onChange={handleFormChange} 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <label htmlFor="is_active" className="text-[13px] font-semibold text-gray-700 dark:text-slate-300">
                            Active Account
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={closeModals} 
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-[13px] font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-[13px] font-bold transition-colors"
                            disabled={addUserMutation.isPending || updateUserMutation.isPending}
                        >
                            {isEditUserModalOpen ? 'Save Changes' : 'Add Staff Member'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OperatorUsers;
