import React, { useState } from 'react';
import {
  usePaymentAccounts,
  useAddBankAccount,
  useSetDefaultAccount,
  useDeletePaymentAccount,
  useWithdrawalLimits,
} from '../../hooks/useProfile';
import { useToast } from '../../contexts/ToastContext';
import { AddBankAccountModal } from './modals/AddBankAccountModal';
import { AddMobileWalletModal } from './modals/AddMobileWalletModal';
import { WithdrawalLimitsModal } from './modals/WithdrawalLimitsModal';
import type { PaymentAccount } from '../../types/profile.types';
import { LoadingSpinner } from '../../components/common/Spinner/LoadingSpinner';

export const WalletSettingsTab: React.FC = () => {
  const { data: accounts, isLoading: accountsLoading } = usePaymentAccounts();
  const { data: withdrawalLimits } = useWithdrawalLimits();
  const setDefaultAccount = useSetDefaultAccount();
  const deleteAccount = useDeletePaymentAccount();
  const { showToast } = useToast();

  // Modal states
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddMobileModal, setShowAddMobileModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<PaymentAccount | null>(null);

  const handleSetDefault = async (accountId: string) => {
    try {
      await setDefaultAccount.mutateAsync(accountId);
      showToast('Default payment account updated', 'success');
    } catch (error) {
      showToast('Failed to update default account', 'error');
    }
  };

  const handleDeleteClick = (account: PaymentAccount) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccount.mutateAsync(accountToDelete.id);
      showToast('Payment account deleted', 'success');
      setShowDeleteModal(false);
      setAccountToDelete(null);
    } catch (error) {
      showToast('Failed to delete account', 'error');
    }
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case 'BANK_ACCOUNT':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case 'MOBILE_WALLET':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const formatAccountNumber = (account: PaymentAccount) => {
    if (account.accountType === 'MOBILE_WALLET') {
      return account.phoneNumber || '';
    }
    if (account.accountType === 'BANK_ACCOUNT' && account.accountNumber) {
      return `****${account.accountNumber.slice(-4)}`;
    }
    return account.email || '';
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Withdrawal Limits Summary */}
      {withdrawalLimits && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Withdrawal Limits</h3>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage Limits
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Daily Limit</p>
              <p className="text-2xl font-bold text-gray-900">
                KSH {withdrawalLimits.dailyLimit.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Single Transaction Limit</p>
              <p className="text-2xl font-bold text-gray-900">
                KSH {withdrawalLimits.singleTransactionLimit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Accounts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Accounts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage your withdrawal payment methods
            </p>
          </div>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Account
          </button>
        </div>

        {accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    {getAccountIcon(account.accountType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{account.accountName}</p>
                      {account.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Default
                        </span>
                      )}
                      {account.isVerified && (
                        <span className="text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {account.accountType === 'BANK_ACCOUNT' && account.bankName}
                      {account.accountType === 'MOBILE_WALLET' && account.provider}
                      {' • '}
                      {formatAccountNumber(account)}
                    </p>
                    {account.nickname && (
                      <p className="text-xs text-gray-500 mt-1">{account.nickname}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!account.isDefault && (
                    <button
                      onClick={() => handleSetDefault(account.id)}
                      disabled={setDefaultAccount.isPending}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(account)}
                    disabled={deleteAccount.isPending}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment accounts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a payment account to receive withdrawals
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Payment Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Type Selection Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment Account</h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
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

            <p className="text-sm text-gray-600 mb-6">
              Choose the type of payment account you'd like to add
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAddAccountModal(false);
                  setShowAddBankModal(true);
                }}
                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Bank Account</p>
                  <p className="text-sm text-gray-600">Add a bank account for withdrawals</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAddAccountModal(false);
                  setShowAddMobileModal(true);
                }}
                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Mobile Wallet</p>
                  <p className="text-sm text-gray-600">Add M-Pesa or other mobile money</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Payment Account?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete "{accountToDelete.accountName}"? This action cannot be
              undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAccountToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteAccount.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAccount.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <AddBankAccountModal
          onClose={() => setShowAddBankModal(false)}
          onBack={() => {
            setShowAddBankModal(false);
            setShowAddAccountModal(true);
          }}
        />
      )}

      {/* Add Mobile Wallet Modal */}
      {showAddMobileModal && (
        <AddMobileWalletModal
          onClose={() => setShowAddMobileModal(false)}
          onBack={() => {
            setShowAddMobileModal(false);
            setShowAddAccountModal(true);
          }}
        />
      )}

      {/* Withdrawal Limits Modal */}
      {showWithdrawalModal && withdrawalLimits && (
        <WithdrawalLimitsModal
          currentLimits={withdrawalLimits}
          onClose={() => setShowWithdrawalModal(false)}
        />
      )}
    </div>
  );
};