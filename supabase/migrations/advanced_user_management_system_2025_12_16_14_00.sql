-- Advanced User Management System
-- Based on user requirements for self-signup and admin-created users
-- Current time: 2025-12-16 14:00 UTC

-- User Status Enum
CREATE TYPE user_status_enum AS ENUM (
    'PENDING_APPROVAL',
    'INVITED', 
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED'
);

-- User Registration Requests table
CREATE TABLE IF NOT EXISTS public.user_registration_requests_2025_12_16_14_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255),
    requested_role VARCHAR(50) NOT NULL CHECK (requested_role IN ('main_client', 'sub_client')),
    registration_reason TEXT,
    status user_status_enum DEFAULT 'PENDING_APPROVAL',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_user_id UUID,
    rejection_reason TEXT,
    activation_token VARCHAR(255),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Extended table (enhanced user management)
CREATE TABLE IF NOT EXISTS public.user_profiles_extended_2025_12_16_14_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'project_manager', 'project_consultant', 'main_client', 'sub_client')),
    status user_status_enum DEFAULT 'ACTIVE',
    created_by_user_id UUID,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    profile_picture_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Invitations table (for admin-created users)
CREATE TABLE IF NOT EXISTS public.user_invitations_2025_12_16_14_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'project_manager', 'project_consultant', 'main_client', 'sub_client')),
    invited_by_user_id UUID NOT NULL,
    invitation_token VARCHAR(255) NOT NULL UNIQUE,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT' CHECK (status IN ('SENT', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    message_to_user TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Log table
CREATE TABLE IF NOT EXISTS public.user_activity_log_2025_12_16_14_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_registration_requests_email ON public.user_registration_requests_2025_12_16_14_00(email);
CREATE INDEX IF NOT EXISTS idx_user_registration_requests_status ON public.user_registration_requests_2025_12_16_14_00(status);
CREATE INDEX IF NOT EXISTS idx_user_registration_requests_submitted_at ON public.user_registration_requests_2025_12_16_14_00(submitted_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON public.user_profiles_extended_2025_12_16_14_00(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_email ON public.user_profiles_extended_2025_12_16_14_00(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_role ON public.user_profiles_extended_2025_12_16_14_00(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_status ON public.user_profiles_extended_2025_12_16_14_00(status);

CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON public.user_invitations_2025_12_16_14_00(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON public.user_invitations_2025_12_16_14_00(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON public.user_invitations_2025_12_16_14_00(status);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log_2025_12_16_14_00(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log_2025_12_16_14_00(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log_2025_12_16_14_00(created_at);

-- RLS Policies for user registration requests
ALTER TABLE public.user_registration_requests_2025_12_16_14_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit registration requests" ON public.user_registration_requests_2025_12_16_14_00
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own registration requests" ON public.user_registration_requests_2025_12_16_14_00
    FOR SELECT USING (email = auth.email());

CREATE POLICY "Admins can view all registration requests" ON public.user_registration_requests_2025_12_16_14_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_extended_2025_12_16_14_00 
            WHERE user_id::text = auth.uid()::text 
            AND role IN ('system_admin', 'project_manager')
        )
    );

-- RLS Policies for user profiles extended
ALTER TABLE public.user_profiles_extended_2025_12_16_14_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles_extended_2025_12_16_14_00
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles_extended_2025_12_16_14_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_extended_2025_12_16_14_00 up
            WHERE up.user_id::text = auth.uid()::text 
            AND up.role IN ('system_admin', 'project_manager')
        )
    );

CREATE POLICY "Users can update their own profile" ON public.user_profiles_extended_2025_12_16_14_00
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- RLS Policies for user invitations
ALTER TABLE public.user_invitations_2025_12_16_14_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" ON public.user_invitations_2025_12_16_14_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_extended_2025_12_16_14_00 
            WHERE user_id::text = auth.uid()::text 
            AND role IN ('system_admin', 'project_manager')
        )
    );

CREATE POLICY "Users can view invitations sent to them" ON public.user_invitations_2025_12_16_14_00
    FOR SELECT USING (email = auth.email());

-- RLS Policies for user activity log
ALTER TABLE public.user_activity_log_2025_12_16_14_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON public.user_activity_log_2025_12_16_14_00
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all activity" ON public.user_activity_log_2025_12_16_14_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_extended_2025_12_16_14_00 
            WHERE user_id::text = auth.uid()::text 
            AND role IN ('system_admin', 'project_manager')
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_user_registration_requests_updated_at 
    BEFORE UPDATE ON public.user_registration_requests_2025_12_16_14_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_extended_updated_at 
    BEFORE UPDATE ON public.user_profiles_extended_2025_12_16_14_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_invitations_updated_at 
    BEFORE UPDATE ON public.user_invitations_2025_12_16_14_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for user registration requests
INSERT INTO public.user_registration_requests_2025_12_16_14_00 (email, full_name, phone, organization, requested_role, registration_reason, status) VALUES
('ahmed.client@example.com', 'أحمد محمد العتيبي', '+966501234567', 'شركة العتيبي للاستشارات', 'main_client', 'أحتاج للوصول إلى منصة إدارة المشاريع لمتابعة مشاريع الشركة', 'PENDING_APPROVAL'),
('sara.subclient@example.com', 'سارة أحمد الزهراني', '+966507654321', 'مؤسسة الزهراني التجارية', 'sub_client', 'أرغب في الحصول على صلاحية للاطلاع على تقارير المشاريع', 'PENDING_APPROVAL'),
('omar.client@example.com', 'عمر سعد القحطاني', '+966509876543', 'مجموعة القحطاني', 'main_client', 'نحتاج لإدارة مشاريع متعددة من خلال المنصة', 'PENDING_APPROVAL');

-- Sample data for user profiles extended (existing users)
INSERT INTO public.user_profiles_extended_2025_12_16_14_00 (user_id, email, full_name, role, status, created_by_user_id) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@system.com', 'محمد رشاد - مدير النظام', 'system_admin', 'ACTIVE', NULL),
('22222222-2222-2222-2222-222222222222', 'manager@project.com', 'أحمد سالم - مدير المشروع', 'project_manager', 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
('33333333-3333-3333-3333-333333333333', 'consultant@project.com', 'فاطمة علي - مستشار المشروع', 'project_consultant', 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'main@client.com', 'خالد منصور - عميل رئيسي', 'main_client', 'ACTIVE', '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', 'sub@client.com', 'نورا أحمد - عميل فرعي', 'sub_client', 'ACTIVE', '44444444-4444-4444-4444-444444444444');

-- Sample data for user invitations
INSERT INTO public.user_invitations_2025_12_16_14_00 (email, full_name, role, invited_by_user_id, invitation_token, token_expires_at, message_to_user) VALUES
('newconsultant@example.com', 'يوسف عبدالله الشمري', 'project_consultant', '11111111-1111-1111-1111-111111111111', 'inv_token_123456789', NOW() + INTERVAL '7 days', 'مرحباً بك في منصة إدارة المشاريع. يرجى تفعيل حسابك وتعيين كلمة مرور قوية.'),
('newmanager@example.com', 'ريم سعد الدوسري', 'project_manager', '11111111-1111-1111-1111-111111111111', 'inv_token_987654321', NOW() + INTERVAL '7 days', 'تم دعوتك كمدير مشروع. يرجى إكمال عملية التسجيل.');

-- Sample data for user activity log
INSERT INTO public.user_activity_log_2025_12_16_14_00 (user_id, activity_type, activity_description, metadata) VALUES
('11111111-1111-1111-1111-111111111111', 'LOGIN', 'تسجيل دخول مدير النظام', '{"ip": "192.168.1.1", "device": "Desktop"}'),
('22222222-2222-2222-2222-222222222222', 'PROJECT_CREATED', 'إنشاء مشروع جديد: مشروع التطوير الرقمي', '{"project_id": "proj-123", "project_name": "مشروع التطوير الرقمي"}'),
('33333333-3333-3333-3333-333333333333', 'DELIVERABLE_SUBMITTED', 'تسليم مخرج: التصميم الأولي', '{"deliverable_id": "del-456", "deliverable_name": "التصميم الأولي"}'),
('44444444-4444-4444-4444-444444444444', 'PROFILE_UPDATED', 'تحديث الملف الشخصي', '{"fields_updated": ["phone", "organization"]}');