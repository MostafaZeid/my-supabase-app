import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Star, 
  DollarSign,
  Upload,
  Camera,
  Edit3,
  Globe,
  Award,
  Clock,
  Target,
  FileText,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  X
} from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onEdit?: (client: any) => void;
}

// مكون تفاصيل المشاريع
const ProjectsDetailModal = ({ isOpen, onClose, client, dir }: any) => {
  const projects = [
    {
      id: 'P001',
      name: dir === 'rtl' ? 'مشروع تطوير السياسات المالية' : 'Financial Policies Development Project',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      budget: 450000,
      spent: 337500
    },
    {
      id: 'P002', 
      name: dir === 'rtl' ? 'مشروع إعادة هيكلة الإجراءات' : 'Procedures Restructuring Project',
      status: 'active',
      progress: 45,
      startDate: '2024-03-01',
      endDate: '2024-08-15',
      budget: 320000,
      spent: 144000
    },
    {
      id: 'P003',
      name: dir === 'rtl' ? 'مشروع تدريب الموظفين' : 'Staff Training Project',
      status: 'completed',
      progress: 100,
      startDate: '2023-10-01',
      endDate: '2024-02-28',
      budget: 180000,
      spent: 175000
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'on_hold': return <PauseCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <BarChart3 className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل المشاريع' : 'Projects Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(project.status)}
                      <span className="text-sm font-medium">{getStatusLabel(project.status)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.id}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'التقدم' : 'Progress'}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'الميزانية' : 'Budget'}</p>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(project.budget)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'المُنفق' : 'Spent'}</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(project.spent)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">{dir === 'rtl' ? 'المتبقي' : 'Remaining'}</p>
                    <p className="text-sm font-semibold text-blue-600">{formatCurrency(project.budget - project.spent)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{dir === 'rtl' ? 'البداية:' : 'Start:'} {new Date(project.startDate).toLocaleDateString()}</span>
                  <span>{dir === 'rtl' ? 'النهاية:' : 'End:'} {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
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

// مكون تفاصيل الإيرادات
const RevenueDetailModal = ({ isOpen, onClose, client, dir }: any) => {
  const revenueData = [
    { month: dir === 'rtl' ? 'يناير' : 'January', amount: 125000, invoices: 2 },
    { month: dir === 'rtl' ? 'فبراير' : 'February', amount: 180000, invoices: 3 },
    { month: dir === 'rtl' ? 'مارس' : 'March', amount: 95000, invoices: 1 },
    { month: dir === 'rtl' ? 'أبريل' : 'April', amount: 220000, invoices: 4 },
    { month: dir === 'rtl' ? 'مايو' : 'May', amount: 165000, invoices: 2 },
    { month: dir === 'rtl' ? 'يونيو' : 'June', amount: 145000, invoices: 2 }
  ];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalInvoices = revenueData.reduce((sum, item) => sum + item.invoices, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <DollarSign className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل الإيرادات' : 'Revenue Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* ملخص الإيرادات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-green-700">{dir === 'rtl' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{totalInvoices}</p>
                <p className="text-sm text-blue-700">{dir === 'rtl' ? 'عدد الفواتير' : 'Total Invoices'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue / totalInvoices)}</p>
                <p className="text-sm text-purple-700">{dir === 'rtl' ? 'متوسط الفاتورة' : 'Avg Invoice'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* تفاصيل شهرية */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.month}</p>
                        <p className="text-sm text-muted-foreground">{item.invoices} {dir === 'rtl' ? 'فواتير' : 'invoices'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(item.amount)}</p>
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

// مكون تفاصيل الرضا
const SatisfactionDetailModal = ({ isOpen, onClose, client, dir }: any) => {
  const satisfactionData = [
    { category: dir === 'rtl' ? 'جودة الخدمة' : 'Service Quality', score: 98, feedback: dir === 'rtl' ? 'ممتاز' : 'Excellent' },
    { category: dir === 'rtl' ? 'سرعة التنفيذ' : 'Execution Speed', score: 92, feedback: dir === 'rtl' ? 'جيد جداً' : 'Very Good' },
    { category: dir === 'rtl' ? 'التواصل' : 'Communication', score: 95, feedback: dir === 'rtl' ? 'ممتاز' : 'Excellent' },
    { category: dir === 'rtl' ? 'الالتزام بالمواعيد' : 'Timeliness', score: 90, feedback: dir === 'rtl' ? 'جيد جداً' : 'Very Good' },
    { category: dir === 'rtl' ? 'القيمة مقابل المال' : 'Value for Money', score: 96, feedback: dir === 'rtl' ? 'ممتاز' : 'Excellent' }
  ];

  const overallSatisfaction = Math.round(satisfactionData.reduce((sum, item) => sum + item.score, 0) / satisfactionData.length);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <Star className="w-6 h-6 mr-2" />
            {dir === 'rtl' ? 'تفاصيل الرضا' : 'Satisfaction Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* النتيجة الإجمالية */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-12 h-12 text-orange-600" />
              </div>
              <p className="text-4xl font-bold text-orange-600 mb-2">{overallSatisfaction}%</p>
              <p className="text-lg text-orange-700">{dir === 'rtl' ? 'نسبة الرضا الإجمالية' : 'Overall Satisfaction'}</p>
            </CardContent>
          </Card>
          
          {/* تفاصيل الفئات */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'تقييم الفئات' : 'Category Ratings'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {satisfactionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{item.category}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{item.score}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getScoreColor(item.score)} border-0`}>
                        {item.feedback}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* تعليقات العميل */}
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'تعليقات العميل' : 'Client Feedback'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 italic">
                  {dir === 'rtl' 
                    ? '"نحن راضون جداً عن مستوى الخدمة المقدمة. الفريق محترف ويلتزم بالمواعيد المحددة. نتطلع للمزيد من التعاون في المستقبل."'
                    : '"We are very satisfied with the level of service provided. The team is professional and meets deadlines. We look forward to more collaboration in the future."'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  - {dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn}
                </p>
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

export function ClientDetailsModal({ isOpen, onClose, client, onEdit }: ClientDetailsModalProps) {
  const { dir } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(client?.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // حالات المكونات المنبثقة
  const [showProjectsDetail, setShowProjectsDetail] = useState(false);
  const [showRevenueDetail, setShowRevenueDetail] = useState(false);
  const [showSatisfactionDetail, setShowSatisfactionDetail] = useState(false);

  if (!client) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoUrl(result);
        console.log('تم رفع الشعار:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      inactive: dir === 'rtl' ? 'غير نشط' : 'Inactive',
      pending: dir === 'rtl' ? 'معلق' : 'Pending'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50" dir={dir}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#0A1E39] to-[#1B4FFF] bg-clip-text text-transparent">
              {dir === 'rtl' ? 'تفاصيل العميل' : 'Client Details'}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
            {/* Header Section with Logo */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Logo Section */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1B4FFF]/10 to-[#0A1E39]/10 border-4 border-white shadow-xl overflow-hidden">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt="Client Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-[#1B4FFF]/50" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-[#1B4FFF] hover:bg-[#0A1E39] shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Organization Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                          {dir === 'rtl' ? client.organization : client.organizationEn}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-3">
                          {dir === 'rtl' ? client.industry : client.industryEn}
                        </p>
                        <Badge className={`${getStatusColor(client.status)} border text-sm px-3 py-1`}>
                          {getStatusLabel(client.status)}
                        </Badge>
                      </div>
                      
                      {onEdit && (
                        <Button 
                          onClick={() => onEdit(client)}
                          className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white hover:shadow-lg"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'تحرير' : 'Edit'}
                        </Button>
                      )}
                    </div>

                    {/* Interactive Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        variant="ghost"
                        className="bg-blue-50 p-3 rounded-lg text-center h-auto hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                        onClick={() => setShowProjectsDetail(true)}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-1">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-blue-600">{client.projects?.total || 0}</p>
                          <p className="text-xs text-blue-600">{dir === 'rtl' ? 'المشاريع' : 'Projects'}</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="bg-green-50 p-3 rounded-lg text-center h-auto hover:bg-green-100 transition-all duration-200 hover:scale-105"
                        onClick={() => setShowRevenueDetail(true)}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(client.revenue || 0)}</p>
                          <p className="text-xs text-green-600">{dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="bg-orange-50 p-3 rounded-lg text-center h-auto hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                        onClick={() => setShowSatisfactionDetail(true)}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-1">
                            <Star className="w-5 h-5 text-orange-600" />
                          </div>
                          <p className="text-2xl font-bold text-orange-600">{client.satisfaction || 0}%</p>
                          <p className="text-xs text-orange-600">{dir === 'rtl' ? 'الرضا' : 'Satisfaction'}</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="bg-purple-50 p-3 rounded-lg text-center h-auto hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                        onClick={() => setShowProjectsDetail(true)}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-purple-600">{client.projects?.active || 0}</p>
                          <p className="text-xs text-purple-600">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10">
                  <CardTitle className="flex items-center text-foreground">
                    <Users className="w-5 h-5 mr-2" />
                    {dir === 'rtl' ? 'معلومات مسؤول التواصل' : 'Communication Manager Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                      <AvatarImage src={client.contactPerson?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-lg font-bold">
                        {((dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn) || '').charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn}
                      </h3>
                      <p className="text-muted-foreground">
                        {dir === 'rtl' ? client.contactPerson?.position : client.contactPerson?.positionEn}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</p>
                        <a 
                          href={`mailto:${client.contactPerson?.email}`} 
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {client.contactPerson?.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</p>
                        <a 
                          href={`tel:${client.contactPerson?.phone}`} 
                          className="text-green-600 hover:underline font-medium"
                        >
                          {client.contactPerson?.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Company Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                  <CardTitle className="flex items-center text-foreground">
                    <Building2 className="w-5 h-5 mr-2" />
                    {dir === 'rtl' ? 'معلومات المؤسسة' : 'Organization Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'الموقع' : 'Location'}</p>
                        <p className="font-medium text-foreground">
                          {dir === 'rtl' 
                            ? `${client.address?.city}, ${client.address?.country}` 
                            : `${client.address?.cityEn}, ${client.address?.countryEn}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تاريخ التأسيس' : 'Established Date'}</p>
                        <p className="font-medium text-foreground">
                          {client.establishedDate ? formatDate(client.establishedDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'آخر نشاط' : 'Last Activity'}</p>
                        <p className="font-medium text-foreground">
                          {client.lastActivity ? formatDate(client.lastActivity) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {(client.tags || client.tagsEn) && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Globe className="w-5 h-5 mr-2" />
                    {dir === 'rtl' ? 'التصنيفات' : 'Tags'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {(dir === 'rtl' ? client.tags : client.tagsEn)?.map((tag: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-[#1B4FFF]/10 hover:to-[#0A1E39]/10 hover:text-foreground transition-all duration-200 px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <Button variant="outline" onClick={onClose} className="px-6">
              {dir === 'rtl' ? 'إغلاق' : 'Close'}
            </Button>
            {onEdit && (
              <Button 
                onClick={() => onEdit(client)} 
                className="bg-gradient-to-r from-[#1B4FFF] to-[#0A1E39] text-white hover:shadow-lg px-6"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modals */}
      <ProjectsDetailModal 
        isOpen={showProjectsDetail} 
        onClose={() => setShowProjectsDetail(false)} 
        client={client} 
        dir={dir} 
      />
      
      <RevenueDetailModal 
        isOpen={showRevenueDetail} 
        onClose={() => setShowRevenueDetail(false)} 
        client={client} 
        dir={dir} 
      />
      
      <SatisfactionDetailModal 
        isOpen={showSatisfactionDetail} 
        onClose={() => setShowSatisfactionDetail(false)} 
        client={client} 
        dir={dir} 
      />
    </>
  );
}