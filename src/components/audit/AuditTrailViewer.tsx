import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Clock, 
  User, 
  FileText, 
  Eye, 
  Download, 
  Filter,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  changes: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout';
}

const AuditTrailViewer: React.FC = () => {
  const { toast } = useToast();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): AuditEntry[] => {
      const users = ['أحمد محمد', 'فاطمة علي', 'محمد حسن', 'نور الدين', 'سارة أحمد'];
      const actions = [
        'إنشاء مشروع جديد',
        'تحديث بيانات المشروع',
        'حذف مهمة',
        'اعتماد مرحلة',
        'رفض تسليم',
        'تسجيل دخول',
        'تسجيل خروج',
        'تصدير تقرير',
        'عرض بيانات حساسة'
      ];
      const entityTypes = ['مشروع', 'مهمة', 'مستخدم', 'تقرير', 'مرحلة'];
      const categories: AuditEntry['category'][] = ['create', 'update', 'delete', 'view', 'export', 'login', 'logout'];
      const severities: AuditEntry['severity'][] = ['low', 'medium', 'high', 'critical'];

      return Array.from({ length: 50 }, (_, i) => ({
        id: `audit-${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        userId: `user-${Math.floor(Math.random() * 5) + 1}`,
        userName: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: `entity-${Math.floor(Math.random() * 100) + 1}`,
        entityName: `عنصر ${Math.floor(Math.random() * 100) + 1}`,
        changes: {
          status: { old: 'قيد التنفيذ', new: 'مكتمل' },
          priority: { old: 'متوسط', new: 'عالي' }
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)]
      }));
    };

    setTimeout(() => {
      const mockData = generateMockData();
      setAuditEntries(mockData);
      setFilteredEntries(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = auditEntries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(entry => entry.severity === selectedSeverity);
    }

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(entry =>
        entry.timestamp >= startDate && entry.timestamp <= endDate
      );
    }

    setFilteredEntries(filtered);
  }, [auditEntries, searchTerm, selectedCategory, selectedSeverity, dateRange]);

  const getSeverityIcon = (severity: AuditEntry['severity']) => {
    switch (severity) {
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: AuditEntry['category']) => {
    switch (category) {
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'update':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'export':
        return <Download className="h-4 w-4 text-purple-500" />;
      case 'login':
        return <User className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityLabel = (severity: AuditEntry['severity']) => {
    switch (severity) {
      case 'low': return 'منخفض';
      case 'medium': return 'متوسط';
      case 'high': return 'عالي';
      case 'critical': return 'حرج';
      default: return severity;
    }
  };

  const getCategoryLabel = (category: AuditEntry['category']) => {
    switch (category) {
      case 'create': return 'إنشاء';
      case 'update': return 'تحديث';
      case 'delete': return 'حذف';
      case 'view': return 'عرض';
      case 'export': return 'تصدير';
      case 'login': return 'دخول';
      case 'logout': return 'خروج';
      default: return category;
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['التاريخ', 'المستخدم', 'الإجراء', 'نوع العنصر', 'اسم العنصر', 'مستوى الخطورة', 'الفئة'].join(','),
      ...filteredEntries.map(entry => [
        entry.timestamp.toLocaleString('ar-SA'),
        entry.userName,
        entry.action,
        entry.entityType,
        entry.entityName,
        getSeverityLabel(entry.severity),
        getCategoryLabel(entry.category)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير سجل العمليات بنجاح"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل سجل العمليات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <ScrollArea className="flex-1">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل العمليات</h1>
            <p className="text-gray-600">عارض سجل العمليات الآلي غير القابل للتعديل</p>
          </div>
        </div>
        <Button onClick={exportAuditLog} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          تصدير السجل
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              <option value="create">إنشاء</option>
              <option value="update">تحديث</option>
              <option value="delete">حذف</option>
              <option value="view">عرض</option>
              <option value="export">تصدير</option>
              <option value="login">دخول</option>
              <option value="logout">خروج</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع مستويات الخطورة</option>
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="high">عالي</option>
              <option value="critical">حرج</option>
            </select>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all' || dateRange.start || dateRange.end) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setDateRange({ start: '', end: '' });
              }}
              className="w-full md:w-auto"
            >
              مسح الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>عرض {filteredEntries.length} من أصل {auditEntries.length} عملية</span>
        <span>آخر تحديث: {new Date().toLocaleString('ar-SA')}</span>
      </div>

      {/* Audit Entries */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-600">لم يتم العثور على عمليات تطابق معايير البحث المحددة</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedEntry?.id === entry.id && "ring-2 ring-blue-500"
              )}
              onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(entry.category)}
                      {getSeverityIcon(entry.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{entry.action}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {getCategoryLabel(entry.category)}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          entry.severity === 'low' && "bg-blue-100 text-blue-700",
                          entry.severity === 'medium' && "bg-yellow-100 text-yellow-700",
                          entry.severity === 'high' && "bg-orange-100 text-orange-700",
                          entry.severity === 'critical' && "bg-red-100 text-red-700"
                        )}>
                          {getSeverityLabel(entry.severity)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.userName}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {entry.entityType}: {entry.entityName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left text-sm text-gray-500">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      {entry.timestamp.toLocaleTimeString('ar-SA')}
                    </div>
                    <div>{entry.timestamp.toLocaleDateString('ar-SA')}</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedEntry?.id === entry.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">تفاصيل العملية</h4>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">معرف المستخدم:</span> {entry.userId}</div>
                          <div><span className="font-medium">معرف العنصر:</span> {entry.entityId}</div>
                          <div><span className="font-medium">عنوان IP:</span> {entry.ipAddress}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">التغييرات</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="bg-gray-50 p-2 rounded">
                              <div className="font-medium">{field}</div>
                              <div className="text-red-600">من: {change.old}</div>
                              <div className="text-green-600">إلى: {change.new}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">معلومات المتصفح</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                        {entry.userAgent}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredEntries.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="w-full md:w-auto">
            تحميل المزيد من العمليات
          </Button>
        </div>
      )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AuditTrailViewer;