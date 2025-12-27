-- إضافة بيانات تجريبية للمشروع

-- إضافة مراحل المشروع
INSERT INTO project_phases_tree_2025_12_16_22_00 (id, project_id, name, description, start_date, end_date, status) VALUES
('phase-1', '1', 'مرحلة التخطيط والتحليل', 'تحليل المتطلبات وإعداد الخطة التفصيلية للمشروع', '2024-01-01', '2024-01-31', 'done'),
('phase-2', '1', 'مرحلة التصميم والتطوير', 'تصميم النظام وتطوير المكونات الأساسية', '2024-02-01', '2024-04-30', 'in_progress'),
('phase-3', '1', 'مرحلة الاختبار والتسليم', 'اختبار النظام وإعداد التوثيق النهائي', '2024-05-01', '2024-06-30', 'not_started');

-- إضافة أنشطة للمراحل
INSERT INTO project_activities_2025_12_16_22_00 (id, phase_id, name, description, owner_id, status, progress_percentage, planned_start_date, planned_end_date, actual_start_date, actual_end_date) VALUES
-- أنشطة مرحلة التخطيط
('activity-1-1', 'phase-1', 'تحليل المتطلبات الوظيفية', 'جمع وتحليل جميع المتطلبات الوظيفية للنظام', null, 'done', 100, '2024-01-01', '2024-01-15', '2024-01-01', '2024-01-14'),
('activity-1-2', 'phase-1', 'إعداد الخطة التفصيلية', 'وضع الخطة الزمنية التفصيلية للمشروع', null, 'done', 100, '2024-01-16', '2024-01-31', '2024-01-16', '2024-01-30'),

-- أنشطة مرحلة التصميم والتطوير
('activity-2-1', 'phase-2', 'تصميم قاعدة البيانات', 'تصميم هيكل قاعدة البيانات والجداول', null, 'done', 100, '2024-02-01', '2024-02-15', '2024-02-01', '2024-02-14'),
('activity-2-2', 'phase-2', 'تطوير واجهة المستخدم', 'تطوير واجهات المستخدم الرئيسية', null, 'in_progress', 75, '2024-02-16', '2024-03-31', '2024-02-16', null),
('activity-2-3', 'phase-2', 'تطوير APIs الخلفية', 'تطوير خدمات الويب والـ APIs', null, 'in_progress', 60, '2024-03-01', '2024-04-15', '2024-03-01', null),
('activity-2-4', 'phase-2', 'التكامل والاختبار الأولي', 'ربط المكونات واختبارها', null, 'not_started', 0, '2024-04-16', '2024-04-30', null, null),

-- أنشطة مرحلة الاختبار والتسليم
('activity-3-1', 'phase-3', 'اختبار النظام الشامل', 'إجراء اختبارات شاملة للنظام', null, 'not_started', 0, '2024-05-01', '2024-05-31', null, null),
('activity-3-2', 'phase-3', 'إعداد التوثيق النهائي', 'كتابة دليل المستخدم والتوثيق التقني', null, 'not_started', 0, '2024-06-01', '2024-06-15', null, null),
('activity-3-3', 'phase-3', 'التسليم والنشر', 'نشر النظام وتسليمه للعميل', null, 'not_started', 0, '2024-06-16', '2024-06-30', null, null);

-- إضافة مخرجات المشروع
INSERT INTO deliverables_tree_2025_12_16_22_00 (id, project_id, name, description, weight_value, weight_unit, status) VALUES
('deliverable-1', '1', 'دليل المستخدم النهائي', 'دليل شامل لاستخدام النظام للمستخدمين النهائيين', 25, 'percent', 'approved'),
('deliverable-2', '1', 'التوثيق التقني', 'توثيق تقني شامل للنظام والمطورين', 20, 'percent', 'in_progress'),
('deliverable-3', '1', 'دليل التدريب', 'مواد تدريبية للمستخدمين والإداريين', 15, 'percent', 'in_progress'),
('deliverable-4', '1', 'خطة النشر والصيانة', 'خطة تفصيلية لنشر النظام وصيانته', 10, 'percent', 'not_started'),
('deliverable-5', '1', 'تقارير الاختبار', 'تقارير شاملة لجميع اختبارات النظام', 30, 'percent', 'not_started');

-- إضافة أجزاء المخرجات
INSERT INTO deliverable_parts_2025_12_16_22_00 (id, deliverable_id, name, description, weight_value, weight_unit, status) VALUES
-- أجزاء دليل المستخدم
('part-1-1', 'deliverable-1', 'الفصل الأول - مقدمة النظام', 'مقدمة شاملة عن النظام وأهدافه', 30, 'percent', 'approved'),
('part-1-2', 'deliverable-1', 'الفصل الثاني - دليل التشغيل', 'شرح تفصيلي لكيفية استخدام النظام', 50, 'percent', 'approved'),
('part-1-3', 'deliverable-1', 'الفصل الثالث - حل المشاكل', 'دليل حل المشاكل الشائعة', 20, 'percent', 'approved'),

-- أجزاء التوثيق التقني
('part-2-1', 'deliverable-2', 'هيكل قاعدة البيانات', 'توثيق تفصيلي لقاعدة البيانات', 40, 'percent', 'approved'),
('part-2-2', 'deliverable-2', 'توثيق APIs', 'توثيق جميع خدمات الويب والـ APIs', 35, 'percent', 'in_progress'),
('part-2-3', 'deliverable-2', 'دليل النشر', 'تعليمات نشر النظام على الخوادم', 25, 'percent', 'not_started'),

-- أجزاء دليل التدريب
('part-3-1', 'deliverable-3', 'مواد التدريب النظرية', 'عروض تقديمية ومواد نظرية', 60, 'percent', 'in_progress'),
('part-3-2', 'deliverable-3', 'التمارين العملية', 'تمارين عملية وحالات دراسية', 40, 'percent', 'not_started'),

-- أجزاء خطة النشر والصيانة
('part-4-1', 'deliverable-4', 'خطة النشر', 'خطة تفصيلية لنشر النظام', 70, 'percent', 'not_started'),
('part-4-2', 'deliverable-4', 'خطة الصيانة', 'خطة الصيانة الدورية والطارئة', 30, 'percent', 'not_started'),

-- أجزاء تقارير الاختبار
('part-5-1', 'deliverable-5', 'تقارير اختبار الوحدة', 'تقارير اختبار المكونات الفردية', 25, 'percent', 'not_started'),
('part-5-2', 'deliverable-5', 'تقارير اختبار التكامل', 'تقارير اختبار التكامل بين المكونات', 25, 'percent', 'not_started'),
('part-5-3', 'deliverable-5', 'تقارير اختبار الأداء', 'تقارير اختبار أداء النظام', 25, 'percent', 'not_started'),
('part-5-4', 'deliverable-5', 'تقارير اختبار الأمان', 'تقارير اختبار أمان النظام', 25, 'percent', 'not_started');

-- إضافة بعض التكليفات التجريبية (سيتم ربطها بالمستخدمين الحقيقيين لاحقاً)
INSERT INTO deliverable_assignments_2025_12_16_22_00 (id, deliverable_id, deliverable_part_id, assigned_to, assigned_by, can_upload, can_submit, can_respond_to_reviews) VALUES
('assignment-1', null, 'part-2-2', 'user-placeholder', 'admin-placeholder', true, true, true),
('assignment-2', null, 'part-3-1', 'user-placeholder', 'admin-placeholder', true, true, false),
('assignment-3', null, 'part-3-2', 'user-placeholder', 'admin-placeholder', true, false, false);

-- إضافة بعض منح الوصول التجريبية
INSERT INTO deliverable_access_grants_2025_12_16_22_00 (id, deliverable_id, deliverable_part_id, granted_to, granted_by, access_level, expires_at) VALUES
('grant-1', 'deliverable-1', null, 'client-placeholder', 'admin-placeholder', 'view', '2024-12-31 23:59:59'),
('grant-2', 'deliverable-2', null, 'client-placeholder', 'admin-placeholder', 'comment', '2024-12-31 23:59:59'),
('grant-3', null, 'part-2-1', 'reviewer-placeholder', 'admin-placeholder', 'review', '2024-06-30 23:59:59');