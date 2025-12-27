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
    const consultantId = url.searchParams.get('consultant_id')
    const action = url.searchParams.get('action')

    // GET - جلب الاستشاريين
    if (method === 'GET') {
      if (consultantId) {
        // جلب استشاري محدد
        const { data: consultant, error } = await supabaseClient
          .from('consultants_2025_12_16_23_00')
          .select(`
            *,
            user:user_profiles_2025_12_16_23_00(full_name, email, avatar_url),
            projects:project_teams_2025_12_16_23_00(
              project:projects_2025_12_16_23_00(id, name, status),
              role,
              is_active
            )
          `)
          .eq('id', consultantId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Consultant not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: consultant }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // جلب جميع الاستشاريين
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const specialization = url.searchParams.get('specialization') || ''
        const availability = url.searchParams.get('availability') || ''
        const minRate = parseFloat(url.searchParams.get('min_rate') || '0')
        const maxRate = parseFloat(url.searchParams.get('max_rate') || '999999')
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('consultants_2025_12_16_23_00')
          .select(`
            *,
            user:user_profiles_2025_12_16_23_00(full_name, email, avatar_url),
            active_projects:project_teams_2025_12_16_23_00(count)
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`name.ilike.%${search}%,specialization.ilike.%${search}%,email.ilike.%${search}%`)
        }

        if (specialization) {
          query = query.ilike('specialization', `%${specialization}%`)
        }

        if (availability) {
          query = query.eq('availability_status', availability)
        }

        if (minRate > 0) {
          query = query.gte('hourly_rate', minRate)
        }

        if (maxRate < 999999) {
          query = query.lte('hourly_rate', maxRate)
        }

        const { data: consultants, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching consultants:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch consultants' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إحصائيات الاستشاريين
        const { data: allConsultants } = await supabaseClient
          .from('consultants_2025_12_16_23_00')
          .select('availability_status, hourly_rate, specialization')
          .eq('is_active', true)

        const stats = {
          total: count || 0,
          available: allConsultants?.filter(c => c.availability_status === 'available').length || 0,
          busy: allConsultants?.filter(c => c.availability_status === 'busy').length || 0,
          avgHourlyRate: allConsultants && allConsultants.length > 0 ?
            allConsultants.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / allConsultants.length : 0,
          topSpecializations: getTopSpecializations(allConsultants || [])
        }

        return new Response(JSON.stringify({
          success: true,
          data: consultants,
          stats: stats,
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

    // POST - إنشاء استشاري جديد
    if (method === 'POST') {
      const body = await req.json()
      
      const { data: consultant, error } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .insert({
          user_id: body.user_id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          specialization: body.specialization,
          experience_years: body.experience_years || 0,
          hourly_rate: body.hourly_rate,
          bio: body.bio,
          skills: body.skills || [],
          certifications: body.certifications || [],
          availability_status: body.availability_status || 'available',
          created_by: user.id
        })
        .select(`
          *,
          user:user_profiles_2025_12_16_23_00(full_name, email, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error creating consultant:', error)
        return new Response(JSON.stringify({ error: 'Failed to create consultant' }), {
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
          entity_type: 'consultant',
          entity_id: consultant.id,
          new_values: consultant
        })

      return new Response(JSON.stringify({ success: true, data: consultant }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT - تحديث استشاري
    if (method === 'PUT' && consultantId) {
      const body = await req.json()
      
      // التحقق من الصلاحيات
      const { data: consultant } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .select('user_id')
        .eq('id', consultantId)
        .single()

      const { data: currentUser } = await supabaseClient
        .from('user_profiles_2025_12_16_23_00')
        .select('role')
        .eq('id', user.id)
        .single()

      // يمكن للاستشاري تحديث ملفه الشخصي أو للإداريين/المديرين
      if (consultant?.user_id !== user.id && !['ADMIN', 'MANAGER'].includes(currentUser?.role)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // جلب البيانات القديمة
      const { data: oldConsultant } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .select('*')
        .eq('id', consultantId)
        .single()

      const { data: updatedConsultant, error } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone,
          specialization: body.specialization,
          experience_years: body.experience_years,
          hourly_rate: body.hourly_rate,
          bio: body.bio,
          skills: body.skills,
          certifications: body.certifications,
          availability_status: body.availability_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', consultantId)
        .select(`
          *,
          user:user_profiles_2025_12_16_23_00(full_name, email, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error updating consultant:', error)
        return new Response(JSON.stringify({ error: 'Failed to update consultant' }), {
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
          entity_type: 'consultant',
          entity_id: updatedConsultant.id,
          old_values: oldConsultant,
          new_values: updatedConsultant
        })

      return new Response(JSON.stringify({ success: true, data: updatedConsultant }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - حذف استشاري (soft delete)
    if (method === 'DELETE' && consultantId) {
      // التحقق من الصلاحيات - الإداريون والمديرون فقط
      const { data: currentUser } = await supabaseClient
        .from('user_profiles_2025_12_16_23_00')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!['ADMIN', 'MANAGER'].includes(currentUser?.role)) {
        return new Response(JSON.stringify({ error: 'Admin or Manager access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: consultant, error } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', consultantId)
        .select()
        .single()

      if (error) {
        console.error('Error deleting consultant:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete consultant' }), {
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
          entity_type: 'consultant',
          entity_id: consultant.id,
          old_values: consultant
        })

      return new Response(JSON.stringify({ success: true, message: 'Consultant deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // إجراءات خاصة
    if (action === 'search_skills' && method === 'GET') {
      // البحث في المهارات المتاحة
      const { data: consultants } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .select('skills')
        .eq('is_active', true)

      const allSkills = new Set()
      consultants?.forEach(consultant => {
        consultant.skills?.forEach((skill: string) => allSkills.add(skill))
      })

      return new Response(JSON.stringify({
        success: true,
        data: Array.from(allSkills).sort()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'availability_report' && method === 'GET') {
      // تقرير توفر الاستشاريين
      const { data: consultants } = await supabaseClient
        .from('consultants_2025_12_16_23_00')
        .select(`
          id, name, availability_status, hourly_rate, specialization,
          active_projects:project_teams_2025_12_16_23_00(
            project:projects_2025_12_16_23_00(name, status),
            is_active
          )
        `)
        .eq('is_active', true)

      const availabilityReport = consultants?.map(consultant => ({
        ...consultant,
        active_projects_count: consultant.active_projects?.filter(p => p.is_active).length || 0,
        current_projects: consultant.active_projects?.filter(p => p.is_active).map(p => p.project) || []
      }))

      return new Response(JSON.stringify({
        success: true,
        data: availabilityReport
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in consultants-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// دالة مساعدة لاستخراج أهم التخصصات
function getTopSpecializations(consultants: any[]): { specialization: string, count: number }[] {
  const specializationCounts: { [key: string]: number } = {}
  
  consultants.forEach(consultant => {
    if (consultant.specialization) {
      specializationCounts[consultant.specialization] = (specializationCounts[consultant.specialization] || 0) + 1
    }
  })

  return Object.entries(specializationCounts)
    .map(([specialization, count]) => ({ specialization, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}