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
    const ticketId = url.searchParams.get('ticket_id')

    // GET - جلب التذاكر
    if (method === 'GET') {
      if (ticketId) {
        // جلب تذكرة محددة
        const { data: ticket, error } = await supabaseClient
          .from('tickets_2025_12_16_23_00')
          .select(`
            *,
            project:projects_2025_12_16_23_00(name, status),
            client:clients_2025_12_16_23_00(name, company),
            assigned_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_assigned_to_fkey(full_name, email),
            created_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_created_by_fkey(full_name, email)
          `)
          .eq('id', ticketId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Ticket not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: ticket }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // جلب جميع التذاكر
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const status = url.searchParams.get('status') || ''
        const priority = url.searchParams.get('priority') || ''
        const projectId = url.searchParams.get('project_id') || ''
        const assignedTo = url.searchParams.get('assigned_to') || ''
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('tickets_2025_12_16_23_00')
          .select(`
            *,
            project:projects_2025_12_16_23_00(name, status),
            client:clients_2025_12_16_23_00(name, company),
            assigned_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_assigned_to_fkey(full_name, email),
            created_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_created_by_fkey(full_name, email)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        if (priority) {
          query = query.eq('priority', priority)
        }

        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        if (assignedTo) {
          query = query.eq('assigned_to', assignedTo)
        }

        const { data: tickets, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching tickets:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إحصائيات التذاكر
        const { data: stats } = await supabaseClient
          .from('tickets_2025_12_16_23_00')
          .select('status, priority')

        const ticketStats = {
          total: count || 0,
          byStatus: {
            open: stats?.filter(t => t.status === 'OPEN').length || 0,
            in_progress: stats?.filter(t => t.status === 'IN_PROGRESS').length || 0,
            resolved: stats?.filter(t => t.status === 'RESOLVED').length || 0,
            closed: stats?.filter(t => t.status === 'CLOSED').length || 0
          },
          byPriority: {
            low: stats?.filter(t => t.priority === 'LOW').length || 0,
            medium: stats?.filter(t => t.priority === 'MEDIUM').length || 0,
            high: stats?.filter(t => t.priority === 'HIGH').length || 0,
            urgent: stats?.filter(t => t.priority === 'URGENT').length || 0
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: tickets,
          stats: ticketStats,
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
    }

    // POST - إنشاء تذكرة جديدة
    if (method === 'POST') {
      const body = await req.json()
      
      const { data: ticket, error } = await supabaseClient
        .from('tickets_2025_12_16_23_00')
        .insert({
          title: body.title,
          description: body.description,
          project_id: body.project_id,
          client_id: body.client_id,
          assigned_to: body.assigned_to,
          status: body.status || 'OPEN',
          priority: body.priority || 'MEDIUM',
          category: body.category,
          tags: body.tags || [],
          due_date: body.due_date,
          estimated_hours: body.estimated_hours,
          created_by: user.id
        })
        .select(`
          *,
          project:projects_2025_12_16_23_00(name, status),
          client:clients_2025_12_16_23_00(name, company),
          assigned_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_assigned_to_fkey(full_name, email)
        `)
        .single()

      if (error) {
        console.error('Error creating ticket:', error)
        return new Response(JSON.stringify({ error: 'Failed to create ticket' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // إرسال إشعار للمكلف بالتذكرة
      if (body.assigned_to) {
        await supabaseClient
          .from('notifications_2025_12_16_23_00')
          .insert({
            recipient_id: body.assigned_to,
            title: 'تذكرة جديدة مكلف بها',
            message: `تم تكليفك بتذكرة جديدة: ${body.title}`,
            type: 'INFO',
            related_entity_type: 'ticket',
            related_entity_id: ticket.id,
            action_url: `/tickets/${ticket.id}`
          })
      }

      // تسجيل النشاط
      await supabaseClient
        .from('audit_logs_2025_12_16_23_00')
        .insert({
          user_id: user.id,
          action: 'CREATE',
          entity_type: 'ticket',
          entity_id: ticket.id,
          new_values: ticket
        })

      return new Response(JSON.stringify({ success: true, data: ticket }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT - تحديث تذكرة
    if (method === 'PUT' && ticketId) {
      const body = await req.json()
      
      // جلب البيانات القديمة
      const { data: oldTicket } = await supabaseClient
        .from('tickets_2025_12_16_23_00')
        .select('*')
        .eq('id', ticketId)
        .single()

      const updateData: any = {
        title: body.title,
        description: body.description,
        project_id: body.project_id,
        client_id: body.client_id,
        assigned_to: body.assigned_to,
        status: body.status,
        priority: body.priority,
        category: body.category,
        tags: body.tags,
        due_date: body.due_date,
        estimated_hours: body.estimated_hours,
        actual_hours: body.actual_hours,
        resolution_notes: body.resolution_notes,
        updated_at: new Date().toISOString()
      }

      // إذا تم تغيير الحالة إلى محلولة، تسجيل وقت الحل
      if (body.status === 'RESOLVED' && oldTicket?.status !== 'RESOLVED') {
        updateData.resolved_at = new Date().toISOString()
      }

      const { data: ticket, error } = await supabaseClient
        .from('tickets_2025_12_16_23_00')
        .update(updateData)
        .eq('id', ticketId)
        .select(`
          *,
          project:projects_2025_12_16_23_00(name, status),
          client:clients_2025_12_16_23_00(name, company),
          assigned_user:user_profiles_2025_12_16_23_00!tickets_2025_12_16_23_00_assigned_to_fkey(full_name, email)
        `)
        .single()

      if (error) {
        console.error('Error updating ticket:', error)
        return new Response(JSON.stringify({ error: 'Failed to update ticket' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // إرسال إشعارات عند تغيير الحالة أو المكلف
      if (body.status !== oldTicket?.status) {
        const statusMessages = {
          'OPEN': 'تم فتح التذكرة',
          'IN_PROGRESS': 'بدأ العمل على التذكرة',
          'RESOLVED': 'تم حل التذكرة',
          'CLOSED': 'تم إغلاق التذكرة'
        }

        if (ticket.assigned_to) {
          await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .insert({
              recipient_id: ticket.assigned_to,
              title: 'تحديث حالة التذكرة',
              message: `${statusMessages[body.status] || 'تم تحديث حالة التذكرة'}: ${ticket.title}`,
              type: 'INFO',
              related_entity_type: 'ticket',
              related_entity_id: ticket.id,
              action_url: `/tickets/${ticket.id}`
            })
        }
      }

      // تسجيل النشاط
      await supabaseClient
        .from('audit_logs_2025_12_16_23_00')
        .insert({
          user_id: user.id,
          action: 'UPDATE',
          entity_type: 'ticket',
          entity_id: ticket.id,
          old_values: oldTicket,
          new_values: ticket
        })

      return new Response(JSON.stringify({ success: true, data: ticket }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - حذف تذكرة
    if (method === 'DELETE' && ticketId) {
      const { data: ticket, error } = await supabaseClient
        .from('tickets_2025_12_16_23_00')
        .delete()
        .eq('id', ticketId)
        .select()
        .single()

      if (error) {
        console.error('Error deleting ticket:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete ticket' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // تسجيل النشاط
      await supabaseClient
        .from('audit_logs_2025_12_16_23_00')
        .insert({
          user_id: user.id,
          action: 'DELETE',
          entity_type: 'ticket',
          entity_id: ticket.id,
          old_values: ticket
        })

      return new Response(JSON.stringify({ success: true, message: 'Ticket deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in tickets-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})