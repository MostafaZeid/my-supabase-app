import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data for v131 - as it was working in the original version
const mockDashboardData = {
  totalClients: 15,
  totalProjects: 8,
  totalTickets: 23,
  totalMeetings: 12,
  totalConsultants: 6,
  unreadNotifications: 5,
  recentActivities: [
    { id: 1, title: 'مشروع جديد تم إضافته', time: '2024-12-17 10:30', type: 'project' },
    { id: 2, title: 'تذكرة دعم جديدة', time: '2024-12-17 09:15', type: 'ticket' },
    { id: 3, title: 'اجتماع تم جدولته', time: '2024-12-17 08:45', type: 'meeting' },
    { id: 4, title: 'عميل جديد تم تسجيله', time: '2024-12-16 16:20', type: 'client' },
    { id: 5, title: 'تقرير شهري جاهز', time: '2024-12-16 14:10', type: 'report' }
  ],
  projectStats: {
    'active': 3,
    'planning': 2,
    'completed': 2,
    'on_hold': 1
  },
  ticketStats: {
    'high': 5,
    'medium': 12,
    'low': 6
  }
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call delay - as in v131
      await new Promise(resolve => setTimeout(resolve, 800));
      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'نشط', color: 'bg-green-100 text-green-800' },
      'planning': { label: 'تخطيط', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'مكتمل', color: 'bg-gray-100 text-gray-800' },
      'on_hold': { label: 'معلق', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['active'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { label: 'عالية', color: 'bg-red-100 text-red-800' },
      'medium': { label: 'متوسطة', color: 'bg-yellow-100 text-yellow-800' },
      'low': { label: 'منخفضة', color: 'bg-green-100 text-green-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['medium'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {userProfile?.full_name || 'المستخدم'}, إليك نظرة عامة على النظام
          </p>
        </div>
        
        <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">العملاء</p>
                <p className="text-2xl font-bold">{dashboardData.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">المشاريع</p>
                <p className="text-2xl font-bold">{dashboardData.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">التذاكر</p>
                <p className="text-2xl font-bold">{dashboardData.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">الاجتماعات</p>
                <p className="text-2xl font-bold">{dashboardData.totalMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">المستشارين</p>
                <p className="text-2xl font-bold">{dashboardData.totalConsultants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">إشعارات جديدة</p>
                <p className="text-2xl font-bold">{dashboardData.unreadNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              حالة المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboardData.projectStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-sm">{count} مشروع</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / dashboardData.totalProjects) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Priority Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              أولوية التذاكر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboardData.ticketStats).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(priority)}
                    <span className="text-sm">{count} تذكرة</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(count / dashboardData.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            الأنشطة الحديثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="outline">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}