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
    const projectId = url.searchParams.get('project_id') || '00000000-0000-0000-0000-000000000001'

    // جلب المراحل والأنشطة
    const { data: phases, error: phasesError } = await supabaseClient
      .from('project_phases_tree_2025_12_16_22_00')
      .select(`
        *,
        activities:project_activities_2025_12_16_22_00(*)
      `)
      .eq('project_id', projectId)
      .order('display_order')

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
        parts:deliverable_parts_2025_12_16_22_00(*)
      `)
      .eq('project_id', projectId)
      .order('display_order')

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
        name: phase.title,
        type: 'phase',
        status: calculatePhaseStatus(phase.activities || []),
        description: phase.description,
        startDate: phase.planned_start_date,
        endDate: phase.planned_end_date,
        progress: calculatePhaseProgress(phase.activities || []),
        canEdit: true,
        canDelete: phase.activities?.length === 0,
        children: (phase.activities || []).map((activity: any) => ({
          id: activity.id,
          name: activity.title,
          type: 'activity',
          status: activity.status?.toLowerCase() || 'not_started',
          description: activity.description,
          progress: activity.progress_percent || 0,
          owner: activity.owner_user_id,
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
      return deliverables.map(deliverable => ({
        id: deliverable.id,
        name: deliverable.title,
        type: 'deliverable',
        status: deliverable.status?.toLowerCase() || 'not_started',
        description: deliverable.description,
        weight: deliverable.weight,
        weightUnit: deliverable.weight_unit?.toLowerCase() === 'percent' ? 'percent' : 'points',
        progress: calculateDeliverableProgress(deliverable.parts || []),
        canEdit: true,
        canDelete: deliverable.parts?.length === 0,
        canUpload: true,
        hasFiles: false, // سيتم تحديثه لاحقاً من جدول الملفات
        fileCount: 0,
        children: (deliverable.parts || []).map((part: any) => ({
          id: part.id,
          name: part.title,
          type: 'part',
          status: part.status?.toLowerCase() || 'not_started',
          description: part.description,
          weight: part.part_weight,
          weightUnit: 'percent',
          progress: part.progress_percent || 0,
          canEdit: true,
          canDelete: true,
          canUpload: true,
          hasFiles: false,
          fileCount: 0,
          assignedTo: part.assigned_user_id
        }))
      }))
    }

    const calculatePhaseProgress = (activities: any[]) => {
      if (activities.length === 0) return 0
      const totalProgress = activities.reduce((sum, activity) => sum + (activity.progress_percent || 0), 0)
      return Math.round(totalProgress / activities.length)
    }

    const calculatePhaseStatus = (activities: any[]) => {
      if (activities.length === 0) return 'not_started'
      
      const statuses = activities.map(a => a.status?.toLowerCase() || 'not_started')
      
      if (statuses.every(s => s === 'done')) return 'done'
      if (statuses.some(s => s === 'in_progress')) return 'in_progress'
      if (statuses.some(s => s === 'done')) return 'in_progress'
      
      return 'not_started'
    }

    const calculateDeliverableProgress = (parts: any[]) => {
      if (parts.length === 0) return 0
      
      const totalWeight = parts.reduce((sum, part) => sum + (part.part_weight || 0), 0)
      if (totalWeight === 0) return 0
      
      const weightedProgress = parts.reduce((sum, part) => {
        const partProgress = part.status === 'APPROVED' ? 100 : 
                           part.status === 'IN_PROGRESS' ? 50 : 0
        return sum + (partProgress * (part.part_weight || 0) / totalWeight)
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