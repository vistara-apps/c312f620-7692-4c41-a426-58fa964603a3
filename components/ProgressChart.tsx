'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface ProgressData {
  day: string;
  weight: number;
  calories: number;
  adherence: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  variant?: 'weight' | 'calories' | 'adherence';
}

export function ProgressChart({ data, variant = 'weight' }: ProgressChartProps) {
  const getChartConfig = () => {
    switch (variant) {
      case 'weight':
        return {
          dataKey: 'weight',
          color: '#8b5cf6',
          label: 'Weight (lbs)',
          format: (value: number) => `${value} lbs`,
        };
      case 'calories':
        return {
          dataKey: 'calories',
          color: '#f59e0b',
          label: 'Calories',
          format: (value: number) => `${value} cal`,
        };
      case 'adherence':
        return {
          dataKey: 'adherence',
          color: '#10b981',
          label: 'Adherence (%)',
          format: (value: number) => `${value}%`,
        };
      default:
        return {
          dataKey: 'weight',
          color: '#8b5cf6',
          label: 'Weight (lbs)',
          format: (value: number) => `${value} lbs`,
        };
    }
  };

  const config = getChartConfig();
  const currentValue = data[data.length - 1]?.[config.dataKey] || 0;
  const previousValue = data[data.length - 2]?.[config.dataKey] || currentValue;
  const change = currentValue - previousValue;
  const isPositive = change > 0;

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-purple-600" />
          Progress Details
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: config.color }}>
            {config.format(currentValue)}
          </p>
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{config.format(change)} this week
          </p>
        </div>
      </div>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'adherence' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number) => [config.format(value), config.label]}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey={config.dataKey} 
                fill={config.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip 
                formatter={(value: number) => [config.format(value), config.label]}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color}
                strokeWidth={3}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Best Day</p>
          <p className="font-semibold text-sm">
            {data.reduce((best, current) => 
              current[config.dataKey] > best[config.dataKey] ? current : best
            ).day}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Average</p>
          <p className="font-semibold text-sm">
            {config.format(
              data.reduce((sum, item) => sum + item[config.dataKey], 0) / data.length
            )}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Trend</p>
          <p className={`font-semibold text-sm ${change < 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {change < 0 ? '↓ Improving' : '↑ Stable'}
          </p>
        </div>
      </div>
    </div>
  );
}
