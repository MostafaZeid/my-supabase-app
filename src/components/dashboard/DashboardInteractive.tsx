import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText, 
  Ticket,
  TrendingUp,
  RefreshCw,
  Activity,
  Target,
  Calendar,
  Award,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  Download,
  Star,
  Building2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// مكون تفاصيل إجمالي المشاريع
const TotalProjectsModal = ({ isOpen, onClose, stats, dir }: any) => {
  const projects = [
    {
      id: '1',
      title: dir === 'rtl' ? 'مشروع تطوير سياسات الموارد البشرية' : 'HR Policies Development Project',
      client: dir === 'rtl' ? 'شركة التقنية المتقدمة' : 'Advanced Technology Company',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-12-15',
      budget: 450000,
      team: 5
    },
    {
      id: '2',
      title: dir === 'rtl' ? 'مشروع إعادة هيكلة السياسات المالية' : 'Financial Policies Restructuring Project',
      client: dir === 'rtl' ? 'مجموعة الاستثمار الخليجي' : 'Gulf Investment Group',
      status: 'active',
      progress: 45,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      budget: 320000,
      team: 3
    },
    {
      id: '3',
      title: dir === 'rtl' ? 'مشروع تطوير دليل الحوكمة المؤسسية' : 'Corporate Governance Manual Development',
      client: dir === 'rtl' ? 'البنك التجاري الوطني' : 'National Commercial Bank',
      status: 'review',
      progress: 90,
      startDate: '2024-02-10',
      endDate: '2024-11-20',
      budget: 280000,
      team: 4
    },
    {
      id: '4',
      title: dir === 'rtl' ? 'مشروع تطوير سياسات الأمن السيبراني' : 'Cybersecurity Policies Development',
      client: dir === 'rtl' ? 'شركة الاتصالات الرقمية' : 'Digital Communications Company',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      budget: 180000,
      team: 3
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'review': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'on_hold': return <PauseCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      review: dir === 'rtl' ? 'مراجعة' : 'Review',
      completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
      on_hold: dir === 'rtl' ? 'معلق' : 'On Hold'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    review: projects.filter(p => p.status === 'review').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <BarChart3 className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل إجمالي المشاريع' : 'Total Projects Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات المشاريع */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{projectStats.total}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <PlayCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{projectStats.review}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'قيد المراجعة' : 'Under Review'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-600">{projectStats.completed}</p>
                <p className="text-sm text-emerald-700">{dir === 'rtl' ? 'مشاريع مكتملة' : 'Completed Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-purple-600">{formatCurrency(projectStats.totalBudget)}</p>
                <p className="text-sm text-purple-700">{dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة المشاريع */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'جميع المشاريع' : 'All Projects'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(project.status)}
                          <h3 className="font-semibold text-foreground">{project.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mb-2 ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'review' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-700">{formatCurrency(project.budget)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'البداية:' : 'Start:'}</span>
                        <span className="ml-1">{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'النهاية:' : 'End:'}</span>
                        <span className="ml-1">{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'الفريق:' : 'Team:'}</span>
                        <span className="ml-1">{project.team} {dir === 'rtl' ? 'أعضاء' : 'members'}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'الميزانية:' : 'Budget:'}</span>
                        <span className="ml-1">{formatCurrency(project.budget)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline">
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// مكون تفاصيل المهام المكتملة
const CompletedTasksModal = ({ isOpen, onClose, stats, dir }: any) => {
  const tasks = [
    {
      id: '1',
      title: dir === 'rtl' ? 'مراجعة سياسة التوظيف' : 'Review Recruitment Policy',
      project: dir === 'rtl' ? 'مشروع الموارد البشرية' : 'HR Project',
      assignee: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed',
      completedDate: '2024-12-10',
      priority: 'high',
      category: 'review'
    },
    {
      id: '2',
      title: dir === 'rtl' ? 'إعداد دليل الإجراءات المالية' : 'Prepare Financial Procedures Manual',
      project: dir === 'rtl' ? 'مشروع السياسات المالية' : 'Financial Policies Project',
      assignee: dir === 'rtl' ? 'فاطمة الزهراني' : 'Fatima Al-Zahrani',
      completedDate: '2024-12-09',
      priority: 'medium',
      category: 'documentation'
    },
    {
      id: '3',
      title: dir === 'rtl' ? 'تحديث قوالب التقييم' : 'Update Evaluation Templates',
      project: dir === 'rtl' ? 'مشروع الحوكمة' : 'Governance Project',
      assignee: dir === 'rtl' ? 'سارة أحمد' : 'Sarah Ahmed',
      completedDate: '2024-12-08',
      priority: 'low',
      category: 'template'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'review': return <Eye className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'template': return <Edit className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const taskStats = {
    total: tasks.length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <CheckCircle2 className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل المهام المكتملة' : 'Completed Tasks Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات المهام */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي المهام' : 'Total Tasks'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{taskStats.high}</p>
                <p className="text-sm text-red-700">{dir === 'rtl' ? 'أولوية عالية' : 'High Priority'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{taskStats.medium}</p>
                <p className="text-sm text-yellow-700">{dir === 'rtl' ? 'أولوية متوسطة' : 'Medium Priority'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{taskStats.low}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'أولوية منخفضة' : 'Low Priority'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة المهام */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'المهام المكتملة' : 'Completed Tasks'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(task.category)}
                        <div>
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.project}</p>
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(task.priority)} border`}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'المسؤول:' : 'Assignee:'}</span>
                        <span className="ml-1">{task.assignee}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'تاريخ الإكمال:' : 'Completed:'}</span>
                        <span className="ml-1">{new Date(task.completedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">{dir === 'rtl' ? 'مكتملة' : 'Completed'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline">
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// مكون تفاصيل التذاكر المفتوحة
const OpenTicketsModal = ({ isOpen, onClose, stats, dir }: any) => {
  const tickets = [
    {
      id: 'T001',
      title: dir === 'rtl' ? 'طلب تعديل سياسة الإجازات' : 'Request to Modify Leave Policy',
      client: dir === 'rtl' ? 'شركة التقنية المتقدمة' : 'Advanced Technology Company',
      priority: 'high',
      status: 'open',
      assignee: dir === 'rtl' ? 'أحمد محمد' : 'Ahmed Mohammed',
      createdDate: '2024-12-08',
      category: 'policy_change'
    },
    {
      id: 'T002',
      title: dir === 'rtl' ? 'استفسار حول إجراءات التوظيف' : 'Inquiry about Recruitment Procedures',
      client: dir === 'rtl' ? 'مجموعة الاستثمار الخليجي' : 'Gulf Investment Group',
      priority: 'medium',
      status: 'in_progress',
      assignee: dir === 'rtl' ? 'فاطمة الزهراني' : 'Fatima Al-Zahrani',
      createdDate: '2024-12-09',
      category: 'inquiry'
    },
    {
      id: 'T003',
      title: dir === 'rtl' ? 'طلب دعم تقني للنظام' : 'Technical Support Request for System',
      client: dir === 'rtl' ? 'البنك التجاري الوطني' : 'National Commercial Bank',
      priority: 'low',
      status: 'pending',
      assignee: dir === 'rtl' ? 'سارة أحمد' : 'Sarah Ahmed',
      createdDate: '2024-12-10',
      category: 'technical'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending': return <PauseCircle className="w-4 h-4 text-blue-600" />;
      default: return <Ticket className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: dir === 'rtl' ? 'مفتوحة' : 'Open',
      in_progress: dir === 'rtl' ? 'قيد المعالجة' : 'In Progress',
      pending: dir === 'rtl' ? 'معلقة' : 'Pending'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    pending: tickets.filter(t => t.status === 'pending').length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <Ticket className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل التذاكر المفتوحة' : 'Open Tickets Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات التذاكر */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Ticket className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{ticketStats.total}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي التذاكر' : 'Total Tickets'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{ticketStats.open}</p>
                <p className="text-sm text-red-700">{dir === 'rtl' ? 'تذاكر مفتوحة' : 'Open Tickets'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</p>
                <p className="text-sm text-yellow-700">{dir === 'rtl' ? 'قيد المعالجة' : 'In Progress'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <PauseCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{ticketStats.pending}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'معلقة' : 'Pending'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة التذاكر */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'التذاكر المفتوحة' : 'Open Tickets'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{ticket.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {ticket.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ticket.client}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'المسؤول:' : 'Assignee:'}</span>
                        <span className="ml-1">{ticket.assignee}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                        <span className="ml-1">{new Date(ticket.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'النوع:' : 'Category:'}</span>
                        <span className="ml-1">
                          {ticket.category === 'policy_change' ? (dir === 'rtl' ? 'تغيير سياسة' : 'Policy Change') :
                           ticket.category === 'inquiry' ? (dir === 'rtl' ? 'استفسار' : 'Inquiry') :
                           ticket.category === 'technical' ? (dir === 'rtl' ? 'دعم تقني' : 'Technical') :
                           ticket.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline">
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// مكون تفاصيل التقدم العام
const OverallProgressModal = ({ isOpen, onClose, stats, dir }: any) => {
  const progressData = [
    {
      category: dir === 'rtl' ? 'تطوير السياسات' : 'Policy Development',
      progress: 75,
      total: 20,
      completed: 15,
      color: 'blue'
    },
    {
      category: dir === 'rtl' ? 'مراجعة الإجراءات' : 'Procedure Review',
      progress: 60,
      total: 15,
      completed: 9,
      color: 'green'
    },
    {
      category: dir === 'rtl' ? 'التدريب والتطوير' : 'Training & Development',
      progress: 80,
      total: 10,
      completed: 8,
      color: 'purple'
    },
    {
      category: dir === 'rtl' ? 'الحوكمة المؤسسية' : 'Corporate Governance',
      progress: 45,
      total: 12,
      completed: 5,
      color: 'orange'
    }
  ];

  const overallStats = {
    totalItems: progressData.reduce((sum, item) => sum + item.total, 0),
    completedItems: progressData.reduce((sum, item) => sum + item.completed, 0),
    averageProgress: Math.round(progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length)
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <TrendingUp className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل التقدم العام' : 'Overall Progress Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات التقدم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{overallStats.totalItems}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي العناصر' : 'Total Items'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{overallStats.completedItems}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'العناصر المكتملة' : 'Completed Items'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{overallStats.averageProgress}%</p>
                <p className="text-sm text-purple-700">{dir === 'rtl' ? 'متوسط التقدم' : 'Average Progress'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* تفاصيل التقدم حسب الفئة */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'التقدم حسب الفئة' : 'Progress by Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progressData.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getColorClasses(item.color)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{item.category}</h3>
                      <Badge className="bg-white/50 text-gray-700">
                        {item.completed}/{item.total} {dir === 'rtl' ? 'مكتمل' : 'completed'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 bg-white/50 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(item.color)}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{item.progress}%</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'المكتمل:' : 'Completed:'}</span>
                        <span className="ml-1">{item.completed}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'المتبقي:' : 'Remaining:'}</span>
                        <span className="ml-1">{item.total - item.completed}</span>
                      </div>
                      <div>
                        <span className="font-medium">{dir === 'rtl' ? 'الإجمالي:' : 'Total:'}</span>
                        <span className="ml-1">{item.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline">
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  // Modal states for interactive statistics
  const [showTotalProjectsModal, setShowTotalProjectsModal] = useState(false);
  const [showCompletedTasksModal, setShowCompletedTasksModal] = useState(false);
  const [showOpenTicketsModal, setShowOpenTicketsModal] = useState(false);
  const [showOverallProgressModal, setShowOverallProgressModal] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Role-based dashboard data
  const getDashboardData = () => {
    const baseStats = {
      totalProjects: 12,
      activeProjects: 8,
      completedTasks: 45,
      pendingApprovals: 6,
      openTickets: 3,
      overallProgress: 68
    };

    // Adjust data based on user role
    if (userProfile?.role === 'sub_consultant') {
      return {
        ...baseStats,
        totalProjects: 5, // Only assigned projects
        activeProjects: 3,
        completedTasks: 18,
        pendingApprovals: 2,
      };
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      return {
        ...baseStats,
        totalProjects: 3, // Only their organization's projects
        activeProjects: 2,
        completedTasks: 12,
        pendingApprovals: 4,
      };
    }

    return baseStats;
  };

  const stats = getDashboardData();

  const getRecentProjects = () => {
    const allProjects = [
      {
        id: '1',
        title: 'مشروع تطوير سياسات الموارد البشرية',
        titleEn: 'HR Policies Development Project',
        progress: 75,
        status: 'active',
        client: 'شركة التقنية المتقدمة',
        clientEn: 'Advanced Technology Company',
        dueDate: '2024-12-15'
      },
      {
        id: '2',
        title: 'مشروع إعادة هيكلة السياسات المالية',
        titleEn: 'Financial Policies Restructuring Project',
        progress: 45,
        status: 'active',
        client: 'مجموعة الاستثمار الخليجي',
        clientEn: 'Gulf Investment Group',
        dueDate: '2024-11-30'
      },
      {
        id: '3',
        title: 'مشروع تطوير دليل الحوكمة المؤسسية',
        titleEn: 'Corporate Governance Manual Development',
        progress: 90,
        status: 'review',
        client: 'البنك التجاري الوطني',
        clientEn: 'National Commercial Bank',
        dueDate: '2024-11-20'
      }
    ];

    // Filter based on user role
    if (userProfile?.role === 'sub_consultant') {
      return allProjects.slice(0, 2); // Only assigned projects
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      return allProjects.slice(0, 1); // Only their organization's projects
    }

    return allProjects;
  };

  const getRecentDeliverables = () => {
    return [
      {
        id: '1',
        title: 'سياسة التوظيف والاختيار المحدثة',
        titleEn: 'Updated Recruitment and Selection Policy',
        type: 'policy',
        status: 'approved',
        project: 'مشروع الموارد البشرية',
        projectEn: 'HR Project',
        version: '2.1'
      },
      {
        id: '2',
        title: 'دليل إجراءات المراجعة الداخلية',
        titleEn: 'Internal Audit Procedures Manual',
        type: 'guide',
        status: 'review',
        project: 'مشروع الحوكمة',
        projectEn: 'Governance Project',
        version: '1.0'
      },
      {
        id: '3',
        title: 'قالب تقييم الأداء السنوي',
        titleEn: 'Annual Performance Evaluation Template',
        type: 'template',
        status: 'draft',
        project: 'مشروع الموارد البشرية',
        projectEn: 'HR Project',
        version: '1.2'
      }
    ];
  };

  const getRecentTickets = () => {
    return [
      {
        id: '1',
        title: 'طلب تعديل سياسة الإجازات',
        titleEn: 'Request to Modify Leave Policy',
        priority: 'high',
        status: 'open',
        client: 'شركة التقنية المتقدمة',
        clientEn: 'Advanced Technology Company',
        assignee: 'أحمد محمد',
        assigneeEn: 'Ahmed Mohammed'
      },
      {
        id: '2',
        title: 'استفسار حول إجراءات التوظيف',
        titleEn: 'Inquiry about Recruitment Procedures',
        priority: 'medium',
        status: 'in_progress',
        client: 'مجموعة الاستثمار الخليجي',
        clientEn: 'Gulf Investment Group',
        assignee: 'فاطمة الزهراني',
        assigneeEn: 'Fatima Al-Zahrani'
      }
    ];
  };

  const recentProjects = getRecentProjects();
  const recentDeliverables = getRecentDeliverables();
  const recentTickets = getRecentTickets();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800' },
      review: { label: dir === 'rtl' ? 'مراجعة' : 'Review', color: 'bg-blue-100 text-blue-800' },
      completed: { label: dir === 'rtl' ? 'مكتمل' : 'Completed', color: 'bg-gray-100 text-gray-800' },
      approved: { label: dir === 'rtl' ? 'معتمد' : 'Approved', color: 'bg-green-100 text-green-800' },
      draft: { label: dir === 'rtl' ? 'مسودة' : 'Draft', color: 'bg-yellow-100 text-yellow-800' },
      open: { label: dir === 'rtl' ? 'مفتوح' : 'Open', color: 'bg-red-100 text-red-800' },
      in_progress: { label: dir === 'rtl' ? 'قيد المعالجة' : 'In Progress', color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: dir === 'rtl' ? 'عالية' : 'High', color: 'bg-red-100 text-red-800' },
      medium: { label: dir === 'rtl' ? 'متوسطة' : 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      low: { label: dir === 'rtl' ? 'منخفضة' : 'Low', color: 'bg-green-100 text-green-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {dir === 'rtl' ? 'نظرة عامة على أداء المنصة والمشاريع' : 'Overview of platform performance and projects'}
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('dashboard.refresh')}
        </Button>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button
          variant="ghost"
          className="h-auto p-0 hover:scale-105 transition-all duration-200"
          onClick={() => setShowTotalProjectsModal(true)}
        >
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalProjects')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? '+2 من الشهر الماضي' : '+2 from last month'}
              </p>
            </CardContent>
          </Card>
        </Button>

        <Button
          variant="ghost"
          className="h-auto p-0 hover:scale-105 transition-all duration-200"
          onClick={() => setShowCompletedTasksModal(true)}
        >
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.completedTasks')}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? '+12 هذا الأسبوع' : '+12 this week'}
              </p>
            </CardContent>
          </Card>
        </Button>

        <Button
          variant="ghost"
          className="h-auto p-0 hover:scale-105 transition-all duration-200"
          onClick={() => setShowOpenTicketsModal(true)}
        >
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.openTickets')}</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                {dir === 'rtl' ? '-1 من أمس' : '-1 from yesterday'}
              </p>
            </CardContent>
          </Card>
        </Button>

        <Button
          variant="ghost"
          className="h-auto p-0 hover:scale-105 transition-all duration-200"
          onClick={() => setShowOverallProgressModal(true)}
        >
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.overallProgress')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#1B4FFF] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        {hasPermission('projects.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('dashboard.recentProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? project.title : project.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? project.client : project.clientEn}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                        <div 
                          className="bg-[#1B4FFF] h-1.5 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(project.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Deliverables */}
        {hasPermission('deliverables.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {t('dashboard.recentDeliverables')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDeliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? deliverable.title : deliverable.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? deliverable.project : deliverable.projectEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? 'الإصدار' : 'Version'} {deliverable.version}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(deliverable.status)}
                    <Badge variant="outline" className="text-xs mt-1">
                      {deliverable.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Tickets */}
        {hasPermission('tickets.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('dashboard.recentTickets')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? ticket.title : ticket.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? ticket.client : ticket.clientEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? 'المسؤول:' : 'Assignee:'} {dir === 'rtl' ? ticket.assignee : ticket.assigneeEn}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics for Lead Consultant */}
      {userProfile?.role === 'lead_consultant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {dir === 'rtl' ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'معدل إنجاز المشاريع' : 'Project Completion Rate'}
                </span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'رضا العملاء' : 'Client Satisfaction'}
                </span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'الالتزام بالمواعيد' : 'On-Time Delivery'}
                </span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {dir === 'rtl' ? 'المواعيد النهائية القادمة' : 'Upcoming Deadlines'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'مراجعة سياسة الموارد البشرية' : 'HR Policy Review'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' ? 'شركة التقنية المتقدمة' : 'Advanced Technology Company'}
                  </p>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {dir === 'rtl' ? '3 أيام' : '3 days'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'تسليم دليل الحوكمة' : 'Governance Manual Delivery'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' ? 'البنك التجاري الوطني' : 'National Commercial Bank'}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {dir === 'rtl' ? '7 أيام' : '7 days'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'مراجعة السياسات المالية' : 'Financial Policies Review'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' ? 'مجموعة الاستثمار الخليجي' : 'Gulf Investment Group'}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {dir === 'rtl' ? '14 يوم' : '14 days'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Statistics Detail Modals */}
      <TotalProjectsModal
        isOpen={showTotalProjectsModal}
        onClose={() => setShowTotalProjectsModal(false)}
        stats={stats}
        dir={dir}
      />
      
      <CompletedTasksModal
        isOpen={showCompletedTasksModal}
        onClose={() => setShowCompletedTasksModal(false)}
        stats={stats}
        dir={dir}
      />
      
      <OpenTicketsModal
        isOpen={showOpenTicketsModal}
        onClose={() => setShowOpenTicketsModal(false)}
        stats={stats}
        dir={dir}
      />
      
      <OverallProgressModal
        isOpen={showOverallProgressModal}
        onClose={() => setShowOverallProgressModal(false)}
        stats={stats}
        dir={dir}
      />
    </div>
  );
}