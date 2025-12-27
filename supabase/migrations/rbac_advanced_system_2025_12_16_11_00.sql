-- إضافة نظام RBAC متقدم مع الأدوار والصلاحيات المفصلة
-- هذا النظام يوفر تحكم دقيق في الصلاحيات بدون تعديل النظام الحالي

-- جدول الأدوار المتقدمة
CREATE TABLE IF NOT EXISTS public.rbac_roles_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL CHECK (code IN (
        'SYSTEM_ADMIN',
        'PROJECT_MANAGER', 
        'CONSULTANT',
        'SUB_CONSULTANT',
        'CLIENT_MAIN',
        'CLIENT_SUB'
    )),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول فئات الصلاحيات
CREATE TABLE IF NOT EXISTS public.rbac_permission_categories_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL CHECK (code IN (
        'org_system',
        'clients',
        'projects',
        'deliverables',
        'versions',
        'workflow_reviews',
        'reopen',
        'grants',
        'messaging',
        'meetings',
        'reports_audit',
        'files'
    )),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الصلاحيات المفصلة
CREATE TABLE IF NOT EXISTS public.rbac_permissions_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    category_code TEXT NOT NULL REFERENCES public.rbac_permission_categories_2025_12_16_11_00(code),
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS public.rbac_role_permissions_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code TEXT NOT NULL REFERENCES public.rbac_roles_2025_12_16_11_00(code),
    permission_code TEXT NOT NULL REFERENCES public.rbac_permissions_2025_12_16_11_00(code),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID,
    
    -- فهرس فريد لمنع التكرار
    UNIQUE(role_code, permission_code)
);

-- جدول صلاحيات المستخدمين المخصصة (إضافية أو استثناءات)
CREATE TABLE IF NOT EXISTS public.rbac_user_permissions_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    permission_code TEXT NOT NULL REFERENCES public.rbac_permissions_2025_12_16_11_00(code),
    
    -- نوع الصلاحية: grant (منح إضافي) أو deny (منع)
    grant_type TEXT DEFAULT 'grant' CHECK (grant_type IN ('grant', 'deny')),
    
    -- السياق (مشروع محدد، عميل محدد، إلخ)
    context_type TEXT, -- 'project', 'client', 'deliverable', etc.
    context_id UUID,
    
    -- صالح حتى
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- من منح هذه الصلاحية
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- معلومات إضافية
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل تغييرات الصلاحيات
CREATE TABLE IF NOT EXISTS public.rbac_permission_audit_2025_12_16_11_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- المستخدم المتأثر
    target_user_id UUID,
    target_role_code TEXT,
    
    -- الصلاحية
    permission_code TEXT NOT NULL,
    
    -- العملية
    action TEXT NOT NULL CHECK (action IN ('grant', 'revoke', 'update')),
    
    -- السياق
    context_type TEXT,
    context_id UUID,
    
    -- من قام بالتغيير
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- التفاصيل
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_rbac_role_permissions_role 
ON public.rbac_role_permissions_2025_12_16_11_00(role_code);

CREATE INDEX IF NOT EXISTS idx_rbac_role_permissions_permission 
ON public.rbac_role_permissions_2025_12_16_11_00(permission_code);

CREATE INDEX IF NOT EXISTS idx_rbac_user_permissions_user 
ON public.rbac_user_permissions_2025_12_16_11_00(user_id);

CREATE INDEX IF NOT EXISTS idx_rbac_user_permissions_context 
ON public.rbac_user_permissions_2025_12_16_11_00(context_type, context_id);

CREATE INDEX IF NOT EXISTS idx_rbac_permission_audit_target 
ON public.rbac_permission_audit_2025_12_16_11_00(target_user_id);

CREATE INDEX IF NOT EXISTS idx_rbac_permission_audit_changed_by 
ON public.rbac_permission_audit_2025_12_16_11_00(changed_by);

-- إضافة RLS policies
ALTER TABLE public.rbac_roles_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_permission_categories_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_permissions_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_role_permissions_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_user_permissions_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_permission_audit_2025_12_16_11_00 ENABLE ROW LEVEL SECURITY;

-- Policies للقراءة (جميع المستخدمين المصادق عليهم)
CREATE POLICY "view_rbac_roles" ON public.rbac_roles_2025_12_16_11_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "view_rbac_categories" ON public.rbac_permission_categories_2025_12_16_11_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "view_rbac_permissions" ON public.rbac_permissions_2025_12_16_11_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "view_rbac_role_permissions" ON public.rbac_role_permissions_2025_12_16_11_00 FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policies للكتابة (المديرون فقط)
CREATE POLICY "manage_rbac_roles" ON public.rbac_roles_2025_12_16_11_00 FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "manage_rbac_permissions" ON public.rbac_permissions_2025_12_16_11_00 FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "manage_rbac_role_permissions" ON public.rbac_role_permissions_2025_12_16_11_00 FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "manage_rbac_user_permissions" ON public.rbac_user_permissions_2025_12_16_11_00 FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "view_rbac_audit" ON public.rbac_permission_audit_2025_12_16_11_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_rbac_audit" ON public.rbac_permission_audit_2025_12_16_11_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- إضافة triggers لتحديث updated_at
CREATE OR REPLACE FUNCTION update_rbac_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rbac_roles_updated_at_trigger
    BEFORE UPDATE ON public.rbac_roles_2025_12_16_11_00
    FOR EACH ROW
    EXECUTE FUNCTION update_rbac_updated_at();

CREATE TRIGGER update_rbac_permissions_updated_at_trigger
    BEFORE UPDATE ON public.rbac_permissions_2025_12_16_11_00
    FOR EACH ROW
    EXECUTE FUNCTION update_rbac_updated_at();