import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
}

interface ClientReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientReportsModal({ isOpen, onClose, client }: ClientReportsModalProps) {
  const { language, dir } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('last_6_months');
  const [selectedReport, setSelectedReport] = useState('overview');

  if (!client) return null;

  // Sample report data
  const reportData = {
    overview: {
      totalProjects: 5,
      activeProjects: 2,
      completedProjects: 2,
      onHoldProjects: 1,
      totalBudget: 1550000,
      spentAmount: 710000,
      remainingBudget: 840000,
      overallProgress: 68,
      clientSatisfaction: 92,
      deliverables: {
        total: 25,
        completed: 17,
        inProgress: 6,
        pending: 2
      }
    },
    financial: {
      totalInvoiced: 710000,
      totalPaid: 650000,
      outstanding: 60000,
      overdue: 15000,
      paymentHistory: [
        { month: 'يناير', amount: 120000, status: 'paid' },
        { month: 'فبراير', amount: 95000, status: 'paid' },
        { month: 'مارس', amount: 150000, status: 'paid' },
        { month: 'أبريل', amount: 130000, status: 'paid' },
        { month: 'مايو', amount: 155000, status: 'paid' },
        { month: 'يونيو', amount: 60000, status: 'outstanding' }
      ]
    },
    performance: {
      onTimeDelivery: 85,
      qualityScore: 92,
      communicationRating: 88,
      responseTime: 2.5, // hours
      issueResolution: 94,
      milestones: {
        achieved: 18,
        missed: 3,
        upcoming: 7
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'outstanding': return 'text-orange-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{reportData.overview.totalProjects}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(reportData.overview.totalBudget)}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{reportData.overview.overallProgress}%</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'التقدم العام' : 'Overall Progress'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{reportData.overview.clientSatisfaction}%</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'رضا العميل' : 'Client Satisfaction'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'حالة المشاريع' : 'Project Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportData.overview.activeProjects}</div>
              <div className="text-sm text-green-600">{dir === 'rtl' ? 'مشاريع نشطة' : 'Active Projects'}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportData.overview.completedProjects}</div>
              <div className="text-sm text-blue-600">{dir === 'rtl' ? 'مشاريع مكتملة' : 'Completed Projects'}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{reportData.overview.onHoldProjects}</div>
              <div className="text-sm text-yellow-600">{dir === 'rtl' ? 'مشاريع معلقة' : 'On Hold Projects'}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{reportData.overview.totalProjects}</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'نظرة عامة على الميزانية' : 'Budget Overview'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{dir === 'rtl' ? 'إجمالي الميزانية:' : 'Total Budget:'}</span>
              <span className="font-bold">{formatCurrency(reportData.overview.totalBudget)}</span>
            </div>
            <div className="flex justify-between">
              <span>{dir === 'rtl' ? 'المبلغ المنفق:' : 'Amount Spent:'}</span>
              <span className="font-bold text-orange-600">{formatCurrency(reportData.overview.spentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>{dir === 'rtl' ? 'المبلغ المتبقي:' : 'Remaining Budget:'}</span>
              <span className="font-bold text-green-600">{formatCurrency(reportData.overview.remainingBudget)}</span>
            </div>
          </div>
          <Progress value={(reportData.overview.spentAmount / reportData.overview.totalBudget) * 100} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round((reportData.overview.spentAmount / reportData.overview.totalBudget) * 100)}% {dir === 'rtl' ? 'من الميزانية مستخدمة' : 'of budget used'}
          </p>
        </CardContent>
      </Card>

      {/* Deliverables Status */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'حالة المخرجات' : 'Deliverables Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.overview.deliverables.completed}</div>
              <div className="text-sm text-green-600">{dir === 'rtl' ? 'مكتملة' : 'Completed'}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{reportData.overview.deliverables.inProgress}</div>
              <div className="text-sm text-blue-600">{dir === 'rtl' ? 'قيد التنفيذ' : 'In Progress'}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{reportData.overview.deliverables.pending}</div>
              <div className="text-sm text-yellow-600">{dir === 'rtl' ? 'معلقة' : 'Pending'}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{reportData.overview.deliverables.total}</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'الإجمالي' : 'Total'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(reportData.financial.totalInvoiced)}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي الفواتير' : 'Total Invoiced'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.financial.totalPaid)}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي المدفوع' : 'Total Paid'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(reportData.financial.outstanding)}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المستحق' : 'Outstanding'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-lg font-bold text-red-600">{formatCurrency(reportData.financial.overdue)}</p>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المتأخر' : 'Overdue'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'تاريخ المدفوعات' : 'Payment History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.financial.paymentHistory.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{payment.month}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(payment.amount)}</span>
                  <Badge 
                    variant={payment.status === 'paid' ? 'default' : 'secondary'}
                    className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                  >
                    {payment.status === 'paid' ? (dir === 'rtl' ? 'مدفوع' : 'Paid') : (dir === 'rtl' ? 'مستحق' : 'Outstanding')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'تحليل المدفوعات' : 'Payment Analysis'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{dir === 'rtl' ? 'معدل الدفع:' : 'Payment Rate:'}</span>
              <span className="font-bold text-green-600">
                {Math.round((reportData.financial.totalPaid / reportData.financial.totalInvoiced) * 100)}%
              </span>
            </div>
            <Progress value={(reportData.financial.totalPaid / reportData.financial.totalInvoiced) * 100} className="h-2" />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">
                {Math.round(((reportData.financial.totalPaid / reportData.financial.totalInvoiced) * 100))}%
              </div>
              <div className="text-sm text-green-600">{dir === 'rtl' ? 'معدل التحصيل' : 'Collection Rate'}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">18</div>
              <div className="text-sm text-blue-600">{dir === 'rtl' ? 'متوسط أيام الدفع' : 'Avg Payment Days'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceReport = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.performance.onTimeDelivery}%</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'التسليم في الوقت المحدد' : 'On-Time Delivery'}</div>
              <Progress value={reportData.performance.onTimeDelivery} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.performance.qualityScore}%</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'نقاط الجودة' : 'Quality Score'}</div>
              <Progress value={reportData.performance.qualityScore} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reportData.performance.communicationRating}%</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تقييم التواصل' : 'Communication Rating'}</div>
              <Progress value={reportData.performance.communicationRating} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{reportData.performance.responseTime}h</div>
              <div className="text-sm text-muted-foreground">{dir === 'rtl' ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'المعالم الرئيسية' : 'Project Milestones'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{reportData.performance.milestones.achieved}</div>
              <div className="text-sm text-green-600">{dir === 'rtl' ? 'معالم محققة' : 'Achieved Milestones'}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{reportData.performance.milestones.missed}</div>
              <div className="text-sm text-red-600">{dir === 'rtl' ? 'معالم مفقودة' : 'Missed Milestones'}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{reportData.performance.milestones.upcoming}</div>
              <div className="text-sm text-blue-600">{dir === 'rtl' ? 'معالم قادمة' : 'Upcoming Milestones'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'اتجاهات الأداء' : 'Performance Trends'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>{dir === 'rtl' ? 'معدل حل المشاكل:' : 'Issue Resolution Rate:'}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">{reportData.performance.issueResolution}%</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <Progress value={reportData.performance.issueResolution} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">{dir === 'rtl' ? 'نقاط القوة:' : 'Strengths:'}</h4>
              <ul className="space-y-1 text-green-600">
                <li>• {dir === 'rtl' ? 'جودة عالية في التسليم' : 'High quality deliverables'}</li>
                <li>• {dir === 'rtl' ? 'تواصل ممتاز مع العميل' : 'Excellent client communication'}</li>
                <li>• {dir === 'rtl' ? 'حل سريع للمشاكل' : 'Quick issue resolution'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{dir === 'rtl' ? 'مجالات التحسين:' : 'Areas for Improvement:'}</h4>
              <ul className="space-y-1 text-orange-600">
                <li>• {dir === 'rtl' ? 'تحسين الالتزام بالمواعيد' : 'Improve timeline adherence'}</li>
                <li>• {dir === 'rtl' ? 'تقليل وقت الاستجابة' : 'Reduce response time'}</li>
                <li>• {dir === 'rtl' ? 'تحسين التخطيط المسبق' : 'Better advance planning'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'financial':
        return renderFinancialReport();
      case 'performance':
        return renderPerformanceReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#1B4FFF]" />
              {dir === 'rtl' ? 'تقارير العميل' : 'Client Reports'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'تحميل' : 'Download'}
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'طباعة' : 'Print'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? client.organization : client.organizationEn}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Controls */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">{dir === 'rtl' ? 'نوع التقرير:' : 'Report Type:'}</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">{dir === 'rtl' ? 'نظرة عامة' : 'Overview'}</SelectItem>
                  <SelectItem value="financial">{dir === 'rtl' ? 'التقرير المالي' : 'Financial Report'}</SelectItem>
                  <SelectItem value="performance">{dir === 'rtl' ? 'تقرير الأداء' : 'Performance Report'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">{dir === 'rtl' ? 'الفترة الزمنية:' : 'Time Period:'}</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_month">{dir === 'rtl' ? 'الشهر الماضي' : 'Last Month'}</SelectItem>
                  <SelectItem value="last_3_months">{dir === 'rtl' ? 'آخر 3 أشهر' : 'Last 3 Months'}</SelectItem>
                  <SelectItem value="last_6_months">{dir === 'rtl' ? 'آخر 6 أشهر' : 'Last 6 Months'}</SelectItem>
                  <SelectItem value="last_year">{dir === 'rtl' ? 'السنة الماضية' : 'Last Year'}</SelectItem>
                  <SelectItem value="all_time">{dir === 'rtl' ? 'كل الأوقات' : 'All Time'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'تحديث' : 'Refresh'}
            </Button>
          </div>

          {/* Report Content */}
          {renderReportContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}