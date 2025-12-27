import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProgressBar from '@/components/tree-system/ProgressBar';
import WeightIndicator from '@/components/tree-system/WeightIndicator';
import DeliverablePartNode from '@/components/tree-system/DeliverablePartNode';

interface DeliverablePart {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  fileVersion?: string;
  lastModified?: string;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  weight: number;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  parts: DeliverablePart[];
  dueDate?: string;
  assignee?: string;
}

interface DeliverableNodeProps {
  deliverable: Deliverable;
  level?: number;
}

const DeliverableNode: React.FC<DeliverableNodeProps> = ({ 
  deliverable, 
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in-progress':
        return 'قيد التنفيذ';
      case 'overdue':
        return 'متأخر';
      default:
        return 'في الانتظار';
    }
  };

  const hasSubParts = deliverable.parts && deliverable.parts.length > 0;

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
          getStatusColor(deliverable.status),
          level > 0 && "mr-6"
        )}
        onClick={() => hasSubParts && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0">
          {hasSubParts ? (
            isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )
          ) : (
            <div className="w-5 h-5 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Deliverable Icon */}
        <div className="flex-shrink-0">
          <Package className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-lg truncate">
                {deliverable.name}
              </h4>
              {deliverable.description && (
                <p className="text-sm opacity-75 mt-1 line-clamp-2">
                  {deliverable.description}
                </p>
              )}
              
              {/* Metadata */}
              <div className="flex items-center gap-4 mt-2 text-xs opacity-75">
                {deliverable.assignee && (
                  <span>المسؤول: {deliverable.assignee}</span>
                )}
                {deliverable.dueDate && (
                  <span>تاريخ الاستحقاق: {deliverable.dueDate}</span>
                )}
                {hasSubParts && (
                  <span>الأجزاء: {deliverable.parts.length}</span>
                )}
              </div>
            </div>

            {/* Right Side - Weight, Progress, Status */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <WeightIndicator weight={deliverable.weight} />
              
              <div className="text-center min-w-[80px]">
                <ProgressBar 
                  progress={deliverable.progress} 
                  size="sm"
                  showLabel={true}
                />
              </div>

              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border min-w-[80px] text-center",
                getStatusColor(deliverable.status)
              )}>
                {getStatusText(deliverable.status)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Parts */}
      {hasSubParts && isExpanded && (
        <div className="mt-2 space-y-2 mr-8">
          {deliverable.parts.map((part) => (
            <DeliverablePartNode
              key={part.id}
              part={part}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliverableNode;