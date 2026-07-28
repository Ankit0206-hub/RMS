import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Shield, FileText, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Input } from '../../components/ui';

const AddEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customFields, setCustomFields] = useState([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: 1, // 1 for Operator, 2 for Waiter, 3 for Kitchen
    kitchen_id: '',
    is_active: true,
    aadhar_card: null,
    pan_card: null,
    bank_passbook: null
  });

  const { data: employeesData } = useQuery({
    queryKey: ['adminEmployees'],
    queryFn: async () => {
      const res = await api.get('/admin/employees', { params: { page: 1, page_size: 100 } });
      return res.data.data || [];
    }
  });

  const { data: kitchens } = useQuery({
    queryKey: ['kitchens'],
    queryFn: async () => {
      const res = await api.get('/admin/kitchen/list');
      return res.data.data || [];
    }
  });

  const { data: nextCodeResponse } = useQuery({
    queryKey: ['nextEmployeeCode', formData.role_id],
    queryFn: async () => {
      const res = await api.get('/admin/employees/next-code', { params: { role_id: formData.role_id } });
      return res.data;
    }
  });
  const nextCode = nextCodeResponse?.data || '';

  useEffect(() => {
    if (nextCode && formData.employee_code !== nextCode) {
      setFormData(prev => ({ ...prev, employee_code: nextCode }));
    }
  }, [nextCode, formData.employee_code]);

  const mutation = useMutation({
    mutationFn: async (newEmployee) => {
      const response = await api.post('/admin/employees/', newEmployee);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries(['employees', 'adminEmployees']);
      navigate('/admin/employees');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create employee';
      toast.error(message);
    }
  });

  const handleChange = (e) => {
    let { name, value, type, checked, files } = e.target;
    
    if (name === 'phone') {
        value = value.replace(/\D/g, '').slice(0, 10); // only allow up to 10 digits
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : type === 'number' || name === 'role_id' ? parseInt(value) : value
    }));
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: '', value: '' }]);
  };

  const handleRemoveCustomField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      custom_fields: customFields,
      kitchen_id: formData.role_id === 3 && formData.kitchen_id ? parseInt(formData.kitchen_id) : null
    };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="p-1.5 text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Employee
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-cyan-50 rounded-lg mr-3">
                <User className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <Input
                label="Employee ID"
                name="employee_code"
                value={formData.employee_code}
                placeholder="Auto-generated"
                readOnly
                disabled
              />
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                autoComplete="new-password"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                pattern="[0-9]*"
                maxLength="10"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              
              {customFields.map((field, index) => (
                <div key={index} className="w-full">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                    placeholder="Custom Field Name"
                    className="block text-sm font-semibold text-gray-700 mb-1 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-cyan-500 p-0 focus:ring-0 placeholder:text-gray-400 w-full transition-colors"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(index)}
                      className="p-2 text-red-500 hover:text-red-700 border border-transparent rounded-lg hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-center">
              <button type="button" onClick={handleAddCustomField} className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold flex items-center transition-colors">
                <Plus className="h-4 w-4 mr-1" /> Add Custom Basic Field
              </button>
            </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-cyan-50 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Role & Security Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 transition-colors"
                >
                  <option value={1}>Operator</option>
                  <option value={2}>Waiter</option>
                  <option value={3}>Kitchen Staff</option>
                </select>
              </div>

              {formData.role_id === 3 && (
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Assign Kitchen
                  </label>
                  <select
                    name="kitchen_id"
                    value={formData.kitchen_id}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 transition-colors"
                    required
                  >
                    <option value="">Select a Kitchen</option>
                    {kitchens?.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center mt-6">
                <input
                  id="is_active"
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                  Active Account
                </label>
              </div>
            </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-cyan-50 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Documents</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div className="w-full">
               <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhar Card</label>
               <input type="file" name="aadhar_card" onChange={handleChange} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
            </div>
            <div className="w-full">
               <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Card</label>
               <input type="file" name="pan_card" onChange={handleChange} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
            </div>
            <div className="w-full">
               <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Passbook</label>
               <input type="file" name="bank_passbook" onChange={handleChange} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddEmployee;
