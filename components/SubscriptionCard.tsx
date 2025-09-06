'use client';

import { Crown, Star, Zap } from 'lucide-react';

interface SubscriptionCardProps {
  currentPlan: 'free' | 'basic' | 'premium';
  onUpgrade?: () => void;
}

export function SubscriptionCard({ currentPlan, onUpgrade }: SubscriptionCardProps) {
  const planDetails = {
    free: {
      name: 'Free Plan',
      icon: Star,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      features: ['Basic meal logging', 'Simple progress tracking'],
    },
    basic: {
      name: 'Basic Plan',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      features: ['Personalized meal plans', 'Advanced tracking', 'Recipe suggestions'],
    },
    premium: {
      name: 'Premium Plan',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      features: ['AI-powered recommendations', 'Community access', 'Priority support'],
    },
  };

  const current = planDetails[currentPlan];
  const Icon = current.icon;

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 ${current.bgColor} rounded-lg mr-3`}>
            <Icon className={`w-5 h-5 ${current.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{current.name}</h3>
            <p className="text-sm text-gray-600">
              {currentPlan === 'premium' ? '$19/month' : currentPlan === 'basic' ? '$9/month' : 'Free'}
            </p>
          </div>
        </div>
        
        {currentPlan !== 'premium' && (
          <button
            onClick={onUpgrade}
            className="btn-secondary text-sm"
          >
            Upgrade
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {current.features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {currentPlan !== 'premium' && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Upgrade to Premium</p>
              <p className="text-xs text-purple-600">Get AI-powered nutrition insights</p>
            </div>
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      )}

      {currentPlan === 'premium' && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Premium Active</p>
              <p className="text-xs text-green-600">Enjoying all premium features</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
