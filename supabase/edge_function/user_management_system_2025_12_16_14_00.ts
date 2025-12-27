import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface SelfSignupRequest {
  email: string;
  fullName: string;
  phone?: string;
  organization?: string;
  requestedRole: 'main_client' | 'sub_client';
  registrationReason?: string;
}

interface AdminCreateUserRequest {
  email: string;
  fullName: string;
  role: 'system_admin' | 'project_manager' | 'project_consultant' | 'main_client' | 'sub_client';
  messageToUser?: string;
  sendEmail?: boolean;
}

interface ApproveRegistrationRequest {
  requestId: string;
  approved: boolean;
  rejectionReason?: string;
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

    // Helper function to generate secure token
    const generateSecureToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Helper function to create notification
    const createNotification = async (userId: string, type: string, title: string, body: string, metadata: any = {}) => {
      const { data, error } = await supabaseClient
        .from('notifications_2025_12_16_13_00')
        .insert([{
          user_id: userId,
          type: type,
          title: title,
          body: body,
          metadata: metadata
        }])
        .select()
        .single();

      return { data, error };
    };

    // Helper function to log user activity
    const logUserActivity = async (userId: string, activityType: string, description: string, metadata: any = {}) => {
      const { data, error } = await supabaseClient
        .from('user_activity_log_2025_12_16_14_00')
        .insert([{
          user_id: userId,
          activity_type: activityType,
          activity_description: description,
          metadata: metadata
        }]);

      return { data, error };
    };

    // Self-signup endpoint (for clients)
    if (method === 'POST' && path.includes('/auth/self-signup')) {
      const requestData: SelfSignupRequest = await req.json();

      // Validate required fields
      if (!requestData.email || !requestData.fullName || !requestData.requestedRole) {
        return new Response(
          JSON.stringify({ error: 'البريد الإلكتروني والاسم الكامل والدور مطلوبة' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if email already exists
      const { data: existingRequest } = await supabaseClient
        .from('user_registration_requests_2025_12_16_14_00')
        .select('id')
        .eq('email', requestData.email)
        .single();

      if (existingRequest) {
        return new Response(
          JSON.stringify({ error: 'يوجد طلب تسجيل مسبق بهذا البريد الإلكتروني' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create registration request
      const { data: registrationRequest, error: registrationError } = await supabaseClient
        .from('user_registration_requests_2025_12_16_14_00')
        .insert([{
          email: requestData.email,
          full_name: requestData.fullName,
          phone: requestData.phone,
          organization: requestData.organization,
          requested_role: requestData.requestedRole,
          registration_reason: requestData.registrationReason,
          status: 'PENDING_APPROVAL'
        }])
        .select()
        .single();

      if (registrationError) {
        return new Response(
          JSON.stringify({ error: registrationError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Notify all system admins about new registration request
      const { data: admins } = await supabaseClient
        .from('user_profiles_extended_2025_12_16_14_00')
        .select('user_id')
        .eq('role', 'system_admin')
        .eq('status', 'ACTIVE');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await createNotification(
            admin.user_id,
            'REGISTRATION_REQUEST',
            'طلب تسجيل جديد',
            `طلب تسجيل جديد من ${requestData.fullName} (${requestData.email})`,
            {
              request_id: registrationRequest.id,
              email: requestData.email,
              requested_role: requestData.requestedRole
            }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم استلام طلب التسجيل بنجاح. سيتم مراجعته والرد عليك قريباً.',
          requestId: registrationRequest.id
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Admin create user endpoint
    if (method === 'POST' && path.includes('/admin/users/create')) {
      const requestData: AdminCreateUserRequest = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      // Validate required fields
      if (!requestData.email || !requestData.fullName || !requestData.role) {
        return new Response(
          JSON.stringify({ error: 'البريد الإلكتروني والاسم الكامل والدور مطلوبة' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if email already exists
      const { data: existingUser } = await supabaseClient
        .from('user_profiles_extended_2025_12_16_14_00')
        .select('id')
        .eq('email', requestData.email)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'يوجد مستخدم مسجل بهذا البريد الإلكتروني' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate invitation token
      const invitationToken = generateSecureToken();
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create user invitation
      const { data: invitation, error: invitationError } = await supabaseClient
        .from('user_invitations_2025_12_16_14_00')
        .insert([{
          email: requestData.email,
          full_name: requestData.fullName,
          role: requestData.role,
          invited_by_user_id: actorUserId,
          invitation_token: invitationToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          message_to_user: requestData.messageToUser || 'مرحباً بك في منصة إدارة المشاريع. يرجى تفعيل حسابك وتعيين كلمة مرور قوية.',
          status: 'SENT'
        }])
        .select()
        .single();

      if (invitationError) {
        return new Response(
          JSON.stringify({ error: invitationError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Log activity
      await logUserActivity(
        actorUserId,
        'USER_INVITED',
        `دعوة مستخدم جديد: ${requestData.fullName} (${requestData.email})`,
        {
          invited_email: requestData.email,
          invited_role: requestData.role,
          invitation_id: invitation.id
        }
      );

      // TODO: Send email invitation (integrate with Resend if available)
      const activationLink = `${req.headers.get('origin') || 'https://platform.example.com'}/activate?token=${invitationToken}`;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم إنشاء دعوة المستخدم بنجاح',
          invitation: {
            id: invitation.id,
            email: requestData.email,
            role: requestData.role,
            activationLink: activationLink,
            expiresAt: tokenExpiresAt.toISOString()
          }
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Approve/reject registration request
    if (method === 'PUT' && path.includes('/admin/registration-requests/')) {
      const requestId = path.split('/registration-requests/')[1].split('/')[0];
      const requestData: ApproveRegistrationRequest = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      // Get registration request
      const { data: registrationRequest, error: fetchError } = await supabaseClient
        .from('user_registration_requests_2025_12_16_14_00')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !registrationRequest) {
        return new Response(
          JSON.stringify({ error: 'طلب التسجيل غير موجود' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (requestData.approved) {
        // Approve registration - create invitation
        const invitationToken = generateSecureToken();
        const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const { data: invitation, error: invitationError } = await supabaseClient
          .from('user_invitations_2025_12_16_14_00')
          .insert([{
            email: registrationRequest.email,
            full_name: registrationRequest.full_name,
            role: registrationRequest.requested_role,
            invited_by_user_id: actorUserId,
            invitation_token: invitationToken,
            token_expires_at: tokenExpiresAt.toISOString(),
            message_to_user: 'تم اعتماد طلب التسجيل الخاص بك. يرجى تفعيل حسابك وتعيين كلمة مرور قوية.',
            status: 'SENT'
          }])
          .select()
          .single();

        if (invitationError) {
          return new Response(
            JSON.stringify({ error: invitationError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Update registration request status
        await supabaseClient
          .from('user_registration_requests_2025_12_16_14_00')
          .update({
            status: 'ACTIVE',
            reviewed_at: new Date().toISOString(),
            reviewed_by_user_id: actorUserId,
            activation_token: invitationToken,
            token_expires_at: tokenExpiresAt.toISOString()
          })
          .eq('id', requestId);

        // TODO: Send approval email with activation link
        const activationLink = `${req.headers.get('origin') || 'https://platform.example.com'}/activate?token=${invitationToken}`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'تم اعتماد طلب التسجيل بنجاح',
            activationLink: activationLink
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        // Reject registration
        await supabaseClient
          .from('user_registration_requests_2025_12_16_14_00')
          .update({
            status: 'DEACTIVATED',
            reviewed_at: new Date().toISOString(),
            reviewed_by_user_id: actorUserId,
            rejection_reason: requestData.rejectionReason || 'لم يتم اعتماد الطلب'
          })
          .eq('id', requestId);

        // TODO: Send rejection email
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'تم رفض طلب التسجيل'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get registration requests (Admin only)
    if (method === 'GET' && path.includes('/admin/registration-requests')) {
      const { data: requests, error } = await supabaseClient
        .from('user_registration_requests_2025_12_16_14_00')
        .select('*')
        .order('submitted_at', { ascending: false });

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
        JSON.stringify({ requests }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user invitations (Admin only)
    if (method === 'GET' && path.includes('/admin/invitations')) {
      const { data: invitations, error } = await supabaseClient
        .from('user_invitations_2025_12_16_14_00')
        .select('*')
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
        JSON.stringify({ invitations }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get all users (Admin only)
    if (method === 'GET' && path.includes('/admin/users')) {
      const { data: users, error } = await supabaseClient
        .from('user_profiles_extended_2025_12_16_14_00')
        .select('*')
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
        JSON.stringify({ users }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update user status (Admin only)
    if (method === 'PUT' && path.includes('/admin/users/') && path.includes('/status')) {
      const userId = path.split('/users/')[1].split('/status')[0];
      const { status: newStatus } = await req.json();
      const actorUserId = req.headers.get('x-user-id') || 'system';

      const { data: updatedUser, error } = await supabaseClient
        .from('user_profiles_extended_2025_12_16_14_00')
        .update({ status: newStatus })
        .eq('user_id', userId)
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

      // Log activity
      await logUserActivity(
        actorUserId,
        'USER_STATUS_CHANGED',
        `تغيير حالة المستخدم ${updatedUser.full_name} إلى ${newStatus}`,
        {
          target_user_id: userId,
          old_status: 'ACTIVE', // Would need to fetch old status in real implementation
          new_status: newStatus
        }
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم تحديث حالة المستخدم بنجاح',
          user: updatedUser
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