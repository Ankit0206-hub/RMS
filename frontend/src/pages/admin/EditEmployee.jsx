import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Shield, Key, Plus, X, FileText, Trash2, Camera, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Input } from '../../components/ui';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: 1,
    kitchen_id: '',
    is_active: true,
    image_url: '',
    aadhar_url: '',
    pan_url: '',
    passbook_url: ''
  });

  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await api.get(`/admin/employees/${id}`);
      return response.data.data;
    },
  });

  const { data: kitchens } = useQuery({
    queryKey: ['kitchens'],
    queryFn: async () => {
      const response = await api.get('/admin/kitchen/list');
      return response.data.data || [];
    }
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/admin/roles/');
      return res.data.data || [];
    }
  });

  useEffect(() => {
    if (employeeData) {
      setFormData({
        first_name: employeeData.first_name || '',
        last_name: employeeData.last_name || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        employee_code: employeeData.employee_code || '',
        password: '', // Don't populate password
        role_id: employeeData.role_id || 1,
        kitchen_id: employeeData.kitchen_id || '',
        is_active: employeeData.is_active !== undefined ? employeeData.is_active : true,
        image_url: employeeData.image_url || '',
        aadhar_url: employeeData.aadhar_url || '',
        pan_url: employeeData.pan_url || '',
        passbook_url: employeeData.passbook_url || ''
      });
    }
  }, [employeeData]);

  const mutation = useMutation({
    mutationFn: async (updatedEmployee) => {
      // Remove password if empty so we don't overwrite with empty string
      const payload = { ...updatedEmployee };
      if (!payload.password) {
        delete payload.password;
      }
      if (payload.role_id === 3 && payload.kitchen_id) {
        payload.kitchen_id = parseInt(payload.kitchen_id);
      } else {
        payload.kitchen_id = null;
      }
      const response = await api.put(`/admin/employees/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Employee updated successfully');
      queryClient.invalidateQueries(['employees']);
      navigate('/admin/employees');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update employee';
      toast.error(message);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' || name === 'role_id' ? parseInt(value) : value
    }));
  };

  const createRoleMutation = useMutation({
    mutationFn: async (name) => {
      const response = await api.post('/admin/roles/', { name });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries(['roles']);
      setFormData(prev => ({ ...prev, role_id: data.data.id }));
      setIsRoleModalOpen(false);
      setNewRoleName('');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create role';
      toast.error(message);
    }
  });

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (newRoleName.trim()) {
      createRoleMutation.mutate(newRoleName.trim());
    }
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append('file', file);

    setIsUploading(true);
    try {
        const response = await api.post('/admin/employees/upload-image', formDataToUpload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        setFormData(prev => ({ ...prev, image_url: response.data.data.image_url }));
        toast.success('Profile picture uploaded');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
        setIsUploading(false);
    }
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading document...');
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
        const response = await api.post('/admin/employees/upload-document', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = response.data.data.document_url;
        setFormData(prev => ({ ...prev, [documentType]: url }));
        toast.success('Document uploaded successfully', { id: toastId });
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to upload document', { id: toastId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

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
          <h2 className="text-xl font-bold text-gray-900">Edit Employee</h2>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Update Employee
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

            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 transition-colors ${formData.image_url ? 'border-transparent' : 'border-gray-300 hover:border-cyan-500 hover:bg-cyan-50'}`}>
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-400 mx-auto group-hover:text-cyan-500 mb-1 transition-colors" />
                          <span className="text-[10px] font-semibold text-gray-500 group-hover:text-cyan-600">Add Photo</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                {formData.image_url && (
                   <button
                     type="button"
                     onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, image_url: '' })); }}
                     className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 shadow-sm hover:bg-red-200 transition-colors z-10"
                   >
                     <X className="w-3 h-3" />
                   </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <Input
                label="Employee ID"
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                placeholder="e.g. EX010"
                required
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
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                required
              />
              <Input
                label="Password (Leave blank to keep current)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <button type="button" onClick={() => setIsRoleModalOpen(true)} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> New Role
                  </button>
                </div>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 transition-colors"
                >
                  {roles?.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
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
                 <input type="file" onChange={(e) => handleDocumentUpload(e, 'aadhar_url')} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 mb-2" />
                 {formData.aadhar_url && <a href={formData.aadhar_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline">View Uploaded Aadhar</a>}
              </div>
              <div className="w-full">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Card</label>
                 <input type="file" onChange={(e) => handleDocumentUpload(e, 'pan_url')} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 mb-2" />
                 {formData.pan_url && <a href={formData.pan_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline">View Uploaded PAN</a>}
              </div>
              <div className="w-full">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Passbook</label>
                 <input type="file" onChange={(e) => handleDocumentUpload(e, 'passbook_url')} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 mb-2" />
                 {formData.passbook_url && <a href={formData.passbook_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 hover:underline">View Uploaded Passbook</a>}
              </div>
            </div>
          </div>
      </div>

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Add New Role</h3>
                    <button type="button" onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Role Name*</label>
                            <input 
                                type="text" 
                                required 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500" 
                                placeholder="e.g. Cleaning Staff"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="button" onClick={handleCreateRole} disabled={createRoleMutation.isPending || !newRoleName.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors disabled:opacity-50">
                            {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </form>
  );
};

export default EditEmployee;
