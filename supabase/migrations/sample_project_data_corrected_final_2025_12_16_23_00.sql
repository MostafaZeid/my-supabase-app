-- إضافة بيانات تجريبية للمشروع (مع أسماء الأعمدة الصحيحة)

-- إضافة مراحل المشروع
INSERT INTO project_phases_tree_2025_12_16_22_00 (project_id, title, description, planned_start_date, planned_end_date, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'مرحلة التخطيط والتحليل', 'تحليل المتطلبات وإعداد الخطة التفصيلية للمشروع', '2024-01-01', '2024-01-31', 1),
('00000000-0000-0000-0000-000000000001', 'مرحلة التصميم والتطوير', 'تصميم النظام وتطوير المكونات الأساسية', '2024-02-01', '2024-04-30', 2),
('00000000-0000-0000-0000-000000000001', 'مرحلة الاختبار والتسليم', 'اختبار النظام وإعداد التوثيق النهائي', '2024-05-01', '2024-06-30', 3);

-- إضافة مخرجات المشروع
INSERT INTO deliverables_tree_2025_12_16_22_00 (project_id, title, description, weight, weight_unit, status, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'دليل المستخدم النهائي', 'دليل شامل لاستخدام النظام للمستخدمين النهائيين', 25, 'PERCENT', 'APPROVED', 1),
('00000000-0000-0000-0000-000000000001', 'التوثيق التقني', 'توثيق تقني شامل للنظام والمطورين', 20, 'PERCENT', 'IN_PROGRESS', 2),
('00000000-0000-0000-0000-000000000001', 'دليل التدريب', 'مواد تدريبية للمستخدمين والإداريين', 15, 'PERCENT', 'IN_PROGRESS', 3);

-- إضافة أنشطة وأجزاء المخرجات بشكل منفصل لتجنب التعقيد
DO $$
DECLARE
    phase1_id UUID;
    phase2_id UUID;
    phase3_id UUID;
    deliverable1_id UUID;
    deliverable2_id UUID;
    deliverable3_id UUID;
BEGIN
    -- الحصول على IDs المراحل
    SELECT id INTO phase1_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة التخطيط والتحليل' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;
    SELECT id INTO phase2_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة التصميم والتطوير' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;
    SELECT id INTO phase3_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة الاختبار والتسليم' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;

    -- إضافة أنشطة للمراحل
    IF phase1_id IS NOT NULL THEN
        INSERT INTO project_activities_2025_12_16_22_00 (phase_id, title, description, planned_start_date, planned_end_date, actual_start_date, actual_end_date, status, progress_percent, display_order) VALUES
        (phase1_id, 'تحليل المتطلبات الوظيفية', 'جمع وتحليل جميع المتطلبات الوظيفية للنظام', '2024-01-01', '2024-01-15', '2024-01-01', '2024-01-14', 'DONE', 100, 1),
        (phase1_id, 'إعداد الخطة التفصيلية', 'وضع الخطة الزمنية التفصيلية للمشروع', '2024-01-16', '2024-01-31', '2024-01-16', '2024-01-30', 'DONE', 100, 2);
    END IF;

    IF phase2_id IS NOT NULL THEN
        INSERT INTO project_activities_2025_12_16_22_00 (phase_id, title, description, planned_start_date, planned_end_date, actual_start_date, status, progress_percent, display_order) VALUES
        (phase2_id, 'تصميم قاعدة البيانات', 'تصميم هيكل قاعدة البيانات والجداول', '2024-02-01', '2024-02-15', '2024-02-01', 'DONE', 100, 1),
        (phase2_id, 'تطوير واجهة المستخدم', 'تطوير واجهات المستخدم الرئيسية', '2024-02-16', '2024-03-31', '2024-02-16', 'IN_PROGRESS', 75, 2),
        (phase2_id, 'تطوير APIs الخلفية', 'تطوير خدمات الويب والـ APIs', '2024-03-01', '2024-04-15', '2024-03-01', 'IN_PROGRESS', 60, 3);
    END IF;

    IF phase3_id IS NOT NULL THEN
        INSERT INTO project_activities_2025_12_16_22_00 (phase_id, title, description, planned_start_date, planned_end_date, status, progress_percent, display_order) VALUES
        (phase3_id, 'اختبار النظام الشامل', 'إجراء اختبارات شاملة للنظام', '2024-05-01', '2024-05-31', 'NOT_STARTED', 0, 1),
        (phase3_id, 'إعداد التوثيق النهائي', 'كتابة دليل المستخدم والتوثيق التقني', '2024-06-01', '2024-06-15', 'NOT_STARTED', 0, 2);
    END IF;

    -- الحصول على IDs المخرجات وإضافة الأجزاء
    SELECT id INTO deliverable1_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'دليل المستخدم النهائي' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;
    SELECT id INTO deliverable2_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'التوثيق التقني' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;
    SELECT id INTO deliverable3_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'دليل التدريب' AND project_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;

    -- أجزاء دليل المستخدم
    IF deliverable1_id IS NOT NULL THEN
        INSERT INTO deliverable_parts_2025_12_16_22_00 (deliverable_id, title, description, part_weight, status, display_order) VALUES
        (deliverable1_id, 'الفصل الأول - مقدمة النظام', 'مقدمة شاملة عن النظام وأهدافه', 30, 'APPROVED', 1),
        (deliverable1_id, 'الفصل الثاني - دليل التشغيل', 'شرح تفصيلي لكيفية استخدام النظام', 50, 'APPROVED', 2),
        (deliverable1_id, 'الفصل الثالث - حل المشاكل', 'دليل حل المشاكل الشائعة', 20, 'APPROVED', 3);
    END IF;

    -- أجزاء التوثيق التقني
    IF deliverable2_id IS NOT NULL THEN
        INSERT INTO deliverable_parts_2025_12_16_22_00 (deliverable_id, title, description, part_weight, status, display_order) VALUES
        (deliverable2_id, 'هيكل قاعدة البيانات', 'توثيق تفصيلي لقاعدة البيانات', 40, 'APPROVED', 1),
        (deliverable2_id, 'توثيق APIs', 'توثيق جميع خدمات الويب والـ APIs', 35, 'IN_PROGRESS', 2),
        (deliverable2_id, 'دليل النشر', 'تعليمات نشر النظام على الخوادم', 25, 'NOT_STARTED', 3);
    END IF;

    -- أجزاء دليل التدريب
    IF deliverable3_id IS NOT NULL THEN
        INSERT INTO deliverable_parts_2025_12_16_22_00 (deliverable_id, title, description, part_weight, status, display_order) VALUES
        (deliverable3_id, 'مواد التدريب النظرية', 'عروض تقديمية ومواد نظرية', 60, 'IN_PROGRESS', 1),
        (deliverable3_id, 'التمارين العملية', 'تمارين عملية وحالات دراسية', 40, 'NOT_STARTED', 2);
    END IF;

END $$;