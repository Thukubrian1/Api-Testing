/**
 * Service Providers Tab Component
 * Manages service providers with full CRUD operations, documents, and approval workflow
 */

import React, { useState, useEffect } from 'react';

import type {
  ServiceProvider,
  ProviderFormData,
  ProviderStatus,
  Category,
  ProviderStats,
  ProviderDocument,
  UserFilters,
} from '@/types/users.types';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/endpoints/users.api';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { StatsCard } from '@/components/ui/StatsCard';

interface ServiceProvidersTabProps {
  categories: Category[];
}

export function ServiceProvidersTab({ categories }: ServiceProvidersTabProps) {
  // State
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [stats, setStats] = useState<ProviderStats>({
    active: 0,
    pending: 0,
    avgSessionTime: '0m',
    newThisWeek: 0,
    sessionChange: '0m',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { showToast } = useToast();

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReinstateDialog, setShowReinstateDialog] = useState(false);

  // Selected Items
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  // Form Data
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    email: '',
    phone: '',
    description: '',
    categories: [],
    subcategories: [],
    password: '',
  });

  const [actionReason, setActionReason] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  // Effects
  useEffect(() => {
    fetchProviders();
    fetchStats();
  }, []);

  useEffect(() => {
    const newSubcategories: string[] = [];
    formData.categories.forEach((categoryName) => {
      const category = categories.find((c) => c.name === categoryName);
      if (category) {
        newSubcategories.push(...category.subcategories);
      }
    });
    setAvailableSubcategories(newSubcategories);
  }, [formData.categories, categories]);

  // API Calls
  const fetchProviders = async (filters?: UserFilters) => {
    try {
      setLoading(true);
      const response = await usersApi.getServiceProviders(filters);
      setProviders(response.data);
    } catch (error) {
      showToast('Failed to load service providers', 'error');
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await usersApi.getProviderStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching provider stats:', error);
    }
  };

  // Search and Filter
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status);
  };

  const applyFilters = (search: string, status: string) => {
    const filters: UserFilters = {};
    if (search) filters.search = search;
    if (status) filters.status = status as ProviderStatus;
    fetchProviders(filters);
  };

  // Actions
  const handleAddProvider = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleViewProvider = async (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowViewModal(true);
  };

  const handleApproveProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowApproveDialog(true);
  };

  const handleRejectProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setActionReason('');
    setShowRejectDialog(true);
  };

  const handleSuspendProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setActionReason('');
    setShowSuspendDialog(true);
  };

  const handleReinstateProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setActionReason('');
    setShowReinstateDialog(true);
  };

  const handleUpdateCommission = async (provider: ServiceProvider, commission: number) => {
    try {
      await usersApi.updateProviderCommission(provider.id, commission);
      showToast('Commission updated successfully', 'success');
      fetchProviders();
    } catch (error) {
      showToast('Failed to update commission', 'error');
      console.error('Error updating commission:', error);
    }
  };

  // Form Submissions
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      showToast('Password is required', 'error');
      return;
    }

    try {
      await usersApi.createServiceProvider({
        ...formData,
        password: formData.password!,
      });

      showToast('Service provider created successfully', 'success');
      setShowAddModal(false);
      resetForm();
      fetchProviders();
      fetchStats();
    } catch (error) {
      showToast('Failed to create service provider', 'error');
      console.error('Error creating provider:', error);
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedProvider) return;

    try {
      await usersApi.approveServiceProvider(selectedProvider.id);
      showToast('Service provider approved successfully', 'success');
      setShowApproveDialog(false);
      setSelectedProvider(null);
      fetchProviders();
      fetchStats();
    } catch (error) {
      showToast('Failed to approve service provider', 'error');
      console.error('Error approving provider:', error);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedProvider || !actionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      await usersApi.rejectServiceProvider(selectedProvider.id, { reason: actionReason });
      showToast('Service provider rejected', 'success');
      setShowRejectDialog(false);
      setSelectedProvider(null);
      setActionReason('');
      fetchProviders();
      fetchStats();
    } catch (error) {
      showToast('Failed to reject service provider', 'error');
      console.error('Error rejecting provider:', error);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedProvider || !actionReason.trim()) {
      showToast('Please provide a reason for suspension', 'error');
      return;
    }

    try {
      await usersApi.suspendServiceProvider(selectedProvider.id, { reason: actionReason });
      showToast('Service provider suspended', 'success');
      setShowSuspendDialog(false);
      setSelectedProvider(null);
      setActionReason('');
      fetchProviders();
      fetchStats();
    } catch (error) {
      showToast('Failed to suspend service provider', 'error');
      console.error('Error suspending provider:', error);
    }
  };

  const handleConfirmReinstate = async () => {
    if (!selectedProvider) return;

    try {
      await usersApi.reinstateServiceProvider(selectedProvider.id, {
        reason: actionReason || undefined,
      });
      showToast('Service provider reinstated successfully', 'success');
      setShowReinstateDialog(false);
      setSelectedProvider(null);
      setActionReason('');
      fetchProviders();
      fetchStats();
    } catch (error) {
      showToast('Failed to reinstate service provider', 'error');
      console.error('Error reinstating provider:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      description: '',
      categories: [],
      subcategories: [],
      password: '',
    });
    setSelectedProvider(null);
    setActionReason('');
  };

  // Utility Functions
  const getCategoriesDisplay = (categoryList: string[]) => {
    if (categoryList.length === 0) return '-';
    if (categoryList.length <= 2) return categoryList.join(', ');
    return `${categoryList[0]}, +${categoryList.length - 1} more`;
  };

  const getDocumentCount = (provider: ServiceProvider) => {
    return provider.documents?.length || 0;
  };

  const getStatusBadgeClass = (status: ProviderStatus) => {
    const baseClass = 'inline-block px-3 py-1.5 rounded-xl text-xs font-bold capitalize';
    switch (status.toLowerCase()) {
      case 'approved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'suspended':
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-200 text-gray-700`;
    }
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoryName],
      });
    } else {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== categoryName),
        subcategories: formData.subcategories.filter((s) => {
          const category = categories.find((cat) => cat.name === categoryName);
          return !category?.subcategories.includes(s);
        }),
      });
    }
  };

  const handleSubcategoryChange = (subcategoryName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, subcategoryName],
      });
    } else {
      setFormData({
        ...formData,
        subcategories: formData.subcategories.filter((s) => s !== subcategoryName),
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
          title="Active Providers"
          value={stats.active}
          trend={`+${stats.newThisWeek} this week`}
          trendType="positive"
          icon="📅"
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending}
          trend="Requires Review"
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
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Input
            type="text"
            placeholder="Search by provider, email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth={false}
          />
        </div>
        <Button onClick={handleAddProvider} variant="primary">
          <span className="text-lg font-bold">+</span> Add Service Provider
        </Button>
      </div>

      {/* Service Providers Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Service Provider</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Email</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Phone Number</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Categories</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Events</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Commission(%)</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Documents</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Status</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-gray-900 capitalize">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No service providers found
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr key={provider.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{provider.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{provider.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{provider.phone}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{getCategoriesDisplay(provider.categories)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{provider.events}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <input
                      type="number"
                      value={provider.commission || 0}
                      onChange={(e) =>
                        handleUpdateCommission(provider, parseFloat(e.target.value))
                      }
                      onBlur={(e) => handleUpdateCommission(provider, parseFloat(e.target.value))}
                      className="w-[70px] px-2 py-1.5 border border-gray-200 rounded text-sm font-semibold text-center transition-all focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 hover:border-[#5b7cff]"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button className="text-blue-700 bg-blue-50 border border-blue-400 px-3 py-1.5 font-bold text-xs rounded-xl transition-all hover:bg-blue-100" onClick={() => alert('Documents modal coming soon')}>
                      View Docs ({getDocumentCount(provider)} file(s))
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={getStatusBadgeClass(provider.status)}>{provider.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold cursor-pointer transition-all bg-white text-gray-900 hover:border-[#5b7cff] hover:text-[#5b7cff] hover:-translate-y-0.5" onClick={() => handleViewProvider(provider)}>
                      View
                    </button>

                    {provider.status === 'Approved' && (
                      <button
                        className="px-3 py-1.5 bg-red-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-red-700 hover:-translate-y-0.5"
                        onClick={() => handleSuspendProvider(provider)}
                      >
                        Suspend
                      </button>
                    )}

                    {provider.status === 'Pending' && (
                      <>
                        <button
                          className="px-3 py-1.5 bg-red-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-red-700 hover:-translate-y-0.5"
                          onClick={() => handleRejectProvider(provider)}
                        >
                          Reject
                        </button>
                        <button
                          className="px-3 py-1.5 bg-green-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-green-700 hover:-translate-y-0.5"
                          onClick={() => handleApproveProvider(provider)}
                        >
                          Approve
                        </button>
                      </>
                    )}

                    {(provider.status === 'Suspended' || provider.status === 'Rejected') && (
                      <button
                        className="px-3 py-1.5 bg-green-600 text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-green-700 hover:-translate-y-0.5"
                        onClick={() => handleReinstateProvider(provider)}
                      >
                        Reinstate
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

      {/* Add Provider Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Service Provider"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="form-grid-2">
            <Input
              label="Provider Name"
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
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Categories *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#5b7cff] border-gray-300 rounded focus:ring-[#5b7cff]"
                    checked={formData.categories.includes(category.name)}
                    onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Subcategories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubcategories.map((subcategory) => (
                  <label key={subcategory} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#5b7cff] border-gray-300 rounded focus:ring-[#5b7cff]"
                      checked={formData.subcategories.includes(subcategory)}
                      onChange={(e) => handleSubcategoryChange(subcategory, e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">{subcategory}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              Add Provider
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Provider Modal */}
      {selectedProvider && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProvider(null);
          }}
          title="Provider Details"
          size="lg"
        >
          <div className="provider-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedProvider.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{selectedProvider.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{selectedProvider.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={getStatusBadgeClass(selectedProvider.status)}>
                {selectedProvider.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Categories:</span>
              <span className="detail-value">{selectedProvider.categories.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Events:</span>
              <span className="detail-value">{selectedProvider.events}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Commission:</span>
              <span className="detail-value">{selectedProvider.commission}%</span>
            </div>
            {selectedProvider.description && (
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedProvider.description}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Approve Confirmation */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => {
          setShowApproveDialog(false);
          setSelectedProvider(null);
        }}
        onConfirm={handleConfirmApprove}
        title="Approve Service Provider"
        message={`Are you sure you want to approve ${selectedProvider?.name}?`}
        confirmText="Approve"
        confirmVariant="primary"
      />

      {/* Reject Dialog with Reason */}
      <Modal
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setSelectedProvider(null);
          setActionReason('');
        }}
        title="Reject Service Provider"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Please provide a reason for rejecting {selectedProvider?.name}:
          </p>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#5b7cff] focus:ring-2 focus:ring-[#5b7cff]/10 transition-all resize-none"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            rows={4}
            placeholder="Enter rejection reason..."
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedProvider(null);
                setActionReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReject}>
              Reject Provider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Dialog with Reason */}
      <Modal
        isOpen={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false);
          setSelectedProvider(null);
          setActionReason('');
        }}
        title="Suspend Service Provider"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Please provide a reason for suspending {selectedProvider?.name}:
          </p>
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
                setSelectedProvider(null);
                setActionReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmSuspend}>
              Suspend Provider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reinstate Confirmation */}
      <ConfirmDialog
        isOpen={showReinstateDialog}
        onClose={() => {
          setShowReinstateDialog(false);
          setSelectedProvider(null);
          setActionReason('');
        }}
        onConfirm={handleConfirmReinstate}
        title="Reinstate Service Provider"
        message={`Are you sure you want to reinstate ${selectedProvider?.name}?`}
        confirmText="Reinstate"
        confirmVariant="primary"
      />
    </div>
  );
}