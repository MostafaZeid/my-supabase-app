-- إضافة حقل كود المستشار
ALTER TABLE consultants_2025_12_14_20_21 
ADD COLUMN IF NOT EXISTS consultant_code VARCHAR(20) UNIQUE;

-- إضافة فهرس للبحث السريع بالكود
CREATE INDEX IF NOT EXISTS idx_consultant_code ON consultants_2025_12_14_20_21(consultant_code);

-- تحديث البيانات الموجودة بأكواد المستشارين
UPDATE consultants_2025_12_14_20_21 
SET consultant_code = CASE 
  WHEN email = 'fahad.alsaadi@albayan.com' THEN 'CON001'
  WHEN email = 'mohammed.rashad@albayan.com' THEN 'CON002'
  WHEN email = 'mohammed.joudah@albayan.com' THEN 'CON003'
  WHEN email = 'marwa.alhamamsi@albayan.com' THEN 'CON004'
  ELSE 'CON' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) + 4 AS TEXT), 3, '0')
END
WHERE consultant_code IS NULL;

-- إضافة تعليق للحقل الجديد
COMMENT ON COLUMN consultants_2025_12_14_20_21.consultant_code IS 'كود المستشار الفريد للبحث والإضافة للمشاريع';

-- إضافة قيد عدم السماح بالقيم الفارغة
ALTER TABLE consultants_2025_12_14_20_21 
ALTER COLUMN consultant_code SET NOT NULL;