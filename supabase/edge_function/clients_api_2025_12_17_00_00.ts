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
    const clientId = pathParts[pathParts.length - 1];

    switch (method) {
      case 'GET':
        if (clientId && clientId !== 'clients_api_2025_12_17_00_00') {
          // Get single client
          const { data, error } = await supabaseClient
            .from('clients_2025_12_17_00_00')
            .select('*')
            .eq('id', clientId)
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all clients with pagination and search
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '10');
          const search = url.searchParams.get('search') || '';
          const status = url.searchParams.get('status');
          
          const offset = (page - 1) * limit;

          let query = supabaseClient
            .from('clients_2025_12_17_00_00')
            .select('*', { count: 'exact' });

          if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
          }

          if (status) {
            query = query.eq('status', status);
          }

          const { data, error, count } = await query
            .order('created_at', { ascending: false })
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
        
        const { data: newClient, error: createError } = await supabaseClient
          .from('clients_2025_12_17_00_00')
          .insert([createData])
          .select()
          .single();

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ success: true, data: newClient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        const updateData = await req.json();
        
        const { data: updatedClient, error: updateError } = await supabaseClient
          .from('clients_2025_12_17_00_00')
          .update(updateData)
          .eq('id', clientId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, data: updatedClient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        const { error: deleteError } = await supabaseClient
          .from('clients_2025_12_17_00_00')
          .delete()
          .eq('id', clientId);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, message: 'Client deleted successfully' }),
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