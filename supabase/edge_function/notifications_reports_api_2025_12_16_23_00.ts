import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const method = req.method
    const endpoint = url.searchParams.get('endpoint') // notifications, reports, dashboard
    const action = url.searchParams.get('action')

    // ==========================================
    // إدارة الإشعارات
    // ==========================================
    if (endpoint === 'notifications') {
      if (method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const unreadOnly = url.searchParams.get('unread_only') === 'true'
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('notifications_2025_12_16_23_00')
          .select('*', { count: 'exact' })
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })

        if (unreadOnly) {
          query = query.eq('is_read', false)
        }

        const { data: notifications, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching notifications:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إحصائيات الإشعارات
        const { data: unreadCount } = await supabaseClient
          .from('notifications_2025_12_16_23_00')
          .select('id', { count: 'exact' })
          .eq('recipient_id', user.id)
          .eq('is_read', false)

        return new Response(JSON.stringify({
          success: true,
          data: notifications,
          stats: {
            total: count || 0,
            unread: unreadCount?.length || 0
          },
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'PUT' && action === 'mark_read') {
        const notificationId = url.searchParams.get('notification_id')
        const markAll = url.searchParams.get('mark_all') === 'true'

        if (markAll) {
          // تحديد جميع الإشعارات كمقروءة
          const { error } = await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('recipient_id', user.id)
            .eq('is_read', false)

          if (error) {
            console.error('Error marking all notifications as read:', error)
            return new Response(JSON.stringify({ error: 'Failed to mark notifications as read' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ success: true, message: 'All notifications marked as read' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (notificationId) {
          // تحديد إشعار محدد كمقروء
          const { error } = await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .eq('recipient_id', user.id)

          if (error) {
            console.error('Error marking notification as read:', error)
            return new Response(JSON.stringify({ error: 'Failed to mark notification as read' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ success: true, message: 'Notification marked as read' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    // ==========================================
    // التقارير والإحصائيات
    // ==========================================
    if (endpoint === 'reports') {
      if (method === 'GET') {
        const reportType = url.searchParams.get('type') // overview, projects, tickets, meetings
        const dateFrom = url.searchParams.get('date_from')
        const dateTo = url.searchParams.get('date_to')

        if (reportType === 'overview') {
          // تقرير عام شامل
          const [
            projectsData,
            ticketsData,
            meetingsData,
            clientsData,
            consultantsData
          ] = await Promise.all([
            // إحصائيات المشاريع
            supabaseClient
              .from('projects_2025_12_16_23_00')
              .select('status, budget, actual_cost, progress_percentage, created_at')
              .eq('is_active', true),
            
            // إحصائيات التذاكر
            supabaseClient
              .from('tickets_2025_12_16_23_00')
              .select('status, priority, estimated_hours, actual_hours, created_at'),
            
            // إحصائيات الاجتماعات
            supabaseClient
              .from('meetings_2025_12_16_23_00')
              .select('status, meeting_type, created_at'),
            
            // إحصائيات العملاء
            supabaseClient
              .from('clients_2025_12_16_23_00')
              .select('created_at')
              .eq('is_active', true),
            
            // إحصائيات الاستشاريين
            supabaseClient
              .from('consultants_2025_12_16_23_00')
              .select('availability_status, hourly_rate, created_at')
              .eq('is_active', true)
          ])

          const projects = projectsData.data || []
          const tickets = ticketsData.data || []
          const meetings = meetingsData.data || []
          const clients = clientsData.data || []
          const consultants = consultantsData.data || []

          const overview = {
            projects: {
              total: projects.length,
              byStatus: {
                planning: projects.filter(p => p.status === 'PLANNING').length,
                in_progress: projects.filter(p => p.status === 'IN_PROGRESS').length,
                on_hold: projects.filter(p => p.status === 'ON_HOLD').length,
                completed: projects.filter(p => p.status === 'COMPLETED').length,
                cancelled: projects.filter(p => p.status === 'CANCELLED').length
              },
              totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
              totalCost: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
              avgProgress: projects.length > 0 ? 
                projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length : 0
            },
            tickets: {
              total: tickets.length,
              byStatus: {
                open: tickets.filter(t => t.status === 'OPEN').length,
                in_progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
                resolved: tickets.filter(t => t.status === 'RESOLVED').length,
                closed: tickets.filter(t => t.status === 'CLOSED').length
              },
              byPriority: {
                low: tickets.filter(t => t.priority === 'LOW').length,
                medium: tickets.filter(t => t.priority === 'MEDIUM').length,
                high: tickets.filter(t => t.priority === 'HIGH').length,
                urgent: tickets.filter(t => t.priority === 'URGENT').length
              },
              totalEstimatedHours: tickets.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
              totalActualHours: tickets.reduce((sum, t) => sum + (t.actual_hours || 0), 0)
            },
            meetings: {
              total: meetings.length,
              byStatus: {
                scheduled: meetings.filter(m => m.status === 'SCHEDULED').length,
                in_progress: meetings.filter(m => m.status === 'IN_PROGRESS').length,
                completed: meetings.filter(m => m.status === 'COMPLETED').length,
                cancelled: meetings.filter(m => m.status === 'CANCELLED').length
              },
              byType: {
                general: meetings.filter(m => m.meeting_type === 'general').length,
                kickoff: meetings.filter(m => m.meeting_type === 'kickoff').length,
                status: meetings.filter(m => m.meeting_type === 'status').length,
                demo: meetings.filter(m => m.meeting_type === 'demo').length,
                workshop: meetings.filter(m => m.meeting_type === 'workshop').length,
                closure: meetings.filter(m => m.meeting_type === 'closure').length
              }
            },
            clients: {
              total: clients.length,
              newThisMonth: clients.filter(c => {
                const created = new Date(c.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length
            },
            consultants: {
              total: consultants.length,
              available: consultants.filter(c => c.availability_status === 'available').length,
              busy: consultants.filter(c => c.availability_status === 'busy').length,
              avgHourlyRate: consultants.length > 0 ?
                consultants.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / consultants.length : 0
            }
          }

          return new Response(JSON.stringify({
            success: true,
            data: overview,
            generatedAt: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (reportType === 'projects') {
          // تقرير تفصيلي للمشاريع
          let query = supabaseClient
            .from('projects_2025_12_16_23_00')
            .select(`
              *,
              client:clients_2025_12_16_23_00(name, company),
              project_manager:user_profiles_2025_12_16_23_00!projects_2025_12_16_23_00_project_manager_id_fkey(full_name),
              team_members:project_teams_2025_12_16_23_00(count),
              tickets:tickets_2025_12_16_23_00(count),
              meetings:meetings_2025_12_16_23_00(count)
            `)
            .eq('is_active', true)

          if (dateFrom) {
            query = query.gte('created_at', dateFrom)
          }
          if (dateTo) {
            query = query.lte('created_at', dateTo)
          }

          const { data: projects, error } = await query

          if (error) {
            console.error('Error fetching projects report:', error)
            return new Response(JSON.stringify({ error: 'Failed to fetch projects report' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({
            success: true,
            data: projects,
            generatedAt: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    // ==========================================
    // بيانات لوحة التحكم
    // ==========================================
    if (endpoint === 'dashboard') {
      if (method === 'GET') {
        // بيانات سريعة للوحة التحكم
        const [
          recentProjects,
          recentTickets,
          upcomingMeetings,
          recentNotifications,
          userStats
        ] = await Promise.all([
          // المشاريع الحديثة
          supabaseClient
            .from('projects_2025_12_16_23_00')
            .select(`
              id, name, status, progress_percentage, created_at,
              client:clients_2025_12_16_23_00(name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(5),
          
          // التذاكر الحديثة
          supabaseClient
            .from('tickets_2025_12_16_23_00')
            .select(`
              id, title, status, priority, created_at,
              project:projects_2025_12_16_23_00(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
          
          // الاجتماعات القادمة
          supabaseClient
            .from('meetings_2025_12_16_23_00')
            .select(`
              id, title, start_time, status,
              project:projects_2025_12_16_23_00(name)
            `)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5),
          
          // الإشعارات الحديثة
          supabaseClient
            .from('notifications_2025_12_16_23_00')
            .select('*')
            .eq('recipient_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(5),
          
          // إحصائيات المستخدم
          supabaseClient
            .from('user_profiles_2025_12_16_23_00')
            .select('role, created_at')
            .eq('id', user.id)
            .single()
        ])

        const dashboardData = {
          recentProjects: recentProjects.data || [],
          recentTickets: recentTickets.data || [],
          upcomingMeetings: upcomingMeetings.data || [],
          recentNotifications: recentNotifications.data || [],
          userProfile: userStats.data,
          quickStats: {
            unreadNotifications: (recentNotifications.data || []).length,
            upcomingMeetingsCount: (upcomingMeetings.data || []).length,
            activeProjectsCount: (recentProjects.data || []).filter(p => p.status === 'IN_PROGRESS').length,
            openTicketsCount: (recentTickets.data || []).filter(t => t.status === 'OPEN').length
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: dashboardData,
          generatedAt: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint or method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in notifications-reports-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})