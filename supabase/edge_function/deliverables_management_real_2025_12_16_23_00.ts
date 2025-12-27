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
    const action = pathParts[pathParts.length - 1] // deliverables, parts, deliverable, part

    if (method === 'POST') {
      const body = await req.json()
      
      if (action === 'deliverables') {
        // إنشاء مخرج جديد
        const { project_id, name, description, weight_value, weight_unit } = body
        
        if (!project_id || !name || !weight_value || !weight_unit) {
          return new Response(JSON.stringify({ error: 'project_id, name, weight_value, and weight_unit are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: deliverable, error } = await supabaseClient
          .from('deliverables_tree_2025_12_16_22_00')
          .insert({
            project_id,
            name,
            description,
            weight_value,
            weight_unit,
            status: 'not_started'
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating deliverable:', error)
          return new Response(JSON.stringify({ error: 'Failed to create deliverable' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: deliverable }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'parts') {
        // إنشاء جزء جديد
        const { deliverable_id, name, description, weight_value, weight_unit } = body
        
        if (!deliverable_id || !name || !weight_value || !weight_unit) {
          return new Response(JSON.stringify({ error: 'deliverable_id, name, weight_value, and weight_unit are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // التحقق من أن مجموع أوزان الأجزاء لا يتجاوز 100% أو الحد المسموح
        const { data: existingParts } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .select('weight_value, weight_unit')
          .eq('deliverable_id', deliverable_id)

        const { data: deliverable } = await supabaseClient
          .from('deliverables_tree_2025_12_16_22_00')
          .select('weight_value, weight_unit')
          .eq('id', deliverable_id)
          .single()

        if (deliverable && existingParts) {
          const totalExistingWeight = existingParts
            .filter(p => p.weight_unit === weight_unit)
            .reduce((sum, p) => sum + p.weight_value, 0)
          
          const maxAllowedWeight = deliverable.weight_unit === 'percent' ? 100 : deliverable.weight_value
          
          if (totalExistingWeight + weight_value > maxAllowedWeight) {
            return new Response(JSON.stringify({ 
              error: `Total weight would exceed maximum allowed (${maxAllowedWeight}${weight_unit === 'percent' ? '%' : ' points'})` 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: part, error } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .insert({
            deliverable_id,
            name,
            description,
            weight_value,
            weight_unit,
            status: 'not_started'
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating part:', error)
          return new Response(JSON.stringify({ error: 'Failed to create part' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: part }), {
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

      if (action === 'deliverable') {
        // تحديث مخرج
        const { name, description, weight_value, weight_unit, status } = body
        
        const updateData: any = { updated_at: new Date().toISOString() }
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (weight_value !== undefined) updateData.weight_value = weight_value
        if (weight_unit !== undefined) updateData.weight_unit = weight_unit
        if (status !== undefined) updateData.status = status

        const { data: deliverable, error } = await supabaseClient
          .from('deliverables_tree_2025_12_16_22_00')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating deliverable:', error)
          return new Response(JSON.stringify({ error: 'Failed to update deliverable' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: deliverable }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'part') {
        // تحديث جزء
        const { name, description, weight_value, weight_unit, status } = body
        
        // التحقق من الصلاحيات - المستخدم يجب أن يكون مكلف بهذا الجزء أو له صلاحية
        const { data: assignments } = await supabaseClient
          .from('deliverable_assignments_2025_12_16_22_00')
          .select('*')
          .eq('deliverable_part_id', id)
          .eq('assigned_to', user.id)

        const { data: grants } = await supabaseClient
          .from('deliverable_access_grants_2025_12_16_22_00')
          .select('*')
          .eq('deliverable_part_id', id)
          .eq('granted_to', user.id)

        const hasPermission = assignments && assignments.length > 0 || 
                             grants && grants.some(g => ['review', 'approve'].includes(g.access_level))

        if (!hasPermission) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData: any = { updated_at: new Date().toISOString() }
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (weight_value !== undefined) updateData.weight_value = weight_value
        if (weight_unit !== undefined) updateData.weight_unit = weight_unit
        if (status !== undefined) updateData.status = status

        const { data: part, error } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating part:', error)
          return new Response(JSON.stringify({ error: 'Failed to update part' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: part }), {
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

      if (action === 'deliverable') {
        // حذف مخرج (فقط إذا لم يحتوي على أجزاء)
        const { data: parts } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .select('id')
          .eq('deliverable_id', id)

        if (parts && parts.length > 0) {
          return new Response(JSON.stringify({ error: 'Cannot delete deliverable with parts' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // حذف التكليفات والمنح المرتبطة
        await supabaseClient
          .from('deliverable_assignments_2025_12_16_22_00')
          .delete()
          .eq('deliverable_id', id)

        await supabaseClient
          .from('deliverable_access_grants_2025_12_16_22_00')
          .delete()
          .eq('deliverable_id', id)

        const { error } = await supabaseClient
          .from('deliverables_tree_2025_12_16_22_00')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting deliverable:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete deliverable' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'part') {
        // حذف جزء
        // حذف التكليفات والمنح المرتبطة
        await supabaseClient
          .from('deliverable_assignments_2025_12_16_22_00')
          .delete()
          .eq('deliverable_part_id', id)

        await supabaseClient
          .from('deliverable_access_grants_2025_12_16_22_00')
          .delete()
          .eq('deliverable_part_id', id)

        const { error } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting part:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete part' }), {
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
    console.error('Error in deliverables-management-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})