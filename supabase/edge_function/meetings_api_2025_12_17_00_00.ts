import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { method } = req;
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const meetingId = pathParts[pathParts.length - 1];

    switch (method) {
      case 'GET':
        if (meetingId && meetingId !== 'meetings_api_2025_12_17_00_00') {
          // Get single meeting
          const { data, error } = await supabaseClient
            .from('meetings_2025_12_17_00_00')
            .select('*')
            .eq('id', meetingId)
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all meetings with pagination and search
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '10');
          const search = url.searchParams.get('search') || '';
          const status = url.searchParams.get('status');
          
          const offset = (page - 1) * limit;

          let query = supabaseClient
            .from('meetings_2025_12_17_00_00')
            .select('*', { count: 'exact' });

          if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,organizer.ilike.%${search}%`);
          }

          if (status) {
            query = query.eq('status', status);
          }

          const { data, error, count } = await query
            .order('start_time', { ascending: true })
            .range(offset, offset + limit - 1);

          if (error) throw error;

          const totalPages = Math.ceil((count || 0) / limit);

          return new Response(
            JSON.stringify({
              success: true,
              data,
              pagination: {
                page,
                limit,
                total: count,
                totalPages
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        const createData = await req.json();
        
        const { data: newMeeting, error: createError } = await supabaseClient
          .from('meetings_2025_12_17_00_00')
          .insert([createData])
          .select()
          .single();

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ success: true, data: newMeeting }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        const updateData = await req.json();
        
        const { data: updatedMeeting, error: updateError } = await supabaseClient
          .from('meetings_2025_12_17_00_00')
          .update(updateData)
          .eq('id', meetingId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, data: updatedMeeting }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        const { error: deleteError } = await supabaseClient
          .from('meetings_2025_12_17_00_00')
          .delete()
          .eq('id', meetingId);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, message: 'Meeting deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});