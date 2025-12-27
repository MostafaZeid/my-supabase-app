-- Advanced Project Membership and Assignments System
-- Based on OpenAPI specification for assignments/grants notifications
-- Current time: 2025-12-16 13:00 UTC

-- Project Members table (enhanced)
CREATE TABLE IF NOT EXISTS public.project_members_advanced_2025_12_16_13_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    member_type VARCHAR(20) NOT NULL CHECK (member_type IN ('pm', 'consultant', 'sub_consultant', 'client_main', 'client_sub')),
    visibility_mode VARCHAR(20) DEFAULT 'full_project' CHECK (visibility_mode IN ('full_project', 'assigned_only', 'restricted')),
    can_contact_client BOOLEAN DEFAULT FALSE,
    added_by_user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Deliverable Assignments table
CREATE TABLE IF NOT EXISTS public.deliverable_assignments_2025_12_16_13_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assignment_role VARCHAR(20) NOT NULL CHECK (assignment_role IN ('owner', 'contributor', 'internal_reviewer')),
    can_view BOOLEAN DEFAULT TRUE,
    can_upload BOOLEAN DEFAULT FALSE,
    can_submit BOOLEAN DEFAULT FALSE,
    can_respond BOOLEAN DEFAULT FALSE,
    assigned_by_user_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deliverable_id, user_id, assignment_role)
);

-- Deliverable Access Grants table (for client sub users)
CREATE TABLE IF NOT EXISTS public.deliverable_access_grants_2025_12_16_13_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL,
    grantee_user_id UUID NOT NULL,
    granted_by_user_id UUID NOT NULL,
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('view', 'comment', 'review', 'approve')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deliverable_id, grantee_user_id)
);

-- Enhanced Notifications table (additional types)
ALTER TABLE public.notifications_2025_12_16_13_00 
ADD COLUMN IF NOT EXISTS assignment_id UUID,
ADD COLUMN IF NOT EXISTS grant_id UUID,
ADD COLUMN IF NOT EXISTS project_member_id UUID;

-- Enhanced Events table (additional types)
ALTER TABLE public.events_2025_12_16_13_00 
ADD COLUMN IF NOT EXISTS assignment_id UUID,
ADD COLUMN IF NOT EXISTS grant_id UUID,
ADD COLUMN IF NOT EXISTS member_id UUID;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members_advanced_2025_12_16_13_00(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members_advanced_2025_12_16_13_00(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_type ON public.project_members_advanced_2025_12_16_13_00(member_type);

CREATE INDEX IF NOT EXISTS idx_deliverable_assignments_deliverable_id ON public.deliverable_assignments_2025_12_16_13_00(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_assignments_user_id ON public.deliverable_assignments_2025_12_16_13_00(user_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_assignments_role ON public.deliverable_assignments_2025_12_16_13_00(assignment_role);

CREATE INDEX IF NOT EXISTS idx_deliverable_grants_deliverable_id ON public.deliverable_access_grants_2025_12_16_13_00(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_grants_grantee_id ON public.deliverable_access_grants_2025_12_16_13_00(grantee_user_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_grants_expires_at ON public.deliverable_access_grants_2025_12_16_13_00(expires_at);

-- RLS Policies for project members
ALTER TABLE public.project_members_advanced_2025_12_16_13_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project members they have access to" ON public.project_members_advanced_2025_12_16_13_00
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR
        EXISTS (
            SELECT 1 FROM public.project_members_advanced_2025_12_16_13_00 pm
            WHERE pm.project_id = project_members_advanced_2025_12_16_13_00.project_id 
            AND pm.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "PMs and Admins can add project members" ON public.project_members_advanced_2025_12_16_13_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id
        )
    );

-- RLS Policies for deliverable assignments
ALTER TABLE public.deliverable_assignments_2025_12_16_13_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments" ON public.deliverable_assignments_2025_12_16_13_00
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "PMs and Admins can create assignments" ON public.deliverable_assignments_2025_12_16_13_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id
        )
    );

-- RLS Policies for deliverable grants
ALTER TABLE public.deliverable_access_grants_2025_12_16_13_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view grants given to them" ON public.deliverable_access_grants_2025_12_16_13_00
    FOR SELECT USING (auth.uid()::text = grantee_user_id::text);

CREATE POLICY "Client mains and admins can create grants" ON public.deliverable_access_grants_2025_12_16_13_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_project_members_updated_at 
    BEFORE UPDATE ON public.project_members_advanced_2025_12_16_13_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverable_assignments_updated_at 
    BEFORE UPDATE ON public.deliverable_assignments_2025_12_16_13_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverable_grants_updated_at 
    BEFORE UPDATE ON public.deliverable_access_grants_2025_12_16_13_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for project members
INSERT INTO public.project_members_advanced_2025_12_16_13_00 (project_id, user_id, member_type, visibility_mode, can_contact_client, added_by_user_id) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'consultant', 'full_project', true, '11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'sub_consultant', 'assigned_only', false, '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'client_main', 'full_project', true, '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'client_sub', 'restricted', false, '44444444-4444-4444-4444-444444444444');

-- Sample data for deliverable assignments
INSERT INTO public.deliverable_assignments_2025_12_16_13_00 (deliverable_id, user_id, assignment_role, can_view, can_upload, can_submit, can_respond, assigned_by_user_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'owner', true, true, true, true, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'contributor', true, true, false, true, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'internal_reviewer', true, false, false, true, '11111111-1111-1111-1111-111111111111');

-- Sample data for deliverable grants
INSERT INTO public.deliverable_access_grants_2025_12_16_13_00 (deliverable_id, grantee_user_id, granted_by_user_id, access_level, expires_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'review', '2025-12-31T23:59:59Z'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'view', NULL);