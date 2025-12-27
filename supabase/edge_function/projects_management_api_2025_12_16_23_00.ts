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
    const projectId = url.searchParams.get('project_id')
    const action = url.searchParams.get('action')

    // GET - جلب المشاريع
    if (method === 'GET') {
      if (projectId) {
        // جلب مشروع محدد مع تفاصيل كاملة
        const { data: project, error } = await supabaseClient
          .from('projects_2025_12_16_23_00')
          .select(`
            *,
            client:clients_2025_12_16_23_00(*),
            project_manager:user_profiles_2025_12_16_23_00!projects_2025_12_16_23_00_project_manager_id_fkey(*),
            team_members:project_teams_2025_12_16_23_00(
              *,
              user:user_profiles_2025_12_16_23_00(*),
              consultant:consultants_2025_12_16_23_00(*)
            ),
            tickets:tickets_2025_12_16_23_00(count),
            meetings:meetings_2025_12_16_23_00(count)
          `)
          .eq('id', projectId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Project not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: project }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // جلب جميع المشاريع
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const status = url.searchParams.get('status') || ''
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('projects_2025_12_16_23_00')
          .select(`
            *,
            client:clients_2025_12_16_23_00(name, company),
            project_manager:user_profiles_2025_12_16_23_00!projects_2025_12_16_23_00_project_manager_id_fkey(full_name),
            team_members:project_teams_2025_12_16_23_00(count)
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data: projects, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching projects:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          success: true,
          data: projects,
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

    // POST - إنشاء مشروع جديد أو إدارة فريق العمل
    if (method === 'POST') {
      const body = await req.json()

      if (action === 'add_team_member' && projectId) {
        // إضافة عضو لفريق المشروع
        const { data: teamMember, error } = await supabaseClient
          .from('project_teams_2025_12_16_23_00')
          .insert({
            project_id: projectId,
            user_id: body.user_id,
            consultant_id: body.consultant_id,
            role: body.role,
            responsibilities: body.responsibilities,
            hourly_rate: body.hourly_rate,
            created_by: user.id
          })
          .select(`
            *,
            user:user_profiles_2025_12_16_23_00(*),
            consultant:consultants_2025_12_16_23_00(*)
          `)
          .single()

        if (error) {
          console.error('Error adding team member:', error)
          return new Response(JSON.stringify({ error: 'Failed to add team member' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: teamMember }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // إنشاء مشروع جديد
        const { data: project, error } = await supabaseClient
          .from('projects_2025_12_16_23_00')
          .insert({
            name: body.name,
            description: body.description,
            client_id: body.client_id,
            project_manager_id: body.project_manager_id || user.id,
            status: body.status || 'PLANNING',
            start_date: body.start_date,
            end_date: body.end_date,
            budget: body.budget,
            priority: body.priority || 1,
            tags: body.tags || [],
            created_by: user.id
          })
          .select(`
            *,
            client:clients_2025_12_16_23_00(*),
            project_manager:user_profiles_2025_12_16_23_00!projects_2025_12_16_23_00_project_manager_id_fkey(*)
          `)
          .single()

        if (error) {
          console.error('Error creating project:', error)
          return new Response(JSON.stringify({ error: 'Failed to create project' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // تسجيل النشاط
        await supabaseClient
          .from('audit_logs_2025_12_16_23_00')
          .insert({
            user_id: user.id,
            action: 'CREATE',
            entity_type: 'project',
            entity_id: project.id,
            new_values: project
          })

        return new Response(JSON.stringify({ success: true, data: project }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // PUT - تحديث مشروع
    if (method === 'PUT' && projectId) {
      const body = await req.json()
      
      // جلب البيانات القديمة
      const { data: oldProject } = await supabaseClient
        .from('projects_2025_12_16_23_00')
        .select('*')
        .eq('id', projectId)
        .single()

      const { data: project, error } = await supabaseClient
        .from('projects_2025_12_16_23_00')
        .update({
          name: body.name,
          description: body.description,
          client_id: body.client_id,
          project_manager_id: body.project_manager_id,
          status: body.status,
          start_date: body.start_date,
          end_date: body.end_date,
          budget: body.budget,
          actual_cost: body.actual_cost,
          progress_percentage: body.progress_percentage,
          priority: body.priority,
          tags: body.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select(`
          *,
          client:clients_2025_12_16_23_00(*),
          project_manager:user_profiles_2025_12_16_23_00!projects_2025_12_16_23_00_project_manager_id_fkey(*)
        `)
        .single()

      if (error) {
        console.error('Error updating project:', error)
        return new Response(JSON.stringify({ error: 'Failed to update project' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // تسجيل النشاط
      await supabaseClient
        .from('audit_logs_2025_12_16_23_00')
        .insert({
          user_id: user.id,
          action: 'UPDATE',
          entity_type: 'project',
          entity_id: project.id,
          old_values: oldProject,
          new_values: project
        })

      return new Response(JSON.stringify({ success: true, data: project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - حذف مشروع أو عضو فريق
    if (method === 'DELETE') {
      if (action === 'remove_team_member') {
        const memberId = url.searchParams.get('member_id')
        
        const { error } = await supabaseClient
          .from('project_teams_2025_12_16_23_00')
          .update({ is_active: false, left_at: new Date().toISOString() })
          .eq('id', memberId)

        if (error) {
          console.error('Error removing team member:', error)
          return new Response(JSON.stringify({ error: 'Failed to remove team member' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, message: 'Team member removed successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else if (projectId) {
        // حذف مشروع (soft delete)
        const { data: project, error } = await supabaseClient
          .from('projects_2025_12_16_23_00')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', projectId)
          .select()
          .single()

        if (error) {
          console.error('Error deleting project:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete project' }), {
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
            entity_type: 'project',
            entity_id: project.id,
            old_values: project
          })

        return new Response(JSON.stringify({ success: true, message: 'Project deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in projects-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})