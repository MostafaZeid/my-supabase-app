-- حذف السياسات القديمة
DROP POLICY IF EXISTS "view_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "insert_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "update_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "delete_project_teams" ON project_teams_2025_12_14_22_21;

-- إنشاء سياسات RLS مبسطة وأكثر مرونة

-- سياسة القراءة: السماح لجميع المستخدمين المصادق عليهم
CREATE POLICY "allow_read_project_teams" ON project_teams_2025_12_14_22_21 FOR SELECT 
USING (auth.role() = 'authenticated');

-- سياسة الإدراج: السماح لجميع المستخدمين المصادق عليهم
CREATE POLICY "allow_insert_project_teams" ON project_teams_2025_12_14_22_21 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- سياسة التحديث: السماح لجميع المستخدمين المصادق عليهم
CREATE POLICY "allow_update_project_teams" ON project_teams_2025_12_14_22_21 FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- سياسة الحذف: السماح لجميع المستخدمين المصادق عليهم
CREATE POLICY "allow_delete_project_teams" ON project_teams_2025_12_14_22_21 FOR DELETE 
USING (auth.role() = 'authenticated');

-- التأكد من تفعيل RLS
ALTER TABLE project_teams_2025_12_14_22_21 ENABLE ROW LEVEL SECURITY;

-- إضافة تعليق للتوضيح
COMMENT ON TABLE project_teams_2025_12_14_22_21 IS 'جدول فرق المشاريع مع سياسات RLS مبسطة للسماح بالوصول لجميع المستخدمين المصادق عليهم';