import React, { useState, useEffect } from 'react';
import type { Category } from '@/types/users.types';
import { usersApi } from '@/api/endpoints/users.api';
import { AdminsTab } from './AdminsTab';
import { ServiceProvidersTab } from './ServiceProvidersTab';
import { AppUsersTab } from './AppUsersTab';
import { useToast } from '@/hooks/useToast';

type TabType = 'admins' | 'providers' | 'users';

export function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('admins');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users & Service Providers</h1>
        <p className="text-gray-600 mt-2">Manage all system users, service providers, and app users</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-6 mb-8 border-b-2 border-gray-200 pb-4">
        <button
          className={`flex items-center gap-2 pb-3 px-0 text-base font-medium border-none bg-transparent cursor-pointer transition-all relative ${
            activeTab === 'admins'
              ? 'text-[#5b7cff] font-semibold after:content-[""] after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-0.5 after:bg-[#5b7cff]'
              : 'text-gray-900 hover:text-[#5b7cff]'
          }`}
          onClick={() => handleTabSwitch('admins')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Admins
        </button>

        <button
          className={`flex items-center gap-2 pb-3 px-0 text-base font-medium border-none bg-transparent cursor-pointer transition-all relative ${
            activeTab === 'providers'
              ? 'text-[#5b7cff] font-semibold after:content-[""] after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-0.5 after:bg-[#5b7cff]'
              : 'text-gray-900 hover:text-[#5b7cff]'
          }`}
          onClick={() => handleTabSwitch('providers')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Service Providers
        </button>

        <button
          className={`flex items-center gap-2 pb-3 px-0 text-base font-medium border-none bg-transparent cursor-pointer transition-all relative ${
            activeTab === 'users'
              ? 'text-[#5b7cff] font-semibold after:content-[""] after:absolute after:-bottom-[18px] after:left-0 after:right-0 after:h-0.5 after:bg-[#5b7cff]'
              : 'text-gray-900 hover:text-[#5b7cff]'
          }`}
          onClick={() => handleTabSwitch('users')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          App Users
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'admins' && <AdminsTab />}
        {activeTab === 'providers' && <ServiceProvidersTab categories={categories} />}
        {activeTab === 'users' && <AppUsersTab categories={categories} />}
      </div>
    </div>
  );
}