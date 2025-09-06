'use client';

import { Target, TrendingUp } from 'lucide-react';

interface HealthGoalsCardProps {
  goals: string[];
  currentWeight: number;
  targetWeight?: number;
  progress: number;
}

export function HealthGoalsCard({ 
  goals, 
  currentWeight, 
  targetWeight = 135, 
  progress 
}: HealthGoalsCardProps) {
  const weightDiff = currentWeight - targetWeight;
  const progressPercentage = Math.max(0, Math.min(100, progress));

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Health Goals
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold">{currentWeight}</p>
          <p className="text-sm text-gray-600">Current Weight</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm capitalize">{goal.replace('_', ' ')}</span>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-600">On Track</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to Goal</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="progress-bar transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Target: {targetWeight} lbs</span>
          <span>{weightDiff > 0 ? `${weightDiff.toFixed(1)} lbs to go` : 'Goal reached!'}</span>
        </div>
      </div>
    </div>
  );
}
