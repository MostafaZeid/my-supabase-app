-- Advanced Notifications System based on OpenAPI specification
-- Current time: 2025-12-16 13:00 UTC

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications_2025_12_16_13_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    deep_link VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS public.events_2025_12_16_13_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    actor_user_id UUID NOT NULL,
    project_id UUID,
    deliverable_id UUID,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification types enum
CREATE TYPE notification_type_enum AS ENUM (
    'SIGNUP_REQUEST_CREATED',
    'SIGNUP_REQUEST_APPROVED', 
    'SIGNUP_REQUEST_REJECTED',
    'USER_INVITED',
    'ASSIGNED_TO_PROJECT',
    'ASSIGNED_TO_DELIVERABLE',
    'GRANT_CREATED',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'DELIVERABLE_SUBMITTED',
    'DELIVERABLE_APPROVED',
    'DELIVERABLE_REJECTED',
    'MEETING_SCHEDULED',
    'MESSAGE_RECEIVED'
);

-- Event types enum
CREATE TYPE event_type_enum AS ENUM (
    'signup.request.created',
    'signup.request.approved',
    'signup.request.rejected',
    'user.invited',
    'project.member.added',
    'deliverable.assignment.created',
    'deliverable.grant.created',
    'project.created',
    'project.updated',
    'deliverable.submitted',
    'deliverable.approved',
    'deliverable.rejected',
    'meeting.scheduled',
    'message.sent'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications_2025_12_16_13_00(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications_2025_12_16_13_00(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications_2025_12_16_13_00(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications_2025_12_16_13_00(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_type ON public.events_2025_12_16_13_00(type);
CREATE INDEX IF NOT EXISTS idx_events_actor_user_id ON public.events_2025_12_16_13_00(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON public.events_2025_12_16_13_00(project_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events_2025_12_16_13_00(created_at DESC);

-- RLS Policies for notifications
ALTER TABLE public.notifications_2025_12_16_13_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications_2025_12_16_13_00
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON public.notifications_2025_12_16_13_00
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for events (admin and project managers can view)
ALTER TABLE public.events_2025_12_16_13_00 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and PMs can view events" ON public.events_2025_12_16_13_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id
        )
    );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications_2025_12_16_13_00
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample notifications data
INSERT INTO public.notifications_2025_12_16_13_00 (user_id, type, title, body, metadata) VALUES
('11111111-1111-1111-1111-111111111111', 'ASSIGNED_TO_PROJECT', 'تم تكليفك بمشروع جديد', 'تم تكليفك بالعمل في مشروع تطوير نظام إدارة المحتوى', '{"project_id": "proj-001", "project_name": "نظام إدارة المحتوى"}'),
('22222222-2222-2222-2222-222222222222', 'DELIVERABLE_SUBMITTED', 'تم تسليم مخرج جديد', 'تم تسليم مخرج التصميم الأولي للمراجعة', '{"deliverable_id": "del-001", "deliverable_name": "التصميم الأولي"}'),
('33333333-3333-3333-3333-333333333333', 'MEETING_SCHEDULED', 'اجتماع مجدول', 'تم جدولة اجتماع مراجعة المشروع غداً الساعة 10 صباحاً', '{"meeting_id": "meet-001", "meeting_time": "2025-12-17T10:00:00Z"}');

-- Sample events data
INSERT INTO public.events_2025_12_16_13_00 (type, actor_user_id, project_id, payload) VALUES
('project.member.added', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '{"member_id": "22222222-2222-2222-2222-222222222222", "role": "consultant"}'),
('deliverable.assignment.created', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '{"assignee_id": "33333333-3333-3333-3333-333333333333", "deliverable_id": "del-001"}'),
('project.created', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '{"project_name": "نظام إدارة المحتوى", "client_id": "55555555-5555-5555-5555-555555555555"}');