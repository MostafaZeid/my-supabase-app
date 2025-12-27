-- إضافة حقل كود المستشار
ALTER TABLE consultants_2025_12_14_20_21 
ADD COLUMN IF NOT EXISTS consultant_code VARCHAR(20);

-- إضافة فهرس للبحث السريع بالكود
CREATE INDEX IF NOT EXISTS idx_consultant_code ON consultants_2025_12_14_20_21(consultant_code);

-- تحديث البيانات الموجودة بأكواد المستشارين المحددة
UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON001'
WHERE email = 'fahad.alsaadi@albayan.com';

UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON002'
WHERE email = 'mohammed.rashad@albayan.com';

UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON003'
WHERE email = 'mohammed.joudah@albayan.com';

UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON004'
WHERE email = 'marwa.alhamamsi@albayan.com';

-- تحديث باقي المستشارين بأكواد تسلسلية
UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON' || LPAD(CAST(id::int + 100 AS TEXT), 3, '0')
WHERE consultant_code IS NULL;

-- إضافة قيد الفريد للكود
ALTER TABLE consultants_2025_12_14_20_21 
ADD CONSTRAINT unique_consultant_code UNIQUE (consultant_code);

-- إضافة تعليق للحقل الجديد
COMMENT ON COLUMN consultants_2025_12_14_20_21.consultant_code IS 'كود المستشار الفريد للبحث والإضافة للمشاريع';