-- إضافة جدول إدارة الإصدارات للمخرجات
-- هذا الجدول يضيف ميزة جديدة بدون تعديل الجداول الموجودة

CREATE TABLE IF NOT EXISTS public.deliverable_versions_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    change_summary TEXT,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_deliverable_versions_deliverable_id 
ON public.deliverable_versions_2025_12_15_23_00(deliverable_id);

CREATE INDEX IF NOT EXISTS idx_deliverable_versions_current 
ON public.deliverable_versions_2025_12_15_23_00(deliverable_id, is_current) 
WHERE is_current = true;

-- إضافة RLS policies
ALTER TABLE public.deliverable_versions_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;

-- Policy للقراءة - يمكن لأعضاء الفريق رؤية الإصدارات
CREATE POLICY "view_deliverable_versions" ON public.deliverable_versions_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy للإدراج - يمكن للمستخدمين المصادق عليهم إضافة إصدارات
CREATE POLICY "insert_deliverable_versions" ON public.deliverable_versions_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy للتحديث - يمكن للمستخدم الذي رفع الإصدار تحديثه
CREATE POLICY "update_deliverable_versions" ON public.deliverable_versions_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = uploaded_by);

-- إضافة بيانات تجريبية للإصدارات
INSERT INTO public.deliverable_versions_2025_12_15_23_00 (
    deliverable_id, 
    version_number, 
    file_url, 
    file_name, 
    file_size,
    change_summary, 
    uploaded_by
) VALUES 
-- إصدارات للمخرج الأول
('11111111-1111-1111-1111-111111111111', 1, 'https://example.com/files/ui-design-v1.pdf', 'تصميم_واجهة_المستخدم_v1.pdf', 2048576, 'الإصدار الأولي لتصميم واجهة المستخدم', '22222222-2222-2222-2222-222222222222'),
('11111111-1111-1111-1111-111111111111', 2, 'https://example.com/files/ui-design-v2.pdf', 'تصميم_واجهة_المستخدم_v2.pdf', 2359296, 'تحديث الألوان وتحسين التخطيط', '22222222-2222-2222-2222-222222222222'),
('11111111-1111-1111-1111-111111111111', 3, 'https://example.com/files/ui-design-v3.pdf', 'تصميم_واجهة_المستخدم_v3.pdf', 2621440, 'إضافة الشاشات المتجاوبة والتفاعلات', '22222222-2222-2222-2222-222222222222'),

-- إصدارات للمخرج الثاني  
('22222222-2222-2222-2222-222222222222', 1, 'https://example.com/files/database-schema-v1.sql', 'مخطط_قاعدة_البيانات_v1.sql', 1048576, 'المخطط الأولي لقاعدة البيانات', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', 2, 'https://example.com/files/database-schema-v2.sql', 'مخطط_قاعدة_البيانات_v2.sql', 1310720, 'إضافة جداول التدقيق والفهارس', '11111111-1111-1111-1111-111111111111');

-- تحديث الإصدارات السابقة لتكون غير حالية
UPDATE public.deliverable_versions_2025_12_15_23_00 
SET is_current = false 
WHERE deliverable_id = '11111111-1111-1111-1111-111111111111' AND version_number < 3;

UPDATE public.deliverable_versions_2025_12_15_23_00 
SET is_current = false 
WHERE deliverable_id = '22222222-2222-2222-2222-222222222222' AND version_number < 2;

-- إضافة trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_deliverable_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliverable_versions_updated_at_trigger
    BEFORE UPDATE ON public.deliverable_versions_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_deliverable_versions_updated_at();