-- إضافة التعليقات للمراجعات
-- هذا الجزء يضيف التعليقات للمراجعات الموجودة

-- إضافة تعليقات للمراجعات
INSERT INTO public.review_comments_2025_12_15_23_00 (
    review_id,
    author_user_id,
    comment_type,
    content,
    is_internal
) 
SELECT 
    r.id,
    '33333333-3333-3333-3333-333333333333',
    'approval_note',
    'التصميم يتبع أفضل الممارسات في تجربة المستخدم. الألوان متناسقة والتخطيط واضح.',
    false
FROM public.deliverable_reviews_2025_12_15_23_00 r 
WHERE r.title LIKE '%تصميم واجهة المستخدم%'
LIMIT 1;

-- تعليقات للمراجعة الثانية
INSERT INTO public.review_comments_2025_12_15_23_00 (
    review_id,
    author_user_id,
    comment_type,
    content,
    is_internal
) 
SELECT 
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'change_request',
    'يرجى إضافة فهرس على حقل created_at في جدول المشاريع لتحسين الأداء.',
    false
FROM public.deliverable_reviews_2025_12_15_23_00 r 
WHERE r.title LIKE '%مخطط قاعدة البيانات%'
LIMIT 1;

INSERT INTO public.review_comments_2025_12_15_23_00 (
    review_id,
    author_user_id,
    comment_type,
    content,
    is_internal
) 
SELECT 
    r.id,
    '44444444-4444-4444-4444-444444444444',
    'change_request',
    'العلاقة بين جدول العملاء والمشاريع تحتاج إلى مراجعة - يفضل إضافة cascade delete.',
    false
FROM public.deliverable_reviews_2025_12_15_23_00 r 
WHERE r.title LIKE '%مخطط قاعدة البيانات%'
LIMIT 1;

-- رد من المطور
INSERT INTO public.review_comments_2025_12_15_23_00 (
    review_id,
    author_user_id,
    comment_type,
    content,
    is_internal
) 
SELECT 
    r.id,
    '11111111-1111-1111-1111-111111111111',
    'response',
    'شكراً للملاحظات. سأقوم بإضافة الفهارس المطلوبة وتحديث العلاقات في الإصدار القادم.',
    false
FROM public.deliverable_reviews_2025_12_15_23_00 r 
WHERE r.title LIKE '%مخطط قاعدة البيانات%'
LIMIT 1;