import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  children: ReactNode;
  label: string;
  icon?: ReactNode;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
  level?: number;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
  onToggle?: (expanded: boolean) => void;
  disabled?: boolean;
  rightContent?: ReactNode;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  children,
  label,
  icon,
  isExpandable = true,
  defaultExpanded = false,
  level = 0,
  className,
  labelClassName,
  contentClassName,
  onToggle,
  disabled = false,
  rightContent
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (disabled || !isExpandable) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const indentationStyle = {
    paddingRight: `${level * 24}px`
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Node Header */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer select-none",
          "border-b border-gray-100",
          disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          labelClassName
        )}
        style={indentationStyle}
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        {isExpandable && (
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 transition-transform duration-200" />
            )}
          </div>
        )}
        
        {/* Non-expandable spacing */}
        {!isExpandable && <div className="w-4 h-4 flex-shrink-0" />}

        {/* Node Icon */}
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Node Label */}
        <div className="flex-1 min-w-0">
          <span className={cn(
            "text-sm font-medium text-gray-900 truncate block",
            disabled && "text-gray-400"
          )}>
            {label}
          </span>
        </div>

        {/* Right Content */}
        {rightContent && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>

      {/* Node Content */}
      {isExpandable && isExpanded && (
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          contentClassName
        )}>
          <div className="pb-1">
            {children}
          </div>
        </div>
      )}

      {/* Non-expandable content (always visible) */}
      {!isExpandable && children && (
        <div className={cn("mt-2", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default TreeNode;