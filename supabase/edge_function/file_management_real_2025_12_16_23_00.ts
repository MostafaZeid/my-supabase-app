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
    const action = pathParts[pathParts.length - 1] // upload, versions, presign

    if (method === 'POST') {
      const body = await req.json()
      
      if (action === 'presign') {
        // إنشاء رابط رفع مؤقت
        const { deliverable_part_id, file_name, file_type, file_size } = body
        
        if (!deliverable_part_id || !file_name || !file_type) {
          return new Response(JSON.stringify({ error: 'deliverable_part_id, file_name, and file_type are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // التحقق من الصلاحيات
        const { data: assignments } = await supabaseClient
          .from('deliverable_assignments_2025_12_16_22_00')
          .select('can_upload')
          .eq('deliverable_part_id', deliverable_part_id)
          .eq('assigned_to', user.id)

        const canUpload = assignments && assignments.some(a => a.can_upload)
        
        if (!canUpload) {
          return new Response(JSON.stringify({ error: 'No upload permission for this part' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // إنشاء مسار الملف
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = `${deliverable_part_id}/${timestamp}_${file_name}`
        
        // إنشاء رابط رفع مؤقت
        const { data: presignData, error: presignError } = await supabaseClient.storage
          .from('deliverable-files')
          .createSignedUploadUrl(fileName, {
            upsert: false
          })

        if (presignError) {
          console.error('Error creating presigned URL:', presignError)
          return new Response(JSON.stringify({ error: 'Failed to create upload URL' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            upload_url: presignData.signedUrl,
            file_path: fileName,
            expires_in: 3600 // ساعة واحدة
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'upload') {
        // تسجيل رفع الملف في قاعدة البيانات
        const { deliverable_part_id, file_path, file_name, file_size, notes } = body
        
        if (!deliverable_part_id || !file_path || !file_name) {
          return new Response(JSON.stringify({ error: 'deliverable_part_id, file_path, and file_name are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // الحصول على رقم الإصدار التالي
        const { data: existingVersions } = await supabaseClient
          .from('deliverable_part_versions_2025_12_16_22_00')
          .select('version_number')
          .eq('deliverable_part_id', deliverable_part_id)
          .order('version_number', { ascending: false })
          .limit(1)

        const nextVersion = existingVersions && existingVersions.length > 0 
          ? existingVersions[0].version_number + 1 
          : 1

        // إدراج سجل الإصدار الجديد
        const { data: version, error } = await supabaseClient
          .from('deliverable_part_versions_2025_12_16_22_00')
          .insert({
            deliverable_part_id,
            version_number: nextVersion,
            file_name,
            file_path,
            file_size,
            uploaded_by: user.id,
            notes
          })
          .select()
          .single()

        if (error) {
          console.error('Error recording file version:', error)
          return new Response(JSON.stringify({ error: 'Failed to record file version' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // تحديث حالة الجزء إلى "in_progress" إذا كان "not_started"
        const { data: part } = await supabaseClient
          .from('deliverable_parts_2025_12_16_22_00')
          .select('status')
          .eq('id', deliverable_part_id)
          .single()

        if (part && part.status === 'not_started') {
          await supabaseClient
            .from('deliverable_parts_2025_12_16_22_00')
            .update({ 
              status: 'in_progress',
              updated_at: new Date().toISOString()
            })
            .eq('id', deliverable_part_id)
        }

        return new Response(JSON.stringify({ success: true, data: version }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'GET') {
      if (action === 'versions') {
        // جلب إصدارات الملفات
        const deliverable_part_id = url.searchParams.get('deliverable_part_id')
        
        if (!deliverable_part_id) {
          return new Response(JSON.stringify({ error: 'deliverable_part_id is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: versions, error } = await supabaseClient
          .from('deliverable_part_versions_2025_12_16_22_00')
          .select('*')
          .eq('deliverable_part_id', deliverable_part_id)
          .order('version_number', { ascending: false })

        if (error) {
          console.error('Error fetching versions:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch versions' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true, data: versions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (action === 'download') {
        // إنشاء رابط تحميل مؤقت
        const file_path = url.searchParams.get('file_path')
        
        if (!file_path) {
          return new Response(JSON.stringify({ error: 'file_path is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: downloadData, error: downloadError } = await supabaseClient.storage
          .from('deliverable-files')
          .createSignedUrl(file_path, 3600) // ساعة واحدة

        if (downloadError) {
          console.error('Error creating download URL:', downloadError)
          return new Response(JSON.stringify({ error: 'Failed to create download URL' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            download_url: downloadData.signedUrl,
            expires_in: 3600
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (method === 'DELETE') {
      const version_id = url.searchParams.get('version_id')
      
      if (!version_id) {
        return new Response(JSON.stringify({ error: 'version_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // جلب معلومات الإصدار
      const { data: version } = await supabaseClient
        .from('deliverable_part_versions_2025_12_16_22_00')
        .select('file_path, uploaded_by')
        .eq('id', version_id)
        .single()

      if (!version) {
        return new Response(JSON.stringify({ error: 'Version not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // التحقق من الصلاحيات (فقط من رفع الملف يمكنه حذفه)
      if (version.uploaded_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Can only delete your own uploads' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // حذف الملف من التخزين
      const { error: storageError } = await supabaseClient.storage
        .from('deliverable-files')
        .remove([version.file_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }

      // حذف سجل الإصدار
      const { error } = await supabaseClient
        .from('deliverable_part_versions_2025_12_16_22_00')
        .delete()
        .eq('id', version_id)

      if (error) {
        console.error('Error deleting version record:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete version' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in file-management-api:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})