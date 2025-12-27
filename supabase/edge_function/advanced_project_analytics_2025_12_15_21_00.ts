import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'get_analytics'
    const projectId = url.searchParams.get('project_id')

    console.log(`Advanced Project Analytics - Action: ${action}, Project ID: ${projectId}`)

    switch (action) {
      case 'get_analytics':
        return await getProjectAnalytics(supabase, projectId)
      
      case 'calculate_progress':
        return await calculateProjectProgress(supabase, projectId)
      
      case 'get_dashboard_stats':
        return await getDashboardStats(supabase)
      
      case 'get_project_timeline':
        return await getProjectTimeline(supabase, projectId)
      
      case 'get_deliverables_status':
        return await getDeliverablesStatus(supabase, projectId)
      
      case 'get_audit_trail':
        return await getAuditTrail(supabase, projectId)
      
      case 'update_progress':
        const body = await req.json()
        return await updateProjectProgress(supabase, body)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in advanced project analytics:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Get comprehensive project analytics
async function getProjectAnalytics(supabase: any, projectId: string | null) {
  try {
    let query = supabase
      .from('projects_advanced_2025_12_15_21_00')
      .select(`
        *,
        phases:project_phases_2025_12_15_21_00(*),
        deliverables:deliverables_advanced_2025_12_15_21_00(*)
      `)

    if (projectId) {
      query = query.eq('id', projectId)
    }

    const { data: projects, error } = await query

    if (error) {
      throw error
    }

    // Calculate analytics for each project
    const analyticsData = await Promise.all(projects.map(async (project: any) => {
      // Calculate weighted progress
      const weightedProgress = await calculateWeightedProgress(project.deliverables)
      
      // Calculate phase progress
      const phaseProgress = calculatePhaseProgress(project.phases)
      
      // Get delay information
      const delayInfo = calculateDelayInfo(project)
      
      // Get recent activities
      const { data: recentActivities } = await supabase
        .from('audit_trail_2025_12_15_21_00')
        .select('*')
        .eq('project_id', project.id)
        .order('performed_at', { ascending: false })
        .limit(10)

      return {
        ...project,
        analytics: {
          weighted_progress: weightedProgress,
          phase_progress: phaseProgress,
          delay_info: delayInfo,
          recent_activities: recentActivities || []
        }
      }
    }))

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: projectId ? analyticsData[0] : analyticsData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting project analytics:', error)
    throw error
  }
}

// Calculate weighted progress based on deliverables
function calculateWeightedProgress(deliverables: any[]) {
  if (!deliverables || deliverables.length === 0) {
    return 0
  }

  let totalWeight = 0
  let weightedSum = 0

  deliverables.forEach(deliverable => {
    const weight = deliverable.weight_percentage || 0
    const progress = deliverable.progress_percentage || 0
    
    totalWeight += weight
    weightedSum += (weight * progress) / 100
  })

  return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0
}

// Calculate phase progress
function calculatePhaseProgress(phases: any[]) {
  if (!phases || phases.length === 0) {
    return []
  }

  return phases.map(phase => ({
    ...phase,
    completion_status: phase.progress_percentage >= 100 ? 'completed' : 
                     phase.progress_percentage > 0 ? 'in_progress' : 'not_started'
  }))
}

// Calculate delay information
function calculateDelayInfo(project: any) {
  const today = new Date()
  const endDate = new Date(project.end_date)
  const startDate = new Date(project.start_date)
  
  const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const expectedProgress = Math.min((elapsedDays / totalDuration) * 100, 100)
  const actualProgress = project.progress_percentage || 0
  const progressVariance = actualProgress - expectedProgress

  return {
    total_duration: totalDuration,
    elapsed_days: Math.max(0, elapsedDays),
    remaining_days: Math.max(0, remainingDays),
    expected_progress: Math.max(0, expectedProgress),
    actual_progress: actualProgress,
    progress_variance: progressVariance,
    is_delayed: progressVariance < -5, // Consider delayed if more than 5% behind
    is_ahead: progressVariance > 5 // Consider ahead if more than 5% ahead
  }
}

// Calculate and update project progress
async function calculateProjectProgress(supabase: any, projectId: string | null) {
  try {
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get project with deliverables
    const { data: project, error: projectError } = await supabase
      .from('projects_advanced_2025_12_15_21_00')
      .select(`
        *,
        deliverables:deliverables_advanced_2025_12_15_21_00(*)
      `)
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw projectError
    }

    // Calculate new progress
    const weightedProgress = calculateWeightedProgress(project.deliverables)
    
    // Update project progress
    const { error: updateError } = await supabase
      .from('projects_advanced_2025_12_15_21_00')
      .update({
        weighted_progress: weightedProgress,
        progress_percentage: weightedProgress,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      throw updateError
    }

    // Log the update in audit trail
    await supabase
      .from('audit_trail_2025_12_15_21_00')
      .insert({
        entity_type: 'project',
        entity_id: projectId,
        action: 'progress_update',
        action_description: `تم تحديث تقدم المشروع إلى ${weightedProgress.toFixed(2)}%`,
        action_description_en: `Project progress updated to ${weightedProgress.toFixed(2)}%`,
        performed_by_name: 'النظام الآلي',
        performed_by_role: 'system',
        project_id: projectId,
        search_keywords: 'تحديث تقدم مشروع آلي'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        weighted_progress: weightedProgress,
        message: 'Project progress updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error calculating project progress:', error)
    throw error
  }
}

// Get dashboard statistics
async function getDashboardStats(supabase: any) {
  try {
    // Get project statistics
    const { data: projectStats, error: projectError } = await supabase
      .from('projects_advanced_2025_12_15_21_00')
      .select('status, priority, progress_percentage, budget, spent')

    if (projectError) {
      throw projectError
    }

    // Get deliverable statistics
    const { data: deliverableStats, error: deliverableError } = await supabase
      .from('deliverables_advanced_2025_12_15_21_00')
      .select('status, priority, progress_percentage, quality_score')

    if (deliverableError) {
      throw deliverableError
    }

    // Get meeting statistics
    const { data: meetingStats, error: meetingError } = await supabase
      .from('meetings_2025_12_15_21_00')
      .select('status, meeting_type, scheduled_date')

    if (meetingError) {
      throw meetingError
    }

    // Calculate statistics
    const stats = {
      projects: {
        total: projectStats.length,
        active: projectStats.filter(p => p.status === 'active').length,
        completed: projectStats.filter(p => p.status === 'completed').length,
        pending: projectStats.filter(p => p.status === 'pending_activation').length,
        average_progress: projectStats.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projectStats.length || 0,
        total_budget: projectStats.reduce((sum, p) => sum + (p.budget || 0), 0),
        total_spent: projectStats.reduce((sum, p) => sum + (p.spent || 0), 0)
      },
      deliverables: {
        total: deliverableStats.length,
        in_progress: deliverableStats.filter(d => d.status === 'in_progress').length,
        under_review: deliverableStats.filter(d => d.status === 'under_review').length,
        approved: deliverableStats.filter(d => d.status === 'approved').length,
        changes_requested: deliverableStats.filter(d => d.status === 'changes_requested').length,
        average_quality: deliverableStats.filter(d => d.quality_score > 0).reduce((sum, d) => sum + d.quality_score, 0) / deliverableStats.filter(d => d.quality_score > 0).length || 0
      },
      meetings: {
        total: meetingStats.length,
        scheduled: meetingStats.filter(m => m.status === 'scheduled').length,
        completed: meetingStats.filter(m => m.status === 'completed').length,
        upcoming: meetingStats.filter(m => {
          const meetingDate = new Date(m.scheduled_date)
          const today = new Date()
          return meetingDate >= today && m.status === 'scheduled'
        }).length
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

// Get project timeline
async function getProjectTimeline(supabase: any, projectId: string | null) {
  try {
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get project phases and deliverables
    const { data: phases, error: phasesError } = await supabase
      .from('project_phases_2025_12_15_21_00')
      .select(`
        *,
        deliverables:deliverables_advanced_2025_12_15_21_00(*)
      `)
      .eq('project_id', projectId)
      .order('phase_order')

    if (phasesError) {
      throw phasesError
    }

    // Get meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings_2025_12_15_21_00')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_date')

    if (meetingsError) {
      throw meetingsError
    }

    const timeline = {
      phases: phases || [],
      meetings: meetings || []
    }

    return new Response(
      JSON.stringify({ success: true, data: timeline }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting project timeline:', error)
    throw error
  }
}

// Get deliverables status
async function getDeliverablesStatus(supabase: any, projectId: string | null) {
  try {
    let query = supabase
      .from('deliverables_advanced_2025_12_15_21_00')
      .select(`
        *,
        files:deliverable_files_2025_12_15_21_00(*)
      `)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: deliverables, error } = await query.order('start_date')

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data: deliverables }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting deliverables status:', error)
    throw error
  }
}

// Get audit trail
async function getAuditTrail(supabase: any, projectId: string | null) {
  try {
    let query = supabase
      .from('audit_trail_2025_12_15_21_00')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(100)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: auditTrail, error } = await query

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data: auditTrail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting audit trail:', error)
    throw error
  }
}

// Update project progress manually
async function updateProjectProgress(supabase: any, body: any) {
  try {
    const { project_id, progress_percentage, updated_by, notes } = body

    if (!project_id || progress_percentage === undefined) {
      return new Response(
        JSON.stringify({ error: 'Project ID and progress percentage are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update project
    const { error: updateError } = await supabase
      .from('projects_advanced_2025_12_15_21_00')
      .update({
        progress_percentage: progress_percentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)

    if (updateError) {
      throw updateError
    }

    // Log in audit trail
    await supabase
      .from('audit_trail_2025_12_15_21_00')
      .insert({
        entity_type: 'project',
        entity_id: project_id,
        action: 'manual_progress_update',
        action_description: `تم تحديث تقدم المشروع يدوياً إلى ${progress_percentage}%${notes ? ` - ${notes}` : ''}`,
        action_description_en: `Project progress manually updated to ${progress_percentage}%${notes ? ` - ${notes}` : ''}`,
        performed_by_name: updated_by || 'مستخدم غير محدد',
        performed_by_role: 'user',
        project_id: project_id,
        search_keywords: 'تحديث تقدم مشروع يدوي'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Project progress updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating project progress:', error)
    throw error
  }
}