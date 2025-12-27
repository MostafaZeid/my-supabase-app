-- إضافة نظام Audit Trail شامل لتتبع جميع الأنشطة والتغييرات
-- هذا النظام يوفر تتبع كامل لجميع العمليات بدون تعديل الجداول الموجودة

-- جدول سجل التدقيق الرئيسي
CREATE TABLE IF NOT EXISTS public.audit_logs_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    
    -- معلومات المستخدم
    actor_user_id UUID NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    
    -- معلومات العملية
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'submit', 'archive', etc.
    entity_type TEXT NOT NULL, -- 'project', 'deliverable', 'review', 'message', 'user', etc.
    entity_id UUID,
    entity_name TEXT,
    
    -- تفاصيل التغيير
    description TEXT NOT NULL,
    changes JSONB DEFAULT '{}', -- البيانات القديمة والجديدة
    
    -- السياق الإضافي
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- التصنيف والأهمية
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'security', 'data', 'workflow', 'system')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إحصائيات الأنشطة (للتحليلات السريعة)
CREATE TABLE IF NOT EXISTS public.activity_statistics_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    
    -- الفترة الزمنية
    date_period DATE NOT NULL,
    period_type TEXT DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    
    -- إحصائيات العمليات
    total_activities INTEGER DEFAULT 0,
    create_count INTEGER DEFAULT 0,
    update_count INTEGER DEFAULT 0,
    delete_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    
    -- إحصائيات المستخدمين
    active_users_count INTEGER DEFAULT 0,
    most_active_user_id UUID,
    most_active_user_name TEXT,
    
    -- إحصائيات الكيانات
    deliverables_modified INTEGER DEFAULT 0,
    reviews_completed INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لمنع التكرار
    UNIQUE(project_id, date_period, period_type)
);

-- جدول تتبع الجلسات (لتحليل سلوك المستخدمين)
CREATE TABLE IF NOT EXISTS public.user_sessions_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- معلومات الجلسة
    session_id TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- أوقات الجلسة
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- إحصائيات الجلسة
    actions_count INTEGER DEFAULT 0,
    pages_visited JSONB DEFAULT '[]',
    features_used JSONB DEFAULT '[]',
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تتبع الأخطاء والمشاكل
CREATE TABLE IF NOT EXISTS public.system_errors_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    user_id UUID,
    
    -- معلومات الخطأ
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_code TEXT,
    stack_trace TEXT,
    
    -- السياق
    page_url TEXT,
    user_action TEXT,
    browser_info JSONB DEFAULT '{}',
    
    -- الحالة
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'ignored')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id 
ON public.audit_logs_2025_12_15_23_00(project_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor 
ON public.audit_logs_2025_12_15_23_00(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON public.audit_logs_2025_12_15_23_00(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON public.audit_logs_2025_12_15_23_00(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs_2025_12_15_23_00(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category_severity 
ON public.audit_logs_2025_12_15_23_00(category, severity);

CREATE INDEX IF NOT EXISTS idx_activity_statistics_project_date 
ON public.activity_statistics_2025_12_15_23_00(project_id, date_period);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_project 
ON public.user_sessions_2025_12_15_23_00(user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_system_errors_status 
ON public.system_errors_2025_12_15_23_00(status, created_at);

-- إضافة RLS policies
ALTER TABLE public.audit_logs_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_statistics_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_errors_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;

-- Policies لسجل التدقيق
CREATE POLICY "view_audit_logs" ON public.audit_logs_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_audit_logs" ON public.audit_logs_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policies للإحصائيات
CREATE POLICY "view_activity_statistics" ON public.activity_statistics_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_activity_statistics" ON public.activity_statistics_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_activity_statistics" ON public.activity_statistics_2025_12_15_23_00 FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policies للجلسات
CREATE POLICY "view_user_sessions" ON public.user_sessions_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_user_sessions" ON public.user_sessions_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_user_sessions" ON public.user_sessions_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies للأخطاء
CREATE POLICY "view_system_errors" ON public.system_errors_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_system_errors" ON public.system_errors_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- إضافة triggers لتحديث updated_at
CREATE OR REPLACE FUNCTION update_activity_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_statistics_updated_at_trigger
    BEFORE UPDATE ON public.activity_statistics_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_statistics_updated_at();