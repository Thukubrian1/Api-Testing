import React, { useState, useEffect } from 'react';
import { useUpdateWithdrawalLimits } from '../../../hooks/useProfile';
import { useToast } from '../../../contexts/ToastContext';
import type { WithdrawalLimitSettings } from '../../../types/profile.types';

interface WithdrawalLimitsModalProps {
  currentLimits: WithdrawalLimitSettings;
  onClose: () => void;
}

export const WithdrawalLimitsModal: React.FC<WithdrawalLimitsModalProps> = ({
  currentLimits,
  onClose,
}) => {
  const updateLimits = useUpdateWithdrawalLimits();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<WithdrawalLimitSettings>(currentLimits);

  useEffect(() => {
    setFormData(currentLimits);
  }, [currentLimits]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.dailyLimit < formData.singleTransactionLimit) {
      showToast('Daily limit must be greater than or equal to single transaction limit', 'error');
      return;
    }

    if (formData.largeTransactionAlerts && !formData.alertThreshold) {
      showToast('Please set an alert threshold', 'error');
      return;
    }

    try {
      await updateLimits.mutateAsync(formData);
      showToast('Withdrawal limits updated successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to update withdrawal limits', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Withdrawal Limits & Notifications
          </h3>
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
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* Withdrawal Limits Section */}
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-semibold text-gray-900">Withdrawal Limits</h4>

            {/* Daily Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Withdrawal Limit
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 font-medium">
                  KSH
                </span>
                <input
                  type="number"
                  name="dailyLimit"
                  value={formData.dailyLimit}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Maximum amount you can withdraw per day
              </p>
            </div>

            {/* Single Transaction Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Single Transaction Limit
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 font-medium">
                  KSH
                </span>
                <input
                  type="number"
                  name="singleTransactionLimit"
                  value={formData.singleTransactionLimit}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Maximum amount per withdrawal transaction
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Security Note</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Setting lower limits helps protect your account. You can always adjust these
                    limits later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Notification Preferences Section */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Notification Preferences</h4>

            {/* Email Notifications */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Receive email alerts for all transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900">
                  SMS Notifications
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Receive SMS alerts for transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Large Transaction Alerts */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Large Transaction Alerts
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get notified for transactions above threshold
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    name="largeTransactionAlerts"
                    checked={formData.largeTransactionAlerts}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.largeTransactionAlerts && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 font-medium">
                      KSH
                    </span>
                    <input
                      type="number"
                      name="alertThreshold"
                      value={formData.alertThreshold || 0}
                      onChange={handleChange}
                      min="0"
                      step="10000"
                      className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateLimits.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLimits.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};