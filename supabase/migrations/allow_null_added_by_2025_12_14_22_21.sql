-- جعل عمود added_by يقبل القيم الفارغة
ALTER TABLE project_teams_2025_12_14_22_21 
ALTER COLUMN added_by DROP NOT NULL;

-- إزالة المرجع الخارجي المقيد إذا كان موجوداً
ALTER TABLE project_teams_2025_12_14_22_21 
DROP CONSTRAINT IF EXISTS project_teams_2025_12_14_22_21_added_by_fkey;

-- إضافة مرجع خارجي جديد يسمح بالقيم الفارغة
ALTER TABLE project_teams_2025_12_14_22_21 
ADD CONSTRAINT project_teams_added_by_fkey 
FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- إضافة تعليق للتوضيح
COMMENT ON COLUMN project_teams_2025_12_14_22_21.added_by IS 'معرف المستخدم الذي أضاف العضو - يمكن أن يكون فارغاً';