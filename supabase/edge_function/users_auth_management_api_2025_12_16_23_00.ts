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

    const url = new URL(req.url)
    const method = req.method
    const action = url.searchParams.get('action')
    const userId = url.searchParams.get('user_id')

    // ==========================================
    // المصادقة وإنشاء الحسابات
    // ==========================================
    if (action === 'register' && method === 'POST') {
      const body = await req.json()
      
      // إنشاء مستخدم جديد
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: body.full_name,
          role: body.role || 'VIEWER'
        }
      })

      if (authError) {
        console.error('Error creating user:', authError)
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // إنشاء ملف شخصي للمستخدم
      const { data: profile, error: profileError } = await supabaseClient
        .from('user_profiles_2025_12_16_23_00')
        .insert({
          id: authData.user.id,
          email: body.email,
          full_name: body.full_name,
          phone: body.phone,
          department: body.department,
          position: body.position,
          role: body.role || 'VIEWER'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // حذف المستخدم إذا فشل إنشاء الملف الشخصي
        await supabaseClient.auth.admin.deleteUser(authData.user.id)
        return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // إرسال إشعار ترحيب
      await supabaseClient
        .from('notifications_2025_12_16_23_00')
        .insert({
          recipient_id: authData.user.id,
          title: 'مرحباً بك في منصة السياسات والإجراءات',
          message: 'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام المنصة.',
          type: 'SUCCESS'
        })

      return new Response(JSON.stringify({
        success: true,
        data: {
          user: authData.user,
          profile: profile
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // التحقق من المصادقة للطلبات الأخرى
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ==========================================
    // إدارة الملفات الشخصية
    // ==========================================
    if (action === 'profile') {
      if (method === 'GET') {
        const targetUserId = userId || user.id
        
        const { data: profile, error } = await supabaseClient
          .from('user_profiles_2025_12_16_23_00')
          .select('*')
          .eq('id', targetUserId)
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // تحديث آخر تسجيل دخول
        if (targetUserId === user.id) {
          await supabaseClient
            .from('user_profiles_2025_12_16_23_00')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id)
        }

        return new Response(JSON.stringify({ success: true, data: profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'PUT') {
        const body = await req.json()
        const targetUserId = userId || user.id

        // التحقق من الصلاحيات
        if (targetUserId !== user.id) {
          const { data: currentUser } = await supabaseClient
            .from('user_profiles_2025_12_16_23_00')
            .select('role')
            .eq('id', user.id)
            .single()

          if (currentUser?.role !== 'ADMIN') {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: profile, error } = await supabaseClient
          .from('user_profiles_2025_12_16_23_00')
          .update({
            full_name: body.full_name,
            phone: body.phone,
            department: body.department,
            position: body.position,
            role: body.role,
            avatar_url: body.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId)
          .select()
          .single()

        if (error) {
          console.error('Error updating profile:', error)
          return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // ==========================================
    // إدارة المستخدمين (للإداريين)
    // ==========================================
    if (action === 'users') {
      // التحقق من صلاحيات الإدارة
      const { data: currentUser } = await supabaseClient
        .from('user_profiles_2025_12_16_23_00')
        .select('role')
        .eq('id', user.id)
        .single()

      if (currentUser?.role !== 'ADMIN') {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const search = url.searchParams.get('search') || ''
        const role = url.searchParams.get('role') || ''
        const offset = (page - 1) * limit

        let query = supabaseClient
          .from('user_profiles_2025_12_16_23_00')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (search) {
          query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`)
        }

        if (role) {
          query = query.eq('role', role)
        }

        const { data: users, error, count } = await query
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error fetching users:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          success: true,
          data: users,
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

      if (method === 'PUT' && userId) {
        const body = await req.json()
        
        if (body.action === 'deactivate') {
          // إلغاء تفعيل المستخدم
          const { data: profile, error } = await supabaseClient
            .from('user_profiles_2025_12_16_23_00')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()

          if (error) {
            console.error('Error deactivating user:', error)
            return new Response(JSON.stringify({ error: 'Failed to deactivate user' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ success: true, data: profile }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (body.action === 'change_role') {
          // تغيير دور المستخدم
          const { data: profile, error } = await supabaseClient
            .from('user_profiles_2025_12_16_23_00')
            .update({ role: body.role, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()

          if (error) {
            console.error('Error changing user role:', error)
            return new Response(JSON.stringify({ error: 'Failed to change user role' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          // إرسال إشعار للمستخدم
          await supabaseClient
            .from('notifications_2025_12_16_23_00')
            .insert({
              recipient_id: userId,
              title: 'تم تحديث دورك في النظام',
              message: `تم تغيير دورك إلى: ${body.role}`,
              type: 'INFO'
            })

          return new Response(JSON.stringify({ success: true, data: profile }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    // ==========================================
    // إحصائيات المستخدمين
    // ==========================================
    if (action === 'stats' && method === 'GET') {
      const { data: users } = await supabaseClient
        .from('user_profiles_2025_12_16_23_00')
        .select('role, is_active, created_at, last_login')

      const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u.is_active).length || 0,
        inactive: users?.filter(u => !u.is_active).length || 0,
        byRole: {
          admin: users?.filter(u => u.role === 'ADMIN').length || 0,
          manager: users?.filter(u => u.role === 'MANAGER').length || 0,
          consultant: users?.filter(u => u.role === 'CONSULTANT').length || 0,
          client: users?.filter(u => u.role === 'CLIENT').length || 0,
          viewer: users?.filter(u => u.role === 'VIEWER').length || 0
        },
        recentlyActive: users?.filter(u => {
          if (!u.last_login) return false
          const lastLogin = new Date(u.last_login)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return lastLogin > weekAgo
        }).length || 0,
        newThisMonth: users?.filter(u => {
          const created = new Date(u.created_at)
          const now = new Date()
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length || 0
      }

      return new Response(JSON.stringify({ success: true, data: stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action or method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in users-auth-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})