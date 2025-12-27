import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Target, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CreatePhaseDialog from '@/components/tree-system/CreatePhaseDialog';
import CreateActivityDialog from '@/components/tree-system/CreateActivityDialog';
import EditPhaseDialog from '@/components/tree-system/EditPhaseDialog';

interface Activity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string[];
  progress: number;
  weight: number;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  weight: number;
  activities: Activity[];
  expanded?: boolean;
}

const PhasesManager: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isCreatePhaseOpen, setIsCreatePhaseOpen] = useState(false);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [isEditPhaseOpen, setIsEditPhaseOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPhaseForActivity, setSelectedPhaseForActivity] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'phase' | 'activity'; id: string; phaseId?: string } | null>(null);

  // Load sample data
  useEffect(() => {
    const samplePhases: Phase[] = [
      {
        id: '1',
        name: 'مرحلة التخطيط',
        description: 'مرحلة التخطيط الأولي للمشروع وتحديد المتطلبات',
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        status: 'completed',
        progress: 100,
        weight: 20,
        expanded: true,
        activities: [
          {
            id: '1-1',
            name: 'تحليل المتطلبات',
            description: 'تحليل وتوثيق متطلبات المشروع',
            startDate: '2024-01-01',
            endDate: '2024-01-15',
            status: 'completed',
            assignedTo: ['أحمد محمد', 'فاطمة علي'],
            progress: 100,
            weight: 50
          },
          {
            id: '1-2',
            name: 'إعداد الخطة الزمنية',
            description: 'وضع الجدول الزمني التفصيلي للمشروع',
            startDate: '2024-01-16',
            endDate: '2024-02-15',
            status: 'completed',
            assignedTo: ['محمد أحمد'],
            progress: 100,
            weight: 50
          }
        ]
      },
      {
        id: '2',
        name: 'مرحلة التطوير',
        description: 'مرحلة تطوير وبناء النظام',
        startDate: '2024-02-16',
        endDate: '2024-05-30',
        status: 'in-progress',
        progress: 65,
        weight: 50,
        expanded: false,
        activities: [
          {
            id: '2-1',
            name: 'تطوير الواجهة الأمامية',
            description: 'بناء واجهة المستخدم',
            startDate: '2024-02-16',
            endDate: '2024-04-15',
            status: 'in-progress',
            assignedTo: ['سارة محمود', 'علي حسن'],
            progress: 80,
            weight: 40
          },
          {
            id: '2-2',
            name: 'تطوير الخادم الخلفي',
            description: 'بناء منطق الأعمال وقاعدة البيانات',
            startDate: '2024-03-01',
            endDate: '2024-05-15',
            status: 'in-progress',
            assignedTo: ['خالد عبدالله'],
            progress: 60,
            weight: 60
          }
        ]
      },
      {
        id: '3',
        name: 'مرحلة الاختبار',
        description: 'اختبار النظام والتأكد من جودته',
        startDate: '2024-05-16',
        endDate: '2024-06-30',
        status: 'pending',
        progress: 0,
        weight: 20,
        expanded: false,
        activities: []
      }
    ];
    setPhases(samplePhases);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in-progress':
        return 'قيد التنفيذ';
      case 'overdue':
        return 'متأخرة';
      default:
        return 'معلقة';
    }
  };

  const togglePhaseExpansion = (phaseId: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, expanded: !phase.expanded }
        : phase
    ));
  };

  const handleCreatePhase = (phaseData: any) => {
    const newPhase: Phase = {
      id: Date.now().toString(),
      ...phaseData,
      activities: [],
      expanded: false,
      progress: 0
    };
    
    setPhases(prev => [...prev, newPhase]);
    setIsCreatePhaseOpen(false);
    
    toast({
      title: "تم إنشاء المرحلة بنجاح",
      description: `تم إضافة المرحلة "${phaseData.name}" بنجاح`,
    });
  };

  const handleCreateActivity = (activityData: any) => {
    if (!selectedPhaseForActivity) return;
    
    const newActivity: Activity = {
      id: `${selectedPhaseForActivity}-${Date.now()}`,
      ...activityData,
      progress: 0
    };
    
    setPhases(prev => prev.map(phase => 
      phase.id === selectedPhaseForActivity
        ? { ...phase, activities: [...phase.activities, newActivity] }
        : phase
    ));
    
    setIsCreateActivityOpen(false);
    setSelectedPhaseForActivity(null);
    
    toast({
      title: "تم إنشاء النشاط بنجاح",
      description: `تم إضافة النشاط "${activityData.name}" بنجاح`,
    });
  };

  const handleEditPhase = (phaseData: any) => {
    if (!selectedPhase) return;
    
    setPhases(prev => prev.map(phase => 
      phase.id === selectedPhase.id
        ? { ...phase, ...phaseData }
        : phase
    ));
    
    setIsEditPhaseOpen(false);
    setSelectedPhase(null);
    
    toast({
      title: "تم تحديث المرحلة بنجاح",
      description: `تم تحديث المرحلة "${phaseData.name}" بنجاح`,
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'phase') {
      setPhases(prev => prev.filter(phase => phase.id !== itemToDelete.id));
      toast({
        title: "تم حذف المرحلة",
        description: "تم حذف المرحلة وجميع الأنشطة المرتبطة بها",
      });
    } else if (itemToDelete.type === 'activity' && itemToDelete.phaseId) {
      setPhases(prev => prev.map(phase => 
        phase.id === itemToDelete.phaseId
          ? { ...phase, activities: phase.activities.filter(activity => activity.id !== itemToDelete.id) }
          : phase
      ));
      toast({
        title: "تم حذف النشاط",
        description: "تم حذف النشاط بنجاح",
      });
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (type: 'phase' | 'activity', id: string, phaseId?: string) => {
    setItemToDelete({ type, id, phaseId });
    setDeleteDialogOpen(true);
  };

  const openEditPhase = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsEditPhaseOpen(true);
  };

  const openCreateActivity = (phaseId: string) => {
    setSelectedPhaseForActivity(phaseId);
    setIsCreateActivityOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المراحل والأنشطة</h2>
          <p className="text-gray-600 mt-1">إدارة مراحل المشروع والأنشطة المرتبطة بها</p>
        </div>
        <Button 
          onClick={() => setIsCreatePhaseOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مرحلة جديدة
        </Button>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <Card key={phase.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePhaseExpansion(phase.id)}
                    className="p-1 h-auto"
                  >
                    {phase.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {phase.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(phase.status))}
                      >
                        <span className="ml-1">{getStatusIcon(phase.status)}</span>
                        {getStatusText(phase.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {phase.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(phase.startDate).toLocaleDateString('ar-SA')} - {new Date(phase.endDate).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">الوزن: {phase.weight}%</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{phase.activities.length} نشاط</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">التقدم</span>
                        <span className="font-medium">{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditPhase(phase)}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل المرحلة
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openCreateActivity(phase.id)}>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة نشاط
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog('phase', phase.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف المرحلة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            {/* Activities */}
            {phase.expanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">الأنشطة</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openCreateActivity(phase.id)}
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة نشاط
                    </Button>
                  </div>
                  
                  {phase.activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد أنشطة في هذه المرحلة</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => openCreateActivity(phase.id)}
                      >
                        إضافة النشاط الأول
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {phase.activities.map((activity) => (
                        <div 
                          key={activity.id} 
                          className="bg-gray-50 rounded-lg p-4 border"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-gray-900 truncate">
                                  {activity.name}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getStatusColor(activity.status))}
                                >
                                  <span className="ml-1">{getStatusIcon(activity.status)}</span>
                                  {getStatusText(activity.status)}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {activity.description}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {new Date(activity.startDate).toLocaleDateString('ar-SA')} - {new Date(activity.endDate).toLocaleDateString('ar-SA')}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {activity.assignedTo.join(', ')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">التقدم</span>
                                    <span className="font-medium">{activity.progress}%</span>
                                  </div>
                                  <Progress value={activity.progress} className="h-1.5" />
                                </div>
                                <div className="text-sm text-gray-600">
                                  الوزن: {activity.weight}%
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('activity', activity.id, phase.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {phases.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراحل</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة المرحلة الأولى لمشروعك</p>
              <Button onClick={() => setIsCreatePhaseOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة المرحلة الأولى
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreatePhaseDialog
        open={isCreatePhaseOpen}
        onOpenChange={setIsCreatePhaseOpen}
        onSubmit={handleCreatePhase}
      />
      
      <CreateActivityDialog
        open={isCreateActivityOpen}
        onOpenChange={setIsCreateActivityOpen}
        onSubmit={handleCreateActivity}
      />
      
      {selectedPhase && (
        <EditPhaseDialog
          open={isEditPhaseOpen}
          onOpenChange={setIsEditPhaseOpen}
          phase={selectedPhase}
          onSubmit={handleEditPhase}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'phase' 
                ? 'هل أنت متأكد من حذف هذه المرحلة؟ سيتم حذف جميع الأنشطة المرتبطة بها أيضاً.'
                : 'هل أنت متأكد من حذف هذا النشاط؟'
              }
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhasesManager;