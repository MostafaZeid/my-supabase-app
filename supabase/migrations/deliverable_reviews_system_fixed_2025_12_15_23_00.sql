-- إضافة نظام المراجعة والاعتماد للمخرجات (مُصحح)
-- هذا النظام يضيف workflow متكامل للمراجعة بدون تعديل الجداول الموجودة

-- جدول المراجعات
CREATE TABLE IF NOT EXISTS public.deliverable_reviews_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL,
    version_id UUID, -- ربط بإصدار معين من المخرج
    reviewer_user_id UUID NOT NULL,
    submitter_user_id UUID NOT NULL,
    
    -- معلومات المراجعة
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- التواريخ
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_due_date TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- حالة المراجعة
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'changes_requested', 'rejected')),
    
    -- القرار النهائي
    decision TEXT CHECK (decision IN ('approved', 'changes_requested', 'rejected')),
    decision_notes TEXT,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تعليقات المراجعة
CREATE TABLE IF NOT EXISTS public.review_comments_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.deliverable_reviews_2025_12_15_23_00(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL,
    
    -- نوع التعليق
    comment_type TEXT DEFAULT 'note' CHECK (comment_type IN ('note', 'change_request', 'response', 'approval_note')),
    
    -- محتوى التعليق
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- هل التعليق داخلي أم يراه العميل
    
    -- مرفقات
    attachments JSONB DEFAULT '[]',
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تتبع حالة المخرجات (إضافة للنظام الموجود)
CREATE TABLE IF NOT EXISTS public.deliverable_status_history_2025_12_15_23_00 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deliverable_id UUID NOT NULL,
    
    -- الحالة
    old_status TEXT,
    new_status TEXT NOT NULL,
    
    -- من قام بالتغيير
    changed_by UUID NOT NULL,
    change_reason TEXT,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_deliverable_reviews_deliverable_id 
ON public.deliverable_reviews_2025_12_15_23_00(deliverable_id);

CREATE INDEX IF NOT EXISTS idx_deliverable_reviews_reviewer 
ON public.deliverable_reviews_2025_12_15_23_00(reviewer_user_id);

CREATE INDEX IF NOT EXISTS idx_deliverable_reviews_status 
ON public.deliverable_reviews_2025_12_15_23_00(status);

CREATE INDEX IF NOT EXISTS idx_review_comments_review_id 
ON public.review_comments_2025_12_15_23_00(review_id);

CREATE INDEX IF NOT EXISTS idx_deliverable_status_history_deliverable_id 
ON public.deliverable_status_history_2025_12_15_23_00(deliverable_id);

-- إضافة RLS policies
ALTER TABLE public.deliverable_reviews_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_status_history_2025_12_15_23_00 ENABLE ROW LEVEL SECURITY;

-- Policies للمراجعات
CREATE POLICY "view_deliverable_reviews" ON public.deliverable_reviews_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_deliverable_reviews" ON public.deliverable_reviews_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_deliverable_reviews" ON public.deliverable_reviews_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = reviewer_user_id OR auth.uid() = submitter_user_id);

-- Policies للتعليقات
CREATE POLICY "view_review_comments" ON public.review_comments_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_review_comments" ON public.review_comments_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_review_comments" ON public.review_comments_2025_12_15_23_00 FOR UPDATE 
USING (auth.uid() = author_user_id);

-- Policies لتاريخ الحالة
CREATE POLICY "view_deliverable_status_history" ON public.deliverable_status_history_2025_12_15_23_00 FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "insert_deliverable_status_history" ON public.deliverable_status_history_2025_12_15_23_00 FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- إضافة بيانات تجريبية للمراجعات
INSERT INTO public.deliverable_reviews_2025_12_15_23_00 (
    deliverable_id,
    version_id,
    reviewer_user_id,
    submitter_user_id,
    title,
    description,
    priority,
    review_due_date,
    status,
    decision,
    decision_notes
) VALUES 
-- مراجعة معتمدة
('11111111-1111-1111-1111-111111111111', gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 
 'مراجعة تصميم واجهة المستخدم - الإصدار 3', 'مراجعة شاملة للتصميم النهائي مع التركيز على تجربة المستخدم', 'high', 
 NOW() + INTERVAL '3 days', 'approved', 'approved', 'التصميم ممتاز ويلبي جميع المتطلبات. معتمد للتنفيذ.'),

-- مراجعة تتطلب تعديلات
('22222222-2222-2222-2222-222222222222', gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
 'مراجعة مخطط قاعدة البيانات - الإصدار 2', 'مراجعة فنية لمخطط قاعدة البيانات والعلاقات', 'medium',
 NOW() + INTERVAL '2 days', 'changes_requested', 'changes_requested', 'يحتاج إلى إضافة فهارس للأداء وتحسين بعض العلاقات.'),

-- مراجعة قيد المراجعة
('33333333-3333-3333-3333-333333333333', NULL, '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
 'مراجعة دليل المستخدم', 'مراجعة محتوى ودقة دليل المستخدم', 'medium',
 NOW() + INTERVAL '5 days', 'in_review', NULL, NULL);

-- إضافة تاريخ تغيير الحالات
INSERT INTO public.deliverable_status_history_2025_12_15_23_00 (
    deliverable_id,
    old_status,
    new_status,
    changed_by,
    change_reason
) VALUES 
('11111111-1111-1111-1111-111111111111', 'in_progress', 'submitted', '22222222-2222-2222-2222-222222222222', 'تم إكمال التصميم وتسليمه للمراجعة'),
('11111111-1111-1111-1111-111111111111', 'submitted', 'approved', '33333333-3333-3333-3333-333333333333', 'تم اعتماد التصميم بعد المراجعة'),
('22222222-2222-2222-2222-222222222222', 'in_progress', 'submitted', '11111111-1111-1111-1111-111111111111', 'تم إكمال مخطط قاعدة البيانات'),
('22222222-2222-2222-2222-222222222222', 'submitted', 'changes_requested', '44444444-4444-4444-4444-444444444444', 'طلب تعديلات على المخطط');

-- إضافة triggers لتحديث updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliverable_reviews_updated_at_trigger
    BEFORE UPDATE ON public.deliverable_reviews_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

CREATE TRIGGER update_review_comments_updated_at_trigger
    BEFORE UPDATE ON public.review_comments_2025_12_15_23_00
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();