import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  deep_link?: string;
  metadata?: any;
}

interface EventRequest {
  type: string;
  actor_user_id: string;
  project_id?: string;
  deliverable_id?: string;
  payload?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Get notifications for a user
    if (method === 'GET' && path.includes('/notifications')) {
      const userId = url.searchParams.get('user_id');
      const isRead = url.searchParams.get('is_read');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let query = supabaseClient
        .from('notifications_2025_12_16_13_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (isRead !== null) {
        query = query.eq('is_read', isRead === 'true');
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ notifications: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a new notification
    if (method === 'POST' && path.includes('/notifications')) {
      const notificationData: NotificationRequest = await req.json();

      const { data, error } = await supabaseClient
        .from('notifications_2025_12_16_13_00')
        .insert([{
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          body: notificationData.body,
          deep_link: notificationData.deep_link,
          metadata: notificationData.metadata || {}
        }])
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ notification: data }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mark notification as read
    if (method === 'PUT' && path.includes('/notifications/') && path.includes('/read')) {
      const notificationId = path.split('/notifications/')[1].split('/read')[0];

      const { data, error } = await supabaseClient
        .from('notifications_2025_12_16_13_00')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ notification: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get events
    if (method === 'GET' && path.includes('/events')) {
      const projectId = url.searchParams.get('project_id');
      const eventType = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let query = supabaseClient
        .from('events_2025_12_16_13_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (eventType) {
        query = query.eq('type', eventType);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ events: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a new event
    if (method === 'POST' && path.includes('/events')) {
      const eventData: EventRequest = await req.json();

      const { data, error } = await supabaseClient
        .from('events_2025_12_16_13_00')
        .insert([{
          type: eventData.type,
          actor_user_id: eventData.actor_user_id,
          project_id: eventData.project_id,
          deliverable_id: eventData.deliverable_id,
          payload: eventData.payload || {}
        }])
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ event: data }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Bulk operations - Create notification and event together
    if (method === 'POST' && path.includes('/bulk-create')) {
      const { notification, event } = await req.json();

      const operations = [];

      if (notification) {
        operations.push(
          supabaseClient
            .from('notifications_2025_12_16_13_00')
            .insert([notification])
        );
      }

      if (event) {
        operations.push(
          supabaseClient
            .from('events_2025_12_16_13_00')
            .insert([event])
        );
      }

      const results = await Promise.all(operations);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ errors: errors.map(e => e.error?.message) }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          notification: results[0]?.data?.[0],
          event: results[1]?.data?.[0]
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});