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
    const pathParts = url.pathname.split('/').filter(Boolean)
    const action = pathParts[pathParts.length - 1] // phases, activities, phase, activity

    if (method === 'POST') {
      const body = await req.json()
      
      if (action === 'phases') {
        // إنشاء مرحلة جديدة
        const { project_id, name, description, start_date, end_date } = body
        
        if (!project_id || !name) {
          return new Response(JSON.stringify({ error: 'project_id and name are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: phase, error } = await supabaseClient
          .from('project_phases_tree_2025_12_16_22_00')
          .insert({
            project_id,
            name,
            description,
            start_date,
            end_date,
            status: 'not_started'
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating phase:', error)
          return new Response(JSON.stringify({ error: 'Failed to create phase' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: phase }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'activities') {
        // إنشاء نشاط جديد
        const { phase_id, name, description, owner_id, planned_start_date, planned_end_date } = body
        
        if (!phase_id || !name) {
          return new Response(JSON.stringify({ error: 'phase_id and name are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: activity, error } = await supabaseClient
          .from('project_activities_2025_12_16_22_00')
          .insert({
            phase_id,
            name,
            description,
            owner_id: owner_id || user.id,
            status: 'not_started',
            progress_percentage: 0,
            planned_start_date,
            planned_end_date
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating activity:', error)
          return new Response(JSON.stringify({ error: 'Failed to create activity' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: activity }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'PUT') {
      const body = await req.json()
      const id = url.searchParams.get('id')
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'phase') {
        // تحديث مرحلة
        const { name, description, start_date, end_date, status } = body
        
        const updateData: any = { updated_at: new Date().toISOString() }
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (start_date !== undefined) updateData.start_date = start_date
        if (end_date !== undefined) updateData.end_date = end_date
        if (status !== undefined) updateData.status = status

        const { data: phase, error } = await supabaseClient
          .from('project_phases_tree_2025_12_16_22_00')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating phase:', error)
          return new Response(JSON.stringify({ error: 'Failed to update phase' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: phase }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'activity') {
        // تحديث نشاط
        const { name, description, owner_id, status, progress_percentage, planned_start_date, planned_end_date, actual_start_date, actual_end_date } = body
        
        const updateData: any = { updated_at: new Date().toISOString() }
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (owner_id !== undefined) updateData.owner_id = owner_id
        if (status !== undefined) updateData.status = status
        if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage
        if (planned_start_date !== undefined) updateData.planned_start_date = planned_start_date
        if (planned_end_date !== undefined) updateData.planned_end_date = planned_end_date
        if (actual_start_date !== undefined) updateData.actual_start_date = actual_start_date
        if (actual_end_date !== undefined) updateData.actual_end_date = actual_end_date

        const { data: activity, error } = await supabaseClient
          .from('project_activities_2025_12_16_22_00')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating activity:', error)
          return new Response(JSON.stringify({ error: 'Failed to update activity' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: activity }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id')
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'phase') {
        // حذف مرحلة (فقط إذا لم تحتوي على أنشطة)
        const { data: activities } = await supabaseClient
          .from('project_activities_2025_12_16_22_00')
          .select('id')
          .eq('phase_id', id)

        if (activities && activities.length > 0) {
          return new Response(JSON.stringify({ error: 'Cannot delete phase with activities' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await supabaseClient
          .from('project_phases_tree_2025_12_16_22_00')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting phase:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete phase' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'activity') {
        // حذف نشاط
        const { error } = await supabaseClient
          .from('project_activities_2025_12_16_22_00')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting activity:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete activity' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in phases-management-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})