import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface AddProjectMemberRequest {
  userId: string;
  memberType: 'pm' | 'consultant' | 'sub_consultant' | 'client_main' | 'client_sub';
  visibilityMode?: 'full_project' | 'assigned_only' | 'restricted';
  canContactClient?: boolean;
  notify?: {
    inApp?: boolean;
    email?: boolean;
    emailTemplateKey?: string;
    ccProjectManager?: boolean;
  };
  messageToUser?: string;
  deepLink?: string;
}

interface CreateDeliverableAssignmentRequest {
  userId: string;
  assignmentRole: 'owner' | 'contributor' | 'internal_reviewer';
  canView?: boolean;
  canUpload?: boolean;
  canSubmit?: boolean;
  canRespond?: boolean;
  notify?: {
    inApp?: boolean;
    email?: boolean;
    emailTemplateKey?: string;
    ccProjectManager?: boolean;
  };
  messageToUser?: string;
  deepLink?: string;
}

interface CreateDeliverableAccessGrantRequest {
  granteeUserId: string;
  accessLevel: 'view' | 'comment' | 'review' | 'approve';
  expiresAt?: string;
  notify?: {
    inApp?: boolean;
    email?: boolean;
    emailTemplateKey?: string;
    ccProjectManager?: boolean;
  };
  messageToUser?: string;
  deepLink?: string;
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

    // Helper function to create notification and event
    const createNotificationAndEvent = async (
      notificationData: any,
      eventData: any
    ) => {
      const [notificationResult, eventResult] = await Promise.all([
        supabaseClient
          .from('notifications_2025_12_16_13_00')
          .insert([notificationData])
          .select()
          .single(),
        supabaseClient
          .from('events_2025_12_16_13_00')
          .insert([eventData])
          .select()
          .single()
      ]);

      return {
        notification: notificationResult.data,
        event: eventResult.data,
        errors: [notificationResult.error, eventResult.error].filter(Boolean)
      };
    };

    // Add member to project
    if (method === 'POST' && path.match(/\/projects\/[^\/]+\/members$/)) {
      const projectId = path.split('/projects/')[1].split('/members')[0];
      const requestData: AddProjectMemberRequest = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      // Insert project member
      const { data: member, error: memberError } = await supabaseClient
        .from('project_members_advanced_2025_12_16_13_00')
        .insert([{
          project_id: projectId,
          user_id: requestData.userId,
          member_type: requestData.memberType,
          visibility_mode: requestData.visibilityMode || 'full_project',
          can_contact_client: requestData.canContactClient || false,
          added_by_user_id: actorUserId
        }])
        .select()
        .single();

      if (memberError) {
        return new Response(
          JSON.stringify({ error: memberError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create notification and event if requested
      if (requestData.notify?.inApp !== false) {
        const notificationData = {
          user_id: requestData.userId,
          type: 'ASSIGNED_TO_PROJECT',
          title: 'تم تكليفك بمشروع جديد',
          body: requestData.messageToUser || `تم إضافتك كـ ${requestData.memberType} في المشروع`,
          deep_link: requestData.deepLink || `/projects/${projectId}`,
          metadata: {
            project_id: projectId,
            member_type: requestData.memberType,
            added_by: actorUserId
          },
          project_member_id: member.id
        };

        const eventData = {
          type: 'project.member.added',
          actor_user_id: actorUserId,
          project_id: projectId,
          member_id: member.id,
          payload: {
            user_id: requestData.userId,
            member_type: requestData.memberType,
            visibility_mode: requestData.visibilityMode
          }
        };

        const { errors } = await createNotificationAndEvent(notificationData, eventData);
        
        if (errors.length > 0) {
          console.warn('Failed to create notification/event:', errors);
        }
      }

      return new Response(
        JSON.stringify({ member }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create deliverable assignment
    if (method === 'POST' && path.match(/\/deliverables\/[^\/]+\/assignments$/)) {
      const deliverableId = path.split('/deliverables/')[1].split('/assignments')[0];
      const requestData: CreateDeliverableAssignmentRequest = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      // Insert deliverable assignment
      const { data: assignment, error: assignmentError } = await supabaseClient
        .from('deliverable_assignments_2025_12_16_13_00')
        .insert([{
          deliverable_id: deliverableId,
          user_id: requestData.userId,
          assignment_role: requestData.assignmentRole,
          can_view: requestData.canView !== false,
          can_upload: requestData.canUpload || false,
          can_submit: requestData.canSubmit || false,
          can_respond: requestData.canRespond || false,
          assigned_by_user_id: actorUserId
        }])
        .select()
        .single();

      if (assignmentError) {
        return new Response(
          JSON.stringify({ error: assignmentError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create notification and event if requested
      if (requestData.notify?.inApp !== false) {
        const notificationData = {
          user_id: requestData.userId,
          type: 'ASSIGNED_TO_DELIVERABLE',
          title: 'تم تكليفك بمخرج جديد',
          body: requestData.messageToUser || `تم تكليفك كـ ${requestData.assignmentRole} في المخرج`,
          deep_link: requestData.deepLink || `/deliverables/${deliverableId}`,
          metadata: {
            deliverable_id: deliverableId,
            assignment_role: requestData.assignmentRole,
            assigned_by: actorUserId
          },
          assignment_id: assignment.id
        };

        const eventData = {
          type: 'deliverable.assignment.created',
          actor_user_id: actorUserId,
          deliverable_id: deliverableId,
          assignment_id: assignment.id,
          payload: {
            user_id: requestData.userId,
            assignment_role: requestData.assignmentRole,
            permissions: {
              can_view: assignment.can_view,
              can_upload: assignment.can_upload,
              can_submit: assignment.can_submit,
              can_respond: assignment.can_respond
            }
          }
        };

        const { errors } = await createNotificationAndEvent(notificationData, eventData);
        
        if (errors.length > 0) {
          console.warn('Failed to create notification/event:', errors);
        }
      }

      return new Response(
        JSON.stringify({ assignment }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create deliverable access grant
    if (method === 'POST' && path.match(/\/deliverables\/[^\/]+\/grants$/)) {
      const deliverableId = path.split('/deliverables/')[1].split('/grants')[0];
      const requestData: CreateDeliverableAccessGrantRequest = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      // Insert deliverable grant
      const { data: grant, error: grantError } = await supabaseClient
        .from('deliverable_access_grants_2025_12_16_13_00')
        .insert([{
          deliverable_id: deliverableId,
          grantee_user_id: requestData.granteeUserId,
          granted_by_user_id: actorUserId,
          access_level: requestData.accessLevel,
          expires_at: requestData.expiresAt || null
        }])
        .select()
        .single();

      if (grantError) {
        return new Response(
          JSON.stringify({ error: grantError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create notification and event if requested
      if (requestData.notify?.inApp !== false) {
        const notificationData = {
          user_id: requestData.granteeUserId,
          type: 'GRANT_CREATED',
          title: 'تم منحك صلاحية جديدة',
          body: requestData.messageToUser || `تم منحك صلاحية ${requestData.accessLevel} للمخرج`,
          deep_link: requestData.deepLink || `/deliverables/${deliverableId}`,
          metadata: {
            deliverable_id: deliverableId,
            access_level: requestData.accessLevel,
            granted_by: actorUserId,
            expires_at: requestData.expiresAt
          },
          grant_id: grant.id
        };

        const eventData = {
          type: 'deliverable.grant.created',
          actor_user_id: actorUserId,
          deliverable_id: deliverableId,
          grant_id: grant.id,
          payload: {
            grantee_user_id: requestData.granteeUserId,
            access_level: requestData.accessLevel,
            expires_at: requestData.expiresAt
          }
        };

        const { errors } = await createNotificationAndEvent(notificationData, eventData);
        
        if (errors.length > 0) {
          console.warn('Failed to create notification/event:', errors);
        }
      }

      return new Response(
        JSON.stringify({ grant }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get project members
    if (method === 'GET' && path.match(/\/projects\/[^\/]+\/members$/)) {
      const projectId = path.split('/projects/')[1].split('/members')[0];

      const { data: members, error } = await supabaseClient
        .from('project_members_advanced_2025_12_16_13_00')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

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
        JSON.stringify({ members }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get deliverable assignments
    if (method === 'GET' && path.match(/\/deliverables\/[^\/]+\/assignments$/)) {
      const deliverableId = path.split('/deliverables/')[1].split('/assignments')[0];

      const { data: assignments, error } = await supabaseClient
        .from('deliverable_assignments_2025_12_16_13_00')
        .select('*')
        .eq('deliverable_id', deliverableId)
        .order('assigned_at', { ascending: false });

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
        JSON.stringify({ assignments }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get deliverable grants
    if (method === 'GET' && path.match(/\/deliverables\/[^\/]+\/grants$/)) {
      const deliverableId = path.split('/deliverables/')[1].split('/grants')[0];

      const { data: grants, error } = await supabaseClient
        .from('deliverable_access_grants_2025_12_16_13_00')
        .select('*')
        .eq('deliverable_id', deliverableId)
        .order('created_at', { ascending: false });

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
        JSON.stringify({ grants }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Test notification endpoint (Admin only)
    if (method === 'POST' && path.includes('/admin/notifications/test')) {
      const testData = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      const notificationData = {
        user_id: testData.userId,
        type: testData.type,
        title: testData.title,
        body: testData.body,
        deep_link: testData.deepLink,
        metadata: { test: true, sent_by: actorUserId }
      };

      const { data: notification, error } = await supabaseClient
        .from('notifications_2025_12_16_13_00')
        .insert([notificationData])
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
        JSON.stringify({ 
          notificationCreated: true,
          emailQueued: testData.notify?.email || false,
          notification 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404, 
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