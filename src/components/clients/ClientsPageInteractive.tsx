import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConsultantProfileModal } from '../projects/ConsultantProfileModal';
import { 
  Plus, 
  Search, 
  Building2,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Filter,
  Download,
  Star,
  Calendar,
  DollarSign,
  Target,
  Award,
  Activity,
  PieChart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import the modals
import { InvoiceModal } from './InvoiceModalSimple';
import { ClientReportsModal } from './ClientReportsModalSimple';
import { ScheduleMeetingModal } from './ScheduleMeetingModalSimple';
import { ClientDetailsModal } from './ClientDetailsModalInteractive';
import { EditClientModal } from './EditClientModalSimple';
import { ClientProjectsModal } from './ClientProjectsModalSimple';
import { CreateClientModal } from './CreateClientModal';

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
  revenue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
  logo?: string;
  assignedTeam: Array<{
    name: string;
    role: string;
    avatar: string;
    email: string;
  }>;
}

// مكون تفاصيل إجمالي العملاء
const TotalClientsModal = ({ isOpen, onClose, clients, dir }: any) => {
  // Ensure clients is always an array
  const safeClients = clients || [];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'prospect': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'inactive': return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      prospect: dir === 'rtl' ? 'محتمل' : 'Prospect',
      inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const statusCounts = {
    active: safeClients.filter((c: Client) => c.status === 'active').length,
    prospect: safeClients.filter((c: Client) => c.status === 'prospect').length,
    inactive: safeClients.filter((c: Client) => c.status === 'inactive').length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <Users className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل إجمالي العملاء' : 'Total Clients Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات الحالة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{statusCounts.prospect}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'عملاء محتملون' : 'Prospect Clients'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold text-muted-foreground">{statusCounts.inactive}</p>
                <p className="text-sm text-gray-700">{dir === 'rtl' ? 'عملاء غير نشطين' : 'Inactive Clients'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة العملاء */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'قائمة جميع العملاء' : 'All Clients List'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeClients.map((client: Client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {((dir === 'rtl' ? client.organization : client.organizationEn) || '').charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {dir === 'rtl' ? client.organization : client.organizationEn}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dir === 'rtl' ? client.industry : client.industryEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(client.status)}
                      <span className="text-sm font-medium">{getStatusLabel(client.status)}</span>
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

// مكون تفاصيل العملاء النشطين
const ActiveClientsModal = ({ isOpen, onClose, clients, dir }: any) => {
  // Ensure clients is always an array
  const safeClients = clients || [];
  const activeClients = safeClients.filter((c: Client) => c.status === 'active');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = activeClients.reduce((sum: number, client: Client) => sum + (client.revenue || 0), 0);
  const totalProjects = activeClients.reduce((sum: number, client: Client) => sum + (client.projects?.total || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <CheckCircle2 className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل العملاء النشطين' : 'Active Clients Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* إحصائيات العملاء النشطين */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{activeClients.length}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{totalProjects}</p>
                <p className="text-sm text-purple-700">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة العملاء النشطين */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'العملاء النشطون' : 'Active Clients'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeClients.map((client: Client) => (
                  <div key={client.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {((dir === 'rtl' ? client.organization : client.organizationEn) || '').charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {dir === 'rtl' ? client.organization : client.organizationEn}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {dir === 'rtl' ? client.industry : client.industryEn}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {dir === 'rtl' ? 'نشط' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{client.projects.total}</p>
                        <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'المشاريع' : 'Projects'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(client.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{client.satisfaction}%</p>
                        <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'الرضا' : 'Satisfaction'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{client.projects.active}</p>
                        <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
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

// مكون تفاصيل إجمالي المشاريع
const TotalProjectsModal = ({ isOpen, onClose, clients, dir }: any) => {
  // Ensure clients is always an array
  const safeClients = clients || [];
  const allProjects = safeClients.flatMap((client: Client) => 
    Array.from({ length: client.projects?.total || 0 }, (_, i) => ({
      id: `${client.id}-P${i + 1}`,
      clientName: dir === 'rtl' ? client.organization : client.organizationEn,
      name: dir === 'rtl' ? `مشروع ${i + 1} - ${client.organization || ''}` : `Project ${i + 1} - ${client.organizationEn || ''}`,
      status: i < (client.projects?.active || 0) ? 'active' : i < (client.projects?.active || 0) + (client.projects?.completed || 0) ? 'completed' : 'on_hold',
      progress: i < (client.projects?.active || 0) ? Math.floor(Math.random() * 40) + 30 : i < (client.projects?.active || 0) + (client.projects?.completed || 0) ? 100 : Math.floor(Math.random() * 30),
      budget: Math.floor(Math.random() * 500000) + 100000,
      clientId: client.id
    }))
  );

  const projectStats = {
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 'active').length,
    completed: allProjects.filter(p => p.status === 'completed').length,
    onHold: allProjects.filter(p => p.status === 'on_hold').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'on_hold': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{projectStats.total}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-600">{projectStats.completed}</p>
                <p className="text-sm text-emerald-700">{dir === 'rtl' ? 'مشاريع مكتملة' : 'Completed Projects'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{projectStats.onHold}</p>
                <p className="text-sm text-yellow-700">{dir === 'rtl' ? 'مشاريع معلقة' : 'On Hold Projects'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة المشاريع */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'جميع المشاريع' : 'All Projects'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allProjects.slice(0, 10).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(project.status)}
                        <h4 className="font-medium text-foreground">{project.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.clientName}</p>
                      <div className="flex items-center gap-2">
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
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-700">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                ))}
                {allProjects.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {dir === 'rtl' ? `و ${allProjects.length - 10} مشاريع أخرى...` : `And ${allProjects.length - 10} more projects...`}
                    </p>
                  </div>
                )}
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

// مكون تفاصيل متوسط الرضا
const AvgSatisfactionModal = ({ isOpen, onClose, clients, dir }: any) => {
  const clientsWithSatisfaction = clients.filter((c: Client) => c.satisfaction > 0);
  const avgSatisfaction = Math.round(
    clientsWithSatisfaction.reduce((sum: number, c: Client) => sum + c.satisfaction, 0) / clientsWithSatisfaction.length
  ) || 0;

  const satisfactionRanges = {
    excellent: clientsWithSatisfaction.filter((c: Client) => c.satisfaction >= 90).length,
    good: clientsWithSatisfaction.filter((c: Client) => c.satisfaction >= 75 && c.satisfaction < 90).length,
    average: clientsWithSatisfaction.filter((c: Client) => c.satisfaction >= 60 && c.satisfaction < 75).length,
    poor: clientsWithSatisfaction.filter((c: Client) => c.satisfaction < 60).length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <Star className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل متوسط الرضا' : 'Average Satisfaction Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* النتيجة الإجمالية */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-12 h-12 text-orange-600" />
              </div>
              <p className="text-4xl font-bold text-orange-600 mb-2">{avgSatisfaction}%</p>
              <p className="text-lg text-orange-700">{dir === 'rtl' ? 'متوسط الرضا العام' : 'Overall Average Satisfaction'}</p>
            </CardContent>
          </Card>
          
          {/* توزيع مستويات الرضا */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{satisfactionRanges.excellent}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'ممتاز (90%+)' : 'Excellent (90%+)'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{satisfactionRanges.good}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'جيد (75-89%)' : 'Good (75-89%)'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{satisfactionRanges.average}</p>
                <p className="text-sm text-yellow-700">{dir === 'rtl' ? 'متوسط (60-74%)' : 'Average (60-74%)'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{satisfactionRanges.poor}</p>
                <p className="text-sm text-red-700">{dir === 'rtl' ? 'ضعيف (<60%)' : 'Poor (<60%)'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* قائمة العملاء حسب الرضا */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'تقييم العملاء' : 'Client Ratings'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientsWithSatisfaction
                  .sort((a, b) => (b.satisfaction || 0) - (a.satisfaction || 0))
                  .map((client: Client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {((dir === 'rtl' ? client.organization : client.organizationEn) || '').charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {dir === 'rtl' ? client.organization : client.organizationEn}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dir === 'rtl' ? client.industry : client.industryEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-bold text-orange-600">{client.satisfaction || 0}%</span>
                      </div>
                      <Badge className={`${
                        (client.satisfaction || 0) >= 90 ? 'bg-green-100 text-green-800' :
                        client.satisfaction >= 75 ? 'bg-blue-100 text-blue-800' :
                        client.satisfaction >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client.satisfaction >= 90 ? (dir === 'rtl' ? 'ممتاز' : 'Excellent') :
                         client.satisfaction >= 75 ? (dir === 'rtl' ? 'جيد' : 'Good') :
                         client.satisfaction >= 60 ? (dir === 'rtl' ? 'متوسط' : 'Average') :
                         (dir === 'rtl' ? 'ضعيف' : 'Poor')}
                      </Badge>
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

export function ClientsPage() {
  const { userProfile } = useAuth();
  const { dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showConsultantProfile, setShowConsultantProfile] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  
  // Statistics modal states
  const [showTotalClientsModal, setShowTotalClientsModal] = useState(false);
  const [showActiveClientsModal, setShowActiveClientsModal] = useState(false);
  const [showTotalProjectsModal, setShowTotalProjectsModal] = useState(false);
  const [showAvgSatisfactionModal, setShowAvgSatisfactionModal] = useState(false);

  // Sample clients data
  const allClients: Client[] = [
    {
      id: '1',
      organization: 'شركة منصور القابضة',
      organizationEn: 'Mansour Holding Company',
      industry: 'الاستثمار والتطوير',
      industryEn: 'Investment & Development',
      contactPerson: {
        name: 'سلطان منصور',
        nameEn: 'Sultan Mansour',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'sultan.mansour@mansourholding.sa',
        phone: '+966501234567',
        avatar: 'SM'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1995-03-15',
      clientSince: '2024-01-15',
      status: 'active',
      projects: {
        total: 3,
        active: 2,
        completed: 1,
        onHold: 0
      },
      totalValue: 1250000,
      paidValue: 750000,
      revenue: 1250000,
      satisfaction: 95,
      logo: './images/mansour-logo_20251213_171634.png',
      lastActivity: '2024-10-30',
      tags: ['استثمار', 'قابضة', 'كبير'],
      tagsEn: ['Investment', 'Holding', 'Large'],
      assignedTeam: [
        { name: 'د. فهد السعدي', role: 'مستشار أول الموارد البشرية', avatar: 'FS', email: 'fahad.alsaadi@albayan.com' },
        { name: 'محمد رشاد', role: 'مستشار أول المالية', avatar: 'MR', email: 'mohammed.rashad@albayan.com' },
        { name: 'محمد جودة', role: 'مستشار أول الحوكمة', avatar: 'MJ', email: 'mohammed.joudah@albayan.com' }
      ]
    },
    {
      id: '2',
      organization: 'مجموعة الاستثمار الخليجي',
      organizationEn: 'Gulf Investment Group',
      industry: 'الاستثمار والمالية',
      industryEn: 'Investment & Finance',
      contactPerson: {
        name: 'فاطمة الزهراني',
        nameEn: 'Fatima Al-Zahrani',
        position: 'مديرة الاستثمار',
        positionEn: 'Investment Director',
        email: 'f.zahrani@gig.sa',
        phone: '+966502345678',
        avatar: 'FZ'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2010-08-22',
      clientSince: '2024-05-20',
      status: 'prospect',
      projects: {
        total: 2,
        active: 1,
        completed: 0,
        onHold: 1
      },
      totalValue: 850000,
      paidValue: 425000,
      revenue: 850000,
      satisfaction: 88,
      logo: './images/gig-logo_20251213_171646.png',
      lastActivity: '2024-10-29',
      tags: ['استثمار', 'مالية', 'مجموعة'],
      tagsEn: ['Investment', 'Finance', 'Group'],
      assignedTeam: [
        { name: 'محمد رشاد', role: 'مستشار أول المالية', avatar: 'MR', email: 'mohammed.rashad@albayan.com' },
        { name: 'مروة الحمامصي', role: 'مستشارة أول الأمن السيبراني', avatar: 'MH', email: 'marwa.alhamamsi@albayan.com' }
      ]
    },
    {
      id: '3',
      organization: 'البنك التجاري الوطني',
      organizationEn: 'National Commercial Bank',
      industry: 'الخدمات المصرفية',
      industryEn: 'Banking Services',
      contactPerson: {
        name: 'أحمد الشمري',
        nameEn: 'Ahmed Al-Shamri',
        position: 'مدير الامتثال',
        positionEn: 'Compliance Manager',
        email: 'a.shamri@ncb.sa',
        phone: '+966503456789',
        avatar: 'AS'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1953-12-20',
      clientSince: '2024-03-10',
      status: 'active',
      projects: {
        total: 4,
        active: 2,
        completed: 2,
        onHold: 0
      },
      totalValue: 2100000,
      paidValue: 1680000,
      revenue: 2100000,
      satisfaction: 92,
      logo: './images/ncb-logo_20251213_171658.png',
      lastActivity: '2024-10-28',
      tags: ['بنك', 'حوكمة', 'امتثال'],
      tagsEn: ['Bank', 'Governance', 'Compliance']
    },
    {
      id: '4',
      organization: 'شركة الاتصالات الرقمية',
      organizationEn: 'Digital Communications Company',
      industry: 'التكنولوجيا والاتصالات',
      industryEn: 'Technology & Communications',
      contactPerson: {
        name: 'نورا القحطاني',
        nameEn: 'Nora Al-Qahtani',
        position: 'مديرة التطوير',
        positionEn: 'Development Manager',
        email: 'n.qahtani@dcc.sa',
        phone: '+966504567890',
        avatar: 'NQ'
      },
      address: {
        city: 'الدمام',
        cityEn: 'Dammam',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2018-06-10',
      clientSince: '2024-07-05',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 1,
        onHold: 0
      },
      totalValue: 680000,
      paidValue: 340000,
      revenue: 680000,
      satisfaction: 90,
      logo: '/images/dcc-logo.png',
      lastActivity: '2024-10-27',
      tags: ['تكنولوجيا', 'اتصالات', 'رقمي'],
      tagsEn: ['Technology', 'Communications', 'Digital']
    },
    {
      id: '5',
      organization: 'مستشفى الملك فيصل التخصصي',
      organizationEn: 'King Faisal Specialist Hospital',
      industry: 'الرعاية الصحية',
      industryEn: 'Healthcare',
      contactPerson: {
        name: 'د. خالد العتيبي',
        nameEn: 'Dr. Khalid Al-Otaibi',
        position: 'مدير الجودة',
        positionEn: 'Quality Manager',
        email: 'k.otaibi@kfsh.med.sa',
        phone: '+966505678901',
        avatar: 'KO'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1975-02-05',
      clientSince: '2024-09-12',
      status: 'inactive',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 1
      },
      totalValue: 280000,
      paidValue: 0,
      revenue: 280000,
      satisfaction: 0,
      logo: '/images/kfsh-logo.png',
      lastActivity: '2024-09-15',
      tags: ['صحة', 'مستشفى', 'جودة'],
      tagsEn: ['Healthcare', 'Hospital', 'Quality']
    }
  ];

  // تصفية العملاء حسب دور المستخدم
  const getFilteredClients = () => {
    let clients = allClients;

    // تصفية حسب دور المستخدم
    if (userProfile?.role === 'sub_consultant') {
      clients = clients.slice(0, 3);
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      clients = clients.slice(0, 1);
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      clients = clients.filter(client => client.status === statusFilter);
    }

    // تصفية حسب البحث
    if (searchTerm) {
      clients = clients.filter(client => 
        client.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.organizationEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industryEn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return clients;
  };

  const filteredClients = getFilteredClients();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      inactive: { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock },
      prospect: { label: dir === 'rtl' ? 'عميل محتمل' : 'Prospect', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // إحصائيات العملاء
  const stats = {
    total: filteredClients.length,
    active: filteredClients.filter(c => c.status === 'active').length,
    prospects: filteredClients.filter(c => c.status === 'prospect').length,
    inactive: filteredClients.filter(c => c.status === 'inactive').length,
    totalProjects: filteredClients.reduce((sum, c) => sum + c.projects.total, 0),
    avgSatisfaction: Math.round(
      filteredClients.filter(c => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) / 
      filteredClients.filter(c => c.satisfaction > 0).length
    ) || 0
  };

  // دوال التعامل مع العملاء والمكونات
  const handleAction = (action: string, client: Client) => {
    setSelectedClient(client);
    
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'projects':
        setShowProjectsModal(true);
        break;
      case 'reports':
        setShowReportsModal(true);
        break;
      case 'invoices':
        setShowInvoiceModal(true);
        break;
      case 'email':
        window.open(`mailto:${client.contactPerson.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${client.contactPerson.phone}`, '_blank');
        break;
      case 'schedule':
        setShowScheduleModal(true);
        break;
      case 'export':
        alert(`${dir === 'rtl' ? 'تصدير بيانات العميل:' : 'Export client data:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'archive':
        if (confirm(`${dir === 'rtl' ? 'هل أنت متأكد من أرشفة العميل:' : 'Are you sure you want to archive client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم أرشفة العميل بنجاح' : 'Client archived successfully'}`);
        }
        break;
      default:
        break;
    }
  };

  const handleCreateClient = (clientData: any) => {
    console.log('إنشاء عميل جديد:', clientData);
    setShowCreateClientModal(false);
  };

  const handleViewConsultantProfile = (consultant: any) => {
    setSelectedConsultant(consultant);
    setShowConsultantProfile(true);
  };

  const handleSaveClient = (clientData: any) => {
    console.log('حفظ بيانات العميل:', clientData);
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowProjectsModal(false);
    setShowInvoiceModal(false);
    setShowReportsModal(false);
    setShowScheduleModal(false);
    setSelectedClient(null);
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {dir === 'rtl' ? 'إدارة العملاء' : 'Client Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {dir === 'rtl' ? 'إدارة وتتبع جميع العملاء والمشاريع' : 'Manage and track all clients and projects'}
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateClientModal(true)}
            className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
          </Button>
        </div>

        {/* Interactive Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Button
            variant="ghost"
            className="h-auto p-0 hover:scale-105 transition-all duration-200"
            onClick={() => setShowTotalClientsModal(true)}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 w-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Button>

          <Button
            variant="ghost"
            className="h-auto p-0 hover:scale-105 transition-all duration-200"
            onClick={() => setShowActiveClientsModal(true)}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 w-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
                    <p className="text-2xl font-bold text-green-800">{stats.active}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </Button>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">{dir === 'rtl' ? 'عملاء محتملون' : 'Prospects'}</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.prospects}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{dir === 'rtl' ? 'غير نشطين' : 'Inactive'}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Button
            variant="ghost"
            className="h-auto p-0 hover:scale-105 transition-all duration-200"
            onClick={() => setShowTotalProjectsModal(true)}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 w-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.totalProjects}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </Button>

          <Button
            variant="ghost"
            className="h-auto p-0 hover:scale-105 transition-all duration-200"
            onClick={() => setShowAvgSatisfactionModal(true)}
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 w-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-700">{dir === 'rtl' ? 'متوسط الرضا' : 'Avg Satisfaction'}</p>
                    <p className="text-2xl font-bold text-indigo-800">{stats.avgSatisfaction}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              {dir === 'rtl' ? 'البحث والتصفية' : 'Search & Filter'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={dir === 'rtl' ? 'البحث عن العملاء...' : 'Search clients...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[120px]">
                      <Filter className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تصفية' : 'Filter'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{dir === 'rtl' ? 'تصفية حسب الحالة' : 'Filter by Status'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      {dir === 'rtl' ? 'جميع العملاء' : 'All Clients'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      {dir === 'rtl' ? 'نشط' : 'Active'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('prospect')}>
                      {dir === 'rtl' ? 'محتمل' : 'Prospect'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      {dir === 'rtl' ? 'غير نشط' : 'Inactive'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'تصدير' : 'Export'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredClients || []).map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-[#1B4FFF] text-white">
                        {((dir === 'rtl' ? client.organization : client.organizationEn) || '').charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground leading-tight">
                        {dir === 'rtl' ? client.organization : client.organizationEn}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {dir === 'rtl' ? client.industry : client.industryEn}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>{dir === 'rtl' ? 'الإجراءات' : 'Actions'}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* View Section */}
                      <DropdownMenuItem onClick={() => handleAction('view', client)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('projects', client)}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('reports', client)}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'التقارير' : 'Reports'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('invoices', client)} data-action="invoice">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'الفواتير' : 'Invoices'}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Communication Section */}
                      <DropdownMenuItem onClick={() => handleAction('email', client)}>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send Email'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('call', client)}>
                        <Phone className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'اتصال هاتفي' : 'Phone Call'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('schedule', client)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Management Section */}
                      <DropdownMenuItem onClick={() => handleAction('edit', client)}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  {getStatusBadge(client.status)}
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{dir === 'rtl' ? client.address.city : client.address.cityEn}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Contact Person */}
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{dir === 'rtl' ? 'مسؤول التواصل' : 'Communication Manager'}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                    </p>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-lg font-semibold text-blue-600">{client.projects.total}</p>
                      <p className="text-xs text-blue-600">{dir === 'rtl' ? 'مشاريع' : 'Projects'}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-lg font-semibold text-green-600">{client.projects.active}</p>
                      <p className="text-xs text-green-600">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-lg font-semibold text-orange-600">{client.satisfaction}%</p>
                      <p className="text-xs text-orange-600">{dir === 'rtl' ? 'رضا' : 'Satisfaction'}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {(dir === 'rtl' ? client.tags : client.tagsEn).slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Assigned Team */}
                  {client.assignedTeam && client.assignedTeam.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">
                        {dir === 'rtl' ? 'فريق العمل:' : 'Assigned Team:'}
                      </h4>
                      <div className="flex -space-x-2">
                        {client.assignedTeam.slice(0, 4).map((member, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Avatar 
                                className="w-8 h-8 border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => handleViewConsultantProfile(member)}
                              >
                                <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                  {member.avatar}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{member.name} - {member.role}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {client.assignedTeam.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{client.assignedTeam.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {dir === 'rtl' ? 'لا توجد عملاء' : 'No Clients Found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {dir === 'rtl' ? 'لم يتم العثور على عملاء يطابقون معايير البحث' : 'No clients match your search criteria'}
              </p>
              <Button 
                onClick={() => setShowCreateClientModal(true)}
                className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'إضافة عميل جديد' : 'Add New Client'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ClientDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
          client={selectedClient}
          onEdit={handleAction}
        />
        
        <EditClientModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          client={selectedClient}
          onSave={handleSaveClient}
        />
        
        <ClientProjectsModal
          isOpen={showProjectsModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <ClientReportsModal
          isOpen={showReportsModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          onClose={handleCloseModal}
          client={selectedClient}
        />
        
        <CreateClientModal
          isOpen={showCreateClientModal}
          onClose={() => setShowCreateClientModal(false)}
          onSave={handleCreateClient}
        />

        {/* Statistics Detail Modals */}
        <TotalClientsModal
          isOpen={showTotalClientsModal}
          onClose={() => setShowTotalClientsModal(false)}
          clients={filteredClients}
          dir={dir}
        />
        
        <ActiveClientsModal
          isOpen={showActiveClientsModal}
          onClose={() => setShowActiveClientsModal(false)}
          clients={filteredClients}
          dir={dir}
        />
        
        <TotalProjectsModal
          isOpen={showTotalProjectsModal}
          onClose={() => setShowTotalProjectsModal(false)}
          clients={filteredClients}
          dir={dir}
        />
        
        <AvgSatisfactionModal
          isOpen={showAvgSatisfactionModal}
          onClose={() => setShowAvgSatisfactionModal(false)}
          clients={filteredClients}
          dir={dir}
        />

        {/* Consultant Profile Modal */}
        {selectedConsultant && (
          <ConsultantProfileModal
            isOpen={showConsultantProfile}
            onClose={() => setShowConsultantProfile(false)}
            consultant={selectedConsultant}
          />
        )}
      </div>
    </TooltipProvider>
  );
}