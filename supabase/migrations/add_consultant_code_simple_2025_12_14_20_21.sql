-- إضافة حقل كود المستشار
ALTER TABLE consultants_2025_12_14_20_21 
ADD COLUMN IF NOT EXISTS consultant_code VARCHAR(20);

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

-- تحديث باقي المستشارين بأكواد افتراضية
UPDATE consultants_2025_12_14_20_21 
SET consultant_code = 'CON005'
WHERE consultant_code IS NULL AND email LIKE '%@albayan.com';

-- إضافة فهرس للبحث السريع بالكود
CREATE INDEX IF NOT EXISTS idx_consultant_code ON consultants_2025_12_14_20_21(consultant_code);

-- إضافة قيد الفريد للكود
ALTER TABLE consultants_2025_12_14_20_21 
ADD CONSTRAINT unique_consultant_code UNIQUE (consultant_code);

-- إضافة تعليق للحقل الجديد
COMMENT ON COLUMN consultants_2025_12_14_20_21.consultant_code IS 'كود المستشار الفريد للبحث والإضافة للمشاريع';