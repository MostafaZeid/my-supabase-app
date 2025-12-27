import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Users,
  FileText,
  Target
} from "lucide-react";

interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedDuration: number; // in days
  dependencies: string[];
  tasks: Task[];
  milestones: Milestone[];
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  dueDate?: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  achieved: boolean;
}

const ProjectPhasesManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedPhase, setSelectedPhase] = useState<string>('planning');
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'planning',
      name: 'مرحلة التخطيط',
      description: 'تحديد متطلبات المشروع والتخطيط الأولي',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-01-01'),
      estimatedDuration: 14,
      dependencies: [],
      tasks: [
        {
          id: 'task-1',
          title: 'تحليل المتطلبات',
          status: 'completed',
          assignee: 'أحمد محمد',
          dueDate: new Date('2024-01-05')
        },
        {
          id: 'task-2',
          title: 'إعداد الخطة الزمنية',
          status: 'in-progress',
          assignee: 'فاطمة علي',
          dueDate: new Date('2024-01-10')
        },
        {
          id: 'task-3',
          title: 'تحديد الموارد المطلوبة',
          status: 'pending',
          assignee: 'محمد حسن',
          dueDate: new Date('2024-01-12')
        }
      ],
      milestones: [
        {
          id: 'milestone-1',
          title: 'اعتماد الخطة الأولية',
          description: 'الحصول على موافقة العميل على الخطة المقترحة',
          targetDate: new Date('2024-01-15'),
          achieved: false
        }
      ]
    },
    {
      id: 'execution',
      name: 'مرحلة التنفيذ',
      description: 'تنفيذ المشروع وفقاً للخطة المعتمدة',
      status: 'pending',
      progress: 0,
      estimatedDuration: 45,
      dependencies: ['planning'],
      tasks: [
        {
          id: 'task-4',
          title: 'بدء التطوير',
          status: 'pending',
          assignee: 'سارة أحمد'
        },
        {
          id: 'task-5',
          title: 'مراجعة التقدم الأسبوعية',
          status: 'pending',
          assignee: 'عمر خالد'
        }
      ],
      milestones: [
        {
          id: 'milestone-2',
          title: 'إنجاز 50% من المشروع',
          description: 'الوصول لنصف المشروع المطلوب',
          targetDate: new Date('2024-03-01'),
          achieved: false
        }
      ]
    },
    {
      id: 'closure',
      name: 'مرحلة الإغلاق',
      description: 'تسليم المشروع والتقييم النهائي',
      status: 'pending',
      progress: 0,
      estimatedDuration: 7,
      dependencies: ['execution'],
      tasks: [
        {
          id: 'task-6',
          title: 'التسليم النهائي',
          status: 'pending',
          assignee: 'ليلى محمود'
        },
        {
          id: 'task-7',
          title: 'تقييم المشروع',
          status: 'pending',
          assignee: 'يوسف عبدالله'
        }
      ],
      milestones: [
        {
          id: 'milestone-3',
          title: 'اعتماد التسليم',
          description: 'الحصول على موافقة العميل النهائية',
          targetDate: new Date('2024-04-15'),
          achieved: false
        }
      ]
    }
  ]);

  const getStatusIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handlePhaseAction = (phaseId: string, action: 'start' | 'pause' | 'complete' | 'reset') => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        switch (action) {
          case 'start':
            return {
              ...phase,
              status: 'in-progress' as const,
              startDate: new Date()
            };
          case 'pause':
            return {
              ...phase,
              status: 'pending' as const
            };
          case 'complete':
            return {
              ...phase,
              status: 'completed' as const,
              progress: 100,
              endDate: new Date()
            };
          case 'reset':
            return {
              ...phase,
              status: 'pending' as const,
              progress: 0,
              startDate: undefined,
              endDate: undefined
            };
          default:
            return phase;
        }
      }
      return phase;
    }));

    toast({
      title: "تم تحديث حالة المرحلة",
      description: `تم ${action === 'start' ? 'بدء' : action === 'pause' ? 'إيقاف' : action === 'complete' ? 'إكمال' : 'إعادة تعيين'} المرحلة بنجاح`,
    });
  };

  const updateTaskStatus = (phaseId: string, taskId: string, newStatus: Task['status']) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        const updatedTasks = phase.tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        
        // Calculate new progress based on completed tasks
        const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
        const newProgress = Math.round((completedTasks / updatedTasks.length) * 100);
        
        return {
          ...phase,
          tasks: updatedTasks,
          progress: newProgress
        };
      }
      return phase;
    }));

    toast({
      title: "تم تحديث المهمة",
      description: "تم تحديث حالة المهمة بنجاح",
    });
  };

  const canStartPhase = (phase: Phase) => {
    if (phase.dependencies.length === 0) return true;
    return phase.dependencies.every(depId => 
      phases.find(p => p.id === depId)?.status === 'completed'
    );
  };

  const selectedPhaseData = phases.find(p => p.id === selectedPhase);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة مراحل المشروع</h1>
        <p className="text-gray-600">تتبع وإدارة المراحل الثلاث الإجبارية للمشروع</p>
      </div>

      {/* Phases Overview */}
      <div className="grid gap-4">
        {phases.map((phase, index) => (
          <Card 
            key={phase.id} 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedPhase === phase.id ? "ring-2 ring-blue-500 shadow-md" : "",
              !canStartPhase(phase) && phase.status === 'pending' ? "opacity-60" : ""
            )}
            onClick={() => setSelectedPhase(phase.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(phase.status)}
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(phase.status)
                  )}>
                    {phase.status === 'completed' ? 'مكتملة' : 
                     phase.status === 'in-progress' ? 'قيد التنفيذ' :
                     phase.status === 'blocked' ? 'محجوبة' : 'في الانتظار'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">التقدم</span>
                  <span className="text-sm font-medium text-gray-900">{phase.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>

              {/* Phase Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {phase.estimatedDuration} يوم
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {phase.tasks.length} مهمة
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {phase.milestones.length} معلم
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {phase.tasks.filter(t => t.assignee).length} مكلف
                  </span>
                </div>
              </div>

              {/* Dependencies Warning */}
              {!canStartPhase(phase) && phase.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      يجب إكمال المراحل السابقة أولاً
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Phase Details */}
      {selectedPhaseData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPhaseData.name}
                </h2>
                <p className="text-gray-600">{selectedPhaseData.description}</p>
              </div>
              <div className="flex gap-2">
                {selectedPhaseData.status === 'pending' && canStartPhase(selectedPhaseData) && (
                  <Button
                    onClick={() => handlePhaseAction(selectedPhaseData.id, 'start')}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    بدء المرحلة
                  </Button>
                )}
                {selectedPhaseData.status === 'in-progress' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handlePhaseAction(selectedPhaseData.id, 'pause')}
                      className="flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      إيقاف مؤقت
                    </Button>
                    <Button
                      onClick={() => handlePhaseAction(selectedPhaseData.id, 'complete')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      إكمال المرحلة
                    </Button>
                  </>
                )}
                {selectedPhaseData.status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handlePhaseAction(selectedPhaseData.id, 'reset')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tasks */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">المهام</h3>
              <div className="space-y-3">
                {selectedPhaseData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                      )} />
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.assignee && (
                          <p className="text-sm text-gray-600">المكلف: {task.assignee}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-sm text-gray-500">
                          {task.dueDate.toLocaleDateString('ar-SA')}
                        </span>
                      )}
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(
                          selectedPhaseData.id, 
                          task.id, 
                          e.target.value as Task['status']
                        )}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">في الانتظار</option>
                        <option value="in-progress">قيد التنفيذ</option>
                        <option value="completed">مكتملة</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">المعالم الرئيسية</h3>
              <div className="space-y-3">
                {selectedPhaseData.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <div className="flex items-center gap-2">
                        {milestone.achieved ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          milestone.achieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        )}>
                          {milestone.achieved ? 'محقق' : 'قيد الانتظار'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    <p className="text-sm text-gray-500">
                      التاريخ المستهدف: {milestone.targetDate.toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectPhasesManager;