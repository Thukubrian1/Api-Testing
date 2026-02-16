import React, { useState } from 'react';
import { useAddMobileWallet } from '../../../hooks/useProfile';
import { useToast } from '../../../contexts/ToastContext';
import type { MobileWalletData } from '../../../types/profile.types';

interface AddMobileWalletModalProps {
  onClose: () => void;
  onBack: () => void;
}

const MOBILE_PROVIDERS = [
  { value: 'M-PESA', label: 'M-Pesa (Safaricom)' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'T-KASH', label: 'T-Kash (Telkom)' },
  { value: 'EQUITEL', label: 'Equitel' },
];

export const AddMobileWalletModal: React.FC<AddMobileWalletModalProps> = ({ onClose, onBack }) => {
  const addMobileWallet = useAddMobileWallet();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<MobileWalletData>({
    provider: '',
    phoneNumber: '',
    accountName: '',
    nickname: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MobileWalletData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof MobileWalletData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MobileWalletData, string>> = {};

    if (!formData.provider) {
      newErrors.provider = 'Please select a mobile money provider';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Normalize phone number before sending
      const normalizedPhone = formData.phoneNumber
        .replace(/\s/g, '')
        .replace(/^0/, '+254');

      await addMobileWallet.mutateAsync({
        ...formData,
        phoneNumber: normalizedPhone,
      });
      
      showToast('Mobile wallet added successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to add mobile wallet', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">Add Mobile Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Money Provider <span className="text-red-600">*</span>
            </label>
            <select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.provider ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a provider</option>
              {MOBILE_PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g., +254 712 345 678 or 0712 345 678"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The phone number registered with {formData.provider || 'your mobile money provider'}
            </p>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="Name registered on the mobile money account"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.accountName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
            )}
          </div>

          {/* Nickname (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname (Optional)
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="e.g., My M-Pesa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              A friendly name to help you identify this wallet
            </p>
          </div>

          {/* Info Boxes */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Verification Required</p>
                  <p className="text-xs text-blue-700 mt-1">
                    We'll send a verification code to this number to confirm it's yours.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-green-800 font-medium">Instant Withdrawals</p>
                  <p className="text-xs text-green-700 mt-1">
                    Receive funds directly to your mobile wallet, typically within minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMobileWallet.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMobileWallet.isPending ? 'Adding...' : 'Add Mobile Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};