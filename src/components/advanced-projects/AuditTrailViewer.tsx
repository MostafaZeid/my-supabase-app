import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  BarChart3,
  Download,
  Eye,
  EyeOff
} from "lucide-react";

interface AuditLog {
  id: string;
  project_id: string;
  actor_user_id: string;
  actor_name?: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  description: string;
  changes: any;
  category: 'general' | 'security' | 'data' | 'workflow' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface ActivityStatistics {
  id: string;
  project_id: string;
  date_period: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  total_activities: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  review_count: number;
  message_count: number;
  active_users_count: number;
  most_active_user_name?: string;
  deliverables_modified: number;
  reviews_completed: number;
  messages_sent: number;
  created_at: string;
}

interface AuditTrailViewerProps {
  projectId: string;
  projectName?: string;
}

const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ 
  projectId, 
  projectName 
}) => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics[]>([]);
  const [viewMode, setViewMode] = useState<'logs' | 'statistics'>('logs');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  
  useEffect(() => {
    loadAuditLogs();
    loadActivityStatistics();
  }, [projectId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    
    // محاكاة تحميل سجلات التدقيق - في التطبيق الحقيقي سيتم جلبها من Supabase
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        project_id: projectId,
        actor_user_id: '11111111-2222-3333-4444-555555555555',
        actor_name: 'أحمد محمد',
        actor_role: 'project_manager',
        action: 'create',
        entity_type: 'project',
        entity_id: 'proj1',
        entity_name: 'نظام إدارة السياسات',
        description: 'إنشاء مشروع جديد',
        changes: {},
        category: 'workflow',
        severity: 'info',
        created_at: '2024-01-20T09:00:00Z',
        ip_address: '192.168.1.100'
      },
      {
        id: '2',
        project_id: projectId,
        actor_user_id: '11111111-2222-3333-4444-555555555555',
        actor_name: 'أحمد محمد',
        actor_role: 'project_manager',
        action: 'update',
        entity_type: 'project',
        entity_id: 'proj1',
        entity_name: 'نظام إدارة السياسات',
        description: 'تحديث تواريخ المشروع',
        changes: {
          old_dates: { start: '2024-01-01', end: '2024-06-30' },
          new_dates: { start: '2024-01-15', end: '2024-07-15' }
        },
        category: 'workflow',
        severity: 'info',
        created_at: '2024-01-20T10:30:00Z',
        ip_address: '192.168.1.100'
      },
      {
        id: '3',
        project_id: projectId,
        actor_user_id: '22222222-3333-4444-5555-666666666666',
        actor_name: 'سارة أحمد',
        actor_role: 'consultant',
        action: 'create',
        entity_type: 'deliverable',
        entity_id: 'del1',
        entity_name: 'تصميم واجهة المستخدم',
        description: 'إنشاء مخرج جديد',
        changes: {},
        category: 'workflow',
        severity: 'info',
        created_at: '2024-01-20T11:15:00Z',
        ip_address: '192.168.1.101'
      },
      {
        id: '4',
        project_id: projectId,
        actor_user_id: '22222222-3333-4444-5555-666666666666',
        actor_name: 'سارة أحمد',
        actor_role: 'consultant',
        action: 'submit',
        entity_type: 'deliverable',
        entity_id: 'del1',
        entity_name: 'تصميم واجهة المستخدم',
        description: 'إرسال المخرج للمراجعة',
        changes: {},
        category: 'workflow',
        severity: 'info',
        created_at: '2024-01-20T14:00:00Z',
        ip_address: '192.168.1.101'
      },
      {
        id: '5',
        project_id: projectId,
        actor_user_id: '44444444-5555-6666-7777-888888888888',
        actor_name: 'محمد علي',
        actor_role: 'reviewer',
        action: 'approve',
        entity_type: 'review',
        entity_id: 'rev1',
        entity_name: 'مراجعة تصميم واجهة المستخدم',
        description: 'اعتماد المخرج بعد المراجعة',
        changes: {},
        category: 'workflow',
        severity: 'info',
        created_at: '2024-01-20T15:30:00Z',
        ip_address: '192.168.1.102'
      },
      {
        id: '6',
        project_id: projectId,
        actor_user_id: '66666666-7777-8888-9999-aaaaaaaaaaaa',
        actor_name: 'فاطمة الزهراء',
        actor_role: 'consultant',
        action: 'create',
        entity_type: 'message',
        entity_id: 'msg1',
        entity_name: 'استفسار حول المتطلبات',
        description: 'إرسال رسالة استفسار',
        changes: {},
        category: 'general',
        severity: 'info',
        created_at: '2024-01-20T16:00:00Z',
        ip_address: '192.168.1.103'
      },
      {
        id: '7',
        project_id: projectId,
        actor_user_id: '11111111-2222-3333-4444-555555555555',
        actor_name: 'أحمد محمد',
        actor_role: 'project_manager',
        action: 'grant',
        entity_type: 'permission',
        entity_id: 'perm1',
        entity_name: 'صلاحية المراجعة',
        description: 'منح صلاحية المراجعة لعضو الفريق',
        changes: {},
        category: 'security',
        severity: 'warning',
        created_at: '2024-01-20T16:30:00Z',
        ip_address: '192.168.1.100'
      },
      {
        id: '8',
        project_id: projectId,
        actor_user_id: '22222222-3333-4444-5555-666666666666',
        actor_name: 'سارة أحمد',
        actor_role: 'consultant',
        action: 'error',
        entity_type: 'upload',
        entity_id: null,
        entity_name: 'فشل في رفع ملف',
        description: 'فشل في رفع ملف التصميم',
        changes: {
          error: 'حجم الملف كبير جداً',
          file_size: '15MB'
        },
        category: 'system',
        severity: 'error',
        created_at: '2024-01-20T17:00:00Z',
        ip_address: '192.168.1.101'
      },
      {
        id: '9',
        project_id: projectId,
        actor_user_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        actor_name: 'النظام',
        actor_role: 'system',
        action: 'crash',
        entity_type: 'server',
        entity_id: null,
        entity_name: 'انقطاع الخدمة',
        description: 'انقطاع مؤقت في الخدمة',
        changes: {
          duration: '5 دقائق',
          cause: 'تحديث النظام'
        },
        category: 'system',
        severity: 'critical',
        created_at: '2024-01-20T18:00:00Z'
      }
    ];
    
    setLogs(mockLogs);
    setLoading(false);
  };

  const loadActivityStatistics = async () => {
    // محاكاة تحميل الإحصائيات
    const mockStats: ActivityStatistics[] = [
      {
        id: '1',
        project_id: projectId,
        date_period: '2024-01-20',
        period_type: 'daily',
        total_activities: 25,
        create_count: 8,
        update_count: 12,
        delete_count: 2,
        review_count: 3,
        message_count: 5,
        active_users_count: 4,
        most_active_user_name: 'أحمد محمد',
        deliverables_modified: 3,
        reviews_completed: 2,
        messages_sent: 5,
        created_at: '2024-01-20T23:59:59Z'
      },
      {
        id: '2',
        project_id: projectId,
        date_period: '2024-01-19',
        period_type: 'daily',
        total_activities: 18,
        create_count: 5,
        update_count: 8,
        delete_count: 1,
        review_count: 2,
        message_count: 3,
        active_users_count: 3,
        most_active_user_name: 'سارة أحمد',
        deliverables_modified: 2,
        reviews_completed: 1,
        messages_sent: 3,
        created_at: '2024-01-19T23:59:59Z'
      },
      {
        id: '3',
        project_id: projectId,
        date_period: '2024-01-18',
        period_type: 'daily',
        total_activities: 15,
        create_count: 4,
        update_count: 6,
        delete_count: 0,
        review_count: 1,
        message_count: 2,
        active_users_count: 3,
        most_active_user_name: 'أحمد محمد',
        deliverables_modified: 1,
        reviews_completed: 1,
        messages_sent: 2,
        created_at: '2024-01-18T23:59:59Z'
      }
    ];
    
    setStatistics(mockStats);
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      info: <Info className="h-4 w-4 text-blue-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <AlertCircle className="h-4 w-4 text-orange-600" />,
      critical: <XCircle className="h-4 w-4 text-red-600" />
    };
    return icons[severity as keyof typeof icons] || <Info className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: <Activity className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      data: <Database className="h-4 w-4" />,
      workflow: <Activity className="h-4 w-4" />,
      system: <Activity className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Activity className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      security: 'bg-purple-100 text-purple-800',
      data: 'bg-green-100 text-green-800',
      workflow: 'bg-blue-100 text-blue-800',
      system: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      approve: 'bg-green-100 text-green-800',
      reject: 'bg-red-100 text-red-800',
      submit: 'bg-yellow-100 text-yellow-800',
      grant: 'bg-purple-100 text-purple-800',
      add: 'bg-green-100 text-green-800',
      remove: 'bg-red-100 text-red-800',
      error: 'bg-orange-100 text-orange-800',
      crash: 'bg-red-100 text-red-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesAction;
  });

  const exportLogs = () => {
    // محاكاة تصدير السجلات
    toast({
      title: "تصدير السجلات",
      description: "جاري تصدير سجلات التدقيق...",
    });
    
    // في التطبيق الحقيقي، سيتم إنشاء ملف CSV أو Excel
    setTimeout(() => {
      toast({
        title: "تم التصدير",
        description: "تم تصدير سجلات التدقيق بنجاح",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">سجل التدقيق</h2>
          <p className="text-gray-600 mt-1">
            {projectName ? `مشروع: ${projectName}` : 'تتبع جميع الأنشطة والتغييرات'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'logs' ? 'default' : 'outline'}
            onClick={() => setViewMode('logs')}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            السجلات
          </Button>
          <Button 
            variant={viewMode === 'statistics' ? 'default' : 'outline'}
            onClick={() => setViewMode('statistics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            الإحصائيات
          </Button>
          <Button onClick={exportLogs} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {viewMode === 'logs' ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في السجلات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="security">أمان</SelectItem>
                    <SelectItem value="data">بيانات</SelectItem>
                    <SelectItem value="workflow">سير العمل</SelectItem>
                    <SelectItem value="system">نظام</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الأهمية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأهميات</SelectItem>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الإجراء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الإجراءات</SelectItem>
                    <SelectItem value="create">إنشاء</SelectItem>
                    <SelectItem value="update">تحديث</SelectItem>
                    <SelectItem value="delete">حذف</SelectItem>
                    <SelectItem value="approve">اعتماد</SelectItem>
                    <SelectItem value="reject">رفض</SelectItem>
                    <SelectItem value="submit">إرسال</SelectItem>
                    <SelectItem value="grant">منح</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setSeverityFilter('all');
                  setActionFilter('all');
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  مسح الفلاتر
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">جاري تحميل سجلات التدقيق...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات</h3>
                  <p className="text-gray-600">لا توجد أنشطة مسجلة تطابق الفلاتر المحددة</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {getSeverityIcon(log.severity)}
                              <span className="font-medium text-gray-900">
                                {log.actor_name}
                              </span>
                              {log.actor_role && (
                                <Badge variant="outline" className="text-xs">
                                  {log.actor_role === 'project_manager' && 'مدير مشروع'}
                                  {log.actor_role === 'consultant' && 'مستشار'}
                                  {log.actor_role === 'reviewer' && 'مراجع'}
                                  {log.actor_role === 'system' && 'النظام'}
                                </Badge>
                              )}
                            </div>
                            
                            <Badge className={getActionColor(log.action)}>
                              {log.action === 'create' && 'إنشاء'}
                              {log.action === 'update' && 'تحديث'}
                              {log.action === 'delete' && 'حذف'}
                              {log.action === 'approve' && 'اعتماد'}
                              {log.action === 'reject' && 'رفض'}
                              {log.action === 'submit' && 'إرسال'}
                              {log.action === 'grant' && 'منح'}
                              {log.action === 'error' && 'خطأ'}
                              {log.action === 'crash' && 'انقطاع'}
                            </Badge>
                            
                            <Badge className={getCategoryColor(log.category)}>
                              {getCategoryIcon(log.category)}
                              {log.category === 'general' && 'عام'}
                              {log.category === 'security' && 'أمان'}
                              {log.category === 'data' && 'بيانات'}
                              {log.category === 'workflow' && 'سير العمل'}
                              {log.category === 'system' && 'نظام'}
                            </Badge>
                            
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity === 'info' && 'معلومات'}
                              {log.severity === 'warning' && 'تحذير'}
                              {log.severity === 'error' && 'خطأ'}
                              {log.severity === 'critical' && 'حرج'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-2">
                            {log.description}
                          </p>
                          
                          {log.entity_name && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>الكيان:</strong> {log.entity_name} ({log.entity_type})
                            </p>
                          )}
                          
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">التغييرات:</p>
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(log.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(log.created_at)}</span>
                            </div>
                            {log.ip_address && (
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>{log.ip_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      ) : (
        /* Statistics View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الأنشطة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.reduce((sum, stat) => sum + stat.total_activities, 0)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المستخدمون النشطون</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(...statistics.map(s => s.active_users_count), 0)}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">المراجعات المكتملة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.reduce((sum, stat) => sum + stat.reviews_completed, 0)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الرسائل المرسلة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.reduce((sum, stat) => sum + stat.messages_sent, 0)}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">الأنشطة اليومية</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.map((stat) => (
                  <div key={stat.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(stat.date_period).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {stat.total_activities} نشاط
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">إنشاء:</span>
                        <span className="font-medium">{stat.create_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-600">تحديث:</span>
                        <span className="font-medium">{stat.update_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-600">حذف:</span>
                        <span className="font-medium">{stat.delete_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-600">مراجعة:</span>
                        <span className="font-medium">{stat.review_count}</span>
                      </div>
                    </div>
                    
                    {stat.most_active_user_name && (
                      <p className="text-sm text-gray-600 mt-2">
                        الأكثر نشاطاً: <span className="font-medium">{stat.most_active_user_name}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuditTrailViewer;