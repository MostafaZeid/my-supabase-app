import React from 'react';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeightIndicatorProps {
  weight: number;
  unit?: 'percentage' | 'points' | 'hours';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const WeightIndicator: React.FC<WeightIndicatorProps> = ({
  weight,
  unit = 'percentage',
  size = 'md',
  variant = 'default',
  className
}) => {
  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'percentage':
        return '%';
      case 'points':
        return 'نقطة';
      case 'hours':
        return 'ساعة';
      default:
        return '%';
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (weight >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (weight >= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5 gap-1';
      case 'lg':
        return 'text-sm px-3 py-1.5 gap-2';
      default:
        return 'text-xs px-2 py-1 gap-1.5';
    }
  };

  const getIconSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3.5 h-3.5';
    }
  };

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          getWeightColor(weight),
          getSizeClasses(size),
          className
        )}
      >
        {weight} {getUnitLabel(unit)}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-lg border font-medium',
          getWeightColor(weight),
          getSizeClasses(size),
          className
        )}
      >
        <Scale className={getIconSize(size)} />
        <span>الوزن: {weight} {getUnitLabel(unit)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        getWeightColor(weight),
        getSizeClasses(size),
        className
      )}
    >
      <Scale className={getIconSize(size)} />
      <span>{weight} {getUnitLabel(unit)}</span>
    </div>
  );
};

export default WeightIndicator;