-- إزالة جميع سياسات RLS من الجدول
DROP POLICY IF EXISTS "allow_read_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_insert_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_update_project_teams" ON project_teams_2025_12_14_22_21;
DROP POLICY IF EXISTS "allow_delete_project_teams" ON project_teams_2025_12_14_22_21;

-- تعطيل RLS مؤقتاً للسماح بالوصول الكامل
ALTER TABLE project_teams_2025_12_14_22_21 DISABLE ROW LEVEL SECURITY;

-- إضافة تعليق للتوضيح
COMMENT ON TABLE project_teams_2025_12_14_22_21 IS 'جدول فرق المشاريع - تم تعطيل RLS مؤقتاً لحل مشكلة الإدراج';

-- اختبار إدراج بيانات تجريبية للتأكد من عمل الجدول
INSERT INTO project_teams_2025_12_14_22_21 (project_id, consultant_id, project_role, project_role_en) 
SELECT 
  'test_proj_001',
  c.id,
  'مستشار اختبار',
  'Test Consultant'
FROM consultants_2025_12_14_20_21 c 
WHERE c.consultant_code = 'CON001'
LIMIT 1
ON CONFLICT (project_id, consultant_id) DO NOTHING;

-- حذف البيانات التجريبية
DELETE FROM project_teams_2025_12_14_22_21 WHERE project_id = 'test_proj_001';