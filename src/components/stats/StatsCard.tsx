import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={iconColor} size={24} />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-semibold ${
              trend.direction === 'up'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
