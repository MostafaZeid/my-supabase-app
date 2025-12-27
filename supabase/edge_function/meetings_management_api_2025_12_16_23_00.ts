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
    const meetingId = url.searchParams.get('meeting_id')
    const action = url.searchParams.get('action')

    // GET - جلب الاجتماعات
    if (method === 'GET') {
      if (meetingId) {
        // جلب اجتماع محدد مع المشاركين
        const { data: meeting, error } = await supabaseClient
          .from('meetings_2025_12_16_23_00')
          .select(`
            *,
            project:projects_2025_12_16_23_00(name, status),
            creator:user_profiles_2025_12_16_23_00!meetings_2025_12_16_23_00_created_by_fkey(full_name, email),
            participants:meeting_participants_2025_12_16_23_00(
              *,
              user:user_profiles_2025_12_16_23_00(full_name, email),
              consultant:consultants_2025_12_16_23_00(name, email),
              client:clients_2025_12_16_23_00(name, email)
            )
          `)
          .eq('id', meetingId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Meeting not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: meeting }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // جلب جميع الاجتماعات
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const status = url.searchParams.get('status') || ''
        const projectId = url.searchParams.get('project_id') || ''
        const dateFrom = url.searchParams.get('date_from') || ''
        const dateTo = url.searchParams.get('date_to') || ''
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('meetings_2025_12_16_23_00')
          .select(`
            *,
            project:projects_2025_12_16_23_00(name, status),
            creator:user_profiles_2025_12_16_23_00!meetings_2025_12_16_23_00_created_by_fkey(full_name, email),
            participants:meeting_participants_2025_12_16_23_00(count)
          `, { count: 'exact' })
          .order('start_time', { ascending: false })

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        if (dateFrom) {
          query = query.gte('start_time', dateFrom)
        }

        if (dateTo) {
          query = query.lte('start_time', dateTo)
        }

        const { data: meetings, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching meetings:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch meetings' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          success: true,
          data: meetings,
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

    // POST - إنشاء اجتماع جديد أو إدارة المشاركين
    if (method === 'POST') {
      const body = await req.json()

      if (action === 'add_participant' && meetingId) {
        // إضافة مشارك للاجتماع
        const { data: participant, error } = await supabaseClient
          .from('meeting_participants_2025_12_16_23_00')
          .insert({
            meeting_id: meetingId,
            user_id: body.user_id,
            consultant_id: body.consultant_id,
            client_id: body.client_id,
            email: body.email,
            name: body.name,
            attendance_status: body.attendance_status || 'invited'
          })
          .select(`
            *,
            user:user_profiles_2025_12_16_23_00(full_name, email),
            consultant:consultants_2025_12_16_23_00(name, email),
            client:clients_2025_12_16_23_00(name, email)
          `)
          .single()

        if (error) {
          console.error('Error adding participant:', error)
          return new Response(JSON.stringify({ error: 'Failed to add participant' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إرسال إشعار للمشارك
        if (body.user_id) {
          const { data: meeting } = await supabaseClient
            .from('meetings_2025_12_16_23_00')
            .select('title, start_time')
            .eq('id', meetingId)
            .single()

          await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .insert({
              recipient_id: body.user_id,
              title: 'دعوة لاجتماع جديد',
              message: `تمت دعوتك للمشاركة في اجتماع: ${meeting?.title}`,
              type: 'INFO',
              related_entity_type: 'meeting',
              related_entity_id: meetingId,
              action_url: `/meetings/${meetingId}`
            })
        }

        return new Response(JSON.stringify({ success: true, data: participant }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else if (action === 'update_attendance' && meetingId) {
        // تحديث حالة الحضور
        const participantId = body.participant_id
        const attendanceStatus = body.attendance_status
        const joinedAt = body.joined_at
        const leftAt = body.left_at

        const { data: participant, error } = await supabaseClient
          .from('meeting_participants_2025_12_16_23_00')
          .update({
            attendance_status: attendanceStatus,
            joined_at: joinedAt,
            left_at: leftAt
          })
          .eq('id', participantId)
          .select()
          .single()

        if (error) {
          console.error('Error updating attendance:', error)
          return new Response(JSON.stringify({ error: 'Failed to update attendance' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: participant }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // إنشاء اجتماع جديد
        const { data: meeting, error } = await supabaseClient
          .from('meetings_2025_12_16_23_00')
          .insert({
            title: body.title,
            description: body.description,
            project_id: body.project_id,
            meeting_type: body.meeting_type || 'general',
            start_time: body.start_time,
            end_time: body.end_time,
            location: body.location,
            meeting_url: body.meeting_url,
            status: body.status || 'SCHEDULED',
            agenda: body.agenda,
            created_by: user.id
          })
          .select(`
            *,
            project:projects_2025_12_16_23_00(name, status),
            creator:user_profiles_2025_12_16_23_00!meetings_2025_12_16_23_00_created_by_fkey(full_name, email)
          `)
          .single()

        if (error) {
          console.error('Error creating meeting:', error)
          return new Response(JSON.stringify({ error: 'Failed to create meeting' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إضافة المشاركين إذا تم تحديدهم
        if (body.participants && body.participants.length > 0) {
          const participantsData = body.participants.map((p: any) => ({
            meeting_id: meeting.id,
            user_id: p.user_id,
            consultant_id: p.consultant_id,
            client_id: p.client_id,
            email: p.email,
            name: p.name,
            attendance_status: 'invited'
          }))

          await supabaseClient
            .from('meeting_participants_2025_12_16_23_00')
            .insert(participantsData)

          // إرسال إشعارات للمشاركين
          for (const participant of body.participants) {
            if (participant.user_id) {
              await supabaseClient
                .from('notifications_2025_12_16_23_00')
                .insert({
                  recipient_id: participant.user_id,
                  title: 'دعوة لاجتماع جديد',
                  message: `تمت دعوتك للمشاركة في اجتماع: ${meeting.title}`,
                  type: 'INFO',
                  related_entity_type: 'meeting',
                  related_entity_id: meeting.id,
                  action_url: `/meetings/${meeting.id}`
                })
            }
          }
        }

        // تسجيل النشاط
        await supabaseClient
          .from('audit_logs_2025_12_16_23_00')
          .insert({
            user_id: user.id,
            action: 'CREATE',
            entity_type: 'meeting',
            entity_id: meeting.id,
            new_values: meeting
          })

        return new Response(JSON.stringify({ success: true, data: meeting }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // PUT - تحديث اجتماع
    if (method === 'PUT' && meetingId) {
      const body = await req.json()
      
      // جلب البيانات القديمة
      const { data: oldMeeting } = await supabaseClient
        .from('meetings_2025_12_16_23_00')
        .select('*')
        .eq('id', meetingId)
        .single()

      const { data: meeting, error } = await supabaseClient
        .from('meetings_2025_12_16_23_00')
        .update({
          title: body.title,
          description: body.description,
          project_id: body.project_id,
          meeting_type: body.meeting_type,
          start_time: body.start_time,
          end_time: body.end_time,
          location: body.location,
          meeting_url: body.meeting_url,
          status: body.status,
          agenda: body.agenda,
          notes: body.notes,
          recording_url: body.recording_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId)
        .select(`
          *,
          project:projects_2025_12_16_23_00(name, status),
          creator:user_profiles_2025_12_16_23_00!meetings_2025_12_16_23_00_created_by_fkey(full_name, email)
        `)
        .single()

      if (error) {
        console.error('Error updating meeting:', error)
        return new Response(JSON.stringify({ error: 'Failed to update meeting' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // إرسال إشعارات عند تغيير الوقت أو الحالة
      if (body.start_time !== oldMeeting?.start_time || body.status !== oldMeeting?.status) {
        const { data: participants } = await supabaseClient
          .from('meeting_participants_2025_12_16_23_00')
          .select('user_id')
          .eq('meeting_id', meetingId)
          .not('user_id', 'is', null)

        for (const participant of participants || []) {
          await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .insert({
              recipient_id: participant.user_id,
              title: 'تحديث في الاجتماع',
              message: `تم تحديث تفاصيل الاجتماع: ${meeting.title}`,
              type: 'WARNING',
              related_entity_type: 'meeting',
              related_entity_id: meeting.id,
              action_url: `/meetings/${meeting.id}`
            })
        }
      }

      // تسجيل النشاط
      await supabaseClient
        .from('audit_logs_2025_12_16_23_00')
        .insert({
          user_id: user.id,
          action: 'UPDATE',
          entity_type: 'meeting',
          entity_id: meeting.id,
          old_values: oldMeeting,
          new_values: meeting
        })

      return new Response(JSON.stringify({ success: true, data: meeting }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - حذف اجتماع أو مشارك
    if (method === 'DELETE') {
      if (action === 'remove_participant') {
        const participantId = url.searchParams.get('participant_id')
        
        const { error } = await supabaseClient
          .from('meeting_participants_2025_12_16_23_00')
          .delete()
          .eq('id', participantId)

        if (error) {
          console.error('Error removing participant:', error)
          return new Response(JSON.stringify({ error: 'Failed to remove participant' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, message: 'Participant removed successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else if (meetingId) {
        // حذف اجتماع
        const { data: meeting, error } = await supabaseClient
          .from('meetings_2025_12_16_23_00')
          .delete()
          .eq('id', meetingId)
          .select()
          .single()

        if (error) {
          console.error('Error deleting meeting:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete meeting' }), {
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
            entity_type: 'meeting',
            entity_id: meeting.id,
            old_values: meeting
          })

        return new Response(JSON.stringify({ success: true, message: 'Meeting deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in meetings-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})