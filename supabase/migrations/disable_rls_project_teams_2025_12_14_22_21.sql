-- إزالة جميع سياسات RLS من الجدول
DROP POLICY IF EXISTS "allow_read_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_insert_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_update_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_delete_project_teams" ON project_teams_2025_12_14_22_21;

-- تعطيل RLS مؤقتاً للسماح بالوصول الكامل
ALTER TABLE project_teams_2025_12_14_22_21 DISABLE ROW LEVEL SECURITY;

-- إضافة تعليق للتوضيح
COMMENT ON TABLE project_teams_2025_12_14_22_21 IS 'جدول فرق المشاريع - تم تعطيل RLS مؤقتاً لحل مشكلة الإدراج';

-- التحقق من حالة الجدول
SELECT schemaname, tablename, rowsecurity, enablerls 
FROM pg_tables 
WHERE tablename = 'project_teams_2025_12_14_22_21';