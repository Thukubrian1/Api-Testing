import React from 'react';
import { calculatePasswordStrength } from '../../../utils/validation';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = '',
}) => {
  const { score, label, color } = calculatePasswordStrength(password);

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'orange':
        return 'bg-orange-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColorClass = () => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getWidthPercentage = () => {
    return `${(score / 7) * 100}%`;
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${getTextColorClass()}`}>
          {label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getColorClasses()}`}
          style={{ width: getWidthPercentage() }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Use at least 8 characters with uppercase, lowercase, and numbers
      </div>
    </div>
  );
};