import React from 'react';
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  className,
  showPercentage = true,
  size = 'md',
  variant = 'default'
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  // Dynamic color based on progress and variant
  const getProgressColor = () => {
    if (variant !== 'default') {
      switch (variant) {
        case 'success':
          return 'bg-green-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'danger':
          return 'bg-red-500';
        default:
          return 'bg-blue-500';
      }
    }

    // Dynamic colors based on progress percentage
    if (normalizedProgress >= 90) return 'bg-green-500';
    if (normalizedProgress >= 70) return 'bg-blue-500';
    if (normalizedProgress >= 50) return 'bg-yellow-500';
    if (normalizedProgress >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className={cn("font-medium text-gray-700", getTextSize())}>
            {normalizedProgress.toFixed(0)}%
          </span>
        )}
      </div>
      
      <div className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        getSizeClasses()
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getProgressColor()
          )}
          style={{ width: `${normalizedProgress}%` }}
        >
          {/* Animated shine effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
      
      {/* Progress status text */}
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className={cn("text-gray-500", getTextSize())}>
            التقدم
          </span>
          <span className={cn("text-gray-500", getTextSize())}>
            {normalizedProgress === 100 ? 'مكتمل' : 'قيد التنفيذ'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;