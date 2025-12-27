import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Building2,
  Users,
  BarChart3,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Target,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function ClientProjectsModal({ isOpen, onClose, client }: ClientProjectsModalProps) {
  const { language, dir } = useLanguage();

  if (!client) return null;

  // Sample projects data for the client
  const clientProjects = [
    {
      id: '1',
      name: 'تطوير نظام إدارة الموارد البشرية',
      nameEn: 'HR Management System Development',
      description: 'تطوير نظام شامل لإدارة الموارد البشرية يشمل الرواتب والحضور والإجازات',
      descriptionEn: 'Comprehensive HR management system including payroll, attendance, and leave management',
      status: 'active',
      priority: 'high',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      budget: 150000,
      spent: 112500,
      teamLeader: 'د. أحمد محمد',
      teamLeaderEn: 'Dr. Ahmed Mohammed',
      teamSize: 8,
      deliverables: {
        total: 12,
        completed: 9
      }
    },
    {
      id: '2',
      name: 'تحديث البنية التحتية التقنية',
      nameEn: 'IT Infrastructure Upgrade',
      description: 'تحديث الخوادم وأنظمة الشبكة وتحسين الأمان السيبراني',
      descriptionEn: 'Server and network systems upgrade with enhanced cybersecurity',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      budget: 80000,
      spent: 78000,
      teamLeader: 'م. سارة أحمد',
      teamLeaderEn: 'Eng. Sarah Ahmed',
      teamSize: 5,
      deliverables: {
        total: 8,
        completed: 8
      }
    },
    {
      id: '3',
      name: 'تطوير تطبيق الهاتف المحمول',
      nameEn: 'Mobile Application Development',
      description: 'تطوير تطبيق للهاتف المحمول لخدمة العملاء والموظفين',
      descriptionEn: 'Mobile application development for customer and employee services',
      status: 'planning',
      priority: 'low',
      progress: 15,
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      budget: 120000,
      spent: 18000,
      teamLeader: 'م. خالد علي',
      teamLeaderEn: 'Eng. Khalid Ali',
      teamSize: 6,
      deliverables: {
        total: 10,
        completed: 1
      }
    }
  ];

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
      case 'onHold': return 'bg-orange-100 text-orange-800';
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
      planning: dir === 'rtl' ? 'تخطيط' : 'Planning',
      onHold: dir === 'rtl' ? 'معلق' : 'On Hold'
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

  // Calculate totals
  const totalBudget = clientProjects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = clientProjects.reduce((sum, project) => sum + project.spent, 0);
  const totalProgress = Math.round(clientProjects.reduce((sum, project) => sum + project.progress, 0) / clientProjects.length);
  const totalDeliverables = clientProjects.reduce((sum, project) => sum + project.deliverables.total, 0);
  const completedDeliverables = clientProjects.reduce((sum, project) => sum + project.deliverables.completed, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{dir === 'rtl' ? 'مشاريع العميل' : 'Client Projects'}</div>
              <p className="text-sm font-normal text-muted-foreground">
                {dir === 'rtl' ? client.organization : client.organizationEn}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Statistics */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'إحصائيات المشاريع' : 'Project Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{clientProjects.length}</div>
                  <div className="text-sm text-blue-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(totalBudget)}</div>
                  <div className="text-sm text-green-600">{dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{formatCurrency(totalSpent)}</div>
                  <div className="text-sm text-orange-600">{dir === 'rtl' ? 'إجمالي المصروف' : 'Total Spent'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{totalProgress}%</div>
                  <div className="text-sm text-purple-600">{dir === 'rtl' ? 'متوسط التقدم' : 'Average Progress'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-700">{completedDeliverables}/{totalDeliverables}</div>
                  <div className="text-sm text-indigo-600">{dir === 'rtl' ? 'المخرجات المكتملة' : 'Completed Deliverables'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B4FFF]" />
              {dir === 'rtl' ? 'قائمة المشاريع التفصيلية' : 'Detailed Projects List'}
            </h3>
            
            {clientProjects.map((project) => (
              <Card key={project.id} className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-foreground">
                          {dir === 'rtl' ? project.name : project.nameEn}
                        </h4>
                        <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {getStatusLabel(project.status)}
                        </Badge>
                        <Badge className={`${getPriorityColor(project.priority)} flex items-center gap-1`}>
                          <AlertTriangle className="w-3 h-3" />
                          {getPriorityLabel(project.priority)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {dir === 'rtl' ? project.description : project.descriptionEn}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#1B4FFF] hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {dir === 'rtl' ? 'عرض' : 'View'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {dir === 'rtl' ? 'تحرير' : 'Edit'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {dir === 'rtl' ? 'التقدم' : 'Progress'}
                        </span>
                        <span className="text-sm font-medium text-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Timeline */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {dir === 'rtl' ? 'الجدولة الزمنية' : 'Timeline'}
                      </div>
                      <div className="text-sm text-foreground">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </div>
                    </div>

                    {/* Team */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {dir === 'rtl' ? 'الفريق' : 'Team'}
                      </div>
                      <div className="text-sm text-foreground">
                        <div className="font-medium">{dir === 'rtl' ? project.teamLeader : project.teamLeaderEn}</div>
                        <div className="text-muted-foreground">{project.teamSize} {dir === 'rtl' ? 'أعضاء' : 'members'}</div>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        {dir === 'rtl' ? 'المخرجات' : 'Deliverables'}
                      </div>
                      <div className="text-sm text-foreground">
                        <span className="font-medium text-green-600">{project.deliverables.completed}</span>
                        <span className="text-muted-foreground"> / {project.deliverables.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {dir === 'rtl' ? 'الميزانية' : 'Budget'}
                        </span>
                        <span className="font-semibold text-blue-700">{formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {dir === 'rtl' ? 'المصروف' : 'Spent'}
                        </span>
                        <span className="font-semibold text-orange-700">{formatCurrency(project.spent)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {dir === 'rtl' ? 'المتبقي' : 'Remaining'}
                        </span>
                        <span className="font-semibold text-green-700">{formatCurrency(project.budget - project.spent)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          <Button className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white">
            <FileText className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}