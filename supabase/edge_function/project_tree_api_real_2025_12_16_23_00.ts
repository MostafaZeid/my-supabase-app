import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface Database {
  public: {
    Tables: {
      project_phases_tree_2025_12_16_22_00: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
      }
      project_activities_2025_12_16_22_00: {
        Row: {
          id: string
          phase_id: string
          name: string
          description: string | null
          owner_id: string | null
          status: string
          progress_percentage: number
          planned_start_date: string | null
          planned_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          created_at: string
          updated_at: string
        }
      }
      deliverables_tree_2025_12_16_22_00: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          weight_value: number
          weight_unit: string
          status: string
          created_at: string
          updated_at: string
        }
      }
      deliverable_parts_2025_12_16_22_00: {
        Row: {
          id: string
          deliverable_id: string
          name: string
          description: string | null
          weight_value: number
          weight_unit: string
          status: string
          created_at: string
          updated_at: string
        }
      }
      deliverable_assignments_2025_12_16_22_00: {
        Row: {
          id: string
          deliverable_id: string | null
          deliverable_part_id: string | null
          assigned_to: string
          assigned_by: string
          can_upload: boolean
          can_submit: boolean
          can_respond_to_reviews: boolean
          created_at: string
        }
      }
      deliverable_access_grants_2025_12_16_22_00: {
        Row: {
          id: string
          deliverable_id: string | null
          deliverable_part_id: string | null
          granted_to: string
          granted_by: string
          access_level: string
          expires_at: string | null
          created_at: string
        }
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
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
    const projectId = url.searchParams.get('project_id')
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // جلب المراحل والأنشطة
    const { data: phases, error: phasesError } = await supabaseClient
      .from('project_phases_tree_2025_12_16_22_00')
      .select(`
        *,
        activities:project_activities_2025_12_16_22_00(*)
      `)
      .eq('project_id', projectId)
      .order('created_at')

    if (phasesError) {
      console.error('Error fetching phases:', phasesError)
      return new Response(JSON.stringify({ error: 'Failed to fetch phases' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // جلب المخرجات والأجزاء
    const { data: deliverables, error: deliverablesError } = await supabaseClient
      .from('deliverables_tree_2025_12_16_22_00')
      .select(`
        *,
        parts:deliverable_parts_2025_12_16_22_00(*),
        assignments:deliverable_assignments_2025_12_16_22_00(*),
        grants:deliverable_access_grants_2025_12_16_22_00(*)
      `)
      .eq('project_id', projectId)
      .order('created_at')

    if (deliverablesError) {
      console.error('Error fetching deliverables:', deliverablesError)
      return new Response(JSON.stringify({ error: 'Failed to fetch deliverables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // تحويل البيانات لتنسيق الشجرة
    const formatPhasesTree = (phases: any[]) => {
      return phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        type: 'phase',
        status: phase.status,
        description: phase.description,
        startDate: phase.start_date,
        endDate: phase.end_date,
        progress: calculatePhaseProgress(phase.activities || []),
        canEdit: true,
        canDelete: phase.activities?.length === 0,
        children: (phase.activities || []).map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          type: 'activity',
          status: activity.status,
          description: activity.description,
          progress: activity.progress_percentage,
          owner: activity.owner_id,
          plannedStartDate: activity.planned_start_date,
          plannedEndDate: activity.planned_end_date,
          actualStartDate: activity.actual_start_date,
          actualEndDate: activity.actual_end_date,
          canEdit: true,
          canDelete: true
        }))
      }))
    }

    const formatDeliverablesTree = (deliverables: any[]) => {
      return deliverables.map(deliverable => {
        const userAssignments = deliverable.assignments?.filter((a: any) => a.assigned_to === user.id) || []
        const userGrants = deliverable.grants?.filter((g: any) => g.granted_to === user.id) || []
        
        const canEdit = userAssignments.length > 0 || userGrants.some((g: any) => ['review', 'approve'].includes(g.access_level))
        const canUpload = userAssignments.some((a: any) => a.can_upload)
        
        return {
          id: deliverable.id,
          name: deliverable.name,
          type: 'deliverable',
          status: deliverable.status,
          description: deliverable.description,
          weight: deliverable.weight_value,
          weightUnit: deliverable.weight_unit,
          progress: calculateDeliverableProgress(deliverable.parts || []),
          canEdit,
          canDelete: deliverable.parts?.length === 0 && canEdit,
          canUpload,
          hasFiles: false, // سيتم تحديثه لاحقاً من جدول الملفات
          fileCount: 0,
          children: (deliverable.parts || []).map((part: any) => {
            const partAssignments = deliverable.assignments?.filter((a: any) => 
              a.deliverable_part_id === part.id && a.assigned_to === user.id
            ) || []
            const partGrants = deliverable.grants?.filter((g: any) => 
              g.deliverable_part_id === part.id && g.granted_to === user.id
            ) || []
            
            const partCanEdit = partAssignments.length > 0 || partGrants.some((g: any) => ['review', 'approve'].includes(g.access_level))
            const partCanUpload = partAssignments.some((a: any) => a.can_upload)
            
            return {
              id: part.id,
              name: part.name,
              type: 'part',
              status: part.status,
              description: part.description,
              weight: part.weight_value,
              weightUnit: part.weight_unit,
              progress: 0, // سيتم حسابه من الملفات
              canEdit: partCanEdit,
              canDelete: partCanEdit,
              canUpload: partCanUpload,
              hasFiles: false,
              fileCount: 0
            }
          })
        }
      })
    }

    const calculatePhaseProgress = (activities: any[]) => {
      if (activities.length === 0) return 0
      const totalProgress = activities.reduce((sum, activity) => sum + (activity.progress_percentage || 0), 0)
      return Math.round(totalProgress / activities.length)
    }

    const calculateDeliverableProgress = (parts: any[]) => {
      if (parts.length === 0) return 0
      const totalWeight = parts.reduce((sum, part) => sum + part.weight_value, 0)
      if (totalWeight === 0) return 0
      
      const weightedProgress = parts.reduce((sum, part) => {
        const partProgress = part.status === 'approved' ? 100 : 
                           part.status === 'submitted' ? 80 :
                           part.status === 'in_progress' ? 50 : 0
        return sum + (partProgress * part.weight_value / totalWeight)
      }, 0)
      
      return Math.round(weightedProgress)
    }

    const response = {
      success: true,
      data: {
        projectId,
        phases: formatPhasesTree(phases || []),
        deliverables: formatDeliverablesTree(deliverables || []),
        summary: {
          totalPhases: phases?.length || 0,
          totalActivities: phases?.reduce((sum, p) => sum + (p.activities?.length || 0), 0) || 0,
          totalDeliverables: deliverables?.length || 0,
          totalParts: deliverables?.reduce((sum, d) => sum + (d.parts?.length || 0), 0) || 0,
          overallProgress: calculateOverallProgress(phases || [], deliverables || [])
        }
      }
    }

    function calculateOverallProgress(phases: any[], deliverables: any[]) {
      const phasesProgress = phases.length > 0 ? 
        phases.reduce((sum, p) => sum + calculatePhaseProgress(p.activities || []), 0) / phases.length : 0
      const deliverablesProgress = deliverables.length > 0 ?
        deliverables.reduce((sum, d) => sum + calculateDeliverableProgress(d.parts || []), 0) / deliverables.length : 0
      
      return Math.round((phasesProgress + deliverablesProgress) / 2)
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in project-tree-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})