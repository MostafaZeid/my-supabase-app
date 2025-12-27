import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TreeNode from '@/components/tree-system/TreeNode';
import ActivityNode from '@/components/tree-system/ActivityNode';
import ProgressBar from '@/components/tree-system/ProgressBar';
import StatusBadge from '@/components/tree-system/StatusBadge';
import WeightIndicator from '@/components/tree-system/WeightIndicator';
import { cn } from '@/lib/utils';

interface Phase {
  id: string;
  name: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';
  progress: number;
  weight: number;
  startDate: string;
  endDate: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  name: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';
  progress: number;
  weight: number;
  startDate: string;
  endDate: string;
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
}

const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'مرحلة التخطيط والتحليل',
    description: 'تحليل المتطلبات ووضع الخطة التفصيلية للمشروع',
    status: 'completed',
    progress: 100,
    weight: 25,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    activities: [
      {
        id: 'activity-1-1',
        name: 'جمع وتحليل المتطلبات',
        description: 'جمع المتطلبات من أصحاب المصلحة وتحليلها',
        status: 'completed',
        progress: 100,
        weight: 40,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        assignee: 'أحمد محمد',
        estimatedHours: 80,
        actualHours: 75
      },
      {
        id: 'activity-1-2',
        name: 'إعداد خطة المشروع',
        description: 'وضع الجدول الزمني وتوزيع المهام',
        status: 'completed',
        progress: 100,
        weight: 35,
        startDate: '2024-01-16',
        endDate: '2024-01-25',
        assignee: 'سارة أحمد',
        estimatedHours: 60,
        actualHours: 65
      },
      {
        id: 'activity-1-3',
        name: 'مراجعة وموافقة الخطة',
        description: 'مراجعة الخطة مع الإدارة والحصول على الموافقة',
        status: 'completed',
        progress: 100,
        weight: 25,
        startDate: '2024-01-26',
        endDate: '2024-01-31',
        assignee: 'محمد علي',
        estimatedHours: 40,
        actualHours: 35
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'مرحلة التصميم والتطوير',
    description: 'تصميم النظام وتطوير الوظائف الأساسية',
    status: 'in-progress',
    progress: 65,
    weight: 40,
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    activities: [
      {
        id: 'activity-2-1',
        name: 'تصميم واجهة المستخدم',
        description: 'تصميم الواجهات والتفاعلات',
        status: 'completed',
        progress: 100,
        weight: 30,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        assignee: 'فاطمة حسن',
        estimatedHours: 120,
        actualHours: 115
      },
      {
        id: 'activity-2-2',
        name: 'تطوير الواجهة الأمامية',
        description: 'برمجة واجهة المستخدم',
        status: 'in-progress',
        progress: 75,
        weight: 35,
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        assignee: 'عمر خالد',
        estimatedHours: 200,
        actualHours: 150
      },
      {
        id: 'activity-2-3',
        name: 'تطوير الواجهة الخلفية',
        description: 'برمجة الخدمات وقاعدة البيانات',
        status: 'in-progress',
        progress: 60,
        weight: 35,
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        assignee: 'ليلى محمود',
        estimatedHours: 180,
        actualHours: 108
      }
    ]
  },
  {
    id: 'phase-3',
    name: 'مرحلة الاختبار والجودة',
    description: 'اختبار النظام وضمان الجودة',
    status: 'not-started',
    progress: 0,
    weight: 20,
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    activities: [
      {
        id: 'activity-3-1',
        name: 'اختبار الوحدة',
        description: 'اختبار الوحدات البرمجية المختلفة',
        status: 'not-started',
        progress: 0,
        weight: 30,
        startDate: '2024-05-01',
        endDate: '2024-05-10',
        assignee: 'يوسف أحمد',
        estimatedHours: 80
      },
      {
        id: 'activity-3-2',
        name: 'اختبار التكامل',
        description: 'اختبار تكامل النظام',
        status: 'not-started',
        progress: 0,
        weight: 40,
        startDate: '2024-05-11',
        endDate: '2024-05-25',
        assignee: 'نور الدين',
        estimatedHours: 100
      },
      {
        id: 'activity-3-3',
        name: 'اختبار المستخدم',
        description: 'اختبار النظام مع المستخدمين النهائيين',
        status: 'not-started',
        progress: 0,
        weight: 30,
        startDate: '2024-05-26',
        endDate: '2024-05-31',
        assignee: 'رانيا سالم',
        estimatedHours: 60
      }
    ]
  },
  {
    id: 'phase-4',
    name: 'مرحلة النشر والتسليم',
    description: 'نشر النظام وتسليمه للعميل',
    status: 'not-started',
    progress: 0,
    weight: 15,
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    activities: [
      {
        id: 'activity-4-1',
        name: 'إعداد بيئة الإنتاج',
        description: 'تجهيز الخوادم وبيئة الإنتاج',
        status: 'not-started',
        progress: 0,
        weight: 40,
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        assignee: 'كريم حسام',
        estimatedHours: 40
      },
      {
        id: 'activity-4-2',
        name: 'نشر النظام',
        description: 'رفع النظام على بيئة الإنتاج',
        status: 'not-started',
        progress: 0,
        weight: 35,
        startDate: '2024-06-06',
        endDate: '2024-06-10',
        assignee: 'مريم عادل',
        estimatedHours: 30
      },
      {
        id: 'activity-4-3',
        name: 'التدريب والتسليم',
        description: 'تدريب المستخدمين وتسليم النظام',
        status: 'not-started',
        progress: 0,
        weight: 25,
        startDate: '2024-06-11',
        endDate: '2024-06-15',
        assignee: 'حسام طارق',
        estimatedHours: 50
      }
    ]
  }
];

const PhasesTreeSection: React.FC = () => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-2']));
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const togglePhaseExpansion = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">مراحل المشروع</h2>
        </div>
        <div className="text-sm text-gray-500">
          {mockPhases.length} مرحلة
        </div>
      </div>

      <div className="space-y-3">
        {mockPhases.map((phase, phaseIndex) => {
          const isExpanded = expandedPhases.has(phase.id);
          const duration = calculateDuration(phase.startDate, phase.endDate);

          return (
            <Card key={phase.id} className="overflow-hidden border-r-4 border-r-blue-500">
              <CardContent className="p-0">
                {/* Phase Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePhaseExpansion(phase.id)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {phase.name}
                          </h3>
                          <StatusBadge status={phase.status} />
                          <WeightIndicator weight={phase.weight} />
                        </div>
                        
                        {phase.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {phase.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{duration} يوم</span>
                          </div>
                          <div className="text-blue-600 font-medium">
                            {phase.activities.length} نشاط
                          </div>
                        </div>
                        
                        <ProgressBar progress={phase.progress} className="max-w-md" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                {isExpanded && (
                  <div className="border-t bg-gray-50/50">
                    <div className="p-4 space-y-3">
                      {phase.activities.map((activity, activityIndex) => (
                        <ActivityNode
                          key={activity.id}
                          activity={activity}
                          isExpanded={expandedActivities.has(activity.id)}
                          onToggleExpansion={() => toggleActivityExpansion(activity.id)}
                          level={1}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">ملخص المراحل</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mockPhases.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">مكتملة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {mockPhases.filter(p => p.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">قيد التنفيذ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {mockPhases.filter(p => p.status === 'not-started').length}
                </div>
                <div className="text-sm text-gray-600">لم تبدأ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {mockPhases.reduce((sum, phase) => sum + phase.activities.length, 0)}
                </div>
                <div className="text-sm text-gray-600">إجمالي الأنشطة</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhasesTreeSection;