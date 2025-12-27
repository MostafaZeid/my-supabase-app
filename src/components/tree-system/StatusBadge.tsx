import React from 'react';
import { cn } from "@/lib/utils";

export type StatusType = 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled' | 'overdue';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, {
  label: string;
  className: string;
}> = {
  'not-started': {
    label: 'لم تبدأ',
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  'in-progress': {
    label: 'قيد التنفيذ',
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  'completed': {
    label: 'مكتملة',
    className: 'bg-green-100 text-green-700 border-green-200'
  },
  'on-hold': {
    label: 'معلقة',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'cancelled': {
    label: 'ملغية',
    className: 'bg-red-100 text-red-700 border-red-200'
  },
  'overdue': {
    label: 'متأخرة',
    className: 'bg-orange-100 text-orange-700 border-orange-200'
  }
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className,
  size = 'sm'
}) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium whitespace-nowrap',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;