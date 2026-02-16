import React, { useState } from 'react';
import { useAddBankAccount } from '../../../hooks/useProfile';
import { useToast } from '../../../contexts/ToastContext';
import type { BankAccountData } from '../../../types/profile.types';

interface AddBankAccountModalProps {
  onClose: () => void;
  onBack: () => void;
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({ onClose, onBack }) => {
  const addBankAccount = useAddBankAccount();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<BankAccountData>({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branchName: '',
    swiftCode: '',
    nickname: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BankAccountData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BankAccountData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BankAccountData, string>> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 8) {
      newErrors.accountNumber = 'Account number must be at least 8 digits';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
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
      await addBankAccount.mutateAsync(formData);
      showToast('Bank account added successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to add bank account', 'error');
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
            <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
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
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g., Equity Bank"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bankName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="e.g., 01234567890"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.accountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
            )}
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
              placeholder="Name as it appears on the account"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.accountName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              placeholder="e.g., Westlands Branch"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.branchName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.branchName && (
              <p className="mt-1 text-sm text-red-600">{errors.branchName}</p>
            )}
          </div>

          {/* SWIFT Code (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SWIFT Code (Optional)
            </label>
            <input
              type="text"
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleChange}
              placeholder="e.g., EQBLKENA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for international transfers
            </p>
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
              placeholder="e.g., My Business Account"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              A friendly name to help you identify this account
            </p>
          </div>

          {/* Info Box */}
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
                  A verification code will be sent to your registered email and phone number to
                  confirm this account.
                </p>
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
              disabled={addBankAccount.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addBankAccount.isPending ? 'Adding...' : 'Add Bank Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};