import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { method } = req;
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const endpoint = pathParts[pathParts.length - 1];

    switch (method) {
      case 'GET':
        if (endpoint === 'dashboard') {
          // Get dashboard data
          const [
            { count: totalClients },
            { count: totalProjects },
            { count: totalTickets },
            { count: totalMeetings },
            { count: totalConsultants },
            { count: unreadNotifications }
          ] = await Promise.all([
            supabaseClient.from('clients_2025_12_17_00_00').select('*', { count: 'exact', head: true }),
            supabaseClient.from('projects_2025_12_17_00_00').select('*', { count: 'exact', head: true }),
            supabaseClient.from('tickets_2025_12_17_00_00').select('*', { count: 'exact', head: true }),
            supabaseClient.from('meetings_2025_12_17_00_00').select('*', { count: 'exact', head: true }),
            supabaseClient.from('consultants_2025_12_17_00_00').select('*', { count: 'exact', head: true }),
            supabaseClient.from('notifications_reports_2025_12_17_00_00').select('*', { count: 'exact', head: true }).eq('status', 'unread')
          ]);

          // Get recent activities
          const { data: recentNotifications } = await supabaseClient
            .from('notifications_reports_2025_12_17_00_00')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

          // Get project status distribution
          const { data: projectStats } = await supabaseClient
            .from('projects_2025_12_17_00_00')
            .select('status')
            .order('status');

          const statusCounts = projectStats?.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

          // Get ticket priority distribution
          const { data: ticketStats } = await supabaseClient
            .from('tickets_2025_12_17_00_00')
            .select('priority, status')
            .order('priority');

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
            projectStats: statusCounts,
            ticketStats: ticketPriorityCounts
          };

          return new Response(
            JSON.stringify({ success: true, data: dashboardData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        } else if (endpoint === 'overview') {
          // Get overview report
          const { data: projects } = await supabaseClient
            .from('projects_2025_12_17_00_00')
            .select('progress, status, budget');

          const { data: tickets } = await supabaseClient
            .from('tickets_2025_12_17_00_00')
            .select('status, priority, created_at');

          const { data: meetings } = await supabaseClient
            .from('meetings_2025_12_17_00_00')
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

          return new Response(
            JSON.stringify({ success: true, data: overviewData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        } else {
          // Get notifications/reports
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '10');
          const type = url.searchParams.get('type');
          const status = url.searchParams.get('status');
          
          const offset = (page - 1) * limit;

          let query = supabaseClient
            .from('notifications_reports_2025_12_17_00_00')
            .select('*', { count: 'exact' });

          if (type) {
            query = query.eq('type', type);
          }

          if (status) {
            query = query.eq('status', status);
          }

          const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) throw error;

          const totalPages = Math.ceil((count || 0) / limit);

          return new Response(
            JSON.stringify({
              success: true,
              data,
              pagination: {
                page,
                limit,
                total: count,
                totalPages
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        const createData = await req.json();
        
        const { data: newNotification, error: createError } = await supabaseClient
          .from('notifications_reports_2025_12_17_00_00')
          .insert([createData])
          .select()
          .single();

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ success: true, data: newNotification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        const updateData = await req.json();
        const notificationId = pathParts[pathParts.length - 1];
        
        const { data: updatedNotification, error: updateError } = await supabaseClient
          .from('notifications_reports_2025_12_17_00_00')
          .update(updateData)
          .eq('id', notificationId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, data: updatedNotification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});