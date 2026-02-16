/**
 * Stats Card Component
 * Displays statistics with icons and trends using Tailwind CSS
 */

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendType: 'positive' | 'neutral' | 'negative';
  icon: string;
}

export function StatsCard({ title, value, trend, trendType, icon }: StatsCardProps) {
  const getTrendClasses = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    switch (trendType) {
      case 'positive':
        return '↑';
      case 'negative':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendClasses()}`}>
        <span>{getTrendIcon()}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}