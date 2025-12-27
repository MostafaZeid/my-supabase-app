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
    const clientId = url.searchParams.get('client_id')

    // GET - جلب العملاء
    if (method === 'GET') {
      if (clientId) {
        // جلب عميل محدد
        const { data: client, error } = await supabaseClient
          .from('clients_2025_12_16_23_00')
          .select('*')
          .eq('id', clientId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Client not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: client }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        // جلب جميع العملاء
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('clients_2025_12_16_23_00')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
        }

        const { data: clients, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching clients:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch clients' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          success: true,
          data: clients,
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

    // POST - إنشاء عميل جديد
    if (method === 'POST') {
      const body = await req.json()
      
      const { data: client, error } = await supabaseClient
        .from('clients_2025_12_16_23_00')
        .insert({
          name: body.name,
          email: body.email,
          phone: body.phone,
          company: body.company,
          address: body.address,
          website: body.website,
          contact_person: body.contact_person,
          notes: body.notes,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating client:', error)
        return new Response(JSON.stringify({ error: 'Failed to create client' }), {
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
          entity_type: 'client',
          entity_id: client.id,
          new_values: client
        })

      return new Response(JSON.stringify({ success: true, data: client }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT - تحديث عميل
    if (method === 'PUT' && clientId) {
      const body = await req.json()
      
      // جلب البيانات القديمة للمقارنة
      const { data: oldClient } = await supabaseClient
        .from('clients_2025_12_16_23_00')
        .select('*')
        .eq('id', clientId)
        .single()

      const { data: client, error } = await supabaseClient
        .from('clients_2025_12_16_23_00')
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone,
          company: body.company,
          address: body.address,
          website: body.website,
          contact_person: body.contact_person,
          notes: body.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        console.error('Error updating client:', error)
        return new Response(JSON.stringify({ error: 'Failed to update client' }), {
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
          entity_type: 'client',
          entity_id: client.id,
          old_values: oldClient,
          new_values: client
        })

      return new Response(JSON.stringify({ success: true, data: client }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - حذف عميل (soft delete)
    if (method === 'DELETE' && clientId) {
      const { data: client, error } = await supabaseClient
        .from('clients_2025_12_16_23_00')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        console.error('Error deleting client:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete client' }), {
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
          entity_type: 'client',
          entity_id: client.id,
          old_values: client
        })

      return new Response(JSON.stringify({ success: true, message: 'Client deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in clients-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})