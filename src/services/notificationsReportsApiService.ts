import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  totalClients: number;
  totalProjects: number;
  totalTickets: number;
  totalMeetings: number;
  totalConsultants: number;
  unreadNotifications: number;
  recentActivities: any[];
  recentProjects: any[];
  recentTickets: any[];
  upcomingMeetings: any[];
  quickStats: {
    activeProjectsCount: number;
    upcomingMeetingsCount: number;
  };
  projectStats: Record<string, number>;
  ticketStats: Record<string, number>;
}

export interface OverviewData {
  projectsOverview: {
    total: number;
    completed: number;
    active: number;
    avgProgress: number;
    totalBudget: number;
  };
  ticketsOverview: {
    total: number;
    open: number;
    resolved: number;
    highPriority: number;
  };
  meetingsOverview: {
    total: number;
    scheduled: number;
    completed: number;
    upcoming: number;
  };
}

export interface Notification {
  id: string;
  type: 'notification' | 'report' | 'alert';
  title: string;
  message?: string;
  status: 'read' | 'unread';
  priority: 'low' | 'medium' | 'high';
  user_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsReportsApiService = {
  async getDashboardData(): Promise<{ success: boolean; data: DashboardData }> {
    try {
      // جلب الإحصائيات من قاعدة البيانات مباشرة
      const [
        { count: totalClients },
        { count: totalProjects },
        { count: totalTickets },
        { count: totalMeetings },
        { count: totalConsultants },
        { count: unreadNotifications }
      ] = await Promise.all([
        supabase.from('clients_2025_12_17_09_00').select('*', { count: 'exact', head: true }),
        supabase.from('projects_2025_12_17_09_00').select('*', { count: 'exact', head: true }),
        supabase.from('tickets_2025_12_17_09_00').select('*', { count: 'exact', head: true }),
        supabase.from('meetings_2025_12_17_09_00').select('*', { count: 'exact', head: true }),
        supabase.from('consultants_2025_12_17_09_00').select('*', { count: 'exact', head: true }),
        supabase.from('notifications_reports_2025_12_17_09_00').select('*', { count: 'exact', head: true }).eq('status', 'unread')
      ]);

      // جلب الأنشطة الحديثة
      const { data: recentNotifications } = await supabase
        .from('notifications_reports_2025_12_17_09_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // جلب المشاريع الحديثة
      const { data: recentProjects } = await supabase
        .from('projects_2025_12_17_09_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // جلب التذاكر الحديثة
      const { data: recentTickets } = await supabase
        .from('tickets_2025_12_17_09_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // جلب الاجتماعات القادمة
      const { data: upcomingMeetings } = await supabase
        .from('meetings_2025_12_17_09_00')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      // جلب إحصائيات المشاريع
      const { data: projectStats } = await supabase
        .from('projects_2025_12_17_09_00')
        .select('status');

      const statusCounts = projectStats?.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // جلب إحصائيات التذاكر
      const { data: ticketStats } = await supabase
        .from('tickets_2025_12_17_09_00')
        .select('priority, status');

      const ticketPriorityCounts = ticketStats?.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const dashboardData = {
        totalClients: totalClients || 0,
        totalProjects: totalProjects || 0,
        totalTickets: totalTickets || 0,
        totalMeetings: totalMeetings || 0,
        totalConsultants: totalConsultants || 0,
        unreadNotifications: unreadNotifications || 0,
        recentActivities: recentNotifications || [],
        recentProjects: recentProjects || [],
        recentTickets: recentTickets || [],
        upcomingMeetings: upcomingMeetings || [],
        quickStats: {
          activeProjectsCount: statusCounts['ACTIVE'] || statusCounts['active'] || 0,
          upcomingMeetingsCount: upcomingMeetings?.length || 0,
        },
        projectStats: statusCounts,
        ticketStats: ticketPriorityCounts
      };

      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { 
        success: false, 
        data: {
          totalClients: 0,
          totalProjects: 0,
          totalTickets: 0,
          totalMeetings: 0,
          totalConsultants: 0,
          unreadNotifications: 0,
          recentActivities: [],
          recentProjects: [],
          recentTickets: [],
          upcomingMeetings: [],
          quickStats: {
            activeProjectsCount: 0,
            upcomingMeetingsCount: 0,
          },
          projectStats: {},
          ticketStats: {}
        }
      };
    }
  },

  async getOverviewReport(): Promise<{ success: boolean; data: OverviewData }> {
    try {
      const { data: projects } = await supabase
        .from('projects_2025_12_17_09_00')
        .select('progress, status, budget');

      const { data: tickets } = await supabase
        .from('tickets_2025_12_17_09_00')
        .select('status, priority, created_at');

      const { data: meetings } = await supabase
        .from('meetings_2025_12_17_09_00')
        .select('status, start_time');

      const overviewData = {
        projectsOverview: {
          total: projects?.length || 0,
          completed: projects?.filter(p => p.status === 'completed').length || 0,
          active: projects?.filter(p => p.status === 'active').length || 0,
          avgProgress: projects?.reduce((sum, p) => sum + (p.progress || 0), 0) / (projects?.length || 1) || 0,
          totalBudget: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0
        },
        ticketsOverview: {
          total: tickets?.length || 0,
          open: tickets?.filter(t => t.status === 'open').length || 0,
          resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
          highPriority: tickets?.filter(t => t.priority === 'high' || t.priority === 'urgent').length || 0
        },
        meetingsOverview: {
          total: meetings?.length || 0,
          scheduled: meetings?.filter(m => m.status === 'SCHEDULED').length || 0,
          completed: meetings?.filter(m => m.status === 'COMPLETED').length || 0,
          upcoming: meetings?.filter(m => {
            const meetingDate = new Date(m.start_time);
            const now = new Date();
            return meetingDate > now && m.status === 'SCHEDULED';
          }).length || 0
        }
      };

      return {
        success: true,
        data: overviewData
      };
    } catch (error) {
      console.error('Error fetching overview report:', error);
      return { 
        success: false, 
        data: {
          projectsOverview: {
            total: 0,
            completed: 0,
            active: 0,
            avgProgress: 0,
            totalBudget: 0
          },
          ticketsOverview: {
            total: 0,
            open: 0,
            resolved: 0,
            highPriority: 0
          },
          meetingsOverview: {
            total: 0,
            scheduled: 0,
            completed: 0,
            upcoming: 0
          }
        }
      };
    }
  },

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<NotificationsResponse> {
    try {
      let query = supabase
        .from('notifications_reports_2025_12_17_09_00')
        .select('*', { count: 'exact' });

      if (params?.type) {
        query = query.eq('type', params.type);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: [] };
    }
  },

  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data: Notification }> {
    try {
      const { data, error } = await supabase
        .from('notifications_reports_2025_12_17_09_00')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, data: {} as Notification };
    }
  },

  async updateNotification(id: string, notificationData: Partial<Notification>): Promise<{ success: boolean; data: Notification }> {
    try {
      const { data, error } = await supabase
        .from('notifications_reports_2025_12_17_09_00')
        .update(notificationData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating notification:', error);
      return { success: false, data: {} as Notification };
    }
  }
};