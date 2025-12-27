import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Building2,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Target,
  Briefcase,
  Eye,
  Edit
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  industry: string;
  industryEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    position: string;
    positionEn: string;
    email: string;
    phone: string;
    avatar: string;
  };
  address: {
    city: string;
    cityEn: string;
    country: string;
    countryEn: string;
  };
  establishedDate: string;
  clientSince: string;
  status: 'active' | 'inactive' | 'prospect';
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  totalValue: number;
  paidValue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
}

interface Project {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  status: 'active' | 'completed' | 'on_hold' | 'planning';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: {
    lead: string;
    leadEn: string;
    members: number;
  };
  deliverables: {
    total: number;
    completed: number;
  };
  priority: 'high' | 'medium' | 'low';
  category: string;
  categoryEn: string;
}

interface ClientProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientProjectsModal({ isOpen, onClose, client }: ClientProjectsModalProps) {
  const { language, dir } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!client) return null;

  // Sample projects data for the client
  const clientProjects: Project[] = [
    {
      id: '1',
      name: 'تطوير نظام إدارة الحوكمة',
      nameEn: 'Governance Management System Development',
      description: 'تطوير نظام شامل لإدارة الحوكمة المؤسسية والامتثال',
      descriptionEn: 'Comprehensive system development for corporate governance and compliance management',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      budget: 850000,
      spent: 637500,
      team: {
        lead: 'د. فهد السعدي',
        leadEn: 'Dr. Fahad Al-Saadi',
        members: 8
      },
      deliverables: {
        total: 12,
        completed: 9
      },
      priority: 'high',
      category: 'تطوير النظم',
      categoryEn: 'System Development'
    },
    {
      id: '2',
      name: 'مراجعة السياسات والإجراءات',
      nameEn: 'Policies and Procedures Review',
      description: 'مراجعة شاملة لجميع السياسات والإجراءات المؤسسية',
      descriptionEn: 'Comprehensive review of all organizational policies and procedures',
      status: 'completed',
      progress: 100,
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      budget: 320000,
      spent: 320000,
      team: {
        lead: 'محمد رشاد',
        leadEn: 'Mohammed Rashad',
        members: 5
      },
      deliverables: {
        total: 8,
        completed: 8
      },
      priority: 'medium',
      category: 'استشارات',
      categoryEn: 'Consulting'
    },
    {
      id: '3',
      name: 'تدريب الموظفين على الامتثال',
      nameEn: 'Employee Compliance Training',
      description: 'برنامج تدريبي شامل للموظفين على متطلبات الامتثال',
      descriptionEn: 'Comprehensive training program for employees on compliance requirements',
      status: 'planning',
      progress: 25,
      startDate: '2024-11-01',
      endDate: '2025-03-31',
      budget: 180000,
      spent: 45000,
      team: {
        lead: 'مروة الحمامصي',
        leadEn: 'Marwa Al-Hamamsi',
        members: 3
      },
      deliverables: {
        total: 6,
        completed: 1
      },
      priority: 'medium',
      category: 'تدريب',
      categoryEn: 'Training'
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
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
      on_hold: dir === 'rtl' ? 'معلق' : 'On Hold',
      planning: dir === 'rtl' ? 'تخطيط' : 'Planning'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: dir === 'rtl' ? 'عالية' : 'High',
      medium: dir === 'rtl' ? 'متوسطة' : 'Medium',
      low: dir === 'rtl' ? 'منخفضة' : 'Low'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle2;
      case 'completed': return Target;
      case 'on_hold': return Clock;
      case 'planning': return TrendingUp;
      default: return AlertTriangle;
    }
  };

  // Calculate project statistics
  const projectStats = {
    totalBudget: clientProjects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: clientProjects.reduce((sum, p) => sum + p.spent, 0),
    avgProgress: Math.round(clientProjects.reduce((sum, p) => sum + p.progress, 0) / clientProjects.length),
    totalDeliverables: clientProjects.reduce((sum, p) => sum + p.deliverables.total, 0),
    completedDeliverables: clientProjects.reduce((sum, p) => sum + p.deliverables.completed, 0)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-[#1B4FFF]/20">
              <AvatarFallback className="bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] text-white font-semibold text-lg">
                {client.contactPerson.avatar}
              </AvatarFallback>
            </Avatar>
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
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(projectStats.totalBudget)}</div>
                  <div className="text-sm text-green-600">{dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{formatCurrency(projectStats.totalSpent)}</div>
                  <div className="text-sm text-orange-600">{dir === 'rtl' ? 'إجمالي المصروف' : 'Total Spent'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{projectStats.avgProgress}%</div>
                  <div className="text-sm text-purple-600">{dir === 'rtl' ? 'متوسط التقدم' : 'Avg Progress'}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-700">{projectStats.completedDeliverables}/{projectStats.totalDeliverables}</div>
                  <div className="text-sm text-indigo-600">{dir === 'rtl' ? 'المخرجات المكتملة' : 'Completed Deliverables'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#1B4FFF]" />
              {dir === 'rtl' ? 'قائمة المشاريع' : 'Projects List'}
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {clientProjects.map((project) => {
                const StatusIcon = getStatusIcon(project.status);
                return (
                  <Card key={project.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="bg-gradient-to-r from-[#1B4FFF]/5 to-[#0A1E39]/5 rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className="w-5 h-5 text-[#1B4FFF]" />
                            <CardTitle className="text-lg text-foreground">
                              {dir === 'rtl' ? project.name : project.nameEn}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {dir === 'rtl' ? project.description : project.descriptionEn}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {getStatusLabel(project.status)}
                            </Badge>
                            <Badge className={`${getPriorityColor(project.priority)}`}>
                              {getPriorityLabel(project.priority)}
                            </Badge>
                            <Badge variant="outline" className="text-foreground border-[#1B4FFF]/20">
                              {dir === 'rtl' ? project.category : project.categoryEn}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProject(project)}
                            className="text-[#1B4FFF] hover:bg-[#1B4FFF]/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-foreground hover:bg-[#0A1E39]/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 p-6">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {dir === 'rtl' ? 'التقدم' : 'Progress'}
                          </span>
                          <span className="text-sm font-bold text-[#1B4FFF]">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Project Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1B4FFF]" />
                            <span className="text-xs text-muted-foreground">{dir === 'rtl' ? 'تاريخ البداية' : 'Start Date'}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{formatDate(project.startDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#1B4FFF]" />
                            <span className="text-xs text-muted-foreground">{dir === 'rtl' ? 'تاريخ الانتهاء' : 'End Date'}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{formatDate(project.endDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#1B4FFF]" />
                            <span className="text-xs text-muted-foreground">{dir === 'rtl' ? 'قائد الفريق' : 'Team Lead'}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {dir === 'rtl' ? project.team.lead : project.team.leadEn}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#1B4FFF]" />
                            <span className="text-xs text-muted-foreground">{dir === 'rtl' ? 'أعضاء الفريق' : 'Team Members'}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{project.team.members}</p>
                        </div>
                      </div>

                      {/* Financial and Deliverables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">{dir === 'rtl' ? 'الميزانية والمصروف' : 'Budget & Spent'}</span>
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'الميزانية:' : 'Budget:'}</span>
                              <span className="font-medium text-green-700">{formatCurrency(project.budget)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'المصروف:' : 'Spent:'}</span>
                              <span className="font-medium text-green-700">{formatCurrency(project.spent)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'المتبقي:' : 'Remaining:'}</span>
                              <span className="font-medium text-green-700">{formatCurrency(project.budget - project.spent)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">{dir === 'rtl' ? 'المخرجات' : 'Deliverables'}</span>
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'الإجمالي:' : 'Total:'}</span>
                              <span className="font-medium text-blue-700">{project.deliverables.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'المكتمل:' : 'Completed:'}</span>
                              <span className="font-medium text-blue-700">{project.deliverables.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{dir === 'rtl' ? 'المتبقي:' : 'Remaining:'}</span>
                              <span className="font-medium text-blue-700">{project.deliverables.total - project.deliverables.completed}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          <Button className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] hover:from-[#0A1E39] hover:to-[#1B4FFF] text-white">
            <Plus className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'مشروع جديد' : 'New Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}