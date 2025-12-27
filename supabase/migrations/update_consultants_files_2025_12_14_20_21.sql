-- إضافة حقول جديدة لجدول المستشارين
ALTER TABLE consultants_2025_12_14_20_21 
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS cv_document_url TEXT,
ADD COLUMN IF NOT EXISTS cv_document_name TEXT;

-- إضافة تعليقات للحقول الجديدة
COMMENT ON COLUMN consultants_2025_12_14_20_21.profile_image IS 'رابط الصورة الشخصية للمستشار';
COMMENT ON COLUMN consultants_2025_12_14_20_21.cv_document_url IS 'رابط مرفق السيرة الذاتية';
COMMENT ON COLUMN consultants_2025_12_14_20_21.cv_document_name IS 'اسم ملف السيرة الذاتية';

-- تحديث البيانات الموجودة بإضافة روابط وهمية للاختبار
UPDATE consultants_2025_12_14_20_21 
SET 
  profile_image = CASE 
    WHEN email = 'fahad.alsaadi@albayan.com' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    WHEN email = 'mohammed.rashad@albayan.com' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    WHEN email = 'mohammed.joudah@albayan.com' THEN 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    WHEN email = 'marwa.alhamamsi@albayan.com' THEN 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    ELSE NULL
  END,
  cv_document_url = CASE 
    WHEN email LIKE '%@albayan.com' THEN 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    ELSE NULL
  END,
  cv_document_name = CASE 
    WHEN email LIKE '%@albayan.com' THEN 'السيرة_الذاتية_' || REPLACE(full_name, ' ', '_') || '.pdf'
    ELSE NULL
  END
WHERE status = 'active';