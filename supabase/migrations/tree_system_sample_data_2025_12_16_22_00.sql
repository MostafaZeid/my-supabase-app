-- ==========================================
-- Sample Data for Tree System Testing
-- ==========================================

-- Insert sample project phases
INSERT INTO project_phases_tree_2025_12_16_22_00 (
  project_id, 
  title, 
  description, 
  planned_start_date, 
  planned_end_date,
  display_order
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid, 
    'مرحلة التخطيط والتحليل',
    'تحليل المتطلبات ووضع الخطة التفصيلية للمشروع',
    '2024-01-01',
    '2024-02-15',
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'مرحلة التصميم والتطوير', 
    'تصميم النظام وتطوير المكونات الأساسية',
    '2024-02-16',
    '2024-05-30',
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'مرحلة الاختبار والتسليم',
    'اختبار النظام وتسليم المخرجات النهائية',
    '2024-06-01', 
    '2024-07-15',
    3
  );

-- Get phase IDs for activities
DO $$
DECLARE
  phase1_id UUID;
  phase2_id UUID;
  phase3_id UUID;
BEGIN
  -- Get phase IDs
  SELECT id INTO phase1_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة التخطيط والتحليل';
  SELECT id INTO phase2_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة التصميم والتطوير';
  SELECT id INTO phase3_id FROM project_phases_tree_2025_12_16_22_00 WHERE title = 'مرحلة الاختبار والتسليم';

  -- Insert sample activities for Phase 1
  INSERT INTO project_activities_2025_12_16_22_00 (
    phase_id, title, description, planned_start_date, planned_end_date, status, progress_percent, display_order
  ) VALUES 
    (phase1_id, 'تحليل المتطلبات الوظيفية', 'جمع وتحليل المتطلبات الوظيفية للنظام', '2024-01-01', '2024-01-15', 'DONE', 100, 1),
    (phase1_id, 'تحليل المتطلبات التقنية', 'تحديد المتطلبات التقنية والبنية التحتية', '2024-01-16', '2024-01-30', 'DONE', 100, 2),
    (phase1_id, 'وضع خطة المشروع', 'إعداد الخطة التفصيلية والجدول الزمني', '2024-02-01', '2024-02-15', 'IN_PROGRESS', 75, 3);

  -- Insert sample activities for Phase 2
  INSERT INTO project_activities_2025_12_16_22_00 (
    phase_id, title, description, planned_start_date, planned_end_date, status, progress_percent, display_order
  ) VALUES 
    (phase2_id, 'تصميم واجهة المستخدم', 'تصميم واجهات النظام وتجربة المستخدم', '2024-02-16', '2024-03-15', 'IN_PROGRESS', 60, 1),
    (phase2_id, 'تطوير قاعدة البيانات', 'إنشاء وتطوير قاعدة البيانات', '2024-03-01', '2024-04-15', 'IN_PROGRESS', 40, 2),
    (phase2_id, 'تطوير المكونات الأساسية', 'برمجة المكونات الأساسية للنظام', '2024-04-01', '2024-05-30', 'NOT_STARTED', 0, 3);

  -- Insert sample activities for Phase 3
  INSERT INTO project_activities_2025_12_16_22_00 (
    phase_id, title, description, planned_start_date, planned_end_date, status, progress_percent, display_order
  ) VALUES 
    (phase3_id, 'اختبار الوحدة', 'اختبار المكونات الفردية للنظام', '2024-06-01', '2024-06-15', 'NOT_STARTED', 0, 1),
    (phase3_id, 'اختبار التكامل', 'اختبار تكامل جميع مكونات النظام', '2024-06-16', '2024-06-30', 'NOT_STARTED', 0, 2),
    (phase3_id, 'التسليم النهائي', 'تسليم النظام والوثائق النهائية', '2024-07-01', '2024-07-15', 'NOT_STARTED', 0, 3);
END $$;

-- Insert sample deliverables
INSERT INTO deliverables_tree_2025_12_16_22_00 (
  project_id,
  title,
  description,
  weight,
  weight_unit,
  planned_start_date,
  planned_end_date,
  status,
  progress_percent,
  display_order
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'وثيقة متطلبات النظام',
    'وثيقة شاملة تحتوي على جميع متطلبات النظام الوظيفية والتقنية',
    25.0,
    'PERCENT',
    '2024-01-01',
    '2024-02-15',
    'COMPLETED',
    100,
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'تصميم النظام والواجهات',
    'تصاميم تفصيلية لواجهات النظام وتجربة المستخدم',
    30.0,
    'PERCENT',
    '2024-02-16',
    '2024-04-30',
    'IN_PROGRESS',
    65,
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'كود النظام المطور',
    'الكود المصدري الكامل للنظام مع الوثائق التقنية',
    35.0,
    'PERCENT',
    '2024-03-01',
    '2024-06-30',
    'IN_PROGRESS',
    30,
    3
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'دليل المستخدم والتدريب',
    'أدلة الاستخدام ومواد التدريب للمستخدمين النهائيين',
    10.0,
    'PERCENT',
    '2024-06-01',
    '2024-07-15',
    'NOT_STARTED',
    0,
    4
  );

-- Insert sample deliverable parts
DO $$
DECLARE
  deliverable1_id UUID;
  deliverable2_id UUID;
  deliverable3_id UUID;
  deliverable4_id UUID;
BEGIN
  -- Get deliverable IDs
  SELECT id INTO deliverable1_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'وثيقة متطلبات النظام';
  SELECT id INTO deliverable2_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'تصميم النظام والواجهات';
  SELECT id INTO deliverable3_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'كود النظام المطور';
  SELECT id INTO deliverable4_id FROM deliverables_tree_2025_12_16_22_00 WHERE title = 'دليل المستخدم والتدريب';

  -- Parts for deliverable 1 (Requirements Document)
  INSERT INTO deliverable_parts_2025_12_16_22_00 (
    deliverable_id, title, description, part_weight, status, progress_percent, display_order
  ) VALUES 
    (deliverable1_id, 'المتطلبات الوظيفية', 'تحليل وتوثيق المتطلبات الوظيفية', 40.0, 'COMPLETED', 100, 1),
    (deliverable1_id, 'المتطلبات التقنية', 'تحديد المتطلبات التقنية والبنية التحتية', 35.0, 'COMPLETED', 100, 2),
    (deliverable1_id, 'متطلبات الأمان', 'تحديد متطلبات الأمان والحماية', 25.0, 'COMPLETED', 100, 3);

  -- Parts for deliverable 2 (System Design)
  INSERT INTO deliverable_parts_2025_12_16_22_00 (
    deliverable_id, title, description, part_weight, status, progress_percent, display_order
  ) VALUES 
    (deliverable2_id, 'تصميم واجهة المستخدم', 'تصميم واجهات المستخدم وتجربة الاستخدام', 50.0, 'IN_PROGRESS', 80, 1),
    (deliverable2_id, 'تصميم قاعدة البيانات', 'تصميم هيكل قاعدة البيانات والعلاقات', 30.0, 'IN_PROGRESS', 60, 2),
    (deliverable2_id, 'تصميم البنية التقنية', 'تصميم البنية التقنية والمعمارية للنظام', 20.0, 'IN_PROGRESS', 40, 3);

  -- Parts for deliverable 3 (System Code)
  INSERT INTO deliverable_parts_2025_12_16_22_00 (
    deliverable_id, title, description, part_weight, status, progress_percent, display_order
  ) VALUES 
    (deliverable3_id, 'الواجهة الأمامية', 'تطوير واجهة المستخدم الأمامية', 40.0, 'IN_PROGRESS', 45, 1),
    (deliverable3_id, 'الخدمات الخلفية', 'تطوير الخدمات والواجهات البرمجية الخلفية', 35.0, 'IN_PROGRESS', 25, 2),
    (deliverable3_id, 'قاعدة البيانات', 'إنشاء وتطوير قاعدة البيانات', 25.0, 'IN_PROGRESS', 20, 3);

  -- Parts for deliverable 4 (User Manual)
  INSERT INTO deliverable_parts_2025_12_16_22_00 (
    deliverable_id, title, description, part_weight, status, progress_percent, display_order
  ) VALUES 
    (deliverable4_id, 'دليل المستخدم النهائي', 'دليل شامل لاستخدام النظام', 60.0, 'NOT_STARTED', 0, 1),
    (deliverable4_id, 'دليل المدير التقني', 'دليل للمديرين التقنيين وإدارة النظام', 40.0, 'NOT_STARTED', 0, 2);
END $$;

-- Update weighted contribution percentages based on progress and weights
UPDATE deliverables_tree_2025_12_16_22_00 
SET weighted_contribution_percent = (progress_percent::decimal / 100) * weight
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;

-- Comments
COMMENT ON TABLE project_phases_tree_2025_12_16_22_00 IS 'Sample data added for testing the tree system';
COMMENT ON TABLE deliverables_tree_2025_12_16_22_00 IS 'Sample deliverables with weight-based progress calculation';