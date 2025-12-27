-- إضافة نظام الرسائل والتواصل للمشاريع
-- هذا النظام يضيف تواصل متقدم بين أعضاء الفريق بدون تعديل الجداول الموجودة

-- جدول الرسائل
CREATE TABLE IF NOT EXISTS public.project_messages_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    sender_user_id UUID NOT NULL,
    recipient_user_id UUID, -- NULL للرسائل العامة للمشروع
    
    -- محتوى الرسالة
    subject TEXT,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'urgent', 'announcement', 'question', 'update', 'issue')),
    
    -- الأولوية
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- الحالة
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    
    -- الرد على رسالة أخرى
    reply_to_message_id UUID REFERENCES public.project_messages_2025_12_15_23_00(id),
    
    -- مرفقات
    attachments JSONB DEFAULT '[]',
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قراءة الرسائل (لتتبع من قرأ الرسالة)
CREATE TABLE IF NOT EXISTS public.message_read_status_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.project_messages_2025_12_15_23_00(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لمنع التكرار
    UNIQUE(message_id, user_id)
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.project_notifications_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- نوع الإشعار
    notification_type TEXT NOT NULL CHECK (notification_type IN ('message', 'mention', 'review', 'deadline', 'assignment', 'update')),
    
    -- محتوى الإشعار
    title TEXT NOT NULL,
    content TEXT,
    
    -- الرابط المرتبط
    related_entity_type TEXT, -- 'message', 'review', 'deliverable', etc.
    related_entity_id UUID,
    
    -- الحالة
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قنوات التواصل (للمناقشات المواضيعية)
CREATE TABLE IF NOT EXISTS public.project_channels_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    
    -- معلومات القناة
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'general' CHECK (channel_type IN ('general', 'announcements', 'technical', 'client', 'team')),
    
    -- الإعدادات
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    -- من أنشأ القناة
    created_by UUID NOT NULL,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول أعضاء القنوات
CREATE TABLE IF NOT EXISTS public.channel_members_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.project_channels_2025_12_15_23_00(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- الدور في القناة
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    
    -- الإعدادات
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لمنع التكرار
    UNIQUE(channel_id, user_id)
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id 
ON public.project_messages_2025_12_15_23_00(project_id);

CREATE INDEX IF NOT EXISTS idx_project_messages_sender 
ON public.project_messages_2025_12_15_23_00(sender_user_id);

CREATE INDEX IF NOT EXISTS idx_project_messages_recipient 
ON public.project_messages_2025_12_15_23_00(recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_project_messages_created_at 
ON public.project_messages_2025_12_15_23_00(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_read_status_user 
ON public.message_read_status_2025_12_15_23_00(user_id);

CREATE INDEX IF NOT EXISTS idx_project_notifications_user 
ON public.project_notifications_2025_12_15_23_00(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_project_channels_project_id 
ON public.project_channels_2025_12_15_23_00(project_id);

-- إضافة RLS policies
ALTER TABLE public.project_messages_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notifications_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_channels_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;

-- Policies للرسائل
CREATE POLICY "view_project_messages" ON public.project_messages_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_project_messages" ON public.project_messages_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_project_messages" ON public.project_messages_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- Policies لحالة القراءة
CREATE POLICY "view_message_read_status" ON public.message_read_status_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_message_read_status" ON public.message_read_status_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies للإشعارات
CREATE POLICY "view_project_notifications" ON public.project_notifications_2025_12_15_23_00 FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "insert_project_notifications" ON public.project_notifications_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_project_notifications" ON public.project_notifications_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies للقنوات
CREATE POLICY "view_project_channels" ON public.project_channels_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_project_channels" ON public.project_channels_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_project_channels" ON public.project_channels_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = created_by);

-- Policies لأعضاء القنوات
CREATE POLICY "view_channel_members" ON public.channel_members_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_channel_members" ON public.channel_members_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- إضافة triggers لتحديث updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_messages_updated_at_trigger
    BEFORE UPDATE ON public.project_messages_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

CREATE TRIGGER update_project_channels_updated_at_trigger
    BEFORE UPDATE ON public.project_channels_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();