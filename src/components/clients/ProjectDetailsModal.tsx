import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar,
  Users,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  User
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onEdit?: (project: any) => void;
}

export function ProjectDetailsModal({ isOpen, onClose, project, onEdit }: ProjectDetailsModalProps) {
  const { dir } = useLanguage();

  if (!project) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
      planning: dir === 'rtl' ? 'تخطيط' : 'Planning'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: dir === 'rtl' ? 'عالية' : 'High',
      medium: dir === 'rtl' ? 'متوسطة' : 'Medium',
      low: dir === 'rtl' ? 'منخفضة' : 'Low'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{dir === 'rtl' ? project.name : project.nameEn}</div>
              <p className="text-sm font-normal text-muted-foreground">
                {dir === 'rtl' ? 'تفاصيل المشروع الشاملة' : 'Comprehensive Project Details'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Project Overview */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'نظرة عامة على المشروع' : 'Project Overview'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{dir === 'rtl' ? 'وصف المشروع' : 'Project Description'}</p>
                  <p className="text-foreground">{dir === 'rtl' ? project.description : project.descriptionEn}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(project.status)}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {getPriorityLabel(project.priority)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1B4FFF]" />
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'التقدم:' : 'Progress:'}</span>
                    <span className="font-semibold text-foreground">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'الجدولة الزمنية' : 'Timeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تاريخ البداية' : 'Start Date'}</p>
                    <p className="font-medium text-foreground">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تاريخ الانتهاء' : 'End Date'}</p>
                    <p className="font-medium text-foreground">{formatDate(project.endDate)}</p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{dir === 'rtl' ? 'تقدم المشروع' : 'Project Progress'}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات الفريق' : 'Team Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'قائد الفريق' : 'Team Leader'}</p>
                    <p className="font-medium text-foreground">{dir === 'rtl' ? project.teamLeader : project.teamLeaderEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'حجم الفريق' : 'Team Size'}</p>
                    <p className="font-medium text-foreground">{project.teamSize} {dir === 'rtl' ? 'أعضاء' : 'members'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المعلومات المالية' : 'Financial Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'الميزانية الإجمالية' : 'Total Budget'}</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(project.budget)}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المصروف' : 'Amount Spent'}</span>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">{formatCurrency(project.spent)}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المتبقي' : 'Remaining Budget'}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(project.budget - project.spent)}</div>
                </div>
              </div>
              
              {/* Budget Usage */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{dir === 'rtl' ? 'استخدام الميزانية' : 'Budget Usage'}</span>
                  <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((project.spent / project.budget) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المخرجات والتسليمات' : 'Deliverables'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-indigo-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-700">{project.deliverables?.completed || 0}</div>
                    <div className="text-sm text-indigo-600">{dir === 'rtl' ? 'مخرجات مكتملة' : 'Completed Deliverables'}</div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">{project.deliverables?.total || 0}</div>
                    <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المخرجات' : 'Total Deliverables'}</div>
                  </div>
                </div>
              </div>
              
              {/* Deliverables Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{dir === 'rtl' ? 'تقدم المخرجات' : 'Deliverables Progress'}</span>
                  <span>{project.deliverables?.total > 0 ? Math.round((project.deliverables?.completed / project.deliverables?.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.deliverables?.total > 0 ? Math.round((project.deliverables?.completed / project.deliverables?.total) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(project)} className="bg-[#1B4FFF] text-white">
              {dir === 'rtl' ? 'تحرير المشروع' : 'Edit Project'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}