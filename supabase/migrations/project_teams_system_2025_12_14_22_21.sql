-- إنشاء جدول فرق المشاريع
CREATE TABLE IF NOT EXISTS project_teams_2025_12_14_22_21 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  consultant_id UUID NOT NULL,
  project_role VARCHAR(100) NOT NULL,
  project_role_en VARCHAR(100) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_project_teams_project_id ON project_teams_2025_12_14_22_21(project_id);
CREATE INDEX IF NOT EXISTS idx_project_teams_consultant_id ON project_teams_2025_12_14_22_21(consultant_id);
CREATE INDEX IF NOT EXISTS idx_project_teams_status ON project_teams_2025_12_14_22_21(status);

-- إضافة قيد فريد لمنع تكرار المستشار في نفس المشروع
ALTER TABLE project_teams_2025_12_14_22_21 
ADD CONSTRAINT unique_project_consultant UNIQUE (project_id, consultant_id);

-- إضافة مرجع خارجي للمستشارين
ALTER TABLE project_teams_2025_12_14_22_21 
ADD CONSTRAINT fk_consultant 
FOREIGN KEY (consultant_id) REFERENCES consultants_2025_12_14_20_21(id) ON DELETE CASCADE;

-- إضافة تعليقات للجدول والأعمدة
COMMENT ON TABLE project_teams_2025_12_14_22_21 IS 'جدول فرق المشاريع - ربط المستشارين بالمشاريع مع أدوارهم';
COMMENT ON COLUMN project_teams_2025_12_14_22_21.project_id IS 'معرف المشروع';
COMMENT ON COLUMN project_teams_2025_12_14_22_21.consultant_id IS 'معرف المستشار';
COMMENT ON COLUMN project_teams_2025_12_14_22_21.project_role IS 'دور المستشار في المشروع (عربي)';
COMMENT ON COLUMN project_teams_2025_12_14_22_21.project_role_en IS 'دور المستشار في المشروع (إنجليزي)';

-- إنشاء سياسات RLS
ALTER TABLE project_teams_2025_12_14_22_21 ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: للمستخدمين المصرح لهم
CREATE POLICY "view_project_teams" ON project_teams_2025_12_14_22_21 FOR SELECT 
USING (
  auth.role() = 'authenticated'
);

-- سياسة الإدراج: للمدراء والمستشارين الرئيسيين
CREATE POLICY "insert_project_teams" ON project_teams_2025_12_14_22_21 FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = added_by
);

-- سياسة التحديث: للمدراء والمستشارين الرئيسيين
CREATE POLICY "update_project_teams" ON project_teams_2025_12_14_22_21 FOR UPDATE 
USING (
  auth.role() = 'authenticated'
);

-- سياسة الحذف: للمدراء والمستشارين الرئيسيين
CREATE POLICY "delete_project_teams" ON project_teams_2025_12_14_22_21 FOR DELETE 
USING (
  auth.role() = 'authenticated'
);

-- إدراج بيانات تجريبية
INSERT INTO project_teams_2025_12_14_22_21 (project_id, consultant_id, project_role, project_role_en, added_by) 
SELECT 
  'proj_001',
  c.id,
  CASE 
    WHEN c.consultant_code = 'CON001' THEN 'مستشار رئيسي'
    WHEN c.consultant_code = 'CON002' THEN 'مستشار فرعي'
    ELSE 'مستشار متخصص'
  END,
  CASE 
    WHEN c.consultant_code = 'CON001' THEN 'Lead Consultant'
    WHEN c.consultant_code = 'CON002' THEN 'Sub Consultant'
    ELSE 'Specialist Consultant'
  END,
  (SELECT id FROM auth.users LIMIT 1)
FROM consultants_2025_12_14_20_21 c 
WHERE c.consultant_code IN ('CON001', 'CON002')
ON CONFLICT (project_id, consultant_id) DO NOTHING;