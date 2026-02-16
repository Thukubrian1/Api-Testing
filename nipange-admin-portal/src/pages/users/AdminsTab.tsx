/**
 * Admins Tab Component
 * Displays and manages system administrators
 */

import React, { useState, useEffect } from 'react';
import type {
  Admin,
  AdminFormData,
  AdminRole,
  AdminStatus,
  UserFilters,
} from '@/types/users.types';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/endpoints/users.api';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';

export function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    gender: undefined,
    role: 'Super Admin' as AdminRole,
    status: 'Active' as AdminStatus,
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async (filters?: UserFilters) => {
    try {
      setLoading(true);
      const response = await usersApi.getAdmins(filters);
      setAdmins(response.data);
    } catch (error) {
      showToast('Failed to load admins', 'error');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchAdmins({ search: query });
  };

  const handleAddAdmin = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      gender: admin.gender,
      role: admin.role,
      status: admin.status,
      password: '',
    });
    setShowEditModal(true);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password) {
      showToast('Password is required', 'error');
      return;
    }

    try {
      await usersApi.createAdmin({
        ...formData,
        password: formData.password!,
      });
      
      showToast('Admin created successfully', 'success');
      setShowAddModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      showToast('Failed to create admin', 'error');
      console.error('Error creating admin:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin) return;

    try {
      await usersApi.updateAdmin(selectedAdmin.id, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        role: formData.role,
        status: formData.status,
      });
      
      showToast('Admin updated successfully', 'success');
      setShowEditModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      showToast('Failed to update admin', 'error');
      console.error('Error updating admin:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      await usersApi.deleteAdmin(selectedAdmin.id);
      showToast('Admin deleted successfully', 'success');
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      showToast('Failed to delete admin', 'error');
      console.error('Error deleting admin:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: undefined,
      role: 'Super Admin' as AdminRole,
      status: 'Active' as AdminStatus,
      password: '',
    });
    setSelectedAdmin(null);
  };

  const getRoleBadgeClass = (role: AdminRole) => {
    const baseClass = 'inline-block px-3 py-1.5 rounded-xl text-xs font-bold capitalize';
    switch (role) {
      case 'Super Admin':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'Admin':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'Moderator':
        return `${baseClass} bg-sky-100 text-sky-800`;
      case 'Data Analyst':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return baseClass;
    }
  };

  const getStatusBadgeClass = (status: AdminStatus) => {
    const baseClass = 'inline-block px-3 py-1.5 rounded-xl text-xs font-bold capitalize';
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'pending':
      case 'suspended':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'inactive':
        return `${baseClass} bg-gray-200 text-gray-700`;
      default:
        return baseClass;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#5b7cff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth={false}
          />
        </div>
        <Button onClick={handleAddAdmin} variant="primary">
          <span className="text-lg font-bold">+</span> Add Admin
        </Button>
      </div>

      {/* Admins Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Name</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Email</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Phone</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Last Login</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Role</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Status</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No admins found
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{admin.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{admin.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{admin.phone || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{admin.lastLogin}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={getRoleBadgeClass(admin.role)}>{admin.role}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={getStatusBadgeClass(admin.status)}>{admin.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button 
                      className="bg-transparent border-none text-gray-900 text-sm font-semibold cursor-pointer mr-4 hover:text-[#5b7cff] transition-colors"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-transparent border-none text-red-600 text-sm font-semibold cursor-pointer hover:text-red-700 transition-colors"
                      onClick={() => handleDeleteAdmin(admin)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Admin"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Gender</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.gender || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as 'Male' | 'Female' | 'Other' | undefined,
                })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Role *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              required
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Status *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminStatus })}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Admin"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input label="Email" type="email" value={formData.email} disabled />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Gender</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.gender || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as 'Male' | 'Female' | 'Other' | undefined,
                })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Role *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              required
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Status *</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminStatus })}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${selectedAdmin?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}