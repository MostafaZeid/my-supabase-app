import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationsReportsApiService } from '@/services/notificationsReportsApiService';
import { projectsApiService } from '@/services/projectsApiService';
import { ticketsApiService } from '@/services/ticketsApiService';
import { meetingsApiService } from '@/services/meetingsApiService';

import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target,
  Activity,
  MessageSquare,
  FolderOpen,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react";

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  delayed: number;
}

interface DeliverableStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface MeetingStats {
  thisWeek: number;
  thisMonth: number;
  upcoming: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'deliverable' | 'meeting' | 'communication';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const AdvancedDashboard: React.FC = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [overviewReport, setOverviewReport] = useState<any>(null);
  
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    delayed: 0
  });

  // Load real dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data and overview report in parallel
      const [dashboardResponse, overviewResponse] = await Promise.all([
        notificationsReportsApiService.getDashboardData(),
        notificationsReportsApiService.getOverviewReport()
      ]);
      
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
        
        // Update project stats from real data
        const quickStats = dashboardResponse.data.quickStats;
        setProjectStats({
          total: dashboardResponse.data.recentProjects.length,
          active: quickStats.activeProjectsCount,
          completed: dashboardResponse.data.recentProjects.filter((p: any) => p.status === 'COMPLETED').length,
          delayed: dashboardResponse.data.recentProjects.filter((p: any) => 
            p.end_date && new Date(p.end_date) < new Date() && p.status !== 'COMPLETED'
          ).length
        });
        
        // Update deliverable stats
        setDeliverableStats({
          total: dashboardResponse.data.recentTickets.length,
          pending: dashboardResponse.data.recentTickets.filter((t: any) => t.status === 'OPEN').length,
          approved: dashboardResponse.data.recentTickets.filter((t: any) => t.status === 'RESOLVED').length,
          rejected: dashboardResponse.data.recentTickets.filter((t: any) => t.status === 'CLOSED').length
        });
        
        // Update meeting stats
        setMeetingStats({
          thisWeek: dashboardResponse.data.upcomingMeetings.length,
          thisMonth: dashboardResponse.data.upcomingMeetings.length,
          upcoming: quickStats.upcomingMeetingsCount
        });
      }
      
      if (overviewResponse.success) {
        setOverviewReport(overviewResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحميل بيانات لوحة التحكم' : 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fallback to simulated data if real data fails
  useEffect(() => {
    if (!dashboardData && !loading) {
      simulateData();
    }
  }, [dashboardData, loading]);

  // Handler functions
  const handleCreateNew = () => {
    toast({
      title: language === 'ar' ? "إنشاء جديد" : "Create New",
      description: language === 'ar' ? "اختر نوع العنصر الذي تريد إنشاءه" : "Choose the type of item you want to create",
    })
  }

  const handleViewDetails = (type: string) => {
    toast({
      title: language === 'ar' ? "عرض التفاصيل" : "View Details",
      description: language === 'ar' ? `عرض تفاصيل ${type}` : `View ${type} details`,
    })
  }

  const handleQuickAction = (action: string) => {
    toast({
      title: language === 'ar' ? "عملية سريعة" : "Quick Action",
      description: language === 'ar' ? `تنفيذ ${action}` : `Execute ${action}`,
    })
  }

  const handleRefreshData = () => {
    toast({
      title: language === 'ar' ? "تحديث البيانات" : "Refresh Data",
      description: language === 'ar' ? "جاري تحديث بيانات لوحة التحكم" : "Refreshing dashboard data",
    })
    loadDashboardData()
  }
  
  const [deliverableStats, setDeliverableStats] = useState<DeliverableStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  const [meetingStats, setMeetingStats] = useState<MeetingStats>({
    thisWeek: 0,
    thisMonth: 0,
    upcoming: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data for fallback
  const simulateData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjectStats({
        total: 24,
        active: 12,
        completed: 8,
        delayed: 4
      });
      
      setDeliverableStats({
        total: 156,
        pending: 23,
        approved: 118,
        rejected: 15
      });
      
      setMeetingStats({
        thisWeek: 8,
        thisMonth: 32,
        upcoming: 5
      });
      
      setRecentActivities([
        {
          id: '1',
          type: 'project',
          title: t('dashboard.advanced.projectCompleted'),
          description: language === 'ar' ? 'مشروع تطوير النظام الإداري' : 'Administrative System Development Project',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'deliverable',
          title: t('dashboard.advanced.deliverablePending'),
          description: t('dashboard.advanced.uiDesignPhase1'),
          timestamp: '2024-01-15T09:15:00Z',
          status: 'warning'
        },
        {
          id: '3',
          type: 'meeting',
          title: t('dashboard.advanced.meetingScheduled'),
          description: t('dashboard.advanced.weeklyReview'),
          timestamp: '2024-01-15T08:00:00Z',
          status: 'info'
        },
        {
          id: '4',
          type: 'communication',
          title: t('dashboard.advanced.newMessage'),
          description: t('dashboard.advanced.devTeamUpdate'),
          timestamp: '2024-01-14T16:45:00Z',
          status: 'info'
        }
      ]);
      
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: t('dashboard.advanced.loadDataError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'deliverable':
        return <FileText className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="p-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.advanced.title')}</h1>
              <p className="text-gray-600 mt-2">{t('dashboard.advanced.overview')}</p>
            </div>
            <Button className="flex items-center gap-2" onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              {t('dashboard.advanced.createNew')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6">
            {/* Project Stats */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-semibold">{t('dashboard.advanced.projectStats')}</h3>
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{projectStats.total}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.advanced.totalProjects')}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.advanced.activeProjects')}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{projectStats.completed}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.advanced.completedProjects')}</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{projectStats.delayed}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.advanced.delayedProjects')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deliverable Stats */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-semibold">{t('dashboard.advanced.deliverableStats')}</h3>
                <FileText className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{deliverableStats.total}</div>
                    <div className="text-sm text-gray-600">إجمالي المخرجات</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{deliverableStats.pending}</div>
                    <div className="text-sm text-gray-600">في انتظار الاعتماد</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{deliverableStats.approved}</div>
                    <div className="text-sm text-gray-600">معتمدة</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{deliverableStats.rejected}</div>
                    <div className="text-sm text-gray-600">مرفوضة</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Stats */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-semibold">إحصائيات الاجتماعات</h3>
                <Calendar className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{meetingStats.thisWeek}</div>
                    <div className="text-sm text-gray-600">اجتماعات هذا الأسبوع</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{meetingStats.thisMonth}</div>
                    <div className="text-sm text-gray-600">اجتماعات هذا الشهر</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{meetingStats.upcoming}</div>
                    <div className="text-sm text-gray-600">اجتماعات قادمة</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-semibold">الأنشطة الأخيرة</h3>
                <Activity className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={cn("p-2 rounded-full bg-white", getStatusColor(activity.status))}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(activity.type)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full" onClick={() => handleViewDetails('جميع الأنشطة')}>
                    عرض جميع الأنشطة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="w-full">
              <CardHeader>
                <h3 className="text-lg font-semibold">إجراءات سريعة</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleQuickAction('مشروع جديد')}>
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">مشروع جديد</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleQuickAction('إضافة مخرج')}>
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">إضافة مخرج</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleQuickAction('جدولة اجتماع')}>
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">جدولة اجتماع</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleQuickAction('عرض التقارير')}>
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">عرض التقارير</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;