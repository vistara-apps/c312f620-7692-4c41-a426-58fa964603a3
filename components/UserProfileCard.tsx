'use client';

import { User, Settings2 } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface UserProfileCardProps {
  user: UserType;
  variant?: 'default' | 'compact';
}

export function UserProfileCard({ user, variant = 'default' }: UserProfileCardProps) {
  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600 capitalize">
              {user.subscriptionStatus} Plan
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Settings2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {variant === 'default' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Age</p>
            <p className="font-semibold">{user.age}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Activity</p>
            <p className="font-semibold capitalize">{user.activityLevel.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {user.dietaryPreferences.slice(0, 3).map((pref, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {pref}
          </span>
        ))}
        {user.dietaryPreferences.length > 3 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{user.dietaryPreferences.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
