import React, { useState } from 'react';
import { ProfileTab } from './ProfileTab';
import { WalletSettingsTab } from './WalletSettingsTab';

type TabType = 'profile' | 'wallet';

export const ProfileAndWalletSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header - Simple version without provider badge */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Profile & Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile, payment accounts, and security settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === 'wallet'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                Wallet Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'wallet' && <WalletSettingsTab />}
        </div>
      </div>
    </div>
  );
};