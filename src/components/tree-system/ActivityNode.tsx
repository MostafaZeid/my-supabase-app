import React from 'react';
import { Calendar, Clock, User, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ProgressBar from '@/components/tree-system/ProgressBar';
import StatusBadge from '@/components/tree-system/StatusBadge';
import { cn } from '@/lib/utils';

interface ActivityNodeProps {
  activity: {
    id: string;
    name: string;
    description?: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
    progress: number;
    startDate: string;
    endDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    assignee?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours?: number;
    actualHours?: number;
    weight?: number;
  };
  level?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const ActivityNode: React.FC<ActivityNodeProps> = ({
  activity,
  level = 0,
  isExpanded = false,
  onToggle,
  className
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'حرج';
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return 'غير محدد';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDelayed = activity.status === 'delayed' || 
    (activity.status === 'in-progress' && new Date() > new Date(activity.endDate));

  return (
    <Card 
      className={cn(
        'w-full max-w-4xl mx-auto mb-3 transition-all duration-200 hover:shadow-md',
        isDelayed && 'border-red-200 bg-red-50/30',
        className
      )}
      style={{ marginRight: `${level * 24}px` }}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 truncate">
                  {activity.name}
                </h3>
                <StatusBadge status={activity.status} />
              </div>
              
              {activity.description && (
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {activity.description}
                </p>
              )}
            </div>

            {/* Priority Badge */}
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
              getPriorityColor(activity.priority)
            )}>
              {getPriorityLabel(activity.priority)}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">التقدم</span>
              <span className="font-medium text-gray-900">
                {activity.progress}%
              </span>
            </div>
            <ProgressBar 
              progress={activity.progress} 
              status={activity.status}
              className="h-2"
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 text-sm">
            {/* Dates Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">التواريخ المخططة:</span>
              </div>
              <div className="flex items-center gap-4 text-gray-700 mr-6">
                <span>من: {formatDate(activity.startDate)}</span>
                <span>إلى: {formatDate(activity.endDate)}</span>
              </div>
              
              {(activity.actualStartDate || activity.actualEndDate) && (
                <>
                  <div className="flex items-center gap-2 text-gray-600 mt-3">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">التواريخ الفعلية:</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-700 mr-6">
                    {activity.actualStartDate && (
                      <span>بدء: {formatDate(activity.actualStartDate)}</span>
                    )}
                    {activity.actualEndDate && (
                      <span>انتهاء: {formatDate(activity.actualEndDate)}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-6 text-gray-600">
              {activity.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>المسؤول: {activity.assignee}</span>
                </div>
              )}
              
              {activity.weight && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>الوزن: {activity.weight}%</span>
                </div>
              )}
              
              {(activity.estimatedHours || activity.actualHours) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    الساعات: 
                    {activity.actualHours && ` ${activity.actualHours} فعلي`}
                    {activity.estimatedHours && activity.actualHours && ' / '}
                    {activity.estimatedHours && ` ${activity.estimatedHours} مقدر`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delay Warning */}
          {isDelayed && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                هذا النشاط متأخر عن الجدول المخطط
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityNode;