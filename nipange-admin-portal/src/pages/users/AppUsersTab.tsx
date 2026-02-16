/**
 * App Users Tab Component
 * Manages application end users
 */

import React, { useState, useEffect } from 'react';
import type {
  AppUser,
  AppUserFormData,
  UserType,
  UserStatus,
  BudgetTier,
  Category,
  UserStats,
  UserFilters,
} from '@/types/users.types';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/endpoints/users.api';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { StatsCard } from '@/components/ui/StatsCard';

interface AppUsersTabProps {
  categories: Category[];
}

export function AppUsersTab({ categories }: AppUsersTabProps) {
  // State
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    active: 0,
    premium: 0,
    avgSessionTime: '0m',
    newThisWeek: 0,
    sessionChange: '0m',
    premiumPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { showToast } = useToast();

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  // Selected Items
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Form Data
  const [formData, setFormData] = useState<AppUserFormData>({
    name: '',
    email: '',
    phone: '',
    gender: undefined,
    dateOfBirth: '',
    location: '',
    categoryPreference: [],
    budgetTier: undefined,
    userType: 'Standard' as UserType,
    password: '',
  });

  const [actionReason, setActionReason] = useState('');

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // API Calls
  const fetchUsers = async (filters?: UserFilters) => {
    try {
      setLoading(true);
      const response = await usersApi.getAppUsers(filters);
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to load app users', 'error');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await usersApi.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Search and Filter
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, typeFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    applyFilters(searchQuery, type);
  };

  const applyFilters = (search: string, type: string) => {
    const filters: UserFilters = {};
    if (search) filters.search = search;
    if (type) filters.userType = type as UserType;
    fetchUsers(filters);
  };

  // Actions
  const handleAddUser = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleViewUser = async (user: AppUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleSuspendUser = (user: AppUser) => {
    setSelectedUser(user);
    setActionReason('');
    setShowSuspendDialog(true);
  };

  const handleReactivateUser = (user: AppUser) => {
    setSelectedUser(user);
    setActionReason('');
    setShowReactivateDialog(true);
  };

  // Form Submissions
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      showToast('Password is required', 'error');
      return;
    }

    try {
      await usersApi.createAppUser({
        ...formData,
        password: formData.password!,
      });

      showToast('App user created successfully', 'success');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
      fetchStats();
    } catch (error) {
      showToast('Failed to create app user', 'error');
      console.error('Error creating user:', error);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser || !actionReason.trim()) {
      showToast('Please provide a reason for suspension', 'error');
      return;
    }

    try {
      await usersApi.suspendAppUser(selectedUser.id, { reason: actionReason });
      showToast('App user suspended', 'success');
      setShowSuspendDialog(false);
      setSelectedUser(null);
      setActionReason('');
      fetchUsers();
      fetchStats();
    } catch (error) {
      showToast('Failed to suspend app user', 'error');
      console.error('Error suspending user:', error);
    }
  };

  const handleConfirmReactivate = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.reactivateAppUser(selectedUser.id, {
        reason: actionReason || undefined,
      });
      showToast('App user reactivated successfully', 'success');
      setShowReactivateDialog(false);
      setSelectedUser(null);
      setActionReason('');
      fetchUsers();
      fetchStats();
    } catch (error) {
      showToast('Failed to reactivate app user', 'error');
      console.error('Error reactivating user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: undefined,
      dateOfBirth: '',
      location: '',
      categoryPreference: [],
      budgetTier: undefined,
      userType: 'Standard' as UserType,
      password: '',
    });
    setSelectedUser(null);
    setActionReason('');
  };

  // Utility Functions
  const getCategoriesDisplay = (categoryList: string[]) => {
    if (categoryList.length === 0) return '-';
    if (categoryList.length <= 2) return categoryList.join(', ');
    return `${categoryList[0]}, +${categoryList.length - 1} more`;
  };

  const getStatusBadgeClass = (status: UserStatus) => {
    const baseClass = 'inline-block px-3 py-1.5 rounded-xl text-xs font-bold capitalize';
    switch (status.toLowerCase()) {
      case 'active':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'suspended':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'inactive':
        return `${baseClass} bg-gray-200 text-gray-700`;
      default:
        return baseClass;
    }
  };

  const getUserTypeBadgeClass = (userType: UserType) => {
    const baseClass = 'inline-block px-3 py-1.5 rounded-xl text-xs font-bold capitalize';
    switch (userType.toLowerCase()) {
      case 'premium':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'vip':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'standard':
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return baseClass;
    }
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        categoryPreference: [...formData.categoryPreference, categoryName],
      });
    } else {
      setFormData({
        ...formData,
        categoryPreference: formData.categoryPreference.filter((c) => c !== categoryName),
      });
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Active Users"
          value={stats.active}
          trend={`+${stats.newThisWeek} this week`}
          trendType="positive"
          icon="📅"
        />
        <StatsCard
          title="Premium Users"
          value={stats.premium}
          trend={`${stats.premiumPercentage}% of total`}
          trendType="neutral"
          icon="📅"
        />
        <StatsCard
          title="AVG. Session Time"
          value={stats.avgSessionTime}
          trend={`+${stats.sessionChange} last week`}
          trendType="positive"
          icon="📅"
        />
      </div>

      {/* Search and Filter Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white cursor-pointer min-w-[140px] font-medium text-gray-900 focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10"
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
          >
            <option value="">All Users</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>
          <Input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth={false}
          />
        </div>
        <Button onClick={handleAddUser} variant="primary">
          <span className="text-lg font-bold">+</span> Add App User
        </Button>
      </div>

      {/* App Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Name</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Email</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Phone</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Location</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Category Preference</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">User Type</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Events Attended</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Status</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No app users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{user.phone}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{user.location}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{getCategoriesDisplay(user.categoryPreference)}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={getUserTypeBadgeClass(user.userType)}>{user.userType}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{user.eventsAttended}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={getStatusBadgeClass(user.status)}>{user.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold cursor-pointer transition-all bg-white text-gray-900 hover:border-[#5b7cff] hover:text-[#5b7cff] hover:-translate-y-0.5"
                        onClick={() => handleViewUser(user)}
                      >
                        View
                      </button>

                      {user.status === 'Active' && (
                        <button 
                          className="px-3 py-1.5 bg-red-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-red-700 hover:-translate-y-0.5"
                          onClick={() => handleSuspendUser(user)}
                        >
                          Suspend
                        </button>
                      )}

                      {user.status === 'Suspended' && (
                        <button
                          className="px-3 py-1.5 bg-green-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-green-700 hover:-translate-y-0.5"
                          onClick={() => handleReactivateUser(user)}
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New App User"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              required
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
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

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">User Type *</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as UserType })}
                required
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Budget Tier</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all"
                value={formData.budgetTier || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetTier: e.target.value as BudgetTier | undefined,
                  })
                }
              >
                <option value="">Select Budget Tier</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Category Preferences</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#5b7cff] border-gray-300 rounded focus:ring-[#5b7cff]"
                    checked={formData.categoryPreference.includes(category.name)}
                    onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

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
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      {selectedUser && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          title="User Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Name:</span>
              <span className="text-sm text-gray-900">{selectedUser.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Email:</span>
              <span className="text-sm text-gray-900">{selectedUser.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Phone:</span>
              <span className="text-sm text-gray-900">{selectedUser.phone}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Location:</span>
              <span className="text-sm text-gray-900">{selectedUser.location}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Gender:</span>
              <span className="text-sm text-gray-900">{selectedUser.gender || '-'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Date of Birth:</span>
              <span className="text-sm text-gray-900">{selectedUser.dateOfBirth || '-'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">User Type:</span>
              <span className={getUserTypeBadgeClass(selectedUser.userType)}>
                {selectedUser.userType}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Budget Tier:</span>
              <span className="text-sm text-gray-900">{selectedUser.budgetTier || '-'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Status:</span>
              <span className={getStatusBadgeClass(selectedUser.status)}>{selectedUser.status}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">Events Attended:</span>
              <span className="text-sm text-gray-900">{selectedUser.eventsAttended}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm font-semibold text-gray-600">Category Preferences:</span>
              <span className="text-sm text-gray-900">
                {selectedUser.categoryPreference.join(', ') || '-'}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend Dialog with Reason */}
      <Modal
        isOpen={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false);
          setSelectedUser(null);
          setActionReason('');
        }}
        title="Suspend App User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Please provide a reason for suspending {selectedUser?.name}:</p>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all resize-none"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={4}
            placeholder="Enter suspension reason..."
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSuspendDialog(false);
                setSelectedUser(null);
                setActionReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmSuspend}>
              Suspend User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reactivate Confirmation */}
      <ConfirmDialog
        isOpen={showReactivateDialog}
        onClose={() => {
          setShowReactivateDialog(false);
          setSelectedUser(null);
          setActionReason('');
        }}
        onConfirm={handleConfirmReactivate}
        title="Reactivate App User"
        message={`Are you sure you want to reactivate ${selectedUser?.name}?`}
        confirmText="Reactivate"
        confirmVariant="primary"
      />
    </div>
  );
}